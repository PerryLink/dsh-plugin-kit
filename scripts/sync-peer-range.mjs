#!/usr/bin/env node
/**
 * Rewrite the `@deepseek-ai/dsh-*` peerDependencies range across a directory
 * of plugin repositories to the canonical range stored in data/peer-range.json.
 *
 * This is the deterministic half of the ecosystem version-lock strategy:
 * - routine in-range updates flow through the shared Renovate preset
 * - breaking range re-pins (`<0.2.0` -> `>=0.2.0 <0.3.0`) run through this
 *   script in one command, so all 33 repos move together.
 *
 * Usage:
 *   node scripts/sync-peer-range.mjs --dir <reposDir>            # report only
 *   node scripts/sync-peer-range.mjs --dir <reposDir> --write    # rewrite
 *   node scripts/sync-peer-range.mjs --dir <reposDir> --range "<range>"
 *
 * The rewrite is line-based: only the range value lines inside the
 * `peerDependencies` block change, so package.json formatting outside that
 * block is preserved byte-for-byte.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const DEFAULT_RANGE_FILE = resolve(import.meta.dirname, '..', 'data', 'peer-range.json')

function printHelp() {
  console.log(`sync-peer-range — re-pin @deepseek-ai/dsh-* peer ranges across repos

  --dir <dir>     directory containing plugin repositories (required)
  --write         rewrite package.json files in place (default: report only)
  --range <range> override the canonical range from data/peer-range.json
  --help          show this help`)
}

function parseArgs(argv) {
  const args = { dir: null, write: false, range: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dir') args.dir = argv[++i]
    else if (a === '--write') args.write = true
    else if (a === '--range') args.range = argv[++i]
    else if (a === '--help' || a === '-h') {
      printHelp()
      process.exit(0)
    }
  }
  return args
}

function countChar(s, ch) {
  let n = 0
  for (let i = 0; i < s.length; i++) if (s[i] === ch) n++
  return n
}

const RANGE_RE = /^>=(\S+)\s+<(\S+)$/

/**
 * Parse a `>=floor <upper` range. Returns null for anything else.
 * Floor comparison uses string ordering, which matches semver for the
 * `0.1.0-rc.8`-style versions in this ecosystem (`0.1.1-rc.2` > `0.1.0-rc.8`,
 * and `0.1.0-rc.8` < `0.1.0`).
 */
export function parseRange(range) {
  const m = RANGE_RE.exec(range)
  return m ? { floor: m[1], upper: m[2] } : null
}

/**
 * Classify a declared range against the canonical one:
 * - `ok`            floor and upper bound match
 * - `ok-higher`     same upper bound, higher floor (a real per-package
 *                   requirement, e.g. dsh-session-projection needing 0.1.1-rc.2)
 * - `drift-low`     same upper bound, floor below canonical
 * - `drift-upper`   upper bound differs (the actual version-lock break)
 * - `unparseable`   range does not match `>=floor <upper`
 */
export function rangeStatus(current, canonical) {
  const cur = parseRange(current)
  const can = parseRange(canonical)
  if (!cur || !can) return 'unparseable'
  if (cur.upper !== can.upper) return 'drift-upper'
  if (cur.floor === can.floor) return 'ok'
  return cur.floor > can.floor ? 'ok-higher' : 'drift-low'
}

/** Target range for a drifting key: highest required floor, canonical upper. */
export function targetRange(current, canonical) {
  const cur = parseRange(current)
  const can = parseRange(canonical)
  if (!cur || !can) return canonical
  const floor = cur.floor > can.floor ? cur.floor : can.floor
  return `>=${floor} <${can.upper}`
}

/**
 * Line-based range rewrite: only `"@deepseek-ai/dsh-*"` value lines inside the
 * `peerDependencies` block change. `resolveRange(key)` returns the replacement
 * range for a key, or null to leave the line untouched.
 */
