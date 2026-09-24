# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Host pins move to `0.1.7-rc.2`; re-verified against that host line. Every `@deepseek-ai/dsh-*` dev/test dependency now pins `0.1.7-rc.2`, the `dshWorkshop.compatibility.dshVersions` timeline appends `0.1.7-rc.2`, and the compatibility baseline in every README records the `dsh-v0.1.7-rc.2` host. The declared host ranges (`engines.dsh` and the `peerDependencies` union) are deliberately **unchanged** — they already admit `0.1.7-rc.2`, and a range is what the manifest accepts, not what has been tested.

## [0.1.11] - 2026-09-24
### Changed

- The host pins move to `0.1.7-rc.1`: every `@deepseek-ai/dsh-*` dev/test pin moves from `0.1.7-alpha.2`, and `dshWorkshop.compatibility.dshVersions` records `0.1.7-rc.1` (appended — the timeline stays append-only). Re-verified against that host line. The declared peer ranges and `engines.dsh` are deliberately **unchanged**: `0.1.7-rc.1` already satisfies their `>=0.1.7-0 <0.2.0` clause, and the family keeps peer ranges wider than the verified line rather than narrowing them to it.

## [0.1.10] - 2026-09-23

### Added

- `typecheck:checkout` (`tsc -p tsconfig.checkout.json --noEmit`), a third ruler alongside `typecheck` and `typecheck:ci`. The checkout face extends `tsconfig.json` with a deliberately EMPTY `paths` table: the kit imports nothing from `@deepseek-ai/*` — no runtime, type-only or dynamic import anywhere under `src/` or `test/` — so there is no specifier to alias and no package to repoint. It is therefore the same program as `typecheck` today, and exists to be the single place an alias is added the day a host import lands in `src/`. `AGENTS.md`'s build note now names all three faces instead of describing a two-ruler system.

### Changed

