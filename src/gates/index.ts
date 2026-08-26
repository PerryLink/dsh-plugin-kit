/**
 * Gate helpers: fail-closed approval requests and the adaptive (ignorable)
 * session-event append gate shared by every audit-producing DSH plugin.
 *
 * @module dsh-plugin-kit/gates
 */

export * from './approval.ts'
export * from './session-event.ts'
