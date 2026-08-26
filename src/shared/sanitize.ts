/**
 * PII masking/redaction pure functions (zero dependency).
 *
 * The `Stripper` class replaces PII with `<LABEL_N>` placeholders, keeps the
 * placeholder→original restore table in memory, and restores text from it.
 * The regex detectors and placeholder vocabulary are aligned with `dsh-mask`
 * (`lib/strip.mjs` + `lib/constants.mjs`, ported from Pii-Stripper-Middleware)
 * so a plugin can migrate onto this module without changing its wire format:
 * same entity names, same labels, same `<TYPE_N>` placeholder shape, same
 * `strip`/`stripInto`/`restore`/`mapping`/`loadMapping`/`stats` surface.
 *
 * Nothing here touches I/O and nothing throws on hostile input; non-string
 * inputs are conservatively stringified.
 *
 * @module dsh-plugin-kit/shared/sanitize
 */

/** Entity type identifiers (regex-capable subset from `dsh-mask`). */
export type EntityName = 'phone' | 'email' | 'id-card' | 'bank-card' | 'key' | 'ip'

/** Placeholder label per entity type (matches `dsh-mask` ENTITY_LABELS). */
export const ENTITY_LABELS: Readonly<Record<EntityName, string>> = Object.freeze({
  phone: 'PHONE',
  email: 'EMAIL',
  'id-card': 'ID_CARD',
  'bank-card': 'BANK_CARD',
  key: 'KEY',
  ip: 'IP',
})

/** One regex detector: an entity plus a compiled pattern and its confidence. */
export interface PiiPattern {
  readonly entity: EntityName
  readonly source: RegExp
  readonly score: number
}

/** Built-in regex detectors, aligned with `dsh-mask` `BUILTIN_PATTERNS`. */
export const BUILTIN_PATTERNS: readonly PiiPattern[] = Object.freeze([
  { entity: 'phone', source: /(?<!\d)1[3-9]\d{9}(?!\d)/gu, score: 0.95 },
  { entity: 'id-card', source: /(?<!\d)\d{17}[\dXx](?!\d)/gu, score: 0.92 },
  { entity: 'email', source: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gu, score: 0.9 },
  { entity: 'bank-card', source: /(?<!\d)\d{16,19}(?!\d)/gu, score: 0.65 },
  { entity: 'ip', source: /\b(?:\d{1,3}\.){3}\d{1,3}\b/gu, score: 0.85 },
  { entity: 'key', source: /sk-[A-Za-z0-9_-]{16,}/gu, score: 0.95 },
  { entity: 'key', source: /gh[pousr]_[A-Za-z0-9]{16,}/gu, score: 0.95 },
  { entity: 'key', source: /xox[baprs]-[A-Za-z0-9-]{10,}/gu, score: 0.9 },
  { entity: 'key', source: /AKIA[0-9A-Z]{16}/gu, score: 0.9 },
  { entity: 'key', source: /Bearer[ \t]+[A-Za-z0-9._~+/=-]{8,}/gu, score: 0.9 },
])

/** One detected PII fragment before overlap resolution. */
export interface DetectedEntity {
  readonly text: string
  readonly entity: EntityName
  readonly label: string
  readonly start: number
  readonly end: number
  readonly score: number
}

/** Options for {@link Stripper}. */
export interface StripperOptions {
  readonly patterns: readonly PiiPattern[]
  readonly maxEntries?: number
}

/** Default cap on retained placeholder mappings (bounded eviction). */
export const DEFAULT_MAX_ENTRIES = 500

/** Hard cap on input length (longer text is returned unchanged). */
export const MAX_TEXT_LENGTH = 1_000_000

/**
 * PII stripper: replaces PII with `<LABEL_N>` placeholders and restores them
 * from an in-memory mapping. Cumulative mode (`stripInto`) keeps the mapping
 * and counters across calls so the same original reuses the same placeholder
 * throughout a session; `strip` resets first (single-shot mode).
 */
export class Stripper {
  readonly #patterns: readonly PiiPattern[]
  readonly #maxEntries: number
  #counter = new Map<string, number>()
  #placeholderMap = new Map<string, string>()
  #valueMap = new Map<string, string>()
  #totalReplaced = 0
  #distribution = new Map<string, number>()

  constructor(options: StripperOptions) {
    this.#patterns = options.patterns
    this.#maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES
  }

  /** Clear counters, mappings, and statistics. */
  reset(): void {
    this.#counter = new Map()
    this.#placeholderMap = new Map()
    this.#valueMap = new Map()
    this.#totalReplaced = 0
    this.#distribution = new Map()
  }

