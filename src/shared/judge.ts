/**
 * Judge decision schema validation (`{ decision, reason, riskLevel }`).
 *
 * Wire-compatible with `dsh-auto-review`'s reviewer verdict: the same closed
 * decision vocabulary (`allow`/`deny`), the same `RiskLevel` enum
 * (`low`/`medium`/`high`), the same object-rooted JSON schema, and the same
 * `parseVerdict` narrowing boundary. A plugin migrating its second-model judge
 * onto this module keeps its prompt, structured output, and audit payloads
 * byte-identical.
 *
 * @module dsh-plugin-kit/shared/judge
 */

/** The closed decision vocabulary a judge may emit. */
export type Decision = 'allow' | 'deny'

/** The risk-level vocabulary, ordered ascending. */
export type RiskLevel = 'low' | 'medium' | 'high'

/** Ascending risk order (index is the rank). */
export const RISK_ORDER: readonly RiskLevel[] = ['low', 'medium', 'high']

/** Whether `level` ranks strictly above `cap` in {@link RISK_ORDER}. */
export function riskExceeds(level: RiskLevel, cap: RiskLevel): boolean {
  return RISK_ORDER.indexOf(level) > RISK_ORDER.indexOf(cap)
}

/** A validated judge verdict. */
export interface JudgeVerdict {
  readonly decision: Decision
  readonly reason: string
  readonly riskLevel?: RiskLevel
}

/** JSON-schema node types in the host's enforced subset (host mirror). */
export type JsonSchemaType = 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null'

/** Scalar-only schema types accepted by literal constraints (host mirror). */
export type JsonSchemaScalarType = Exclude<JsonSchemaType, 'object' | 'array'>

/**
 * The minimal object-rooted JSON-schema surface the dsh-tools
 * structured-output seam enforces. Mirrors the host's `JsonSchemaNode`
 * (`packages/core/tools/src/json-schema.ts`): every node field is optional
 * there, so this structural type keeps `type`/`properties`/`required`/`enum`
 * optional and uses the host's mutable field types. `VERDICT_SCHEMA` is
 * therefore assignable to the host's `ObjectJsonSchema`
 * (`JsonSchemaNode & { type: 'object' }`) exactly as declared.
 */
export interface ObjectJsonSchema {
  type?: JsonSchemaType
  properties?: Record<string, ObjectJsonSchema>
  required?: string[]
  enum?: JsonSchemaScalarType[]
}

/**
 * Object-rooted verdict schema for the structured_output capture. The
 * intersection re-requires `type`/`properties`/`required` (present on this
 * literal) while keeping the assignability to the host's `ObjectJsonSchema`
 * (`JsonSchemaNode & { type: 'object' }`, all fields optional).
 */
export const VERDICT_SCHEMA: ObjectJsonSchema & { type: 'object'; properties: Record<string, ObjectJsonSchema>; required: string[] } = Object.freeze({
  type: 'object',
  properties: {
    decision: { type: 'string', enum: ['allow', 'deny'] },
    reason: { type: 'string' },
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
  },
  required: ['decision', 'reason'],
}) as ObjectJsonSchema & { type: 'object'; properties: Record<string, ObjectJsonSchema>; required: string[] }

/**
 * Truncate a string to a cap, appending an ellipsis when cut.
 * @param text - the string to cap.
 * @param maxChars - the maximum length (positive).
 * @returns the truncated string.
 */
export function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  const cut = maxChars - 1
  return cut > 0 ? `${text.slice(0, cut)}…` : ''
}

/**
 * Validate a captured structured value against the closed verdict vocabulary.
 * This is the boundary that narrows the provider-validated `unknown` capture
 * into a {@link JudgeVerdict}.
 * @param value - the captured structured value.
 * @param reasonMaxChars - the reason cap applied to the trimmed reason.
 * @returns the verdict, or `undefined` when the value cannot be a verdict.
 */
export function parseVerdict(value: unknown, reasonMaxChars: number): JudgeVerdict | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const record = value as Record<string, unknown>
  const decision = record.decision
  if (decision !== 'allow' && decision !== 'deny') return undefined
  const reason = record.reason
  if (typeof reason !== 'string' || reason.trim().length === 0) return undefined
  const riskLevel = record.riskLevel
  if (riskLevel !== undefined && riskLevel !== 'low' && riskLevel !== 'medium' && riskLevel !== 'high') return undefined
  return {
    decision,
    reason: truncate(reason.trim(), reasonMaxChars),
    ...riskLevel === undefined ? {} : { riskLevel },
  }
}
