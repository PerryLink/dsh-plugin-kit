/**
 * Mechanical license gate: a plugin repo must ship a non-empty license file
 * and its `package.json` `license` field must be a known SPDX identifier
 * (default `Apache-2.0`, matching the 33-repo convention). Other repos reuse
 * this by calling `verifyLicense(process.cwd())` from their CI.
 *
 * @module dsh-plugin-kit/verify/license
 */

import { join } from 'node:path'
import { readText, report, type VerifyIssue, type VerifyReport } from './report.ts'

/** Options for {@link verifyLicense}. */
export interface VerifyLicenseOptions {
  /** SPDX id the `package.json` `license` field must equal. Default `Apache-2.0`. */
  readonly expected?: string
  /** Candidate license filenames (first match wins). */
  readonly licenseFiles?: readonly string[]
}

/** Candidate license filenames checked when none are configured. */
const DEFAULT_LICENSE_FILES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt'] as const

/**
 * Check the license surface of a repo directory.
 * @param dir - repo root.
 * @param options - expected SPDX id and candidate filenames.
 * @returns the gate report.
 */
export function verifyLicense(dir: string, options: VerifyLicenseOptions = {}): VerifyReport {
  const expected = options.expected ?? 'Apache-2.0'
  const candidates = options.licenseFiles ?? DEFAULT_LICENSE_FILES
  const errors: VerifyIssue[] = []
  const warnings: VerifyIssue[] = []

  const found = candidates.find(name => readText(join(dir, name)) !== undefined)
  if (found === undefined) {
    errors.push({ message: `no license file found (looked for ${candidates.join(', ')})` })
  }

  const pkgText = readText(join(dir, 'package.json'))
  if (pkgText === undefined) {
    warnings.push({ path: 'package.json', message: 'package.json not found; license field not checked' })
  } else {
    let license: unknown
    try {
      license = (JSON.parse(pkgText) as Record<string, unknown>).license
    } catch {
      license = undefined
    }
    if (typeof license !== 'string' || license.trim() === '') {
      errors.push({ path: 'package.json', message: `missing or empty "license" field (expected ${expected})` })
    } else if (license !== expected) {
      warnings.push({ path: 'package.json', message: `license "${license}" differs from expected "${expected}"` })
    }
  }

  return report(errors, warnings)
}
