/**
 * Cost / carbon / latency estimation tables and formatting (zero dependency).
 *
 * Consolidates the pure-estimate surface of `dsh-budget` (`src/estimate/`)
 * into one importable module so `dsh-budget`, `dsh-observe`, `dsh-draw`, and
 * `dsh-background-agents` stop duplicating tables. Function names and shapes
 * mirror `dsh-budget` exactly (`PriceEntry`, `BUILTIN_PRICES`, `mergePrices`,
 * `priceFor`, `estimateUsageCost`, `cnyPer1kToUsdPer1m`, `CARBON_INTENSITY`,
 * `DEFAULT_PUE`, `tokenCarbon`, `latencyStats`, `formatMs`, `formatMoney`,
 * `formatTokens`) for a mechanical migration.
 *
 * Prices are USD per 1M tokens; they drift, so treat the table as a starting
 * point and override entries per deployment.
 *
 * @module dsh-plugin-kit/shared/pricing
 */

// ---------------------------------------------------------------------------
// Price table + cost
// ---------------------------------------------------------------------------

/** Where a built-in price entry's numbers came from. */
export type PriceSource = 'vendor' | 'upstream-cny'

/** USD price per 1M tokens. Cache fields follow the harness TokenUsage split. */
export interface PriceEntry {
  /** Uncached input tokens. */
  readonly input: number
  /** Output tokens. */
  readonly output: number
  /** Cached (hit) input tokens; defaults to `input` when absent. */
  readonly cacheRead?: number
  /** Cache-miss (written) input tokens; defaults to `input` when absent. */
  readonly cacheWrite?: number
  /** Provenance metadata for built-in entries. */
  readonly source?: PriceSource
}

/** Fixed CNY→USD rate used when converting the upstream CNY-per-1k table. */
export const UPSTREAM_CNY_PER_USD = 7.2

/**
 * Convert an upstream CNY-per-1k price into USD per 1M tokens.
 * @param cnyPer1k - price in CNY per 1000 tokens.
 * @returns the price in USD per 1,000,000 tokens.
 */
export function cnyPer1kToUsdPer1m(cnyPer1k: number): number {
  return (cnyPer1k * 1000) / UPSTREAM_CNY_PER_USD
}

/** The built-in price table (USD per 1M tokens). */
export const BUILTIN_PRICES: Readonly<Record<string, PriceEntry>> = Object.freeze({
  'deepseek-chat': { input: 0.27, cacheRead: 0.027, cacheWrite: 0.27, output: 1.1, source: 'vendor' },
  'deepseek-reasoner': { input: 0.55, cacheRead: 0.055, cacheWrite: 0.55, output: 2.19, source: 'vendor' },
  'gpt-4o': { input: 2.5, cacheRead: 1.25, output: 10.0, source: 'vendor' },
  'gpt-4o-mini': { input: 0.15, cacheRead: 0.075, output: 0.6, source: 'vendor' },
  'claude-sonnet-4-5': { input: 3.0, output: 15.0, source: 'vendor' },
  'gemini-2.5-flash': { input: 0.3, output: 2.5, source: 'vendor' },
  'qwen-plus': { input: cnyPer1kToUsdPer1m(0.04), output: cnyPer1kToUsdPer1m(0.04), source: 'upstream-cny' },
  'glm-4': { input: cnyPer1kToUsdPer1m(0.1), output: cnyPer1kToUsdPer1m(0.1), source: 'upstream-cny' },
})

/**
 * Merge the user table over the built-in table (per-model override).
 * @param custom - deployment-specific entries.
 * @returns the merged table; custom entries win per model id.
 */
export function mergePrices(custom: Readonly<Record<string, PriceEntry>>): Record<string, PriceEntry> {
  return { ...BUILTIN_PRICES, ...custom }
}

/**
 * Resolve the price for one exact route: `${provider}/${model}` first, then
 * the bare model id, then the fallback.
 * @param table - merged price table.
 * @param fallback - price for models absent from the table.
 * @param provider - registered provider route.
 * @param model - model id.
 * @returns the effective price entry (never undefined).
 */
export function priceFor(
  table: Readonly<Record<string, PriceEntry>>,
  fallback: Readonly<PriceEntry>,
  provider: string,
  model: string,
): PriceEntry {
  return table[`${provider}/${model}`] ?? table[model] ?? fallback
}

/** Cost breakdown for one usage record. */
export interface UsageCost {
  readonly inputCost: number
  readonly outputCost: number
  readonly cacheReadCost: number
  readonly cacheWriteCost: number
  readonly totalCost: number
}

/**
 * Price one disjoint token usage record.
 * @param price - effective price entry.
 * @param inputTokens - uncached input tokens.
 * @param outputTokens - output tokens.
 * @param cacheReadTokens - cache-hit tokens (0 when absent).
 * @param cacheWriteTokens - cache-miss tokens (0 when absent).
 * @returns the USD cost breakdown.
 */
export function estimateUsageCost(
  price: Readonly<PriceEntry>,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
  cacheWriteTokens: number,
): UsageCost {
  const inputCost = (inputTokens / 1_000_000) * price.input
  const outputCost = (outputTokens / 1_000_000) * price.output
  const cacheReadCost = (cacheReadTokens / 1_000_000) * (price.cacheRead ?? price.input)
  const cacheWriteCost = (cacheWriteTokens / 1_000_000) * (price.cacheWrite ?? price.input)
  return { inputCost, outputCost, cacheReadCost, cacheWriteCost, totalCost: inputCost + outputCost + cacheReadCost + cacheWriteCost }
}

// ---------------------------------------------------------------------------
// Carbon
// ---------------------------------------------------------------------------