  /**
   * Single-shot mask: reset, then replace PII. Returns the masked text.
   * @param text - text to mask (non-strings are stringified).
   * @returns the masked text.
   */
  strip(text: unknown): string {
    this.reset()
    return this.#apply(text)
  }

  /**
   * Cumulative mask: keep state across calls, returning this call's delta.
   * @param text - text to mask.
   * @returns the masked text plus the replacements and distribution added by
   *   this call only.
   */
  stripInto(text: unknown): { readonly text: string; readonly replaced: number; readonly distribution: Record<string, number> } {
    const startReplaced = this.#totalReplaced
    const startDist = new Map(this.#distribution)
    const out = this.#apply(text)
    const distribution: Record<string, number> = {}
    for (const [label, count] of this.#distribution) {
      const before = startDist.get(label) ?? 0
      if (count > before) distribution[label] = count - before
    }
    return { text: out, replaced: this.#totalReplaced - startReplaced, distribution }
  }

  /**
   * Restore placeholders in masked text to their originals (longest-first so a
   * short placeholder never shadows a longer one).
   * @param text - text containing placeholders.
   * @returns the restored text.
   */
  restore(text: string): string {
    if (typeof text !== 'string') return String(text)
    let result = text
    const entries = [...this.#placeholderMap.entries()].sort((a, b) => b[0].length - a[0].length)
    for (const [placeholder, original] of entries) {
      result = result.split(placeholder).join(original)
    }
    return result
  }

  /** @returns a read-only `{ placeholder: original }` copy. */
  mapping(): Record<string, string> {
    return Object.fromEntries(this.#placeholderMap)
  }

  /**
   * Reload a persisted `{ placeholder: original }` mapping (restore table
   * survival across restarts). Rebuilds per-label counters so future
   * placeholders stay monotonic; cumulative telemetry is process-local and not
   * reloaded.
   * @param entries - placeholder→original mapping to load.
   */
  loadMapping(entries: Record<string, string>): void {
    for (const [placeholder, original] of Object.entries(entries ?? {})) {
      this.#placeholderMap.set(placeholder, original)
      this.#valueMap.set(original, placeholder)
      const match = /^<([A-Z_]+)_(\d+)>$/u.exec(placeholder)
      if (match !== null) {
        const label = match[1]!
        const number = Number(match[2])
        const current = this.#counter.get(label) ?? 0
        if (number > current) this.#counter.set(label, number)
      }
    }
  }

  /** @returns cumulative audit statistics (never contains plaintext). */
  stats(): { readonly replaced: number; readonly distribution: Record<string, number> } {
    return { replaced: this.#totalReplaced, distribution: Object.fromEntries(this.#distribution) }
  }

  #apply(input: unknown): string {
    const text = typeof input === 'string' ? input : String(input)
    if (text.length === 0 || text.length > MAX_TEXT_LENGTH) return text
    const entities = this.#detect(text)
    const resolved = this.#resolveOverlaps(entities)
    return this.#applyReplacements(text, resolved)
  }

  #detect(text: string): DetectedEntity[] {
    const entities: DetectedEntity[] = []
    for (const pattern of this.#patterns) {
      for (const match of text.matchAll(pattern.source)) {
        const index = match.index ?? 0
        entities.push({
          text: match[0],
          entity: pattern.entity,
          label: ENTITY_LABELS[pattern.entity] ?? pattern.entity,
          start: index,
          end: index + match[0].length,
          score: pattern.score,
        })
      }
    }
    return entities
  }

  #resolveOverlaps(entities: readonly DetectedEntity[]): DetectedEntity[] {
    if (entities.length === 0) return []
    const sorted = [...entities].sort((a, b) => a.start - b.start || b.score - a.score)
    const result: DetectedEntity[] = []
    let lastEnd = -1
    for (const entity of sorted) {
      if (entity.start >= lastEnd) {
        result.push(entity)
        lastEnd = entity.end
      }
    }
    return result
  }

  #applyReplacements(text: string, entities: readonly DetectedEntity[]): string {
    const parts: string[] = []
    let lastEnd = 0
    for (const entity of [...entities].sort((a, b) => a.start - b.start)) {
      parts.push(text.slice(lastEnd, entity.start))
      const original = entity.text
      let placeholder = this.#valueMap.get(original)
      if (placeholder === undefined) {
        placeholder = this.#makePlaceholder(entity.label)
        this.#placeholderMap.set(placeholder, original)
        this.#valueMap.set(original, placeholder)
      }
      parts.push(placeholder)
      lastEnd = entity.end
      this.#totalReplaced += 1
      this.#distribution.set(entity.label, (this.#distribution.get(entity.label) ?? 0) + 1)
    }
    parts.push(text.slice(lastEnd))
    this.#prune()
    return parts.join('')
  }

  #makePlaceholder(label: string): string {
    const count = (this.#counter.get(label) ?? 0) + 1
    this.#counter.set(label, count)
    return `<${label}_${count}>`
  }

  #prune(): void {
    while (this.#placeholderMap.size > this.#maxEntries) {
      const oldest = this.#placeholderMap.keys().next().value as string | undefined
      if (oldest === undefined) break
      const original = this.#placeholderMap.get(oldest)
      this.#placeholderMap.delete(oldest)
      if (original !== undefined) this.#valueMap.delete(original)
    }
  }
}

