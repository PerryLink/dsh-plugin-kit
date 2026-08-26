/**
 * Thin CLI over the three mechanical gates. Run the built artifact from CI:
 *
 * ```sh
 * node lib/verify/cli.js verify-license .
 * node lib/verify/cli.js verify-readme-languages .
 * node lib/verify/cli.js verify-seam .
 * node lib/verify/cli.js all .
 * ```
 *
 * A failing gate prints its report and sets a non-zero exit code; it never
 * throws, so a CI script can chain the gates without `|| true`.
 *
 * @module dsh-plugin-kit/verify/cli
 */

import { pathToFileURL } from 'node:url'
import { formatReport, type VerifyReport } from './report.ts'
import { verifyLicense } from './license.ts'
import { verifyReadmeLanguages } from './readme-languages.ts'
import { verifySeam } from './seam.ts'

/** Run one gate, print its report, and set `process.exitCode` on failure. */
function runGate(name: string, check: () => VerifyReport): void {
  const result = check()
  process.stdout.write(formatReport(name, result))
  if (!result.ok) process.exitCode = 1
}

/**
 * Dispatch CLI arguments to a gate.
 * @param argv - `process.argv.slice(2)` (`<gate> [dir]`).
 */
export function main(argv: readonly string[]): void {
  const gate = argv[0] ?? 'all'
  const dir = argv[1] ?? '.'
  switch (gate) {
    case 'verify-license':
      runGate('verify-license', () => verifyLicense(dir))
      return
    case 'verify-readme-languages':
      runGate('verify-readme-languages', () => verifyReadmeLanguages(dir))
      return
    case 'verify-seam':
      runGate('verify-seam', () => verifySeam(dir))
      return
    case 'all':
      runGate('verify-license', () => verifyLicense(dir))
      runGate('verify-readme-languages', () => verifyReadmeLanguages(dir))
      runGate('verify-seam', () => verifySeam(dir))
      return
    default:
      process.stderr.write(`unknown gate "${gate}" (expected verify-license | verify-readme-languages | verify-seam | all)\n`)
      process.exitCode = 2
  }
}

// Run directly only when this module is the entry point (not when imported).
const invokedAs = process.argv[1]
if (invokedAs !== undefined && import.meta.url === pathToFileURL(invokedAs).href) {
  main(process.argv.slice(2))
}
