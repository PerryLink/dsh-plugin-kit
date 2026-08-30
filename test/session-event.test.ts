import { describe, expect, it, vi } from 'vitest'
import { makeEventGate, maybeAppendSessionEvent, probeIgnorableAppend } from '../src/gates/session-event.ts'
import type { AppendableSession } from '../src/gates/session-event.ts'

describe('makeEventGate', () => {
  it('appends known types directly', () => {
    expect(makeEventGate(new Set(['dsh/x']), true)('dsh/x')).toEqual({ append: true, ignorable: false })
  })

  it('appends unknown types with the ignorable envelope when the host stamps it', () => {
    expect(makeEventGate(new Set(['dsh/x']), true)('dsh/y')).toEqual({ append: true, ignorable: true })
  })

  it('refuses unknown types when the host cannot stamp the envelope', () => {
    expect(makeEventGate(new Set(['dsh/x']))('dsh/y')).toEqual({ append: false, ignorable: false })
  })
})

describe('maybeAppendSessionEvent', () => {
  it('skips a null session', () => {
    expect(maybeAppendSessionEvent(null, 'dsh/x', {}, makeEventGate(new Set(['dsh/x'])))).toBeUndefined()
  })

  it('skips types the gate refuses without calling append', () => {
    const append = vi.fn()
    const session = { append }
    expect(maybeAppendSessionEvent(session, 'dsh/y', {}, makeEventGate(new Set(['dsh/x'])))).toBeUndefined()
    expect(append).not.toHaveBeenCalled()
  })

  it('warns and returns undefined when the append throws', () => {
    const warn = vi.fn()
    const session: AppendableSession = {
      append: () => {
        throw new Error('boom')
      },
    }
    expect(maybeAppendSessionEvent(session, 'dsh/x', {}, makeEventGate(new Set(['dsh/x'])), warn)).toBeUndefined()
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]?.[0]).toContain('dsh/x')
  })
})

describe('probeIgnorableAppend', () => {
  it('reports true when the host stamps the envelope', () => {
    const session: AppendableSession = {
      append: (_type, _data, envelope?: { ignorable?: boolean }) => ({ ignorable: envelope?.ignorable }),
    }
    expect(probeIgnorableAppend(session, 'dsh/x')).toBe(true)
  })

  it('reports false when the host drops the envelope', () => {
    const session: AppendableSession = { append: () => ({}) }
    expect(probeIgnorableAppend(session, 'dsh/x')).toBe(false)
  })

  it('reports false instead of throwing when the host rejects the probe options bag (SurfaceIntent-era validateNext)', () => {
    const session: AppendableSession = {
      append: () => {
        throw new Error('validateNext: third argument must be a SurfaceIntent')
      },
    }
    expect(probeIgnorableAppend(session, 'dsh/x')).toBe(false)
  })
})
