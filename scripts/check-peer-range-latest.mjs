#!/usr/bin/env node
/**
 * check-peer-range-latest - tripwire for the canonical `@deepseek-ai/dsh-*`
 * peer range stored in data/peer-range.json.
 *
 * Why this exists: semver only lets a prerelease version satisfy a comparator
 * set when a comparator in the *same* [major, minor, patch] tuple carries a
 * prerelease. That makes the canonical range a moving target - every new
 * upstream prerelease tuple (`0.1.6-rc.1`, ...) silently stops matching, even
 * though the OR form already carries one clause per known tuple. This script
 * turns "someone notices a failed install months later" into a red gate.
 *
 * Usage:
 *   node scripts/check-peer-range-latest.mjs                 # live registry check
 *   node scripts/check-peer-range-latest.mjs --pkg <name>    # check another package
 *   node scripts/check-peer-range-latest.mjs --range "<r>"   # override the range
 *   node scripts/check-peer-range-latest.mjs --tags latest,next,alpha
 *
 * Exit codes: 0 = every checked dist-tag is admitted by the range;
 *             1 = at least one published version is not admitted;
 *             2 = usage / network error.
 *
 * The version algebra below is a deliberate dependency-free subset of
 * node-semver (parse, compare, and the prerelease rule for `>=floor <upper`
 * clauses); it is covered by test/check-peer-range-latest.test.mjs.
 */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { parseRangeSet } from './sync-peer-range.mjs'

const DEFAULT_RANGE_FILE = resolve(import.meta.dirname, '..', 'data', 'peer-range.json')
const DEFAULT_PKG = '@deepseek-ai/dsh'
const DEFAULT_TAGS = ['latest', 'next', 'alpha']

/** Parse `major.minor.patch[-prerelease]`; returns null when malformed. */
export function parseVersion(value) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(String(value).trim())
  if (!m) return null
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] ? m[4].split('.') : [],
  }
}

function compareIdentifier(a, b) {
  const aNumeric = /^\d+$/.test(a)
  const bNumeric = /^\d+$/.test(b)
  if (aNumeric && bNumeric) return Number(a) - Number(b)
  if (aNumeric) return -1
  if (bNumeric) return 1
  return a < b ? -1 : a > b ? 1 : 0
}

/** Semver precedence. Throws on an unparseable version. */
export function compareVersions(a, b) {
  const va = parseVersion(a)
  const vb = parseVersion(b)
  if (!va || !vb) throw new Error(`unparseable version: ${!va ? a : b}`)
  for (const key of ['major', 'minor', 'patch']) {
    if (va[key] !== vb[key]) return va[key] < vb[key] ? -1 : 1
  }
  const pa = va.prerelease
  const pb = vb.prerelease
  if (pa.length === 0 && pb.length === 0) return 0
  if (pa.length === 0) return 1 // release > prerelease
  if (pb.length === 0) return -1
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if (pa[i] === undefined) return -1
    if (pb[i] === undefined) return 1
    const cmp = compareIdentifier(pa[i], pb[i])
    if (cmp !== 0) return cmp
  }
  return 0
}

/** Does `version` satisfy one `>=floor <upper` clause (semver prerelease rule included)? */
export function satisfiesClause(version, clause) {
  const ver = parseVersion(version)
  const floor = parseVersion(clause.floor)
  const upper = parseVersion(clause.upper)
  if (!ver || !floor || !upper) return false
  if (compareVersions(version, clause.floor) < 0) return false
  if (compareVersions(version, clause.upper) >= 0) return false
  if (ver.prerelease.length === 0) return true
  return (
    floor.prerelease.length > 0 &&
    floor.major === ver.major &&
    floor.minor === ver.minor &&
    floor.patch === ver.patch
  )
}

/** Does `version` satisfy any clause of the range? */
export function satisfiesRange(version, range) {
  const clauses = parseRangeSet(range)
  if (!clauses) return false
  return clauses.some((clause) => satisfiesClause(version, clause))
}

/**
 * The clause that would admit `version` without widening the upper bound:
 * `>=<major>.<minor>.<patch>-0 <upper>`. The `-0` prerelease makes the clause
 * cover every prerelease of that tuple.
 */
export function suggestedClause(version, range) {
  const ver = parseVersion(version)
  const clauses = parseRangeSet(range)
  if (!ver || !clauses) return null
  const upper = clauses.reduce((acc, c) => (c.upper > acc ? c.upper : acc), clauses[0].upper)
  return `>=${ver.major}.${ver.minor}.${ver.patch}-0 <${upper}`
}

function parseArgs(argv) {
  const args = { pkg: DEFAULT_PKG, range: null, tags: DEFAULT_TAGS }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--pkg') args.pkg = argv[++i]
    else if (a === '--range') args.range = argv[++i]
    else if (a === '--tags') args.tags = String(argv[++i]).split(',').map((s) => s.trim()).filter(Boolean)
    else if (a === '--help' || a === '-h') {
      console.log('usage: node scripts/check-peer-range-latest.mjs [--pkg name] [--range range] [--tags latest,next,alpha]')
      process.exit(0)
    }
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const range = args.range ?? JSON.parse(await readFile(DEFAULT_RANGE_FILE, 'utf8')).canonicalRange

  let packument
  try {
    const res = await fetch(`https://registry.npmjs.org/${args.pkg.replace('/', '%2F')}`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`registry responded ${res.status}`)
    packument = await res.json()
  } catch (error) {
    console.error(`error: cannot read the registry for ${args.pkg}: ${error.message}`)
    process.exit(2)
  }

  const distTags = packument['dist-tags'] ?? {}
  const failures = []
  console.log(`package:  ${args.pkg}`)
  console.log(`range:    ${range}`)
  for (const tag of args.tags) {
    const version = distTags[tag]
    if (!version) {
      console.log(`  ${tag.padEnd(7)} (no such dist-tag)`)
      continue
    }
    const ok = satisfiesRange(version, range)
    console.log(`  ${tag.padEnd(7)} ${version.padEnd(16)} ${ok ? 'OK' : 'NOT ADMITTED'}`)
    if (!ok) failures.push({ tag, version })
  }

  if (failures.length > 0) {
    console.error('')
    console.error('FAIL: the canonical peer range does not admit a published version.')
    for (const { tag, version } of failures) {
      const clause = suggestedClause(version, range)
      console.error(`  ${tag} -> ${version}: append  || ${clause}`)
    }
    console.error('')
    console.error('Fix: update data/peer-range.json canonicalRange, then run')
    console.error('  node scripts/sync-peer-range.mjs --dir <reposDir> --write')
    process.exit(1)
  }
  console.log('summary: all checked dist-tags are admitted')
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) await main()
