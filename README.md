# @perrylink/dsh-plugin-kit

Shared **zero-runtime-dependency** toolkit for the 33 PerryLink DSH plugin
repositories. It extracts the cross-cutting infrastructure every plugin
reimplements today — the pluggable Provider seam, the fail-closed and adaptive
session-event gates, the mechanical verify scripts, and the shared
sanitize/pricing/judge pure modules — into one ESM + TypeScript package.

- **Zero runtime dependencies** — nothing in `dependencies`; the pure core
  (`seam`, `gates`, `shared`) is browser-safe.
- **ESM + strict TypeScript** — every module ships JSDoc contracts; `strict`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **Wire-compatible with the 33 repos** — function names and shapes mirror
  `dsh-mask` (sanitize), `dsh-budget` (pricing), and `dsh-auto-review` (judge)
  so migration is mechanical.

## Why this package exists

The per-project audit (`perrylink-dsh-33-逐项目优化方案.md`) found that 20+ of
the 33 plugins independently hand-roll the same Provider-seam registry, and
several duplicate the same PII/sanitize, pricing, and approval-verdict shapes.
Eight independent sub-agents concluded the same thing: a shared kit is the only
sustainable path for a single maintainer. This package is that kit.

## Modules

| Subpath | Purpose |
|---|---|
| `@perrylink/dsh-plugin-kit/seam` | Pluggable `ProviderRegistry<T>` seam template. |
| `@perrylink/dsh-plugin-kit/gates` | Fail-closed approval + adaptive (ignorable) session-event gates. |
| `@perrylink/dsh-plugin-kit/shared` | `sanitize` / `pricing` / `judge` pure modules. |
| `@perrylink/dsh-plugin-kit/verify` | Mechanical gates: `verify-license`, `verify-readme-languages`, `verify-seam`. |
| `@perrylink/dsh-plugin-kit` | Root barrel re-exporting all of the above. |

### `seam` — Provider registry template

A framework-agnostic, reversible registry for one capability's implementations.
`register()` returns a disposer, so a Cordis plugin registers inside
`ctx.effect()` and teardown is automatic. Duplicate names fail loud. A default
implementation can be injected up front.

```ts
import { ProviderRegistry } from '@perrylink/dsh-plugin-kit/seam'

const registry = new ProviderRegistry<Detector>({
  default: { name: 'regex', impl: new RegexDetector() },
})
ctx.effect(() => registry.register('ner', new NerDetector()))
const active = registry.use('ner') ?? registry.use()
```

### `gates` — approval and session-event gates

- `applyFailClosed` — resolves a reviewer/rule verdict to a decision, defaulting
  to `deny` on failure (fail closed, matching `dsh-auto-review`'s
  `fallbackPolicy`).
- `makeEventGate` / `maybeAppendSessionEvent` / `probeIgnorableAppend` — the
  adaptive `ignorable`-envelope gate `dsh-mask` and `dsh-auto-review` both
  reimplement, so audit events never break session resume on hosts that do not
  stamp the envelope.

### `shared` — sanitize / pricing / judge

- `sanitize` — `Stripper` (placeholder `<LABEL_N>` masking + restore table),
  `redactText`/`redactMapping`, and display `sanitizeText`/`sanitizeUrl`.
- `pricing` — `BUILTIN_PRICES` (USD/1M), `estimateUsageCost`, `tokenCarbon`,
  `latencyStats`, `formatMoney`, `formatTokens`.
- `judge` — `{ decision, reason, riskLevel }` validation (`parseVerdict`,
  `VERDICT_SCHEMA`, `riskExceeds`).

### `verify` — mechanical CI gates

Each returns a `VerifyReport` and the CLI sets a non-zero exit code on failure:

```sh
node lib/verify/cli.js all .
```

### `template/` — new-plugin skeleton

`cordis.yml`, `src/index.ts` (Service Definition / Service Provider / Consumer
roles), a minimal test, a README, and `renovate.json5` (the shared version-lock
upgrade template for the `<0.2.0` band).

## Integrating into the existing 33 repos

1. Add the kit as a regular dependency (it has none of its own):
   ```sh
   pnpm add @perrylink/dsh-plugin-kit
   ```
2. Replace a hand-rolled registry with `ProviderRegistry` (`seam`), or import
   the shared modules directly (`shared`, `gates`) — the shapes match the
   current code, so the change is mostly deleting duplicated files.
3. Add the mechanical gates to CI (drop-in for the existing `verify-*.mjs`
   scripts):
   ```sh
   node node_modules/@perrylink/dsh-plugin-kit/lib/verify/cli.js all .
   ```
4. Copy `template/renovate.json5` to keep the `@deepseek-ai/dsh-*` peers
   grouped and inside the `>=0.1.0-rc.8 <0.2.0` band.

## Peer dependencies

`@deepseek-ai/cordis` and the `@deepseek-ai/dsh-*` packages are declared as
**optional** peer dependencies in the same `>=0.1.0-rc.8 <0.2.0` range the 33
repos use. They are optional because the kit does not import them at runtime:
they exist only for type interop when a consumer already has the harness
installed.

## Development

```sh
pnpm install
pnpm test        # vitest unit tests
pnpm typecheck   # tsc --noEmit
pnpm build       # emit lib/ + declarations
```

License: Apache-2.0.
