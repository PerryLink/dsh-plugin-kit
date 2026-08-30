# Third-party notices

## Ported code

The regex PII detectors, overlap resolution, same-value-same-placeholder
reuse, and restore-by-descending-placeholder-length logic in
`src/shared/sanitize.ts` are ported from `dsh-mask`'s `lib/strip.mjs` and
`lib/constants.mjs`, which are themselves a JavaScript port of
[Pii-Stripper-Middleware](https://github.com/PerryLink/Pii-Stripper-Middleware).
The upstream carries the Apache-2.0 LICENSE (`Copyright 2026 PerryLink`),
verified against `dsh-mask`'s `THIRD_PARTY_NOTICES.md` at port time; the port
adapts the Python implementation to JavaScript and adds the `key` detector.
This repository is licensed under Apache-2.0 (see `LICENSE`).

## Install-time dependencies

The kit bundles no third-party source code. It depends on the following
software, none of which is bundled into the published tarball:

| Package | Version range | License | Purpose |
|---|---|---|---|
| [typescript](https://www.typescriptlang.org/) | `^6.0.3` | Apache-2.0 | Build-time `lib/` emission (`prepare`/`build`) |
