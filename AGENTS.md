# AGENTS.md

Repo-local decisions for `@perrylink/dsh-plugin-kit` (v0.1.x, unpublished).
The engineering standard lives in the batch task spec and the DeepSeek
Harness `AGENTS.md`; this file records only what is decided *here*.

## Protocol alignment

- **Approval vocabulary**: `src/gates/approval.ts` mirrors `dsh-auto-review`'s
  `fallbackPolicy` verbatim: `'rejected' | 'delegate' | 'allow-once'`, default
  `'rejected'`. Kit verdict `deny` maps to policy `'rejected'`; verdict
  `allow` maps to `'allow-once'`; `'delegate'` has no verdict equivalent and
  resolves to `deny` with `EffectiveDecision.policy === 'delegate'`.
- **Session events**: `src/gates/session-event.ts` is the shared adaptive
  (`ignorable`) append gate. `probeIgnorableAppend` must swallow append
  errors: hosts whose third append argument is a `SurfaceIntent`
  (`0.1.2-alpha.1` onward) throw `validateNext` on the probe options bag
  for surface probe types and ignore it for log-only types — either way
  the probe reports `false`. `0.1.2-alpha.2` retains the `ignorable?: true`
  envelope field for stored-log read compatibility only; `Session.append`
  still cannot stamp it.
- **Judge schema**: `src/shared/judge.ts` `ObjectJsonSchema` mirrors the host
  `JsonSchemaNode` (`packages/core/tools/src/json-schema.ts`): every node
  field is optional and array/record fields stay mutable so `VERDICT_SCHEMA`
  is assignable to the host's `ObjectJsonSchema`. Do not add `readonly` to
  the mirror fields.

## Docs

- Five-language READMEs: `README.md` is the source; `README.zh.md`,
  `README.es.md`, `README.pt.md`, `README.hi.md` follow the same section
  order (Compatibility / What you get / Quick start / Install & uninstall /
  Configuration / Tools & surfaces / Permissions & data / Security
  boundaries / Known limitations / Development / Topics / Contributors /
  License). Change the English source first, then sync the translations in
  the same commit.

## Build

- `prepare`/`build` emit `lib/` with plain `tsc` (no tsdown split): the kit
  has one library face, not a bundled plugin face.
- `typescript` lives in `dependencies` so the git install channel can run
  `prepare` without devDependencies.
- `typecheck:ci` runs `tsc -p tsconfig.ci.json`; the kit has no checkout
  `paths` aliases, so it equals `typecheck` until one is added.

## Notices

- `src/shared/sanitize.ts` is a port of `dsh-mask`'s `lib/strip.mjs` (itself
  ported from Pii-Stripper-Middleware, Apache-2.0, Copyright 2026
  PerryLink). Keep `THIRD_PARTY_NOTICES.md` current when the port changes.
