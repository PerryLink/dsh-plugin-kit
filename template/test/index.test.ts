import { describe, expect, it } from 'vitest'
import { resolveConfig } from '../src/index.ts'

describe('resolveConfig', () => {
  it('defaults the provider to "default"', () => {
    expect(resolveConfig({})).toEqual({ provider: 'default' })
  })

  it('keeps an explicit provider', () => {
    expect(resolveConfig({ provider: 'fast' })).toEqual({ provider: 'fast' })
  })
})
