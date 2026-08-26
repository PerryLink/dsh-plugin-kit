/**
 * Mechanical seam gate: a capability seam is the Service Definition / Service
 * Provider / Consumer trio, never one role alone. This gate scans a plugin's
 * source for a marker of each role and fails when any role is absent, so an
 * incomplete seam is caught mechanically instead of in review.
 *
 * Markers are substring probes into source text; the shipped template
 * (`template/src/index.ts`) carries the exact markers this gate looks for.
 *
 * @module dsh-plugin-kit/verify/seam
 */

import { join } from 'node:path'
import { listFiles, readText, report, type VerifyIssue, type VerifyReport } from './report.ts'

/** Source filename suffixes scanned for role markers. */
const SOURCE_EXTS = ['.ts', '.mjs', '.js', '.tsx', '.jsx'] as const

/** Role markers the gate looks for. */
export interface SeamMarkers {
  /** Marker for the Service Definition role. */
  readonly definition: string
  /** Marker for the Service Provider role. */
  readonly provider: string
  /** Marker for the Consumer role. */
  readonly consumer: string
}

/** Options for {@link verifySeam}. */
export interface VerifySeamOptions {
  /** Custom role markers. */
  readonly markers?: SeamMarkers
  /** Directory scanned for sources. Default `src`. */
  readonly sourceDir?: string
}

/** Default role markers (matching the template's role comments). */
const DEFAULT_MARKERS: SeamMarkers = {
  definition: 'Service Definition',
  provider: 'Service Provider',
  consumer: 'Consumer',
}

/**
 * Check that a repo's source carries all three seam roles.
 * @param dir - repo root.
 * @param options - markers and source directory.
 * @returns the gate report.
 */
export function verifySeam(dir: string, options: VerifySeamOptions = {}): VerifyReport {
  const markers = options.markers ?? DEFAULT_MARKERS
  const sourceDir = options.sourceDir ?? 'src'
  const errors: VerifyIssue[] = []

  const files = listFiles(dir, SOURCE_EXTS).filter(path => path.startsWith(`${sourceDir}/`) || path.startsWith(`${sourceDir}\\`))
  if (files.length === 0) {
    errors.push({ path: sourceDir, message: `no source files found under ${sourceDir}` })
    return report(errors)
  }

  const corpus = files.map(file => readText(join(dir, file)) ?? '').join('\n')
  for (const [role, marker] of Object.entries(markers)) {
    if (!corpus.includes(marker)) {
      errors.push({ path: sourceDir, message: `seam role "${role}" marker ${JSON.stringify(marker)} not found in source` })
    }
  }

  return report(errors)
}
