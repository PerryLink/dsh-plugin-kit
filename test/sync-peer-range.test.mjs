import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtemp, writeFile, readFile, rm, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import {
  rewritePeerRange,
  currentPeerRanges,
  rangeStatus,
  targetRange,
  parseRange,
} from '../scripts/sync-peer-range.mjs'

const TARGET = '>=0.1.0-rc.8 <0.2.0'
let dir

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'peer-range-'))
})

afterAll(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('parseRange / rangeStatus / targetRange', () => {
  it('parses and classifies the four range states', () => {
    expect(parseRange(TARGET)).toEqual({ floor: '0.1.0-rc.8', upper: '0.2.0' })
    expect(rangeStatus('>=0.1.0-rc.8 <0.2.0', TARGET)).toBe('ok')
    expect(rangeStatus('>=0.1.1-rc.2 <0.2.0', TARGET)).toBe('ok-higher')
    expect(rangeStatus('>=0.1.0-rc.5 <0.2.0', TARGET)).toBe('drift-low')
    expect(rangeStatus('>=0.1.0-rc.8 <0.3.0', TARGET)).toBe('drift-upper')
    expect(rangeStatus('^0.1.0', TARGET)).toBe('unparseable')
  })

  it('computes rewrite targets preserving a higher real floor', () => {
    expect(targetRange('>=0.1.0-rc.5 <0.2.0', TARGET)).toBe('>=0.1.0-rc.8 <0.2.0')
    expect(targetRange('>=0.1.1-rc.2 <0.2.0', TARGET)).toBe('>=0.1.1-rc.2 <0.2.0')
    expect(targetRange('>=0.1.0-rc.8 <0.3.0', TARGET)).toBe('>=0.1.0-rc.8 <0.2.0')
  })
})

describe('rewritePeerRange', () => {
  it('rewrites only dsh peer lines inside the peerDependencies block', () => {
    const text = [
      '{',
      '  "name": "demo",',
      '  "peerDependencies": {',
      '    "@deepseek-ai/dsh-session": ">=0.1.0-rc.5 <0.2.0",',
      '    "@deepseek-ai/dsh-tools": ">=0.1.1-rc.2 <0.2.0",',
      '    "zod": "^3.22.0"',
      '  },',
      '  "dependencies": {',
      '    "@deepseek-ai/dsh-other": ">=0.1.0-rc.5 <0.2.0"',
      '  }',
      '}',
      '',
    ].join('\n')
    const resolveRange = (key) => targetRange(key === '@deepseek-ai/dsh-tools' ? '>=0.1.1-rc.2 <0.2.0' : '>=0.1.0-rc.5 <0.2.0', TARGET)
    const { text: next, changed } = rewritePeerRange(text, resolveRange)
    expect(changed).toBe(1)
    expect(next).toContain('"@deepseek-ai/dsh-session": ">=0.1.0-rc.8 <0.2.0",')
    // higher floor key is left alone
    expect(next).toContain('"@deepseek-ai/dsh-tools": ">=0.1.1-rc.2 <0.2.0",')
    // outside the peer block nothing changes
    expect(next).toContain('"@deepseek-ai/dsh-other": ">=0.1.0-rc.5 <0.2.0"')
    expect(next).toContain('"zod": "^3.22.0"')
    expect(next).toContain('  "name": "demo",')
  })

  it('leaves text untouched when resolveRange returns null', () => {
    const text = '{\n  "peerDependencies": {\n    "@deepseek-ai/dsh-session": ">=0.1.0-rc.8 <0.2.0"\n  }\n}\n'
    const { text: next, changed } = rewritePeerRange(text, () => null)
    expect(changed).toBe(0)
    expect(next).toBe(text)
  })

  it('handles inline-empty and trailing-comma styles', () => {
    const inline = '{\n  "peerDependencies": {},\n  "name": "x"\n}\n'
    expect(rewritePeerRange(inline, () => TARGET).changed).toBe(0)
    const trailing = '{\n  "peerDependencies": {\n    "@deepseek-ai/dsh-a": ">=0.1.0-rc.5",\n  },\n  "x": 1\n}\n'
    const { text: next, changed } = rewritePeerRange(trailing, () => TARGET)
    expect(changed).toBe(1)
    expect(next).toContain('"@deepseek-ai/dsh-a": ">=0.1.0-rc.8 <0.2.0",')
  })
})

describe('currentPeerRanges', () => {
  it('returns only dsh-scoped peers', () => {
    const ranges = currentPeerRanges({
      peerDependencies: {
        '@deepseek-ai/dsh-session': '>=0.1.0-rc.8 <0.2.0',
        zod: '^3.0.0',
      },
    })
    expect([...ranges.keys()]).toEqual(['@deepseek-ai/dsh-session'])
    expect(ranges.get('@deepseek-ai/dsh-session')).toBe('>=0.1.0-rc.8 <0.2.0')
  })

  it('returns an empty map without peerDependencies', () => {
    expect(currentPeerRanges({}).size).toBe(0)
  })
})

describe('CLI end-to-end', () => {
  it('reports drift without --write and rewrites only drifting keys with --write', async () => {
    const repoDir = join(dir, 'cli-repo')
    await mkdir(repoDir, { recursive: true })
    const pkg = join(repoDir, 'package.json')
    await writeFile(
      pkg,
      '{\n  "name": "cli-repo",\n  "peerDependencies": {\n    "@deepseek-ai/dsh-session": ">=0.1.0-rc.1 <0.2.0",\n    "@deepseek-ai/dsh-projection": ">=0.1.1-rc.2 <0.2.0"\n  }\n}\n',
    )
    const script = resolve(import.meta.dirname, '..', 'scripts', 'sync-peer-range.mjs')
    const report = execFileSync(process.execPath, [script, '--dir', dir], { encoding: 'utf8' })
    expect(report).toContain('cli-repo\tdrift')
    expect(report).toContain('@deepseek-ai/dsh-session: drift-low')
    const rewrite = execFileSync(process.execPath, [script, '--dir', dir, '--write'], { encoding: 'utf8' })
    expect(rewrite).toContain('rewritten (1 keys)')
    const after = await readFile(pkg, 'utf8')
    expect(after).toContain('"@deepseek-ai/dsh-session": ">=0.1.0-rc.8 <0.2.0"')
    // higher-floor key untouched by the rewrite
    expect(after).toContain('"@deepseek-ai/dsh-projection": ">=0.1.1-rc.2 <0.2.0"')
    const second = execFileSync(process.execPath, [script, '--dir', dir], { encoding: 'utf8' })
    expect(second).toContain('cli-repo\tok (1 higher-floor)')
  })
})
