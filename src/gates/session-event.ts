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
 * @param knownTypes - the host's known session-event vocabulary: event types
 *   the running host's `SessionEventMap` declares (its required-on-read
 *   `KNOWN_SESSION_EVENT_TYPES`). Hosts refuse appends whose type is not in
 *   this vocabulary unless the append carries the `ignorable` envelope.
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
   * @param third - host-dependent third argument: the options bag
   *   (`{ ignorable: boolean }`) accepted by every released rc line through
   *   `0.1.1-rc.2`, and a `SurfaceIntent` (`{ surfaceOp, sourceEventSeqs? }`,
   *   surface event types only) since `0.1.2-alpha.1` — still true in
   *   `0.1.2-alpha.2`, which has no `ignorable` option; its retained
   *   `ignorable?: true` envelope field exists for stored-log read
   *   compatibility only (host note
   *   2026-08-30-retain-ignorable-external-session-events). Declared
   *   `unknown` so sessions from all host generations satisfy this surface.
   * @returns the appended event (shape host-dependent).
   */
  append(type: string, data: unknown, third?: unknown): unknown
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
 * Hosts whose third append argument is a `SurfaceIntent` (`0.1.2-alpha.1`
 * onward, including `0.1.2-alpha.2`) never stamp the envelope either: the
 * probe options bag is ignored for log-only probe types and trips surface
 * validation for surface probe types. The read-back reports `false` on
 * both paths, because a host without an ignorable append option cannot
 * stamp the envelope.
 *
 * @param session - the live session to probe.
 * @param probeType - an event type already known to the host (so the probe
 *   append is itself valid even when the envelope is not stamped).
 * @param probeData - payload for the probe event.
 * @returns `true` when the host stamps the envelope.
 */
export function probeIgnorableAppend(session: AppendableSession, probeType: string, probeData: unknown = {}): boolean {
  try {
    // SurfaceIntent-era hosts (0.1.2-alpha.1 onward) either ignore the
    // probe options bag (log-only types) or throw validateNext (surface
    // types); the read-back below reports false on every path.
    return (session.append(probeType, probeData, { ignorable: true }) as { ignorable?: boolean } | undefined)?.ignorable === true
  } catch {
    // validateNext from a SurfaceIntent-era host with a surface probe type.
    return false
  }
}
