import { describe, expect, it } from 'vitest'
import {
  estimateUsageCost,
  formatMoney,
  formatTokens,
  latencyStats,
  mergePrices,
  priceFor,
  tokenCarbon,
} from '../src/shared/pricing.ts'

describe('cost estimation', () => {
  it('prices disjoint token buckets', () => {
    const cost = estimateUsageCost({ input: 1, output: 2, cacheRead: 0.5 }, 1_000_000, 500_000, 1_000_000, 1_000_000)
    expect(cost.inputCost).toBeCloseTo(1)
    expect(cost.outputCost).toBeCloseTo(1)
    expect(cost.cacheReadCost).toBeCloseTo(0.5)
    expect(cost.cacheWriteCost).toBeCloseTo(1) // falls back to input price
    expect(cost.totalCost).toBeCloseTo(3.5)
  })

  it('resolves provider/model routes and merges overrides', () => {
    const merged = mergePrices({ 'deepseek-chat': { input: 9, output: 9 } })
    expect(merged['deepseek-chat']?.input).toBe(9)
    const table = { 'deepseek-chat': { input: 1, output: 2 }, 'x/deepseek-chat': { input: 3, output: 4 } }
    expect(priceFor(table, { input: 0, output: 0 }, 'x', 'deepseek-chat')).toEqual({ input: 3, output: 4 })
    expect(priceFor(table, { input: 0, output: 0 }, 'y', 'deepseek-chat')).toEqual({ input: 1, output: 2 })
    expect(priceFor(table, { input: 0, output: 0 }, 'y', 'unknown')).toEqual({ input: 0, output: 0 })
  })
})

describe('carbon estimation', () => {
  it('bridges tokens to CO2 via region and PUE', () => {
    const result = tokenCarbon(1_000_000, 0.0000001, 1.58, 'global')
    expect(result.energyKwh).toBeCloseTo(0.1)
    expect(result.totalEnergyKwh).toBeCloseTo(0.158)
    expect(result.co2Kg).toBeCloseTo(0.07505)
  })

  it('throws on an unknown region', () => {
    expect(() => tokenCarbon(1, 0.0000001, 1.58, 'mars')).toThrow(/Unknown region/)
  })
})

describe('latency stats', () => {
  it('computes percentile statistics', () => {
    const stats = latencyStats([10, 20, 30])
    expect(stats.count).toBe(3)
    expect(stats.mean).toBe(20)
    expect(stats.min).toBe(10)
    expect(stats.max).toBe(30)
    expect(stats.p50).toBe(20)
    expect(stats.p95).toBe(29)
    expect(stats.p99).toBeCloseTo(29.8)
    expect(stats.stdev).toBeCloseTo(8.1649, 3)
  })

  it('returns zeros for an empty window', () => {
    expect(latencyStats([])).toEqual({ count: 0, mean: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0, stdev: 0 })
  })
})

describe('formatting', () => {
  it('formats money with grouping and currency code', () => {
    expect(formatMoney(1234.5, { code: 'USD', rate: 1, decimals: 2 })).toBe('USD 1,234.50')
    expect(formatMoney(Number.NaN, { code: 'USD', rate: 1, decimals: 2 })).toBe('USD 0.00')
  })

  it('formats token counts compactly', () => {
    expect(formatTokens(999)).toBe('999')
    expect(formatTokens(1234)).toBe('1.23k')
    expect(formatTokens(4_500_000)).toBe('4.50M')
  })
})
