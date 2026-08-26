import { describe, expect, it } from 'vitest'
import { parseVerdict, RISK_ORDER, riskExceeds, truncate, VERDICT_SCHEMA } from '../src/shared/judge.ts'

describe('parseVerdict', () => {
  it('accepts a valid allow verdict', () => {
    expect(parseVerdict({ decision: 'allow', reason: 'safe', riskLevel: 'low' }, 100)).toEqual({
      decision: 'allow',
      reason: 'safe',
      riskLevel: 'low',
    })
  })

  it('accepts a verdict without riskLevel', () => {
    expect(parseVerdict({ decision: 'deny', reason: 'unsafe' }, 100)).toEqual({
      decision: 'deny',
      reason: 'unsafe',
    })
  })

  it('trims and truncates the reason', () => {
    expect(parseVerdict({ decision: 'allow', reason: '  hello  ' }, 3)).toEqual({
      decision: 'allow',
      reason: 'he…',
    })
  })

  it('rejects invalid decisions, empty reasons, and bad risk levels', () => {
    expect(parseVerdict(null, 100)).toBeUndefined()
    expect(parseVerdict('x', 100)).toBeUndefined()
    expect(parseVerdict({ decision: 'maybe', reason: 'r' }, 100)).toBeUndefined()
    expect(parseVerdict({ decision: 'allow', reason: '   ' }, 100)).toBeUndefined()
    expect(parseVerdict({ decision: 'allow', reason: 'r', riskLevel: 'extreme' }, 100)).toBeUndefined()
  })
})

describe('risk ordering', () => {
  it('orders low < medium < high', () => {
    expect(RISK_ORDER).toEqual(['low', 'medium', 'high'])
    expect(riskExceeds('high', 'medium')).toBe(true)
    expect(riskExceeds('medium', 'medium')).toBe(false)
    expect(riskExceeds('low', 'high')).toBe(false)
  })
})

describe('VERDICT_SCHEMA', () => {
  it('declares the closed decision vocabulary', () => {
    expect(VERDICT_SCHEMA.type).toBe('object')
    expect(VERDICT_SCHEMA.required).toEqual(['decision', 'reason'])
    expect(VERDICT_SCHEMA.properties.decision?.enum).toEqual(['allow', 'deny'])
    expect(VERDICT_SCHEMA.properties.riskLevel?.enum).toEqual(['low', 'medium', 'high'])
  })
})

describe('truncate', () => {
  it('passes short text through and ellipsizes long text', () => {
    expect(truncate('abc', 5)).toBe('abc')
    expect(truncate('abcdef', 3)).toBe('ab…')
  })
})
