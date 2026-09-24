# @perrylink/dsh-plugin-kit
- **Canal da loja 1024**: primeiro `npm i -g dsh1024`, depois `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` (conta para o ranking de instalações do [deepseek1024.com](https://deepseek1024.com)).

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-listed-en.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-plugin-kit)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-plugin-kit/ci.yml?branch=master&label=CI)](https://github.com/PerryLink/dsh-plugin-kit/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-plugin-kit?label=version)](https://github.com/PerryLink/dsh-plugin-kit/releases)
[![npm downloads](https://img.shields.io/npm/dm/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-plugin-kit?metric=downloads&lang=pt)](https://dshfind.com/pt/plugins/PerryLink/dsh-plugin-kit?ref=badge)

[English](README.md) | [简体中文](README-zh.md) | [Español](README-es.md) | **Português** | [हिन्दी](README-hi.md)

Kit compartilhado **sem dependências em tempo de execução** para os
repositórios de plugins DSH da PerryLink. A auditoria por projeto encontrou
mais de 20 dos 33 plugins reimplementando o mesmo seam Provider e duplicando
as mesmas formas de sanitização, precificação e veredicto, então este pacote
extrai tudo isso — o seam Provider plugável, as portas de aprovação
fail-closed e de eventos de sessão adaptativos, os scripts de verificação
mecânica e os módulos puros sanitize/pricing/judge — em um único pacote
ESM + TypeScript.

## Compatibilidade

- **DSH harness**: o kit não importa nada de `@deepseek-ai/*` em tempo de
  execução. `@deepseek-ai/cordis` (`^4.0.4`), `@deepseek-ai/schemastery`
  (`^3.18.4`) e os pacotes `@deepseek-ai/dsh-*` são peer dependencies
  **opcionais** na faixa `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0 || >=0.1.6-0 <0.2.0 || >=0.1.7-0 <0.2.0` compartilhada pelos repos de plugins da PerryLink;
  existem apenas para interoperação de tipos. Verificado em 2026-09-11 contra
  o checkout master `dsh-v0.1.7-alpha.1` (cadeia completa de portas + smoke
  de instalação de perfil), e re-verificado em 2026-09-24 contra o checkout
  `dsh-v0.1.7-rc.2`.
- **Node**: `^22.19.0 || >=24.0.0`, somente ESM.
- **Compatibilidade de formato**: nomes e formas espelham `dsh-mask`
  (sanitize), `dsh-budget` (pricing) e `dsh-auto-review` (judge e o
  vocabulário `fallbackPolicy`), então a migração é mecânica.

## O que você recebe

- **Zero dependências em tempo de execução** — o núcleo puro (`seam`,
  `gates`, `shared`) é seguro para o navegador.
- **ESM + TypeScript estrito** — contratos JSDoc em cada módulo; `strict`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **Portas fail-closed e adaptativas** — a aprovação nunca concede por
  padrão; os eventos de sessão degradam com elegância em hosts que rejeitam
  tipos de evento desconhecidos.
- **Esqueleto de plugin** — `template/` com `cordis.yml`, um `src/index.ts`
  de três papéis (Service Definition / Provider / Consumer), um teste e o
  preset compartilhado do Renovate.

## Início rápido

Pelo npm:

```sh
pnpm add @perrylink/dsh-plugin-kit
```

Pelo git (o script `prepare` constrói `lib/` usando apenas dependências de
produção):

```sh
pnpm add github:PerryLink/dsh-plugin-kit
```

Substitua um registro escrito à mão em um passo:

```ts
import { ProviderRegistry } from '@perrylink/dsh-plugin-kit/seam'

const registry = new ProviderRegistry<Detector>({
  default: { name: 'regex', impl: new RegexDetector() },
})
ctx.effect(() => registry.register('ner', new NerDetector()))
const active = registry.use('ner') ?? registry.use()
```

## Instalar e desinstalar

A instalação é `pnpm add` (ver Início rápido). O pacote também traz uma camada `dsh.bundle.patch` deliberadamente vazia (`cordis.patch.yml`), então ele também flui pelo canal bundle do harness quando um perfil quer montar o kit como pacote:

```sh
# canal npm (versões publicadas)
dsh plugin --profile web add @perrylink/dsh-plugin-kit

# canal git (master mais recente)
dsh plugin --profile web add "github:PerryLink/dsh-plugin-kit#master"
```

Para remover:

```sh
pnpm remove @perrylink/dsh-plugin-kit
```

Nada registra estado global: desinstalar é exatamente o inverso de instalar.

## Configuração

Sem configuração em tempo de execução: as portas e utilitários são funções
puras. A única superfície de configuração é `cordis.patch.yml`, a camada de
patch de bundle distribuída para a composição de perfis do harness; ela não
monta nenhuma linha de plugin (o kit é uma biblioteca) e documenta como
plugins consumidores adicionam as suas.

## Ferramentas e superfícies

| Subcaminho | Propósito |
|---|---|
| `seam` | `ProviderRegistry<T>` — registro nomeado de providers, reversível e que falha em voz alta. |
| `gates` | `applyFailClosed`; `makeEventGate` / `maybeAppendSessionEvent` / `probeIgnorableAppend`. |
| `shared` | `sanitize` (`Stripper`, `redactText`, `redactMapping`, `sanitizeText`, `sanitizeUrl`), `pricing` (`BUILTIN_PRICES`, `estimateUsageCost`, `tokenCarbon`, `latencyStats`, `formatMoney`, `formatTokens`), `judge` (`parseVerdict`, `VERDICT_SCHEMA`, `riskExceeds`). |
| `verify` | Portas CI mecânicas (`verify-license`, `verify-readme-languages`, `verify-seam`) com `VerifyReport` e CLI com saída não zero: `node lib/verify/cli.js all .` |
| `template/` | Esqueleto de plugin novo (`cordis.yml`, plugin de três papéis, teste, README, `renovate.json5`). |
| barrel raiz | Reexporta tudo acima. |

## Permissões e dados

O kit não faz E/S, acesso à rede nem subprocessos por conta própria. O
`Stripper` mantém os mapeamentos placeholder→original apenas em memória, e
`stats()`/`redactMapping()` nunca emitem texto puro; um consumidor que
persista um mapeamento é dono dessa decisão e das permissões de armazenamento.

## Limites de segurança

- `sanitize`/`redact*` são **higiene de exibição**, não um limite de
  segurança: reduzem vazamentos em logs e resultados, não autenticam nem
  autorizam.
- As portas de aprovação são fail-closed por padrão (`rejected`); o único
  caminho de concessão é uma opção explícita `allow-once`.
- Eventos de sessão que o host recusa são pulados, nunca tentados de novo de
  forma que possa quebrar a retomada da sessão.
- Reporte vulnerabilidades via GitHub Security Advisories — ver `SECURITY.md`.

## Limitações conhecidas

- Hosts cujo terceiro argumento de `Session.append` é um `SurfaceIntent`
  (`0.1.2-rc.1`) lançam `validateNext` na sonda do envelope ignorable; a
  porta degrada para pular-desconhecido, então eventos de auditoria são
  descartados (fail closed) nesses hosts em vez de registrados.
- 0.1.2-rc.1 (adaptado em 2026-09-02): o envelope de sessão mantém seu campo ignorable apenas para compatibilidade de leitura de logs armazenados - o Session.append ainda não consegue estampá-lo, então o comportamento da porta não muda.
- O kit não traz metade de UI de navegador: é uma biblioteca consumida pelas
  metades Host (e opcionalmente Client) de outros plugins.

## Desenvolvimento

```sh
pnpm install
pnpm run typecheck        # tsc --noEmit
pnpm run typecheck:ci     # face CI: tsc -p tsconfig.ci.json --noEmit
pnpm test                 # testes unitários vitest
pnpm run build            # emite lib/ e declarações (prepare também faz)
pnpm run verify:self-contained
pnpm run verify:artifacts
```

## Tópicos

Este repositório também é o hub de manutenção dos 33 repos de plugins:
`scripts/sync-peer-range.mjs` reaponta a faixa de peers compartilhada em todos
os repos com um comando, `renovate/default.json5` é o preset compartilhado do
Renovate que todos estendem, `.github/workflows/npm-publish.yml` é um fluxo de
publicação reutilizável disparado por tag (precisa apenas de um segredo
`NPM_TOKEN`), e `data/repos.json` é o registro do ecossistema consumido pelo
portal. Ver [docs/ecosystem-tooling.md](docs/ecosystem-tooling.md).

Palavras-chave: dsh, dsh-plugin, deepseek-harness, deepseek, cordis, perrylink,
provider, seam, approval, sanitize, pricing, judge.

## Contribuidores

Mantido por [PerryLink](https://github.com/PerryLink) com contribuições do
ecossistema de plugins DSH.

## Licença

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
