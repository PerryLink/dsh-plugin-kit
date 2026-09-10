# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `scripts/check-peer-range-latest.mjs` — a dependency-free tripwire that reads the published `@deepseek-ai/dsh` dist-tags and fails when the canonical peer range no longer admits one, printing the clause to append. semver only admits a prerelease when a comparator in the same `[major, minor, patch]` tuple carries a prerelease, so every new upstream prerelease tuple silently stops matching; this turns that into a red gate. Wired into `.github/workflows/peer-range.yml` (push, PR, nightly, manual).

### Changed

- Rename the four translated READMEs to `README-<lang>.md`. npm selects the package-page readme as the first markdown file matching its `{README,README.*}` glob (`@npmcli/package-json`, publish path), and that glob order puts `README.<lang>.md` ahead of `README.md` — so npm was serving the Simplified-Chinese file for this package too (measured on 15/15 sampled packages of the family). The new names sit outside the glob, so the English source is served again. No content changed apart from the language-switcher link each translation holds to its siblings, and the repo readme gate still passes. Takes effect with the next release; an already-published version cannot gain a corrected readme retroactively.
- `data/peer-range.json` canonical range is now `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` (was the stale `>=0.1.0-rc.8 <0.2.0` from 2026-08-26), which is what the ecosystem already declares.
- `scripts/sync-peer-range.mjs` understands the `||`-joined clause form: `parseRangeSet`/`formatRangeSet` were added and `rangeStatus`/`targetRange` now compare clause sets instead of a single floor/upper pair. The single-clause `parseRange` keeps its old signature, so existing callers and tests are unaffected.
- The release workflow now creates the GitHub Release itself, with the body taken from this version's CHANGELOG section. Until now a `v*` tag published to npm and stopped there, so every Release page had to be created by hand afterwards.

### Fixed

- `verifyReadmeLanguages` now expects `README-<lang>.md`. It built the dotted name from a template, so a textual rename cannot see it — this is the one place in the fleet that constructs the filename dynamically, and its own test is what caught the mismatch. Nothing consumes this verifier yet (each repo carries its own `verify-readmes` copy), so the change stays inside this repo.

## [0.1.8] - 2026-09-10

### Changed

- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.5-rc.1` line and record `0.1.5-rc.1` in `dshWorkshop.compatibility.dshVersions`; the monthly Compat workflow now runs against `0.1.5-rc.1`. The peer range `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` is unchanged, so no supported host line is dropped.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-rc.1` (verified 2026-09-10).

## [0.1.7] - 2026-09-09

### Changed

- Align the `@deepseek-ai/dsh-*` peer ranges to `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` and pin the dev/test dependencies to the published `0.1.5-alpha.1` line: adaptation to DeepSeek Harness `dsh-v0.1.5-alpha.1` (session format V3, `ctx.agent` removal, `Inbox` type-only interface); runtime behavior is unchanged for every supported host line.
- Record `0.1.5-alpha.1` in `dshWorkshop.compatibility.dshVersions`.

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