export function rewritePeerRange(text, resolveRange) {
  const lines = text.split('\n')
  let inPeer = false
  let depth = 0
  let changed = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!inPeer) {
      if (/^\s*"peerDependencies"\s*:\s*\{/.test(line)) {
        inPeer = true
        depth = countChar(line, '{') - countChar(line, '}')
      }
      continue
    }
    depth += countChar(line, '{') - countChar(line, '}')
    if (depth <= 0) {
      inPeer = false
      if (depth < 0) depth = 0
      continue
    }
    const m = line.match(/^(\s*"(@deepseek-ai\/dsh-[^"]+)"\s*:\s*)("[^"]*")(\s*,?)\s*$/)
    if (!m) continue
    const next = resolveRange(m[2])
    if (next == null) continue
    if (m[3] !== `"${next}"`) {
      lines[i] = `${m[1]}"${next}"${m[4]}`
      changed++
    }
  }
  return { text: lines.join('\n'), changed }
}

/** Map of dsh-scoped peer names to their declared ranges. */
export function currentPeerRanges(pkgJson) {
  const peers = pkgJson.peerDependencies ?? {}
  const ranges = new Map()
  for (const [k, v] of Object.entries(peers)) {
    if (k.startsWith('@deepseek-ai/dsh-')) ranges.set(k, v)
  }
  return ranges
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.dir) {
    console.error('error: --dir <reposDir> is required')
    printHelp()
    process.exit(2)
  }
  const range =
    args.range ?? JSON.parse(await readFile(DEFAULT_RANGE_FILE, 'utf8')).canonicalRange
  const entries = await readdir(args.dir, { withFileTypes: true })
  let changedRepos = 0
  let changedKeys = 0
  const report = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const pkgPath = join(args.dir, entry.name, 'package.json')
    if (!existsSync(pkgPath)) continue
    const text = await readFile(pkgPath, 'utf8')
    let pkg
    try {
      pkg = JSON.parse(text)
    } catch {
      report.push({ repo: entry.name, status: 'unparseable' })
      continue
    }
    const ranges = currentPeerRanges(pkg)
    if (ranges.size === 0) continue
    const states = [...ranges.entries()].map(([k, v]) => [k, v, rangeStatus(v, range)])
    const driftKeys = states.filter(([, , s]) => s === 'drift-upper' || s === 'drift-low')
    const higherKeys = states.filter(([, , s]) => s === 'ok-higher')
    const unparseableKeys = states.filter(([, , s]) => s === 'unparseable')
    if (driftKeys.length === 0 && unparseableKeys.length === 0) {
      report.push({
        repo: entry.name,
        status: higherKeys.length > 0 ? `ok (${higherKeys.length} higher-floor)` : 'ok',
      })
      continue
    }
    if (args.write) {
      const { text: next, changed } = rewritePeerRange(text, (key) => {
        const st = rangeStatus(ranges.get(key) ?? range, range)
        if (st === 'ok' || st === 'ok-higher') return null
        return targetRange(ranges.get(key) ?? range, range)
      })
      await writeFile(pkgPath, next, 'utf8')
      changedRepos++
      changedKeys += changed
      report.push({ repo: entry.name, status: 'rewritten', changed })
    } else {
      report.push({
        repo: entry.name,
        status: 'drift',
        detail: driftKeys
          .map(([k, v, s]) => `${k}: ${s} (${v})`)
          .concat(unparseableKeys.map(([k, v]) => `${k}: unparseable (${v})`))
          .join('; '),
      })
    }
  }
  for (const r of report) {
    console.log(`${r.repo}\t${r.status}${r.changed ? ` (${r.changed} keys)` : ''}${r.detail ? ` :: ${r.detail}` : ''}`)
  }
  console.log(
    `summary: scanned=${report.length} rewrittenRepos=${changedRepos} rewrittenKeys=${changedKeys} target="${range}"`,
  )
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) await main()
