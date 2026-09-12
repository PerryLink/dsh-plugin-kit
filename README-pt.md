# @perrylink/dsh-plugin-kit
- **Canal da loja 1024**: primeiro `npm i -g dsh1024`, depois `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` (conta para o ranking de instalações do [deepseek1024.com](https://deepseek1024.com)).

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

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
  execução. `@deepseek-ai/cordis` (`^4.0.2`), `@deepseek-ai/schemastery`
  (`^3.18.2`) e os pacotes `@deepseek-ai/dsh-*` são peer dependencies
  **opcionais** na faixa `>=0.1.2-rc.1 <0.2.0` compartilhada pelos repos de plugins da PerryLink;
  existem apenas para interoperação de tipos. Verificado em 2026-09-11 contra
  o checkout master `dsh-v0.1.5-rc.2` (cadeia completa de portas + smoke
  de instalação de perfil).
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

A instalação é `pnpm add` (ver Início rápido). Para remover:

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

## Família de plugins DSH da PerryLink

Este projeto é um dos [40 plugins de DeepSeek Harness](https://github.com/PerryLink) mantidos por [PerryLink](https://github.com/PerryLink). Se este ajuda você, os outros provavelmente também:

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
