# @perrylink/dsh-plugin-kit
- **1024 store channel**: `npm i -g dsh1024` once, then `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` (counts toward the [deepseek1024.com](https://deepseek1024.com) install ranking).

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

Shared **zero-runtime-dependency** toolkit for the PerryLink DSH plugin
repositories. The per-project audit found 20+ of the 33 plugins hand-rolling
the same Provider seam and duplicating the same sanitize/pricing/verdict
shapes, so this package extracts all of it — the pluggable Provider seam, the
fail-closed approval and adaptive session-event gates, the mechanical verify
scripts, and the shared sanitize/pricing/judge pure modules — into one
ESM + TypeScript package.

## Compatibility

- **DSH harness**: the kit imports nothing from `@deepseek-ai/*` at runtime.
  `@deepseek-ai/cordis` (`^4.0.1`), `@deepseek-ai/schemastery` (`^3.18.0`),
  and the `@deepseek-ai/dsh-*` packages are **optional** peer dependencies in
  the `>=0.1.0-rc.8 <0.2.0` band the 33 repos share; they exist only for type
  interop.
- **Node**: `^22.19.0 || >=24.0.0`, ESM only.
- **Wire compatibility**: names and shapes mirror `dsh-mask` (sanitize),
  `dsh-budget` (pricing), and `dsh-auto-review` (judge and the
  `fallbackPolicy` vocabulary), so migration is mechanical.

## What you get

- **Zero runtime dependencies** — the pure core (`seam`, `gates`, `shared`)
  is browser-safe.
- **ESM + strict TypeScript** — JSDoc contracts on every module; `strict`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **Fail-closed and adaptive gates** — approval never defaults to a grant;
  session-event appends degrade gracefully on hosts that reject unknown event
  types.
- **A new-plugin skeleton** — `template/` with `cordis.yml`, a three-role
  `src/index.ts` (Service Definition / Provider / Consumer), a test, and the
  shared Renovate preset.

## Quick start

From npm:

```sh
pnpm add @perrylink/dsh-plugin-kit
```

From git (the `prepare` script builds `lib/` using only production
dependencies):

```sh
pnpm add github:PerryLink/dsh-plugin-kit
```

Replace a hand-rolled registry in one step:

```ts
import { ProviderRegistry } from '@perrylink/dsh-plugin-kit/seam'

const registry = new ProviderRegistry<Detector>({
  default: { name: 'regex', impl: new RegexDetector() },
})
ctx.effect(() => registry.register('ner', new NerDetector()))
const active = registry.use('ner') ?? registry.use()
```

## Install & uninstall

Install is `pnpm add` (see Quick start). Remove with:

```sh
pnpm remove @perrylink/dsh-plugin-kit
```

Nothing registers global state: uninstall is exactly the reverse of install.

## Configuration

No runtime configuration: the gates and helpers are pure functions. The only
configuration surface is `cordis.patch.yml`, the bundle-patch layer shipped
for harness profile composition; it mounts no plugin row (the kit is a
library) and documents how consuming plugins add their own rows.

## Tools & surfaces

| Subpath | Purpose |
|---|---|
| `seam` | `ProviderRegistry<T>` — reversible, fail-loud named provider registry. |
| `gates` | `applyFailClosed`; `makeEventGate` / `maybeAppendSessionEvent` / `probeIgnorableAppend`. |
| `shared` | `sanitize` (`Stripper`, `redactText`, `redactMapping`, `sanitizeText`, `sanitizeUrl`), `pricing` (`BUILTIN_PRICES`, `estimateUsageCost`, `tokenCarbon`, `latencyStats`, `formatMoney`, `formatTokens`), `judge` (`parseVerdict`, `VERDICT_SCHEMA`, `riskExceeds`). |
| `verify` | Mechanical CI gates (`verify-license`, `verify-readme-languages`, `verify-seam`) with a `VerifyReport` and a non-zero-exit CLI: `node lib/verify/cli.js all .` |
| `template/` | New-plugin skeleton (`cordis.yml`, three-role plugin, test, README, `renovate.json5`). |
| root barrel | Re-exports all of the above. |

## Permissions & data

The kit performs no I/O, no network access, and no subprocess spawns on its
own. `Stripper` keeps placeholder→original mappings in memory only, and
`stats()`/`redactMapping()` never emit plaintext; a consumer that persists a
mapping owns that decision and its storage permissions.

## Security boundaries

- `sanitize`/`redact*` are **display hygiene**, not a security boundary: they
  reduce leakage into logs and results, they do not authenticate or authorize.
- Approval gates are fail closed by default (`rejected`); the only grant path
  is an explicit `allow-once` opt-in.
- Session-event appends the host refuses are skipped, never retried in a way
  that could break session resume.
- Report vulnerabilities via GitHub Security Advisories — see `SECURITY.md`.

## Known limitations

- Hosts whose `Session.append` third argument is a `SurfaceIntent`
  (`0.1.2-alpha.2`) throw `validateNext` on the ignorable-envelope probe; the
  gate degrades to skip-unknown, so audit events are dropped (fail closed)
  rather than logged on those hosts.
- 0.1.2-alpha.2 (adapted 2026-08-31): the session envelope keeps its ignorable field for stored-log read compatibility only - Session.append still cannot stamp it, so audit-gate behavior is unchanged.
- The kit ships no browser UI half; it is a library consumed by the Host (and
  optionally Client) halves of other plugins.

## Development

```sh
pnpm install
pnpm run typecheck        # tsc --noEmit
pnpm run typecheck:ci     # CI face: tsc -p tsconfig.ci.json --noEmit
pnpm test                 # vitest unit tests
pnpm run build            # emit lib/ + declarations (also run by prepare)
pnpm run verify:self-contained
pnpm run verify:artifacts
```

## Topics

This repository is also the maintenance hub for the 33 plugin repos:
`scripts/sync-peer-range.mjs` re-pins the shared peer band across all repos in
one command, `renovate/default.json5` is the shared Renovate preset every repo
extends, `.github/workflows/npm-publish.yml` is a reusable tag-triggered
publish workflow (needs only an `NPM_TOKEN` secret), and `data/repos.json` is
the ecosystem registry consumed by the portal. See
[docs/ecosystem-tooling.md](docs/ecosystem-tooling.md).

Keywords: dsh, dsh-plugin, deepseek-harness, deepseek, cordis, perrylink,
provider, seam, approval, sanitize, pricing, judge.

## Contributors

Maintained by [PerryLink](https://github.com/PerryLink) with contributions
from the DSH plugin ecosystem.

## License

Apache-2.0 — see [LICENSE](LICENSE).
