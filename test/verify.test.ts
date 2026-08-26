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
  writeFileSync(join(dir, 'README.zh.md'), '# title\n')
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
    rmSync(join(dir, 'README.zh.md'))
    expect(verifyReadmeLanguages(dir).ok).toBe(false)
  })

  it('verifySeam finds the three roles and fails on an incomplete seam', () => {
    const dir = makeRepo()
    expect(verifySeam(dir).ok).toBe(true)
    writeFileSync(join(dir, 'src', 'index.ts'), '// Service Definition only\n')
    expect(verifySeam(dir).ok).toBe(false)
  })
})
