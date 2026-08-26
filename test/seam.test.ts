import { describe, expect, it } from 'vitest'
import { createProviderRegistry, ProviderRegistry } from '../src/seam/provider.ts'

interface Capability {
  run(input: string): string
}

describe('ProviderRegistry', () => {
  it('registers, resolves, and disposes a provider', () => {
    const registry = new ProviderRegistry<Capability>()
    const impl: Capability = { run: input => `a:${input}` }
    const dispose = registry.register('a', impl)

    expect(registry.use('a')).toBe(impl)
    expect(registry.has('a')).toBe(true)
    expect(registry.names()).toEqual(['a'])

    dispose()
    expect(registry.use('a')).toBeUndefined()
    expect(registry.has('a')).toBe(false)

    // Disposing twice is a no-op.
    expect(() => dispose()).not.toThrow()
  })

  it('throws loudly on a duplicate registration', () => {
    const registry = new ProviderRegistry<Capability>()
    registry.register('a', { run: input => input })
    expect(() => registry.register('a', { run: input => input })).toThrow(/already registered/)
  })

  it('injects and resolves a default implementation', () => {
    const impl: Capability = { run: input => input }
    const registry = createProviderRegistry('default', impl)
    expect(registry.use()).toBe(impl)
    expect(registry.use('default')).toBe(impl)
  })

  it('switches the default and clears the registry', () => {
    const registry = new ProviderRegistry<string>({ default: { name: 'd', impl: 'def' } })
    registry.register('alt', 'alt')
    registry.setDefault('alt')
    expect(registry.use()).toBe('alt')

    registry.setDefault(undefined)
    expect(registry.use()).toBeUndefined()

    registry.clear()
    expect(registry.names()).toEqual([])
    expect(registry.use('alt')).toBeUndefined()
  })
})
