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

/**
 * Line-based range rewrite: only `"@deepseek-ai/dsh-*"` value lines inside the
 * `peerDependencies` block change. Returns the new text and the change count.
 */
export function rewritePeerRange(text, range) {
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
    const m = line.match(/^(\s*"@deepseek-ai\/dsh-[^"]+"\s*:\s*)("[^"]*")(\s*,?)\s*$/)
    if (m && m[2] !== `"${range}"`) {
      lines[i] = `${m[1]}"${range}"${m[3]}`
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
    const off = [...ranges.values()].filter((v) => v !== range).length
    if (off === 0) {
      report.push({ repo: entry.name, status: 'ok' })
      continue
    }
    if (args.write) {
      const { text: next, changed } = rewritePeerRange(text, range)
      await writeFile(pkgPath, next, 'utf8')
      changedRepos++
      changedKeys += changed
      report.push({ repo: entry.name, status: 'rewritten', changed })
    } else {
      report.push({ repo: entry.name, status: 'drift', current: [...new Set(ranges.values())].join(' | ') })
    }
  }
  for (const r of report) {
    console.log(
      `${r.repo}\t${r.status}${r.changed ? ` (${r.changed} keys)` : ''}${r.current ? ` current=${r.current}` : ''}`,
    )
  }
  console.log(
    `summary: scanned=${report.length} rewrittenRepos=${changedRepos} rewrittenKeys=${changedKeys} target="${range}"`,
  )
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) await main()
