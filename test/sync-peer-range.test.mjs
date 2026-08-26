import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { rewritePeerRange, currentPeerRanges } from '../scripts/sync-peer-range.mjs'

const TARGET = '>=0.1.0-rc.8 <0.2.0'
let dir

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'peer-range-'))
})

afterAll(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('rewritePeerRange', () => {
  it('rewrites only dsh peer lines inside the peerDependencies block', () => {
    const text = [
      '{',
      '  "name": "demo",',
      '  "peerDependencies": {',
      '    "@deepseek-ai/dsh-session": ">=0.1.0-rc.5 <0.2.0",',
      '    "@deepseek-ai/dsh-tools": ">=0.1.0-rc.5 <0.2.0",',
      '    "zod": "^3.22.0"',
      '  },',
      '  "dependencies": {',
      '    "@deepseek-ai/dsh-other": ">=0.1.0-rc.5 <0.2.0"',
      '  }',
      '}',
      '',
    ].join('\n')
    const { text: next, changed } = rewritePeerRange(text, TARGET)
    expect(changed).toBe(2)
    expect(next).toContain('"@deepseek-ai/dsh-session": ">=0.1.0-rc.8 <0.2.0",')
    expect(next).toContain('"@deepseek-ai/dsh-tools": ">=0.1.0-rc.8 <0.2.0",')
    // outside the peer block nothing changes
    expect(next).toContain('"@deepseek-ai/dsh-other": ">=0.1.0-rc.5 <0.2.0"')
    expect(next).toContain('"zod": "^3.22.0"')
    expect(next).toContain('  "name": "demo",')
  })

  it('leaves text untouched when already at the target range', () => {
    const text = '{\n  "peerDependencies": {\n    "@deepseek-ai/dsh-session": ">=0.1.0-rc.8 <0.2.0"\n  }\n}\n'
    const { text: next, changed } = rewritePeerRange(text, TARGET)
    expect(changed).toBe(0)
    expect(next).toBe(text)
  })

  it('handles inline-empty and trailing-comma styles', () => {
    const inline = '{\n  "peerDependencies": {},\n  "name": "x"\n}\n'
    expect(rewritePeerRange(inline, TARGET).changed).toBe(0)
    const trailing = '{\n  "peerDependencies": {\n    "@deepseek-ai/dsh-a": ">=0.1.0-rc.5",\n  },\n  "x": 1\n}\n'
    const { text: next, changed } = rewritePeerRange(trailing, TARGET)
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
  it('reports drift without --write and rewrites with --write', async () => {
    const repoDir = join(dir, 'cli-repo')
    const { mkdir } = await import('node:fs/promises')
    await mkdir(repoDir, { recursive: true })
    const pkg = join(repoDir, 'package.json')
    await writeFile(
      pkg,
      '{\n  "name": "cli-repo",\n  "peerDependencies": {\n    "@deepseek-ai/dsh-session": ">=0.1.0-rc.1 <0.2.0"\n  }\n}\n',
    )
    const script = resolve(import.meta.dirname, '..', 'scripts', 'sync-peer-range.mjs')
    const report = execFileSync(process.execPath, [script, '--dir', dir], { encoding: 'utf8' })
    expect(report).toContain('cli-repo\tdrift')
    execFileSync(process.execPath, [script, '--dir', dir, '--write'], { encoding: 'utf8' })
    const after = await readFile(pkg, 'utf8')
    expect(after).toContain('"@deepseek-ai/dsh-session": ">=0.1.0-rc.8 <0.2.0"')
  })
})
