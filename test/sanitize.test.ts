import { describe, expect, it } from 'vitest'
import {
  createStripper,
  redactMapping,
  redactText,
  sanitizeText,
  sanitizeUrl,
  Stripper,
} from '../src/shared/sanitize.ts'

describe('Stripper round-trip', () => {
  it('masks PII to placeholders and restores them', () => {
    const stripper = createStripper()
    const masked = stripper.strip('call 13800138000 or email a@b.com')
    expect(masked).toContain('<PHONE_1>')
    expect(masked).toContain('<EMAIL_1>')
    expect(masked).not.toContain('13800138000')
    expect(masked).not.toContain('a@b.com')
    expect(stripper.restore(masked)).toBe('call 13800138000 or email a@b.com')
  })

  it('reuses the same placeholder for the same original across calls', () => {
    const stripper = createStripper()
    const first = stripper.stripInto('call 13800138000')
    const second = stripper.stripInto('again 13800138000')
    expect(first.text).toContain('<PHONE_1>')
    expect(second.text).toContain('<PHONE_1>')
    expect(second.replaced).toBe(1)
  })

  it('reloads a persisted mapping and keeps restoring', () => {
    const stripper = createStripper()
    stripper.loadMapping({ '<PHONE_7>': '13800138000' })
    expect(stripper.restore('dial <PHONE_7>')).toBe('dial 13800138000')
  })
})

describe('redact helpers', () => {
  it('redacts credential assignments, URL userinfo, and PII', () => {
    expect(redactText('api_key = abc123secret')).toBe('api_key = ***')
    expect(redactText('http://user:pass@host.com')).toBe('http://***@host.com')
    expect(redactText('mail a@b.com now')).toBe('mail *** now')
    expect(redactText(42)).toBe('42')
  })

  it('summarizes a mapping without plaintext', () => {
    expect(redactMapping({ '<PHONE_1>': '13800138000' })).toEqual({ '<PHONE_1>': '***' })
    expect(redactMapping(null)).toEqual({})
  })

  it('sanitizes display text and URLs', () => {
    expect(sanitizeText('a\u0000b  c', 20)).toBe('ab c')
    expect(sanitizeText('abcdefghij', 3)).toBe('ab…')
    expect(sanitizeUrl('https://user:pass@example.com/path')).toBe('https://***@example.com/path')
    expect(sanitizeUrl('not a url')).toBe('')
  })
})

describe('Stripper bounded eviction', () => {
  it('evicts the oldest entry past maxEntries', () => {
    const stripper = new Stripper({ patterns: [{ entity: 'email', source: /[a-z]+@[a-z]+\.[a-z]+/gu, score: 1 }], maxEntries: 1 })
    stripper.stripInto('a@b.com')
    stripper.stripInto('c@d.com')
    expect(stripper.mapping()).toEqual({ '<EMAIL_2>': 'c@d.com' })
  })
})
