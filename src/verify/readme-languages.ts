/**
 * Mechanical README-language gate: the English base `README.md` must exist and
 * every configured language must have a non-empty `README.<lang>.md`. This is
 * the single-language-check core the 33 repos' five-language `verify-readmes`
 * scripts reduce to; configure `languages` to match a repo's translation set.
 *
 * @module dsh-plugin-kit/verify/readme-languages
 */

import { join } from 'node:path'
import { readText, report, type VerifyIssue, type VerifyReport } from './report.ts'

/** Options for {@link verifyReadmeLanguages}. */
export interface VerifyReadmeLanguagesOptions {
  /** Language codes whose `README.<code>.md` must exist. Default `['zh']`. */
  readonly languages?: readonly string[]
}

/**
 * Check that the English README and each configured translation exist and are
 * non-empty.
 * @param dir - repo root.
 * @param options - language codes to require.
 * @returns the gate report.
 */
export function verifyReadmeLanguages(dir: string, options: VerifyReadmeLanguagesOptions = {}): VerifyReport {
  const languages = options.languages ?? ['zh']
  const errors: VerifyIssue[] = []

  const english = readText(join(dir, 'README.md'))
  if (english === undefined || english.trim().length === 0) {
    errors.push({ path: 'README.md', message: 'English README.md missing or empty' })
  }

  for (const lang of languages) {
    const name = `README.${lang}.md`
    const text = readText(join(dir, name))
    if (text === undefined || text.trim().length === 0) {
      errors.push({ path: name, message: `translation ${name} missing or empty` })
    }
  }

  return report(errors)
}
