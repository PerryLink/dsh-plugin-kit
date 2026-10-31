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

This template starts at `ENTRY=not-run`, `FLOW=not-run`, `BOOST=not-measured` in
`standards.json`. After you have evidence, update that file — never claim
`runtime`/`measured` without a recorded gate, journey or benchmark. The three
levels are adoption depths, not grades or certification; the public teaching
copy is
[dsh-plugin-guide/guide/standards.md](https://github.com/PerryLink/dsh-plugin-guide/blob/main/guide/standards.md).
