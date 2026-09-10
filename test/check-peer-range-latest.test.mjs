import { describe, expect, it } from 'vitest'

import {
  parseVersion,
  compareVersions,
  satisfiesClause,
  satisfiesRange,
  suggestedClause,
} from '../scripts/check-peer-range-latest.mjs'

const CANONICAL = '>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0'

describe('parseVersion / compareVersions', () => {
  it('parses release and prerelease versions', () => {
    expect(parseVersion('0.1.5-rc.1')).toEqual({
      major: 0,
      minor: 1,
      patch: 5,
      prerelease: ['rc', '1'],
    })
    expect(parseVersion('1.2.3').prerelease).toEqual([])
    expect(parseVersion('not-a-version')).toBeNull()
  })

  it('orders by semver precedence, not by string', () => {
    expect(compareVersions('0.1.5-rc.1', '0.1.2-rc.1')).toBe(1)
    expect(compareVersions('0.1.5-alpha.1', '0.1.5-rc.1')).toBe(-1)
    expect(compareVersions('0.1.5-rc.1', '0.1.5')).toBe(-1) // prerelease < release
    expect(compareVersions('0.1.5-rc.10', '0.1.5-rc.9')).toBe(1) // numeric identifiers
    expect(compareVersions('0.1.5', '0.1.5')).toBe(0)
  })
})

describe('satisfiesClause', () => {
  it('applies the semver prerelease rule per tuple', () => {
    const clause = { floor: '0.1.2-rc.1', upper: '0.2.0' }
    expect(satisfiesClause('0.1.2-rc.1', clause)).toBe(true)
    expect(satisfiesClause('0.1.2', clause)).toBe(true)
    expect(satisfiesClause('0.1.5', clause)).toBe(true)
    // a prerelease of a DIFFERENT tuple is not admitted by this comparator set
    expect(satisfiesClause('0.1.5-rc.1', clause)).toBe(false)
    expect(satisfiesClause('0.1.3-alpha.1', clause)).toBe(false)
    // bounds
    expect(satisfiesClause('0.1.1', clause)).toBe(false)
    expect(satisfiesClause('0.2.0', clause)).toBe(false)
  })
})

describe('satisfiesRange', () => {
  it('admits every published version line through the canonical OR form', () => {
    expect(satisfiesRange('0.1.5-rc.1', CANONICAL)).toBe(true)
    expect(satisfiesRange('0.1.5-alpha.2', CANONICAL)).toBe(true)
    expect(satisfiesRange('0.1.2-rc.1', CANONICAL)).toBe(true)
    expect(satisfiesRange('0.1.6', CANONICAL)).toBe(true)
  })

  it('does NOT admit a future prerelease tuple (the reason the tripwire exists)', () => {
    expect(satisfiesRange('0.1.6-rc.1', CANONICAL)).toBe(false)
  })

  it('rejects unparseable input instead of throwing', () => {
    expect(satisfiesRange('0.1.5-rc.1', '^0.1.0')).toBe(false)
    expect(satisfiesRange('nope', CANONICAL)).toBe(false)
  })
})

describe('suggestedClause', () => {
  it('proposes a -0 clause bounded by the canonical upper bound', () => {
    expect(suggestedClause('0.1.6-rc.1', CANONICAL)).toBe('>=0.1.6-0 <0.2.0')
    // and the suggestion actually fixes the miss
    const fixed = `${CANONICAL} || ${suggestedClause('0.1.6-rc.1', CANONICAL)}`
    expect(satisfiesRange('0.1.6-rc.1', fixed)).toBe(true)
    expect(satisfiesRange('0.1.6-alpha.0', fixed)).toBe(true)
    expect(satisfiesRange('0.1.7-rc.1', fixed)).toBe(false)
  })
})
