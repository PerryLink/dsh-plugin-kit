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
