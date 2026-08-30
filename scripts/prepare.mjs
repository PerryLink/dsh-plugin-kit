// Self-contained build used by both `pnpm run build` and the git-install
// `prepare` lifecycle: emits lib/ (tsc ESM + declarations). Uses ONLY build
// tools declared in `dependencies` because pnpm does not install
// devDependencies of git-hosted packages.
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)

const tscPkgPath = require.resolve('typescript/package.json')
const tscPkg = require(tscPkgPath)
const tscBin = path.resolve(path.dirname(tscPkgPath), tscPkg.bin.tsc)

// Remove the previous lib/ output so a rebuild never mixes stale artifacts.
rmSync(new URL('../lib', import.meta.url), { recursive: true, force: true })

const result = spawnSync(process.execPath, [tscBin, '-p', 'tsconfig.build.json'], { stdio: 'inherit' })
if (result.error !== undefined) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)
console.log('build complete: lib/')
