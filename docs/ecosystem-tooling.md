# Ecosystem Tooling (34-repo maintenance)

`dsh-plugin-kit` doubles as the maintenance hub for the 33 @perrylink dsh
plugin repos. Everything here is deterministic and runs offline.

## 1. Peer-range sync — `scripts/sync-peer-range.mjs`

The 34 repos lock `@deepseek-ai/dsh-*` peerDependencies to one band. When the
harness ships a breaking minor (0.2.0), every repo must re-pin together:

```sh
node scripts/sync-peer-range.mjs --dir D:\deepseek-harness\Project\Plugins           # report
node scripts/sync-peer-range.mjs --dir D:\deepseek-harness\Project\Plugins --write   # rewrite
```

Range states per key:

- `ok` — floor and upper bound match `data/peer-range.json`
- `ok-higher` — same upper bound, higher floor: a real per-package requirement
  (e.g. `dsh-session-projection` needs `>=0.1.1-rc.2 <0.2.0`); never rewritten
- `drift-low` — floor below canonical: rewritten to the canonical band
- `drift-upper` — upper bound differs: the actual version-lock break, rewritten
- `unparseable` — range does not match `>=floor <upper`: reported, rewritten

The rewrite is line-based: only `peerDependencies` value lines change, so
`package.json` formatting outside the block is preserved byte-for-byte.

Canonical band lives in `data/peer-range.json`; bump `canonicalRange` there
after a dsh minor/major release, run `--write`, commit all repos, push.

## 2. Shared Renovate preset — `renovate/default.json5`

Every plugin repo has a `renovate.json5` that extends:

```json5
{ "extends": ["github>PerryLink/dsh-plugin-kit//renovate/default.json5"] }
```

The preset groups routine `@deepseek-ai/dsh-*` in-range bumps into one PR per
month and keeps everything manual. Breaking band re-pins are deliberately NOT
Renovate's job — they go through the sync script above (see the preset
comments).

## 3. Reusable publish workflow — `.github/workflows/npm-publish.yml`

No local npm token is required for releases. In each plugin repo add a caller
workflow on tag push:

```yaml
name: release
on:
  push:
    tags: ['v*']
jobs:
  publish:
    uses: PerryLink/dsh-plugin-kit/.github/workflows/npm-publish.yml@master
    with:
      package-dir: .
    secrets:
      npm_token: ${{ secrets.NPM_TOKEN }}
```

Set `NPM_TOKEN` once as an org/repo secret. The workflow installs, tests,
builds, and publishes with `--provenance`.

## 4. Repo manifest — `data/repos.json`

The single registry of the 34 repos (name, GitHub URL, group, role, star
count). Consumed by `dsh-plugin-portal`, sync scripts, and score pipelines.
Update star counts periodically and keep it the source of truth for the
ecosystem inventory.
