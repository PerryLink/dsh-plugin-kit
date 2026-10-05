import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { verifyLicense } from '../src/verify/license.ts'
import { verifyReadmeLanguages } from '../src/verify/readme-languages.ts'
import { verifySeam } from '../src/verify/seam.ts'

let dirs: string[] = []
afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true })
  dirs = []
})

function makeRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-kit-verify-'))
  dirs.push(dir)
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ license: 'Apache-2.0' }))
  writeFileSync(join(dir, 'LICENSE'), 'Apache-2.0')
  writeFileSync(join(dir, 'README.md'), '# title\n')
  writeFileSync(join(dir, 'README-zh.md'), '# title\n')
  mkdirSync(join(dir, 'src'))
  writeFileSync(join(dir, 'src', 'index.ts'), '// Service Definition\n// Service Provider\n// Consumer\n')
  return dir
}

describe('verify gates', () => {
  it('verifyLicense passes a conforming repo and fails a missing license', () => {
    const dir = makeRepo()
    expect(verifyLicense(dir).ok).toBe(true)
    rmSync(join(dir, 'LICENSE'))
    expect(verifyLicense(dir).ok).toBe(false)
  })

  it('verifyReadmeLanguages checks the English base and translations', () => {
    const dir = makeRepo()
    expect(verifyReadmeLanguages(dir).ok).toBe(true)
    rmSync(join(dir, 'README-zh.md'))
    expect(verifyReadmeLanguages(dir).ok).toBe(false)
  })

  it('verifySeam finds the three roles and fails on an incomplete seam', () => {
    const dir = makeRepo()
    expect(verifySeam(dir).ok).toBe(true)
    writeFileSync(join(dir, 'src', 'index.ts'), '// Service Definition only\n')
    expect(verifySeam(dir).ok).toBe(false)
  })

  it('verifySeam passes, with a warning, for a plugin that carries no seam at all', () => {
    // A pure detector registers nothing for anyone else to consume, so the three-role
    // rule is out of scope rather than unmet. Measured on dsh-plugin-doctor, whose flat
    // `.mjs` + `lib/` layout is the root-level fallback path.
    const dir = makeRepo()
    writeFileSync(join(dir, 'src', 'index.ts'), 'export const nothing = 1\n')

    const result = verifySeam(dir)
    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]?.message).toMatch(/carries no capability seam/)
  })

  it('verifySeam still fails when exactly two of the three roles are present', () => {
    // The failure mode the gate exists to catch, pinned so the out-of-scope pass above
    // cannot quietly widen into "any subset is fine".
    const dir = makeRepo()
    writeFileSync(join(dir, 'src', 'index.ts'), '// Service Definition\n// Service Provider\n')
    const result = verifySeam(dir)
    expect(result.ok).toBe(false)
    expect(result.errors.map(e => e.message).join('\n')).toMatch(/role "consumer"/)
  })

  it('verifySeam scans root-level sources for a pure-JS repo', () => {
    const dir = makeRepo()
    rmSync(join(dir, 'src'), { recursive: true, force: true })
    writeFileSync(join(dir, 'index.mjs'), '// Service Definition\n// Service Provider\n// Consumer\n')
    expect(verifySeam(dir).ok).toBe(true)

    writeFileSync(join(dir, 'index.mjs'), 'export const nothing = 1\n')
    const none = verifySeam(dir)
    expect(none.ok).toBe(true)
    expect(none.warnings).toHaveLength(1)
  })
})
