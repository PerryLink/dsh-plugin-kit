import { describe, expect, it } from 'vitest'
import { DEFAULT_FALLBACK, applyFailClosed } from '../src/gates/approval.ts'

describe('applyFailClosed', () => {
  it('passes an allow verdict through unchanged', () => {
    expect(applyFailClosed({ decision: 'allow', reason: 'ok' })).toEqual({
      decision: 'allow',
      reason: 'ok',
      usedFallback: false,
    })
  })

  it('passes a deny verdict through unchanged', () => {
    expect(applyFailClosed({ decision: 'deny', reason: 'no' })).toEqual({
      decision: 'deny',
      reason: 'no',
      usedFallback: false,
    })
  })

  it('fails closed to rejected (deny) by default on a missing verdict', () => {
    const out = applyFailClosed(undefined)
    expect(out).toMatchObject({ decision: 'deny', usedFallback: true, policy: 'rejected' })
    expect(out.reason).toContain('rejected')
  })

  it('resolves allow-once to a one-shot allow grant', () => {
    const out = applyFailClosed(null, { fallback: 'allow-once' })
    expect(out).toMatchObject({ decision: 'allow', usedFallback: true, policy: 'allow-once' })
  })

  it('resolves delegate to a deny with the delegate policy recorded', () => {
    const out = applyFailClosed(null, { fallback: 'delegate' })
    expect(out).toMatchObject({ decision: 'deny', usedFallback: true, policy: 'delegate' })
  })

  it('uses the custom fallback reason', () => {
    expect(applyFailClosed(null, { fallbackReason: 'reviewer crashed' }).reason).toBe('reviewer crashed')
  })

  it('defaults the policy to rejected', () => {
    expect(DEFAULT_FALLBACK).toBe('rejected')
  })
})
