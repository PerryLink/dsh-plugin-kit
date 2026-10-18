/**
 * Mechanical verify gates reusable by every plugin repo's CI: license, README
 * language coverage, and capability-seam role completeness.
 *
 * The ecosystem size lives in `data/repos.json`, not in prose: it is the
 * registry consumed by the portal and the sync scripts, and
 * `scripts/check-parity.mjs` holds the READMEs to it. (This comment said "the
 * 33 repos" until 2026-10-13; the registry then held 95 entries — 87 active,
 * 5 frozen, 3 retired — 42 of them in this workspace.)
 *
 * @module dsh-plugin-kit/verify
 */

export * from './report.ts'
export * from './license.ts'
export * from './readme-languages.ts'
export * from './seam.ts'
export { main } from './cli.ts'