- The canonical `@deepseek-ai/dsh-*` peer range gains the `0.1.7` tuple's own clause (`|| >=0.1.7-0 <0.2.0`) in `data/peer-range.json` and on all three peers this package declares. Under npm semver's prerelease rule the three-clause form excluded every `0.1.7` prerelease, because its newest comparator sat on the `0.1.6` tuple — so the tripwire's own canonical value could not admit the published line. The three existing clauses are unchanged, in place and in order, and nothing was narrowed.
- The optional peer carets are raised to the versions `dsh-tools` / `dsh-user-approval@0.1.7-alpha.2` themselves require: `@deepseek-ai/cordis` `^4.0.2` → `^4.0.4`, `@deepseek-ai/schemastery` `^3.18.2` → `^3.18.4`. All five READMEs restate those two carets and were updated in the same commit.
- `compat.yml` runs weekly (`0 4 * * 1`) instead of monthly, and on pull requests, so a newly published upstream tuple is caught by the compatibility probe within a week rather than up to a month - the delay that let the `0.1.6` tuple trip the wire. The scratch profile pins `@deepseek-ai/dsh@0.1.7-alpha.2`, `dsh-base`/`dsh-headless@0.1.7-alpha.2`, and sets `minimumReleaseAge: 0` (pnpm 11's default age gate would otherwise keep a fresh `@deepseek-ai` prerelease red for 24h). The 25-minute job cap added in #1 is kept.

### Fixed

- The kit declared its five host packages **only** as optional `peerDependencies`, so with pnpm's `autoInstallPeers` they were materialised as dependencies at the LOWEST version each range admits — `@deepseek-ai/dsh-session` / `dsh-tools` / `dsh-user-approval` at `0.1.2-rc.1`, `cordis` 4.0.2, `schemastery` 3.18.2, seven releases behind the `0.1.7-alpha.2` line this repo nominally targets. Widening a range cannot raise that floor under semver's prerelease rule, which is why the earlier range widening did not move it. The five packages are now declared as `devDependencies` at the line the family targets (`dsh-session` / `dsh-tools` / `dsh-user-approval` at exact `0.1.7-alpha.2`, `cordis` `^4.0.4`, `schemastery` `^3.18.4`), so the installed faces match the declared ones and the graph resolves a single `schemastery` copy. Nothing under `src/`, `test/`, `scripts/` or `template/` imports `@deepseek-ai/*`: the devDependencies exist so the installed faces match the line, not because any build path needs them. The three `dsh-*` peers stay optional — they are a real compatibility contract for consumers.
- The five READMEs described the optional `@deepseek-ai/dsh-*` peers as the `>=0.1.2-rc.1 <0.2.0` band. The declared band is the four-clause canonical range ending `|| >=0.1.7-0 <0.2.0`, so the READMEs understated it by three clauses.
- The canonical `@deepseek-ai/dsh-*` peer range now admits the `0.1.6-alpha.2` tuple (`|| >=0.1.6-0 <0.2.0`). The `peer-range` tripwire has been failing on `master` since that tuple was published, because semver's prerelease rule gives every new tuple its own clause; the three peers this package declares are re-pinned in the same commit, the lockfile's specifiers follow, and the `sync-peer-range` fixture's "higher-floor" example was raised above the new floor.
- `scripts/sync-peer-range.mjs` no longer discards a real higher floor when the clause counts differ. `targetRange()` returned the canonical range as soon as `current.length !== canonical.length`, which was harmless only while canonical never changed length - and adding the `0.1.6-0` clause changed exactly that. A repo declaring `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-rc.1 <0.2.0` (a genuinely higher 0.1.5 floor) was silently rewritten down to canonical's `>=0.1.5-alpha.1`; the same held for a single-clause `>=0.1.5-rc.1 <0.2.0`. Clauses now pair by `[major, minor, patch]` tuple when the counts differ, so the higher floor survives while the new clause is added, and a current clause in a tuple canonical does not carry is kept only when its floor is above every canonical floor. `test/sync-peer-range.test.mjs` covers the two-clause and single-clause cases, and the end-to-end fixture now exercises the merge instead of the raised-floor bypass.

## [0.1.9] - 2026-09-12

### Added

- `scripts/check-peer-range-latest.mjs` — a dependency-free tripwire that reads the published `@deepseek-ai/dsh` dist-tags and fails when the canonical peer range no longer admits one, printing the clause to append. semver only admits a prerelease when a comparator in the same `[major, minor, patch]` tuple carries a prerelease, so every new upstream prerelease tuple silently stops matching; this turns that into a red gate. Wired into `.github/workflows/peer-range.yml` (push, PR, nightly, manual).

### Changed

- Rename the four translated READMEs to `README-<lang>.md`. npm selects the package-page readme as the first markdown file matching its `{README,README.*}` glob (`@npmcli/package-json`, publish path), and that glob order puts `README.<lang>.md` ahead of `README.md` — so npm was serving the Simplified-Chinese file for this package too (measured on 15/15 sampled packages of the family). The new names sit outside the glob, so the English source is served again. No content changed apart from the language-switcher link each translation holds to its siblings, and the repo readme gate still passes. Takes effect with the next release; an already-published version cannot gain a corrected readme retroactively.
- `data/peer-range.json` canonical range is now `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` (was the stale `>=0.1.0-rc.8 <0.2.0` from 2026-08-26), which is what the ecosystem already declares.
- `scripts/sync-peer-range.mjs` understands the `||`-joined clause form: `parseRangeSet`/`formatRangeSet` were added and `rangeStatus`/`targetRange` now compare clause sets instead of a single floor/upper pair. The single-clause `parseRange` keeps its old signature, so existing callers and tests are unaffected.
- The release workflow now creates the GitHub Release itself, with the body taken from this version's CHANGELOG section. Until now a `v*` tag published to npm and stopped there, so every Release page had to be created by hand afterwards.
- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.5-rc.2` line; the monthly Compat workflow now runs against `0.1.5-rc.2`. The peer range `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` is unchanged, so no supported host line is dropped.

### Fixed

- `verifyReadmeLanguages` now expects `README-<lang>.md`. It built the dotted name from a template, so a textual rename cannot see it — this is the one place in the fleet that constructs the filename dynamically, and its own test is what caught the mismatch. Nothing consumes this verifier yet (each repo carries its own `verify-readmes` copy), so the change stays inside this repo.

## [0.1.8] - 2026-09-10

### Changed

- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.5-rc.1` line; the monthly Compat workflow now runs against `0.1.5-rc.1`. The peer range `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` is unchanged, so no supported host line is dropped.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-rc.1` (verified 2026-09-10).

## [0.1.7] - 2026-09-09

### Changed

- Align the `@deepseek-ai/dsh-*` peer ranges to `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` and pin the dev/test dependencies to the published `0.1.5-alpha.1` line: adaptation to DeepSeek Harness `dsh-v0.1.5-alpha.1` (session format V3, `ctx.agent` removal, `Inbox` type-only interface); runtime behavior is unchanged for every supported host line.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-alpha.1` (verified 2026-09-09).

## [0.1.6] - 2026-09-07

### Fixed

- Align the `@deepseek-ai/dsh-*` peer ranges to `>=0.1.2-rc.1 <0.2.0`: the older `>=0.1.0-rc.8 <0.2.0` band resolved to only the `0.1.0-rc.8` prerelease under registry-driven resolution and broke fresh tarball installs; no behavior change.

### Docs

- Refresh the five-language README support-version wording: the verified GitHub tag `dsh-v0.1.3-alpha.1` now leads the compatibility claim, while npm `0.1.2-rc.1` stays the published dependency-pin line (peers `>=0.1.2-rc.1 <0.2.0`); no behavior change.


## [0.1.5] - 2026-09-04

### Changed

- Refresh the five-language READMEs and AGENTS.md to the `0.1.2-rc.1` facts and bump the compat CI harness probes from `0.1.1-rc.2` to `0.1.2-rc.1`; the adaptive session-event gate behavior is unchanged.

## [0.1.4] - 2026-09-02

### Changed

- Refresh the five-language READMEs, `AGENTS.md`, and the session-event gate JSDoc to the `0.1.2-alpha.5` narrative (gate behavior unchanged: `KNOWN_SESSION_EVENT_TYPES` still holds 51 types, `Session.append` still cannot stamp the `ignorable` marker, and the `Session.events` getter rename to `snapshotEvents()` does not touch this kit).

## [0.1.3] - 2026-09-01

### Changed

- Align the optional `@deepseek-ai/cordis` / `@deepseek-ai/schemastery` peer carets to `^4.0.2` / `^3.18.2` and refresh the five-language READMEs, `AGENTS.md`, and the `cordis.patch.yml` example comment to the `0.1.2-alpha.3` narrative (gate behavior unchanged: `Session.append` still cannot stamp the `ignorable` marker).

## [0.1.2] - 2026-08-30

### Fixed

- `cordis.patch.yml` is now a real top-level YAML array (empty) — the loader rejects comment-only patch files, which broke any profile the kit was installed into.

## [0.1.1] - 2026-08-30

### Added

- Five-language READMEs (`README.md`, `README-zh.md`, `README-es.md`,
  `README-pt.md`, `README-hi.md`) in the standard section order
  (Compatibility / What you get / Quick start / Install & uninstall /
  Configuration / Tools & surfaces / Permissions & data / Security
  boundaries / Known limitations / Development / Topics / Contributors /
  License).
- `CHANGELOG.md`, `SECURITY.md`, `AGENTS.md`, and `THIRD_PARTY_NOTICES.md`.
- `cordis.patch.yml` bundle patch layer, wired via `dsh.bundle.patch`.
- CI (`ci.yml`) and monthly compatibility verification (`compat.yml`)
  workflows.
- `prepare`, `typecheck:ci`, `verify:self-contained`, and `verify:artifacts`
  scripts (minimal dsh-score-style versions).
- `@deepseek-ai/schemastery ^3.18.0` optional peer dependency.
- Unit tests for the approval and session-event gates.

### Fixed

- `gates/approval`: `FallbackPolicy` vocabulary corrected to
  `dsh-auto-review`'s actual `'rejected' | 'delegate' | 'allow-once'`
  (default `'rejected'`); `EffectiveDecision` records the applied policy;
  documented the `deny` -> `rejected` / `allow` -> `allow-once` mapping.
- `gates/session-event`: `probeIgnorableAppend` no longer throws on hosts
  whose `Session.append` third argument is a `SurfaceIntent`
  (`0.1.2-alpha.1`, `validateNext`); `AppendableSession` documents the
  host-generation difference.
- `shared/judge`: `ObjectJsonSchema` now mirrors the host's all-optional
  `JsonSchemaNode` (`packages/core/tools/src/json-schema.ts`), so
  `VERDICT_SCHEMA` is assignable to the host's `ObjectJsonSchema`.

## [0.1.0] - 2026-08-30

Initial release: pluggable Provider registry seam, fail-closed approval and
adaptive session-event gates, mechanical verify scripts, shared
sanitize/pricing/judge modules, and the new-plugin template.