/** Options for {@link createStripper}. */
export interface CreateStripperOptions {
  readonly entities?: readonly EntityName[]
  readonly maxEntries?: number
}

/**
 * Create a stripper configured for a subset of the built-in entity types.
 * @param options - optional entity whitelist and entry cap.
 * @returns a configured {@link Stripper}.
 */
export function createStripper(options: CreateStripperOptions = {}): Stripper {
  const enabled = new Set<EntityName>(options.entities ?? (Object.keys(ENTITY_LABELS) as EntityName[]))
  const patterns = BUILTIN_PATTERNS.filter(pattern => enabled.has(pattern.entity))
  return new Stripper({
    patterns,
    ...options.maxEntries === undefined ? {} : { maxEntries: options.maxEntries },
  })
}

/** key=value credential assignments (value fully redacted, key preserved). */
const CREDENTIAL_ASSIGNMENT = /\b((?:api[_-]?key|access[_-]?token|auth[_-]?token|refresh[_-]?token|password|passwd|client[_-]?secret|private[_-]?key)\s*=\s*)([^\s&;,]+)/giu

/** URL userinfo (`user:password@`) echoed back in error messages. */
const URL_USERINFO = /\/\/([^/\s:@]+):([^/\s@]+)@/gu

/** Merge of every built-in detector source for whole-value redaction. */
const REDACT_RE = new RegExp(BUILTIN_PATTERNS.map(pattern => pattern.source.source).join('|'), 'gu')

/**
 * Redact PII entities, credential assignments, and URL userinfo from arbitrary
 * text. Never throws: non-string inputs are stringified.
 * @param text - any output text (error messages, command/tool results).
 * @returns the redacted text.
 */
export function redactText(text: unknown): string {
  if (typeof text !== 'string') return String(text)
  return text
    .replace(URL_USERINFO, '//***@')
    .replace(CREDENTIAL_ASSIGNMENT, '$1***')
    .replace(REDACT_RE, '***')
}

/**
 * Reduce a `{ placeholder: original }` mapping to a safe `{ placeholder: '***' }`
 * summary for any surface that must show the mapping without plaintext.
 * @param mapping - the mapping, or any value.
 * @returns a summary containing only placeholder keys.
 */
export function redactMapping(mapping: unknown): Record<string, string> {
  if (mapping === null || typeof mapping !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [placeholder] of Object.entries(mapping as Record<string, unknown>)) {
    out[placeholder] = '***'
  }
  return out
}

/** Control characters plus zero-width and bidi-override code points. */
const CONTROL_OR_INVISIBLE = /[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/gu

/**
 * Make arbitrary text safe for one-line display and logs: strip control and
 * invisible characters, collapse whitespace runs, truncate with an ellipsis.
 * @param input - raw text (possibly hostile).
 * @param maxLength - output length cap (default 200).
 * @returns the sanitized text.
 */
export function sanitizeText(input: string, maxLength = 200): string {
  const text = input.replace(CONTROL_OR_INVISIBLE, '').replace(/\s+/gu, ' ').trim()
  if (text.length <= maxLength) return text
  const cut = maxLength - 1
  return cut > 0 ? `${text.slice(0, cut)}…` : ''
}

/**
 * Redact credentials from a URL for display and logs: the userinfo component
 * (`user:pass@`) is replaced, the rest is kept, and overlong URLs are cut.
 * @param input - raw URL (possibly hostile).
 * @param maxLength - output length cap (default 512).
 * @returns the redacted URL, or `''` when it cannot be parsed.
 */
export function sanitizeUrl(input: string, maxLength = 512): string {
  let parsed: URL
  try {
    parsed = new URL(input)
  } catch {
    return ''
  }
  if (parsed.username !== '' || parsed.password !== '') {
    parsed.username = '***'
    parsed.password = ''
  }
  const out = parsed.toString()
  if (out.length <= maxLength) return out
  return `${out.slice(0, maxLength - 1)}…`
}
