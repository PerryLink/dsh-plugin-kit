# <PLUGIN_NAME>

<One-line purpose.>

## Seam roles

- **Service Definition** — `src/index.ts` (`MyCapability` interface).
- **Service Provider** — `src/index.ts` (default + `fast` implementations registered via `ProviderRegistry`).
- **Consumer** — `src/index.ts` (`apply` resolves and uses the active provider).

## Configuration

See `cordis.yml` for the Config fields.

## Development

```sh
pnpm install
pnpm test
```

Replace every `<PLACEHOLDER>` token before publishing.

## Standards (fill before publishing)

The optional `dsh.standards` block in `package.json` starts as a placeholder, not a claim.
Run `level-audit` (`node 40-checker/scripts/level-audit.mjs <plugin-dir> --format json`) and replace it with the recorded output.
With no evidence, keep `not-run` / `not-measured`; never write `PASS` without a recorded gate, journey or benchmark.

The same statuses live in `standards.json`. The three levels are adoption
depths, not grades or certification; the public teaching copy is
[dsh-plugin-guide/guide/standards.md](https://github.com/PerryLink/dsh-plugin-guide/blob/main/guide/standards.md).
