# @perrylink/dsh-plugin-kit
- **Canal de la tienda 1024**: primero `npm i -g dsh1024`, luego `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

[English](README.md) | [简体中文](README-zh.md) | **Español** | [Português](README-pt.md) | [हिन्दी](README-hi.md)

Kit compartido **sin dependencias en tiempo de ejecución** para los
repositorios de plugins DSH de PerryLink. La auditoría por proyecto detectó
que más de 20 de los 33 plugins reimplementan el mismo seam Provider y
duplican las mismas formas de sanitización, precios y veredictos, así que este
paquete lo extrae todo — el seam Provider enchufable, las puertas de aprobación
fail-closed y de eventos de sesión adaptativos, los scripts de verificación
mecánica y los módulos puros sanitize/pricing/judge — en un único paquete
ESM + TypeScript.

## Compatibilidad

- **DSH harness**: el kit no importa nada de `@deepseek-ai/*` en tiempo de
  ejecución. `@deepseek-ai/cordis` (`^4.0.2`), `@deepseek-ai/schemastery`
  (`^3.18.2`) y los paquetes `@deepseek-ai/dsh-*` son peer dependencies
  **opcionales** en la banda `>=0.1.2-rc.1 <0.2.0` compartida por los repos de plugins de PerryLink
  repos; solo existen para interoperar tipos. Verificado el 2026-09-11 contra
  el checkout master `dsh-v0.1.5-rc.2` (cadena completa de puertas + smoke
  de instalación de perfil).
- **Node**: `^22.19.0 || >=24.0.0`, solo ESM.
- **Compatibilidad de formato**: nombres y formas reflejan `dsh-mask`
  (sanitize), `dsh-budget` (pricing) y `dsh-auto-review` (judge y el
  vocabulario `fallbackPolicy`), así que la migración es mecánica.

## Qué obtienes

- **Cero dependencias en tiempo de ejecución** — el núcleo puro (`seam`,
  `gates`, `shared`) es seguro para el navegador.
- **ESM + TypeScript estricto** — contratos JSDoc en cada módulo; `strict`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **Puertas fail-closed y adaptativas** — la aprobación nunca concede por
  defecto; los eventos de sesión degradan con elegancia en hosts que rechazan
  tipos de evento desconocidos.
- **Plantilla de plugin** — `template/` con `cordis.yml`, un `src/index.ts` de
  tres roles (Service Definition / Provider / Consumer), un test y el preset
  compartido de Renovate.

## Inicio rápido

Desde npm:

```sh
pnpm add @perrylink/dsh-plugin-kit
```

Desde git (el script `prepare` construye `lib/` usando solo dependencias de
producción):

```sh
pnpm add github:PerryLink/dsh-plugin-kit
```

Reemplaza un registro escrito a mano en un paso:

```ts
import { ProviderRegistry } from '@perrylink/dsh-plugin-kit/seam'

const registry = new ProviderRegistry<Detector>({
  default: { name: 'regex', impl: new RegexDetector() },
})
ctx.effect(() => registry.register('ner', new NerDetector()))
const active = registry.use('ner') ?? registry.use()
```

## Instalación y desinstalación

La instalación es `pnpm add` (ver Inicio rápido). Para eliminar:

```sh
pnpm remove @perrylink/dsh-plugin-kit
```

Nada registra estado global: desinstalar es exactamente lo inverso de instalar.

## Configuración

Sin configuración en tiempo de ejecución: las puertas y utilidades son
funciones puras. La única superficie de configuración es `cordis.patch.yml`,
la capa de parche de bundle que se distribuye para la composición de perfiles
del harness; no monta ninguna fila de plugin (el kit es una biblioteca) y
documenta cómo los plugins consumidores añaden las suyas.

## Herramientas y superficies

| Subruta | Propósito |
|---|---|
| `seam` | `ProviderRegistry<T>` — registro de providers nombrado, reversible y que falla en voz alta. |
| `gates` | `applyFailClosed`; `makeEventGate` / `maybeAppendSessionEvent` / `probeIgnorableAppend`. |
| `shared` | `sanitize` (`Stripper`, `redactText`, `redactMapping`, `sanitizeText`, `sanitizeUrl`), `pricing` (`BUILTIN_PRICES`, `estimateUsageCost`, `tokenCarbon`, `latencyStats`, `formatMoney`, `formatTokens`), `judge` (`parseVerdict`, `VERDICT_SCHEMA`, `riskExceeds`). |
| `verify` | Puertas CI mecánicas (`verify-license`, `verify-readme-languages`, `verify-seam`) con `VerifyReport` y CLI con salida no cero: `node lib/verify/cli.js all .` |
| `template/` | Plantilla de plugin nuevo (`cordis.yml`, plugin de tres roles, test, README, `renovate.json5`). |
| barrel raíz | Reexporta todo lo anterior. |

## Permisos y datos

El kit no realiza E/S, acceso a red ni subprocesos por sí mismo. `Stripper`
mantiene los mapeos placeholder→original solo en memoria, y
`stats()`/`redactMapping()` nunca emiten texto plano; un consumidor que
persista un mapeo es dueño de esa decisión y de sus permisos de almacenamiento.

## Límites de seguridad

- `sanitize`/`redact*` son **higiene de presentación**, no un límite de
  seguridad: reducen la fuga en logs y resultados, no autentican ni autorizan.
- Las puertas de aprobación son fail-closed por defecto (`rejected`); la única
  vía de concesión es una opción explícita `allow-once`.
- Los eventos de sesión que el host rechaza se omiten, nunca se reintentan de
  forma que pueda romper la reanudación de la sesión.
- Reporta vulnerabilidades vía GitHub Security Advisories — ver `SECURITY.md`.

## Limitaciones conocidas

- Los hosts cuyo tercer argumento de `Session.append` es un `SurfaceIntent`
  (`0.1.2-rc.1`) lanzan `validateNext` ante la sonda del sobre ignorable;
  la puerta degrada a omitir-desconocido, de modo que los eventos de auditoría
  se descartan (fail closed) en esos hosts en lugar de registrarse.
- 0.1.2-rc.1 (adaptado el 2026-09-02): el sobre de sesión conserva su campo ignorable solo para compatibilidad de lectura de logs almacenados - Session.append aún no puede estamparlo, por lo que el comportamiento de la puerta no cambia.
- El kit no trae mitad de UI de navegador: es una biblioteca consumida por las
  mitades Host (y opcionalmente Client) de otros plugins.

## Desarrollo

```sh
pnpm install
pnpm run typecheck        # tsc --noEmit
pnpm run typecheck:ci     # cara CI: tsc -p tsconfig.ci.json --noEmit
pnpm test                 # tests unitarios vitest
pnpm run build            # emite lib/ y declaraciones (también lo hace prepare)
pnpm run verify:self-contained
pnpm run verify:artifacts
```

## Temas

Este repositorio es también el centro de mantenimiento de los 33 repos de
plugins: `scripts/sync-peer-range.mjs` repinnea la banda de peers compartida
en todos los repos con un comando, `renovate/default.json5` es el preset de
Renovate compartido que todos extienden, `.github/workflows/npm-publish.yml`
es un flujo de publicación reutilizable disparado por tag (solo necesita un
secreto `NPM_TOKEN`), y `data/repos.json` es el registro del ecosistema que
consume el portal. Ver [docs/ecosystem-tooling.md](docs/ecosystem-tooling.md).

Palabras clave: dsh, dsh-plugin, deepseek-harness, deepseek, cordis, perrylink,
provider, seam, approval, sanitize, pricing, judge.

## Contribuidores

Mantenido por [PerryLink](https://github.com/PerryLink) con contribuciones
del ecosistema de plugins DSH.

## Licencia

Apache-2.0 — ver [LICENSE](LICENSE).

## Familia de plugins DSH de PerryLink

Este proyecto es uno de los [40 complementos de DeepSeek Harness](https://github.com/PerryLink) mantenidos por [PerryLink](https://github.com/PerryLink). Si este te ayuda, probablemente los demás también:

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
