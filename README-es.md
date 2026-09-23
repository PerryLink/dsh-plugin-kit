# @perrylink/dsh-plugin-kit
- **Canal de la tienda 1024**: primero `npm i -g dsh1024`, luego `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-listed-en.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-plugin-kit)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-plugin-kit/ci.yml?branch=master&label=CI)](https://github.com/PerryLink/dsh-plugin-kit/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-plugin-kit?label=version)](https://github.com/PerryLink/dsh-plugin-kit/releases)
[![npm downloads](https://img.shields.io/npm/dm/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-plugin-kit?metric=downloads&lang=es)](https://dshfind.com/es/plugins/PerryLink/dsh-plugin-kit?ref=badge)

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
  ejecución. `@deepseek-ai/cordis` (`^4.0.4`), `@deepseek-ai/schemastery`
  (`^3.18.4`) y los paquetes `@deepseek-ai/dsh-*` son peer dependencies
  **opcionales** en la banda `>=0.1.2-rc.1 <0.2.0` compartida por los repos de plugins de PerryLink
  repos; solo existen para interoperar tipos. Verificado el 2026-09-11 contra
  el checkout master `dsh-v0.1.7-alpha.1` (cadena completa de puertas + smoke
  de instalación de perfil), y re-verificado el 2026-09-23 contra el checkout
  `dsh-v0.1.7-alpha.2`.
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

La instalación es `pnpm add` (ver Inicio rápido). El paquete también incluye una capa `dsh.bundle.patch` deliberadamente vacía (`cordis.patch.yml`), así que también fluye por el canal bundle del harness cuando un perfil quiere montar el kit como paquete:

```sh
# canal npm (versiones publicadas)
dsh plugin --profile web add @perrylink/dsh-plugin-kit

# canal git (último master)
dsh plugin --profile web add "github:PerryLink/dsh-plugin-kit#master"
```

Para eliminar:

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
