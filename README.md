# @perrylink/dsh-plugin-kit
- **1024 store channel**: `npm i -g dsh1024` once, then `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` (counts toward the [deepseek1024.com](https://deepseek1024.com) install ranking).

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-listed-en.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-plugin-kit)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-plugin-kit/ci.yml?branch=master&label=CI)](https://github.com/PerryLink/dsh-plugin-kit/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-plugin-kit?label=version)](https://github.com/PerryLink/dsh-plugin-kit/releases)
[![npm downloads](https://img.shields.io/npm/dm/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-plugin-kit?metric=downloads)](https://dshfind.com/plugins/PerryLink/dsh-plugin-kit?ref=badge)

**English** | [简体中文](README-zh.md) | [Español](README-es.md) | [Português](README-pt.md) | [हिन्दी](README-hi.md)

Shared **zero-runtime-dependency** toolkit for the PerryLink DSH plugin
repositories. The per-project audit found 20+ of the 33 plugins hand-rolling
the same Provider seam and duplicating the same sanitize/pricing/verdict
shapes, so this package extracts all of it — the pluggable Provider seam, the
fail-closed approval and adaptive session-event gates, the mechanical verify
scripts, and the shared sanitize/pricing/judge pure modules — into one
ESM + TypeScript package.

## Compatibility

- **DSH harness**: the kit imports nothing from `@deepseek-ai/*` at runtime.
  `@deepseek-ai/cordis` (`^4.0.2`), `@deepseek-ai/schemastery` (`^3.18.2`),
  and the `@deepseek-ai/dsh-*` packages are **optional** peer dependencies in
  the `>=0.1.2-rc.1 <0.2.0` band the PerryLink plugin repos share; they exist only for type
  interop. Verified 2026-09-11 against the dsh-v0.1.7-alpha.1 master checkout
  (full gate chain + profile install smoke).
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

As a library, install is `pnpm add` (see Quick start). The package also ships an
intentionally empty `dsh.bundle.patch` layer (`cordis.patch.yml`), so it flows
through the harness bundle channel when a profile wants the kit mounted as a
package:

```sh
# npm channel (published releases)
dsh plugin --profile web add @perrylink/dsh-plugin-kit

# git channel (latest master)
dsh plugin --profile web add "github:PerryLink/dsh-plugin-kit#master"
```

Remove with:

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
  (`0.1.2-rc.1`) throw `validateNext` on the ignorable-envelope probe; the
  gate degrades to skip-unknown, so audit events are dropped (fail closed)
  rather than logged on those hosts.
- 0.1.2-rc.1 (adapted 2026-09-02): the session envelope keeps its ignorable field for stored-log read compatibility only - Session.append still cannot stamp it, so audit-gate behavior is unchanged.
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

## PerryLink DSH Plugin Family

This project is one of the **45 DeepSeek Harness plugins** maintained by [PerryLink](https://github.com/PerryLink). If this one helps you, the others likely will too:

| Plugin | One-liner |
|---|---|
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default | |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command | |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | |
| **[dsh-catalog](https://github.com/PerryLink/dsh-catalog)** | DSH Desktop Market standard catalog source for the PerryLink family | |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence | |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore | |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. | |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search | |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) | |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review | |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. | |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds | |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval | |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` | |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools | |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. | |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. | |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers | |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer | |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors | |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool | |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. | |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching | |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit | |
| **[dsh-plugin-certification](https://github.com/PerryLink/dsh-plugin-certification)** | Community certification registry with repro-checkable grades and badges | |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins | |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill | |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins | |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card | |
| **[dsh-plugin-upgrade-015](https://github.com/PerryLink/dsh-plugin-upgrade-015)** | Merged `0.1.3-alpha.1` → `0.1.5-rc.1` upgrade corridor card plus a zero-dependency seam scanner | |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions | |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. | |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. | |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review | |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. | |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. | |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools | |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. | |


## License

Apache-2.0 — see [LICENSE](LICENSE).
