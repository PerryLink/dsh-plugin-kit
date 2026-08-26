/**
 * Adaptive (ignorable) session-event append gate helpers.
 *
 * DSH session logs reject event types the running host does not know about
 * unless the append carries the `ignorable: true` envelope. Plugin audit events
 * therefore must be gated: append directly when the host knows the type, append
 * with the ignorable envelope when the host's `Session.append` stamps it, and
 * otherwise skip the append so the session keeps loading. This module is the
 * framework-agnostic form of the gate `dsh-mask` and `dsh-auto-review` both
 * reimplement (their `lib/gate.mjs` and `src/audit.ts`).
 *
 * @module dsh-plugin-kit/gates/session-event
 */

/** What an adaptive gate decides for one event type. */
export interface EventGateDecision {
  /** Whether the event may be appended at all. */
  readonly append: boolean
  /** Whether the append must carry the `ignorable` envelope. */
  readonly ignorable: boolean
}

/** A gate: maps an event type to its append decision. */
export type EventGate = (type: string) => EventGateDecision

/**
 * Build the adaptive event gate.
 *
 * @param knownTypes - event types the host's `SessionEventMap` knows.
 * @param ignorableAppend - whether the host's `Session.append` stamps the
 *   `ignorable` envelope (probe with {@link probeIgnorableAppend}).
 * @returns the decision function described above.
 */
export function makeEventGate(knownTypes: ReadonlySet<string>, ignorableAppend = false): EventGate {
  return (type) => {
    if (knownTypes.has(type)) return { append: true, ignorable: false }
    if (ignorableAppend) return { append: true, ignorable: true }
    return { append: false, ignorable: false }
  }
}

/** The minimal `Session` surface the append helper needs (structural type). */
export interface AppendableSession {
  /**
   * Append one session event.
   * @param type - event type.
   * @param data - event payload.
   * @param envelope - optional options bag (`{ ignorable: boolean }`).
   * @returns the appended event (shape host-dependent).
   */
  append(type: string, data: unknown, envelope?: { readonly ignorable?: boolean }): unknown
}

/**
 * Append a session event through the gate, swallowing append errors (a failed
 * audit append warns but must never break the session).
 *
 * @param session - the session, or `null`/`undefined` (skips the append).
 * @param type - event type to append.
 * @param data - event payload.
 * @param gate - a gate from {@link makeEventGate}.
 * @param warn - optional warning sink for a failed append.
 * @returns the appended event, or `undefined` when the gate refused or append failed.
 */
export function maybeAppendSessionEvent(
  session: AppendableSession | null | undefined,
  type: string,
  data: unknown,
  gate: EventGate,
  warn?: (message: string) => void,
): unknown {
  if (session === null || session === undefined) return undefined
  const decision = gate(type)
  if (!decision.append) return undefined
  try {
    return session.append(type, data, decision.ignorable ? { ignorable: true } : undefined)
  } catch (error) {
    warn?.(`session event ${type} append failed: ${error instanceof Error ? error.message : String(error)}`)
    return undefined
  }
}

/**
 * Probe whether the host's `Session.append` stamps the `ignorable` envelope:
 * append a probe event with `{ ignorable: true }` and check the returned
 * event's `ignorable` field. Hosts whose `append` drops the options bag
 * (every released rc line through `0.1.1-rc.2`) return `false`.
 *
 * @param session - the live session to probe.
 * @param probeType - an event type already known to the host (so the probe
 *   append is itself valid even when the envelope is not stamped).
 * @param probeData - payload for the probe event.
 * @returns `true` when the host stamps the envelope.
 */
export function probeIgnorableAppend(session: AppendableSession, probeType: string, probeData: unknown = {}): boolean {
  const event = session.append(probeType, probeData, { ignorable: true }) as { ignorable?: boolean } | undefined
  return event?.ignorable === true
}