/** Regional grid carbon intensity in kg CO2e per kWh. */
export const CARBON_INTENSITY: Readonly<Record<string, number>> = Object.freeze({
  global: 0.475,
  us: 0.386,
  eu: 0.276,
  china: 0.555,
  india: 0.708,
  uk: 0.233,
  france: 0.056,
  iceland: 0.01,
})

/** Default power usage effectiveness. */
export const DEFAULT_PUE = 1.58

/** Token-bridge carbon result for one token volume. */
export interface TokenCarbonResult {
  /** IT energy in kWh (tokens × kWh/token). */
  readonly energyKwh: number
  /** Total energy in kWh (IT × PUE). */
  readonly totalEnergyKwh: number
  /** Emissions in kg CO2e. */
  readonly co2Kg: number
  /** Regional intensity used, kg CO2e/kWh. */
  readonly carbonIntensity: number
}

/**
 * Estimate the carbon footprint of a token volume: energy = tokens × kWh/token,
 * total = energy × PUE, CO2 = total × regional intensity.
 * @param tokens - total tokens processed (all buckets).
 * @param energyKwhPerToken - IT energy per token in kWh.
 * @param pue - power usage effectiveness.
 * @param region - electricity region key.
 * @returns the estimation result.
 * @throws on an unknown region.
 */
export function tokenCarbon(tokens: number, energyKwhPerToken: number, pue: number, region: string): TokenCarbonResult {
  const carbonIntensity = CARBON_INTENSITY[region]
  if (carbonIntensity === undefined) throw new Error(`Unknown region: ${region}`)
  const energyKwh = tokens * energyKwhPerToken
  const totalEnergyKwh = energyKwh * pue
  return { energyKwh, totalEnergyKwh, co2Kg: totalEnergyKwh * carbonIntensity, carbonIntensity }
}

// ---------------------------------------------------------------------------
// Latency
// ---------------------------------------------------------------------------

/** Percentile statistics over one duration sample window (milliseconds). */
export interface LatencyStats {
  readonly count: number
  readonly mean: number
  readonly min: number
  readonly max: number
  readonly p50: number
  readonly p95: number
  readonly p99: number
  readonly stdev: number
}

/** One percentile via linear interpolation (R-7, numpy default). */
function percentile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return 0
  if (sorted.length === 1) return sorted[0]!
  const position = (sorted.length - 1) * q
  const lo = Math.floor(position)
  const hi = Math.ceil(position)
  const lower = sorted[lo]!
  return lo === hi ? lower : lower + (sorted[hi]! - lower) * (position - lo)
}

/**
 * Aggregate latency statistics over a sample window. Deterministic and pure;
 * callers own the sample retention policy.
 * @param samples - durations in milliseconds (any order, may be empty).
 * @returns the statistics; every field is 0 for an empty window.
 */
export function latencyStats(samples: readonly number[]): LatencyStats {
  if (samples.length === 0) {
    return { count: 0, mean: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0, stdev: 0 }
  }
  const sorted = [...samples].sort((a, b) => a - b)
  const count = sorted.length
  const mean = sorted.reduce((sum, value) => sum + value, 0) / count
  const variance = sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / count
  return {
    count,
    mean,
    min: sorted[0]!,
    max: sorted[count - 1]!,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
    stdev: Math.sqrt(variance),
  }
}

/**
 * Format a millisecond duration: `123ms` for sub-second values, `1.23s` otherwise.
 * @param ms - duration in milliseconds.
 * @returns the formatted duration.
 */
export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Display-currency options for {@link formatMoney}. */
export interface MoneyFormat {
  /** Currency code placed before the amount (display only). */
  readonly code: string
  /** Display-currency units per 1 USD (1 = USD). */
  readonly rate: number
  /** Decimal places. */
  readonly decimals: number
}

/** Insert grouping separators into the integer part of a decimal string. */
function groupInteger(integer: string): string {
  let out = ''
  let count = 0
  for (let i = integer.length - 1; i >= 0; i -= 1) {
    out = integer[i]! + out
    count += 1
    if (count % 3 === 0 && i > 0) out = `,${out}`
  }
  return out
}

/**
 * Format a USD amount in the configured display currency, deterministically
 * (no locale-dependent grouping).
 * @param usd - amount in USD.
 * @param format - display options.
 * @returns e.g. `USD 1,234.57`; non-finite input renders as `USD 0.00`.
 */
export function formatMoney(usd: number, format: Readonly<MoneyFormat>): string {
  const decimals = Math.max(0, Math.trunc(format.decimals))
  if (!Number.isFinite(usd) || !Number.isFinite(format.rate)) {
    return `${format.code} ${(0).toFixed(decimals)}`
  }
  const converted = usd * format.rate
  const fixed = converted.toFixed(decimals)
  const [integer, fraction = ''] = fixed.split('.') as [string, string?]
  const sign = integer.startsWith('-') ? '-' : ''
  const digits = sign === '-' ? integer.slice(1) : integer
  return `${format.code} ${sign}${groupInteger(digits)}${fraction === '' ? '' : `.${fraction}`}`
}

/**
 * Format a token count compactly: `999` stays as-is, `1234` → `1.23k`,
 * `4_500_000` → `4.50M`.
 * @param tokens - non-negative token count.
 * @returns the compact string.
 */
export function formatTokens(tokens: number): string {
  if (!Number.isFinite(tokens) || tokens < 0) return '0'
  if (tokens < 1000) return String(Math.round(tokens))
  if (tokens < 1_000_000) return `${(tokens / 1000).toFixed(tokens < 10_000 ? 2 : 1)}k`
  return `${(tokens / 1_000_000).toFixed(tokens < 10_000_000 ? 2 : 1)}M`
}
