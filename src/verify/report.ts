/**
 * Shared report shape for the mechanical verify scripts. Each verify module
 * returns a {@link VerifyReport}; the CLI prints it and sets a non-zero exit
 * code on failure so CI can run `node lib/verify/cli.js <gate> <dir>`.
 *
 * @module dsh-plugin-kit/verify/report
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/** One problem (or warning) found by a gate. */
export interface VerifyIssue {
  /** Relative path the issue refers to, when one applies. */
  readonly path?: string
  /** Human-readable description of the issue. */
  readonly message: string
}

/** The outcome of one mechanical gate. */
export interface VerifyReport {
  /** `true` when the gate passed (no errors). */
  readonly ok: boolean
  readonly errors: readonly VerifyIssue[]
  readonly warnings: readonly VerifyIssue[]
}

/**
 * Build a report. A report is `ok` exactly when it has no errors.
 * @param errors - blocking issues.
 * @param warnings - non-blocking issues (default none).
 * @returns the report.
 */
export function report(errors: readonly VerifyIssue[], warnings: readonly VerifyIssue[] = []): VerifyReport {
  return { ok: errors.length === 0, errors, warnings }
}

/**
 * Render a report as text for stdout.
 * @param name - gate name.
 * @param result - the report.
 * @returns the printable text.
 */
export function formatReport(name: string, result: VerifyReport): string {
  const lines: string[] = []
  lines.push(`${result.ok ? 'PASS' : 'FAIL'} ${name}`)
  for (const error of result.errors) {
    lines.push(`  ERROR ${error.path ?? ''} ${error.message}`.trimEnd())
  }
  for (const warning of result.warnings) {
    lines.push(`  WARN  ${warning.path ?? ''} ${warning.message}`.trimEnd())
  }
  return `${lines.join('\n')}\n`
}

/**
 * Recursively list files under `dir` whose basename matches one of `exts`
 * (matched by suffix). Directories named `node_modules`, `.git`, and `lib`
 * are skipped.
 * @param dir - root directory to walk.
 * @param exts - filename suffixes to include (e.g. `.ts`, `.mjs`).
 * @returns relative paths (POSIX separators).
 */
export function listFiles(dir: string, exts: readonly string[]): string[] {
  const out: string[] = []
  const walk = (current: string): void => {
    let entries
    try {
      entries = readdirSync(current)
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'lib' || entry === 'coverage') continue
      const full = join(current, entry)
      let stat
      try {
        stat = statSync(full)
      } catch {
        continue
      }
      if (stat.isDirectory()) {
        walk(full)
      } else if (exts.some(ext => entry.endsWith(ext))) {
        out.push(relative(dir, full).split('\\').join('/'))
      }
    }
  }
  walk(dir)
  return out.sort()
}

/**
 * Read a UTF-8 file, returning `undefined` when it is missing or unreadable.
 * @param file - absolute or relative path.
 * @returns the text, or `undefined`.
 */
export function readText(file: string): string | undefined {
  if (!existsSync(file)) return undefined
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return undefined
  }
}
