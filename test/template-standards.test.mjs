import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readJson = (name) =>
  JSON.parse(readFileSync(new URL(`../template/${name}`, import.meta.url), 'utf8'))

const PLACEHOLDER_STATUSES = {
  entry: 'not-run',
  flow: 'not-run',
  boost: 'not-measured',
}
const LEVELS = Object.keys(PLACEHOLDER_STATUSES)

describe('template placeholders', () => {
  const pkg = readJson('package.json')
  const standards = readJson('standards.json')

  it('ships dsh.standards as a not-run placeholder, not a claim', () => {
    expect(pkg.dsh.standards.schema).toBe('dsh-levels/1')
    for (const level of LEVELS) {
      expect(standards.levels[level].status).toBe(PLACEHOLDER_STATUSES[level])
      expect(pkg.dsh.standards[level]).toEqual({
        status: standards.levels[level].status,
        evidence: standards.levels[level].evidence,
      })
      expect(pkg.dsh.standards[level].evidence).toBeNull()
    }
    expect(JSON.stringify(pkg.dsh.standards)).not.toMatch(/PASS|certified|official|recommended|secure/iu)
  })

  it('points dsh.bundle.patch at the bundle patch source', () => {
    expect(pkg.dsh.bundle.patch).toBe('./cordis.patch.yml')
    expect(existsSync(new URL('../template/cordis.yml', import.meta.url))).toBe(true)
  })
})
