/**
 * Mechanical seam gate: a capability seam is the Service Definition / Service
 * Provider / Consumer trio, never one role alone. This gate scans a plugin's
 * source for a marker of each role and fails when any role is absent, so an
 * incomplete seam is caught mechanically instead of in review.
 *
 * **Scope: a plugin that carries a seam must carry all three roles. A plugin that
 * carries none is out of scope, not incomplete.** The distinction is measured, not
 * assumed: the gate fires only once at least one role marker is present. That
 * matters because a large part of the family has no capability seam at all — a
 * pure detector or a read-only tool registers nothing for anyone else to consume
 * (`dsh-plugin-doctor` is the canonical case), and failing it for not having a
 * seam would report a structural exception as a defect. The failure mode this gate
 * exists to catch, a half-declared seam, still fails exactly as before.
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
 * Check that a repo's source carries all three seam roles, when it carries a seam at all.
 * @param dir - repo root.
 * @param options - markers and source directory.
 * @returns the gate report.
 */
export function verifySeam(dir: string, options: VerifySeamOptions = {}): VerifyReport {
  const markers = options.markers ?? DEFAULT_MARKERS
  const sourceDir = options.sourceDir ?? 'src'
  const errors: VerifyIssue[] = []
  const warnings: VerifyIssue[] = []

  const srcFiles = listFiles(dir, SOURCE_EXTS).filter(path => path.startsWith(`${sourceDir}/`) || path.startsWith(`${sourceDir}\\`))
  // 纯 JS 仓（无 src/ 目录，入口在仓库根，如 index.mjs）：回退扫描根层源文件
  // （listFiles 已排除 node_modules/.git/lib/coverage，根层即发布面源码）
  const files = srcFiles.length > 0 ? srcFiles : listFiles(dir, SOURCE_EXTS).filter(path => !path.includes('/'))
  if (files.length === 0) {
    errors.push({ path: sourceDir, message: `no source files found under ${sourceDir} or the repo root` })
    return report(errors)
  }

  const corpus = files.map(file => readText(join(dir, file)) ?? '').join('\n')

  // Out of scope: no role marker anywhere means this plugin carries no capability seam,
  // so there is no incomplete trio to report. Passing is not leniency — it is the correct
  // reading of "an incomplete seam is caught", and the warning keeps the outcome visible
  // instead of indistinguishable from a fully conforming trio.
  const present = Object.entries(markers).filter(([, marker]) => corpus.includes(marker))
  if (present.length === 0) {
    warnings.push({
      path: sourceDir,
      message: `no seam role marker present (none of ${Object.values(markers).map(m => JSON.stringify(m)).join(', ')}); `
        + 'this plugin carries no capability seam, so the three-role rule does not apply',
    })
    return report(errors, warnings)
  }

  for (const [role, marker] of Object.entries(markers)) {
    if (!corpus.includes(marker)) {
      errors.push({ path: sourceDir, message: `seam role "${role}" marker ${JSON.stringify(marker)} not found in source` })
    }
  }

  return report(errors, warnings)
}
