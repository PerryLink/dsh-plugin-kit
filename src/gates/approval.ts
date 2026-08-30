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
 * (`'rejected'` | `'delegate'` | `'allow-once'`; `'rejected'` is the
 * fail-closed default) and its `{ decision, reason }` verdict surface, so
 * migrating the review plugin onto this kit is mechanical. Mapping between
 * the two vocabularies: this kit's closed verdict `deny` corresponds to
 * `dsh-auto-review`'s fallback policy `'rejected'`, and its `allow`
 * corresponds to `'allow-once'` (a one-shot grant); `'delegate'` has no
 * verdict equivalent and resolves to `deny` with the policy recorded on
 * {@link EffectiveDecision.policy}.
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

/**
 * The policy applied when no usable verdict is available. Mirrors
 * `dsh-auto-review`'s `fallbackPolicy` vocabulary verbatim:
 * - `'rejected'` — fail closed (the default): resolves to the `deny` verdict.
 * - `'delegate'` — no automated verdict: resolves to `deny` with
 *   `usedFallback: true` and {@link EffectiveDecision.policy} set to
 *   `'delegate'`, so the caller's escalation channel can pick it up.
 * - `'allow-once'` — one-shot grant: resolves to the `allow` verdict. An
 *   explicit opt-in; never the default.
 */
export type FallbackPolicy = 'rejected' | 'delegate' | 'allow-once'

/** Options for {@link applyFailClosed}. */
export interface FailClosedOptions {
  /** Policy to use when no verdict is available. Default `'rejected'` (fail closed). */
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
  /** The policy that produced the decision when `usedFallback` is `true`. */
  readonly policy?: FallbackPolicy
}

/** The fail-closed default: any failure resolves to `rejected`. */
export const DEFAULT_FALLBACK: FallbackPolicy = 'rejected'

/** Policy → closed-verdict mapping (see {@link FallbackPolicy}). */
const POLICY_DECISION: Readonly<Record<FallbackPolicy, GateDecision>> = Object.freeze({
  rejected: 'deny',
  delegate: 'deny',
  'allow-once': 'allow',
})

/**
 * Apply the fail-closed policy to a verdict-shaped result.
 *
 * A usable `allow` or `deny` verdict passes through unchanged. A missing or
 * unusable verdict resolves to `fallback` (default `rejected`) with
 * `usedFallback` set, so callers can log the fallback path for audit.
 *
 * @param verdict - the reviewer/rule result, or `null`/`undefined` on failure.
 * @param options - optional fallback policy and reason text.
 * @returns the effective decision (never a grant on failure by default).
 */
export function applyFailClosed(verdict: VerdictLike | null | undefined, options?: FailClosedOptions): EffectiveDecision {
  if (verdict !== null && verdict !== undefined) {
    return { decision: verdict.decision, reason: verdict.reason, usedFallback: false }
  }
  const policy = options?.fallback ?? DEFAULT_FALLBACK
  return {
    decision: POLICY_DECISION[policy],
    reason: options?.fallbackReason ?? `no verdict produced; fail-closed fallback ${policy}`,
    usedFallback: true,
    policy,
  }
}
