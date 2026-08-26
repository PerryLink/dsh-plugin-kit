/**
 * Fail-closed approval gate helpers.
 *
 * An approval gate must never default to a grant: when a reviewer (second
 * model), a rule engine, or any other decision source fails to produce a
 * verdict, the gate resolves to `deny` unless the operator explicitly opted
 * into an open fallback. These pure helpers build that decision so approval
 * plugins do not hand-roll the fallback branch.
 *
 * Wire-compatible with `dsh-auto-review`'s `fallbackPolicy` vocabulary
 * (`'deny'` is the fail-closed default) and its `{ decision, reason }` verdict
 * surface, so migrating the review plugin onto this kit is mechanical.
 *
 * @module dsh-plugin-kit/gates/approval
 */

/** The closed decision vocabulary a verdict carries. */
export type GateDecision = 'allow' | 'deny'

/** A verdict-shaped value: what a reviewer or rule engine produced. */
export interface VerdictLike {
  readonly decision: GateDecision
  readonly reason: string
}

/** The policy applied when no usable verdict is available. */
export type FallbackPolicy = GateDecision

/** Options for {@link applyFailClosed}. */
export interface FailClosedOptions {
  /** Decision to use when no verdict is available. Default `'deny'` (fail closed). */
  readonly fallback?: FallbackPolicy
  /** Reason text attached to the fallback decision when used. */
  readonly fallbackReason?: string
}

/** The effective decision after the fail-closed fallback is applied. */
export interface EffectiveDecision {
  readonly decision: GateDecision
  readonly reason: string
  /** `true` when the fallback supplied the decision (no usable verdict). */
  readonly usedFallback: boolean
}

/** The fail-closed default: any failure resolves to `deny`. */
export const DEFAULT_FALLBACK: FallbackPolicy = 'deny'

/**
 * Apply the fail-closed policy to a verdict-shaped result.
 *
 * A usable `allow` or `deny` verdict passes through unchanged. A missing or
 * unusable verdict resolves to `fallback` (default `deny`) with `usedFallback`
 * set, so callers can log the fallback path for audit.
 *
 * @param verdict - the reviewer/rule result, or `null`/`undefined` on failure.
 * @param options - optional fallback policy and reason text.
 * @returns the effective decision (never a grant on failure by default).
 */
export function applyFailClosed(verdict: VerdictLike | null | undefined, options?: FailClosedOptions): EffectiveDecision {
  if (verdict !== null && verdict !== undefined) {
    return { decision: verdict.decision, reason: verdict.reason, usedFallback: false }
  }
  const fallback = options?.fallback ?? DEFAULT_FALLBACK
  return {
    decision: fallback,
    reason: options?.fallbackReason ?? `no verdict produced; fail-closed fallback ${fallback}`,
    usedFallback: true,
  }
}
