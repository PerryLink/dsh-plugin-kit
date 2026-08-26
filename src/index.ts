/**
 * @perrylink/dsh-plugin-kit — shared zero-runtime-dependency toolkit for
 * PerryLink DSH plugins.
 *
 * Subpath map:
 * - `dsh-plugin-kit/seam`   — pluggable Provider registry template.
 * - `dsh-plugin-kit/gates`  — fail-closed approval + adaptive session-event gates.
 * - `dsh-plugin-kit/shared` — sanitize / pricing / judge pure modules.
 * - `dsh-plugin-kit/verify` — mechanical verify gates (license / readmes / seam).
 *
 * @module dsh-plugin-kit
 */

export * from './seam/provider.ts'
export * from './gates/index.ts'
export * from './shared/index.ts'
export * from './verify/index.ts'
