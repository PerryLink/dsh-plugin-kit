# @perrylink/dsh-plugin-kit
- **1024 store channel**: `npm i -g dsh1024` once, then `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` (counts toward the [deepseek1024.com](https://deepseek1024.com) install ranking).

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-plugin-kit)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-plugin-kit/ci.yml?branch=master&label=CI)](https://github.com/PerryLink/dsh-plugin-kit/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-plugin-kit?label=version)](https://github.com/PerryLink/dsh-plugin-kit/releases)
[![npm downloads](https://img.shields.io/npm/dm/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)

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
  interop. Verified 2026-09-11 against the dsh-v0.1.5-rc.2 master checkout
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

This project is one of the [40 DeepSeek Harness plugins](https://github.com/PerryLink) maintained by [PerryLink](https://github.com/PerryLink). If this one helps you, the others likely will too:

| Plugin | One-liner |
|---|---|
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default | |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command | |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | |
| **[dsh-catalog](https://github.com/PerryLink/dsh-catalog)** | DSH Desktop Market standard catalog source for the PerryLink family | |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence | |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Unified session + workspace + config checkpoints with one-shot `/rewind` | |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code, Codex, OpenCode and Hermes sessions, memories and skills into DSH | |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. | |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search | |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Deterministic dataset profiling, cleaning and citation verification | |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review | |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics: load, spill, compaction and cache hit rate | |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Chinese mutual-fund research with sealed, traceable source snapshots | |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issue/CI integration with every write approval-gated | |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry and company research pack: chain map, policy timeline, company cards | |
| **[dsh-kit](https://github.com/PerryLink/dsh-kit)** | One-command starter pack that installs the core family | |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base with hybrid search and citation-aware injection | |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local Ollama model discovery and task-based routing with cloud fallback | |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions, symbols and rename | |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking at the model boundary with a host-side restore table | |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | MCP management console: `/mcp` command, Settings tab and trial calls | |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory protocol (`ctx.memory` + SQLite) | |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse telemetry export from the session event stream | |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Runtime-switchable model output styles | |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Declarative allow/deny/ask rules plus a process-level network policy | |
| **[dsh-plugin-certification](https://github.com/PerryLink/dsh-plugin-certification)** | Community certification registry with repro-checkable grades and badges | |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins | |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-dev knowledge base, agent skill and the `dsh-plugin-dev` CLI toolchain | |
| **[dsh-plugin-portal](https://github.com/PerryLink/dsh-plugin-portal)** | Zero-dependency static portal rendering the whole plugin family as one page | |
| **[dsh-plugin-upgrade-015](https://github.com/PerryLink/dsh-plugin-upgrade-015)** | Merged `0.1.3-alpha.1` → `0.1.5-rc.1` upgrade corridor card plus a zero-dependency seam scanner | |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat, Telegram, Feishu + a session console | |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research reports: evidence ledger, manifest seal, per-claim verdicts | |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional plugin quality scoring with an evidence-backed leaderboard | |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions and workspaces in the Web sidebar with per-pin colors | |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Git-backed cross-device session synchronization with keep-both merges | |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack plus the `plugin_vet` supply-chain gate | |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop: speech-to-text input and text-to-speech replies | |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives with a pass/fail matrix | |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel plus eleven agent tools | |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair | |
| **[dsh-wechat](https://github.com/pan17/dsh-wechat)** | WeChat ↔ DSH bridge (Tencent iLink bot) developed with [pan17](https://github.com/pan17/dsh-wechat), who hosts the repo | |
| **[dsh-personal-directive](https://github.com/PerryLink/dsh-personal-directive)** | Personal directive injector with a top-bar toggle (fork of liucai2026/dsh-personal-directive) | |

## License

Apache-2.0 — see [LICENSE](LICENSE).
