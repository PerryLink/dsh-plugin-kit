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
  parseRangeSet,
  formatRangeSet,
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

describe('OR-form range sets', () => {
  const OR = '>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0'

  it('parses and re-renders the OR form', () => {
    expect(parseRangeSet(OR)).toEqual([
      { floor: '0.1.2-rc.1', upper: '0.2.0' },
      { floor: '0.1.5-alpha.1', upper: '0.2.0' },
    ])
    expect(formatRangeSet(parseRangeSet(OR))).toBe(OR)
    // the single-clause parser stays strict: OR form is not a single clause
    expect(parseRange(OR)).toBeNull()
  })

  it('tolerates whitespace variants but rejects a malformed clause', () => {
    expect(parseRangeSet('>=0.1.2-rc.1 <0.2.0||>=0.1.5-alpha.1 <0.2.0')).toHaveLength(2)
    expect(parseRangeSet('>=0.1.2-rc.1 <0.2.0 || ^0.1.5')).toBeNull()
  })

  it('classifies the OR form against itself and against the bare form', () => {
    expect(rangeStatus(OR, OR)).toBe('ok')
    // the historical bare range lost the 0.1.5 prerelease clause
    expect(rangeStatus('>=0.1.2-rc.1 <0.2.0', OR)).toBe('drift-low')
    // a per-package floor above every canonical floor is a real requirement
    expect(rangeStatus('>=0.1.5-rc.1 <0.2.0', OR)).toBe('ok-higher')
    // a different upper bound is still the version-lock break
    expect(rangeStatus('>=0.1.2-rc.1 <0.3.0 || >=0.1.5-alpha.1 <0.3.0', OR)).toBe('drift-upper')
  })

  it('rewrites a bare range to the full canonical clause set', () => {
    expect(targetRange('>=0.1.2-rc.1 <0.2.0', OR)).toBe(OR)
    expect(targetRange('>=0.1.1-rc.2 <0.2.0', OR)).toBe(OR)
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
    const canonical = JSON.parse(
      await readFile(resolve(import.meta.dirname, '..', 'data', 'peer-range.json'), 'utf8'),
    ).canonicalRange
    // above every canonical floor: a real per-package requirement, left alone
    const highFloor = '>=0.1.5-rc.1 <0.2.0'
    const repoDir = join(dir, 'cli-repo')
    await mkdir(repoDir, { recursive: true })
    const pkg = join(repoDir, 'package.json')
    await writeFile(
      pkg,
      `{\n  "name": "cli-repo",\n  "peerDependencies": {\n    "@deepseek-ai/dsh-session": ">=0.1.0-rc.1 <0.2.0",\n    "@deepseek-ai/dsh-projection": "${highFloor}"\n  }\n}\n`,
    )
    const script = resolve(import.meta.dirname, '..', 'scripts', 'sync-peer-range.mjs')
    const report = execFileSync(process.execPath, [script, '--dir', dir], { encoding: 'utf8' })
    expect(report).toContain('cli-repo\tdrift')
    expect(report).toContain('@deepseek-ai/dsh-session: drift-low')
    const rewrite = execFileSync(process.execPath, [script, '--dir', dir, '--write'], { encoding: 'utf8' })
    expect(rewrite).toContain('rewritten (1 keys)')
    const after = await readFile(pkg, 'utf8')
    expect(after).toContain(`"@deepseek-ai/dsh-session": "${canonical}"`)
    // higher-floor key untouched by the rewrite
    expect(after).toContain(`"@deepseek-ai/dsh-projection": "${highFloor}"`)
    const second = execFileSync(process.execPath, [script, '--dir', dir], { encoding: 'utf8' })
    expect(second).toContain('cli-repo\tok (1 higher-floor)')
  })
})
