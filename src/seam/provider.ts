/**
 * Pluggable Provider registry seam template.
 *
 * A "seam" is the trio of Service Definition / Service Provider / Consumer
 * roles (see the deepseek-harness glossary). This module supplies the
 * framework-agnostic middle piece most DSH plugins need: a registry that maps
 * a name to one implementation of a capability, resolves the active one, and
 * makes every registration reversible.
 *
 * It deliberately imports nothing from `@deepseek-ai/*` so it stays usable as
 * a zero-dependency building block in both Host and Client halves. Inside a
 * Cordis plugin, wrap the returned disposer in `ctx.effect()`:
 *
 * ```ts
 * const registry = new ProviderRegistry<Detector>()
 * ctx.effect(() => registry.register('regex', new RegexDetector()))
 * ctx.effect(() => registry.register('ner', new NerDetector()))
 * const active = registry.use('ner') ?? registry.use()
 * ```
 *
 * @module dsh-plugin-kit/seam
 */

/** A function that reverses one registration (a Cordis-style disposer). */
export type Disposer = () => void

/** A named provider implementation registered under one capability. */
export interface ProviderEntry<T> {
  /** Stable registration key. */
  readonly name: string
  /** The implementation bound to {@link name}. */
  readonly impl: T
}

/** Options for {@link ProviderRegistry}. */
export interface ProviderRegistryOptions<T> {
  /** Optional default provider, registered and resolved by {@link ProviderRegistry.use} without an argument. */
  readonly default?: ProviderEntry<T>
}

/**
 * A reversible, named registry of one capability's implementations.
 *
 * Registration is a side effect: {@link register} returns a {@link Disposer}
 * that removes exactly that registration, so a plugin can register inside
 * `ctx.effect()` and let Cordis dispose it on stop/update. Duplicate names
 * fail loud — a second registration for an existing name is a misconfiguration,
 * not a silent replacement.
 *
 * @typeParam T - the provider interface shared by every implementation.
 */
export class ProviderRegistry<T> {
  readonly #providers = new Map<string, T>()
  #defaultName: string | undefined

  /**
   * @param options - optional default provider; when given it is registered
   *   immediately and becomes the fallback for {@link use} without an argument.
   */
  constructor(options?: ProviderRegistryOptions<T>) {
    if (options?.default !== undefined) {
      this.#providers.set(options.default.name, options.default.impl)
      this.#defaultName = options.default.name
    }
  }

  /**
   * Register a named implementation and return the disposer that unregisters it.
   *
   * @param name - stable registration key (unique within this registry).
   * @param impl - the implementation to bind.
   * @returns a disposer; calling it removes the registration (idempotent).
   * @throws when `name` is already registered.
   */
  register(name: string, impl: T): Disposer {
    if (this.#providers.has(name)) {
      throw new Error(`Provider "${name}" is already registered`)
    }
    this.#providers.set(name, impl)
    let active = true
    return () => {
      if (!active) return
      active = false
      this.#providers.delete(name)
    }
  }

  /**
   * Resolve the implementation for `name`, or the default provider when `name`
   * is omitted.
   *
   * @param name - registration key to resolve; omit to use the default.
   * @returns the implementation, or `undefined` when no such provider exists.
   */
  use(name?: string): T | undefined {
    const key = name ?? this.#defaultName
    if (key === undefined) return undefined
    return this.#providers.get(key)
  }

  /**
   * Whether a provider is registered under `name`.
   *
   * @param name - registration key to probe.
   * @returns `true` when the key is registered.
   */
  has(name: string): boolean {
    return this.#providers.has(name)
  }

  /** @returns every registered name, in insertion order. */
  names(): string[] {
    return [...this.#providers.keys()]
  }

  /**
   * Change which registered provider {@link use} resolves without an argument.
   *
   * @param name - the new default name, or `undefined` to clear it.
   */
  setDefault(name: string | undefined): void {
    this.#defaultName = name
  }

  /** Remove every registration and clear the default. */
  clear(): void {
    this.#providers.clear()
    this.#defaultName = undefined
  }
}

/**
 * Create a registry with an injected default implementation (convenience for
 * the common "default zero-dependency provider + optional heavy backends"
 * pattern the 33 repos share).
 *
 * @param defaultName - name for the default provider.
 * @param defaultImpl - default implementation registered under `defaultName`.
 * @returns a registry whose {@link ProviderRegistry.use} resolves `defaultImpl`.
 */
export function createProviderRegistry<T>(defaultName: string, defaultImpl: T): ProviderRegistry<T> {
  return new ProviderRegistry<T>({ default: { name: defaultName, impl: defaultImpl } })
}
