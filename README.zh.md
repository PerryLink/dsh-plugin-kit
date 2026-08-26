# @perrylink/dsh-plugin-kit

面向 PerryLink 33 个 DSH 插件仓库的共享 **零运行时依赖** 工具包。它把每个插件都在重复实现的横切基建——可插拔 Provider seam、fail-closed 与自适应会话事件门、机械校验脚本、sanitize/pricing/judge 纯函数模块——抽取成单一 ESM + TypeScript 包。

- **零运行时依赖**——`dependencies` 为空；纯核心（`seam` / `gates` / `shared`）可运行在浏览器侧。
- **ESM + 严格 TypeScript**——每个模块都带 JSDoc 契约；开启 `strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`。
- **与 33 仓线级兼容**——函数名与形状对齐 `dsh-mask`（脱敏）、`dsh-budget`（pricing）、`dsh-auto-review`（judge），迁移是机械替换。

## 这个包解决什么

逐项目审计（`perrylink-dsh-33-逐项目优化方案.md`）发现：33 个插件里有 20+ 各自手写同样的 Provider 注册表 seam，另有多个项目重复同样的脱敏、计费与审批裁决形状；8 个子代理独立得出同一结论——公共 kit 是单维护者可持续的唯一路径。这个包就是那个 kit。

## 模块

| 子路径 | 用途 |
|---|---|
| `@perrylink/dsh-plugin-kit/seam` | 可插拔 `ProviderRegistry<T>` seam 模板。 |
| `@perrylink/dsh-plugin-kit/gates` | fail-closed 审批门 + 自适应（ignorable）会话事件门。 |
| `@perrylink/dsh-plugin-kit/shared` | `sanitize` / `pricing` / `judge` 纯函数模块。 |
| `@perrylink/dsh-plugin-kit/verify` | 机械门：`verify-license`、`verify-readme-languages`、`verify-seam`。 |
| `@perrylink/dsh-plugin-kit` | 根 barrel，重导出以上全部。 |

### `seam` — Provider 注册表模板

框架无关、可逆的单一能力实现注册表。`register()` 返回 disposer，因此 Cordis
插件在 `ctx.effect()` 内注册即可自动随 stop/update 注销；重复名响亮失败；可
注入默认实现。

```ts
import { ProviderRegistry } from '@perrylink/dsh-plugin-kit/seam'

const registry = new ProviderRegistry<Detector>({
  default: { name: 'regex', impl: new RegexDetector() },
})
ctx.effect(() => registry.register('ner', new NerDetector()))
const active = registry.use('ner') ?? registry.use()
```

### `gates` — 审批门与会话事件门

- `applyFailClosed`——把评审/规则裁决解析为决策，失败时默认 `deny`（fail
  closed，对齐 `dsh-auto-review` 的 `fallbackPolicy`）。
- `makeEventGate` / `maybeAppendSessionEvent` / `probeIgnorableAppend`——`dsh-mask`
  与 `dsh-auto-review` 都在重写的自适应 `ignorable` 信封门，保证在不盖章信封的
  宿主上审计事件不会破坏会话 resume。

### `shared` — sanitize / pricing / judge

- `sanitize`——`Stripper`（`<LABEL_N>` 占位符遮罩 + 还原表）、
  `redactText`/`redactMapping`，以及展示用 `sanitizeText`/`sanitizeUrl`。
- `pricing`——`BUILTIN_PRICES`（USD/百万 token）、`estimateUsageCost`、
  `tokenCarbon`、`latencyStats`、`formatMoney`、`formatTokens`。
- `judge`——`{ decision, reason, riskLevel }` 校验（`parseVerdict`、
  `VERDICT_SCHEMA`、`riskExceeds`）。

### `verify` — 机械 CI 门

每个都返回 `VerifyReport`，CLI 在失败时设置非零退出码：

```sh
node lib/verify/cli.js all .
```

### `template/` — 新插件骨架

`cordis.yml`、`src/index.ts`（Service Definition / Service Provider / Consumer
三角色）、最小测试、README，以及 `renovate.json5`（`<0.2.0` 版本锁统一升级模板）。

## 接入既有 33 仓

1. 作为普通依赖加入（它自身无依赖）：
   ```sh
   pnpm add @perrylink/dsh-plugin-kit
   ```
2. 用手写注册表替换为 `ProviderRegistry`（`seam`），或直接引入共享模块
   （`shared`、`gates`）——形状与现状一致，改动主要是删除重复文件。
3. 把机械门接进 CI（可替换现有 `verify-*.mjs` 脚本）：
   ```sh
   node node_modules/@perrylink/dsh-plugin-kit/lib/verify/cli.js all .
   ```
4. 复制 `template/renovate.json5`，把 `@deepseek-ai/dsh-*` peer 归组并锁定在
   `>=0.1.0-rc.8 <0.2.0` 区间内。

## peer 依赖

`@deepseek-ai/cordis` 与 `@deepseek-ai/dsh-*` 以 **可选** peer 依赖声明，区间
与 33 仓一致（`>=0.1.0-rc.8 <0.2.0`）。之所以可选，是因为本包运行时并不 import
它们，仅在消费方已装 harness 时用于类型互通。

## 开发

```sh
pnpm install
pnpm test        # vitest 单测
pnpm typecheck   # tsc --noEmit
pnpm build       # 产出 lib/ 与声明
```

许可：Apache-2.0。
