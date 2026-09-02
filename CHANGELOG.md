# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

- Five-language READMEs (`README.md`, `README.zh.md`, `README.es.md`,
  `README.pt.md`, `README.hi.md`) in the standard section order
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
