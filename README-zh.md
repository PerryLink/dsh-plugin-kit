# @perrylink/dsh-plugin-kit
- **1024 商店渠道**：先 `npm i -g dsh1024`，再 `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit`（计入 [deepseek1024.com](https://deepseek1024.com) 安装排行）。

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

[English](README.md) | **简体中文** | [Español](README-es.md) | [Português](README-pt.md) | [हिन्दी](README-hi.md)

面向 PerryLink DSH 插件仓库的共享**零运行时依赖**工具包。逐项审计发现 33 个插件中有
20+ 各自手写同样的 Provider seam、并重复相同的 sanitize/pricing/裁决形状，因此本包把
这一切——可插拔 Provider seam、fail-closed 审批门与自适应会话事件门、机械校验脚本、共享
的 sanitize/pricing/judge 纯函数模块——抽取进一个 ESM + TypeScript 包。

## 兼容性

- **DSH harness**：本包运行时零 `@deepseek-ai/*` import。`@deepseek-ai/cordis`
  （`^4.0.2`）、`@deepseek-ai/schemastery`（`^3.18.2`）与各 `@deepseek-ai/dsh-*`
  包均声明为**可选** peer 依赖，区间与 PerryLink 各插件仓一致（`>=0.1.2-rc.1 <0.2.0`），仅用于
  类型互通。已于 2026-09-11 针对 `dsh-v0.1.5-rc.2` master checkout 核验（全量门禁链 + profile 安装冒烟测试）。
- **Node**：`^22.19.0 || >=24.0.0`，仅 ESM。
- **线级兼容**：函数名与形状对齐 `dsh-mask`（sanitize）、`dsh-budget`（pricing）、
  `dsh-auto-review`（judge 与 `fallbackPolicy` 词汇），迁移是机械替换。

## 你能得到什么

- **零运行时依赖**——纯核心（`seam` / `gates` / `shared`）浏览器侧可用。
- **ESM + 严格 TypeScript**——每个模块带 JSDoc 契约；开启 `strict`、
  `noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`。
- **fail-closed 与自适应门**——审批永不默认放行；会话事件追加在拒绝未知事件类型的
  宿主上优雅降级。
- **新插件骨架**——`template/` 含 `cordis.yml`、三角色 `src/index.ts`（Service
  Definition / Provider / Consumer）、最小测试与共享 Renovate 预设。

## 快速开始

npm 通道：

```sh
pnpm add @perrylink/dsh-plugin-kit
```

git 通道（`prepare` 脚本只用生产依赖构建 `lib/`）：

```sh
pnpm add github:PerryLink/dsh-plugin-kit
```

一步替换手写注册表：

```ts
import { ProviderRegistry } from '@perrylink/dsh-plugin-kit/seam'

const registry = new ProviderRegistry<Detector>({
  default: { name: 'regex', impl: new RegexDetector() },
})
ctx.effect(() => registry.register('ner', new NerDetector()))
const active = registry.use('ner') ?? registry.use()
```

## 安装与卸载

安装即 `pnpm add`（见快速开始）。移除：

```sh
pnpm remove @perrylink/dsh-plugin-kit
```

不注册任何全局状态：卸载就是安装的精确逆操作。

## 配置

无运行时配置：门与辅助函数均为纯函数。唯一配置面是 `cordis.patch.yml`——随包发布的
bundle-patch 层，供 harness profile 组合使用；它不挂载插件行（本包是库），并说明消费
插件如何添加自己的行。

## 工具与表面

| 子路径 | 用途 |
|---|---|
| `seam` | `ProviderRegistry<T>`——可逆、重名响亮失败的具名 Provider 注册表。 |
| `gates` | `applyFailClosed`；`makeEventGate` / `maybeAppendSessionEvent` / `probeIgnorableAppend`。 |
| `shared` | `sanitize`（`Stripper`、`redactText`、`redactMapping`、`sanitizeText`、`sanitizeUrl`）、`pricing`（`BUILTIN_PRICES`、`estimateUsageCost`、`tokenCarbon`、`latencyStats`、`formatMoney`、`formatTokens`）、`judge`（`parseVerdict`、`VERDICT_SCHEMA`、`riskExceeds`）。 |
| `verify` | 机械 CI 门（`verify-license`、`verify-readme-languages`、`verify-seam`），返回 `VerifyReport` 且 CLI 以非零码失败：`node lib/verify/cli.js all .` |
| `template/` | 新插件骨架（`cordis.yml`、三角色插件、测试、README、`renovate.json5`）。 |
| 根 barrel | 重导出以上全部。 |

## 权限与数据

本包自身不做任何 I/O、网络访问或子进程启动。`Stripper` 的占位符→原文映射只存内存，
`stats()`/`redactMapping()` 绝不输出明文；持久化映射的消费方自行承担该决策及其存储权限。

## 安全边界

- `sanitize`/`redact*` 是**展示卫生**，不是安全边界：它们降低日志与结果中的泄露，
  不做认证或授权。
- 审批门默认 fail closed（`rejected`）；唯一放行路径是显式 `allow-once` 选择。
- 宿主拒绝的会话事件追加会被跳过，绝不重试到破坏会话 resume 的程度。
- 漏洞请走 GitHub Security Advisories——见 `SECURITY.md`。

## 已知限制

- `Session.append` 第三参为 `SurfaceIntent` 的宿主（`0.1.2-rc.1`）会对 ignorable
  信封探测抛 `validateNext`；门退化为跳过未知类型，即该类宿主上审计事件被丢弃
  （fail closed）而非写入。
- 0.1.2-rc.1（2026-09-02 已适配）：会话信封保留 ignorable 字段但仅用于存量日志读取兼容——Session.append 仍无法盖章，门控行为不变。
- 本包无浏览器 UI 半：它是被其他插件 Host（及可选 Client）半消费的库。

## 开发

```sh
pnpm install
pnpm run typecheck        # tsc --noEmit
pnpm run typecheck:ci     # CI 面：tsc -p tsconfig.ci.json --noEmit
pnpm test                 # vitest 单测
pnpm run build            # 产出 lib/ 与声明（prepare 也会执行）
pnpm run verify:self-contained
pnpm run verify:artifacts
```

## 主题

本仓库同时是 33 个插件仓的维护枢纽：`scripts/sync-peer-range.mjs` 一条命令重钉所有仓的
共享 peer 区间，`renovate/default.json5` 是各仓统一继承的 Renovate 预设，
`.github/workflows/npm-publish.yml` 是可复用的 tag 触发发布工作流（只需一个
`NPM_TOKEN` secret），`data/repos.json` 是门户消费的生态注册表。见
[docs/ecosystem-tooling.md](docs/ecosystem-tooling.md)。

关键词：dsh、dsh-plugin、deepseek-harness、deepseek、cordis、perrylink、provider、
seam、approval、sanitize、pricing、judge。

## 贡献者

由 [PerryLink](https://github.com/PerryLink) 维护，DSH 插件生态共建。

## 许可证

Apache-2.0——见 [LICENSE](LICENSE)。

## PerryLink DSH 插件家族

这是 [PerryLink](https://github.com/PerryLink) 维护的 [40 个 DeepSeek Harness 插件](https://github.com/PerryLink) 之一。如果它能帮到你，其他的也会：

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
