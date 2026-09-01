# @perrylink/dsh-plugin-kit
- **Canal de la tienda 1024**: primero `npm i -g dsh1024`, luego `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

Kit compartido **sin dependencias en tiempo de ejecución** para los
repositorios de plugins DSH de PerryLink. La auditoría por proyecto detectó
que más de 20 de los 33 plugins reimplementan el mismo seam Provider y
duplican las mismas formas de sanitización, precios y veredictos, así que este
paquete lo extrae todo — el seam Provider enchufable, las puertas de aprobación
fail-closed y de eventos de sesión adaptativos, los scripts de verificación
mecánica y los módulos puros sanitize/pricing/judge — en un único paquete
ESM + TypeScript.

## Compatibilidad

- **DSH harness**: el kit no importa nada de `@deepseek-ai/*` en tiempo de
  ejecución. `@deepseek-ai/cordis` (`^4.0.1`), `@deepseek-ai/schemastery`
  (`^3.18.0`) y los paquetes `@deepseek-ai/dsh-*` son peer dependencies
  **opcionales** en la banda `>=0.1.0-rc.8 <0.2.0` compartida por los 33
  repos; solo existen para interoperar tipos.
- **Node**: `^22.19.0 || >=24.0.0`, solo ESM.
- **Compatibilidad de formato**: nombres y formas reflejan `dsh-mask`
  (sanitize), `dsh-budget` (pricing) y `dsh-auto-review` (judge y el
  vocabulario `fallbackPolicy`), así que la migración es mecánica.

## Qué obtienes

- **Cero dependencias en tiempo de ejecución** — el núcleo puro (`seam`,
  `gates`, `shared`) es seguro para el navegador.
- **ESM + TypeScript estricto** — contratos JSDoc en cada módulo; `strict`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **Puertas fail-closed y adaptativas** — la aprobación nunca concede por
  defecto; los eventos de sesión degradan con elegancia en hosts que rechazan
  tipos de evento desconocidos.
- **Plantilla de plugin** — `template/` con `cordis.yml`, un `src/index.ts` de
  tres roles (Service Definition / Provider / Consumer), un test y el preset
  compartido de Renovate.

## Inicio rápido

Desde npm:

```sh
pnpm add @perrylink/dsh-plugin-kit
```

Desde git (el script `prepare` construye `lib/` usando solo dependencias de
producción):

```sh
pnpm add github:PerryLink/dsh-plugin-kit
```

Reemplaza un registro escrito a mano en un paso:

```ts
import { ProviderRegistry } from '@perrylink/dsh-plugin-kit/seam'

const registry = new ProviderRegistry<Detector>({
  default: { name: 'regex', impl: new RegexDetector() },
})
ctx.effect(() => registry.register('ner', new NerDetector()))
const active = registry.use('ner') ?? registry.use()
```

## Instalación y desinstalación

La instalación es `pnpm add` (ver Inicio rápido). Para eliminar:

```sh
pnpm remove @perrylink/dsh-plugin-kit
```

Nada registra estado global: desinstalar es exactamente lo inverso de instalar.

## Configuración

Sin configuración en tiempo de ejecución: las puertas y utilidades son
funciones puras. La única superficie de configuración es `cordis.patch.yml`,
la capa de parche de bundle que se distribuye para la composición de perfiles
del harness; no monta ninguna fila de plugin (el kit es una biblioteca) y
documenta cómo los plugins consumidores añaden las suyas.

## Herramientas y superficies

| Subruta | Propósito |
|---|---|
| `seam` | `ProviderRegistry<T>` — registro de providers nombrado, reversible y que falla en voz alta. |
| `gates` | `applyFailClosed`; `makeEventGate` / `maybeAppendSessionEvent` / `probeIgnorableAppend`. |
| `shared` | `sanitize` (`Stripper`, `redactText`, `redactMapping`, `sanitizeText`, `sanitizeUrl`), `pricing` (`BUILTIN_PRICES`, `estimateUsageCost`, `tokenCarbon`, `latencyStats`, `formatMoney`, `formatTokens`), `judge` (`parseVerdict`, `VERDICT_SCHEMA`, `riskExceeds`). |
| `verify` | Puertas CI mecánicas (`verify-license`, `verify-readme-languages`, `verify-seam`) con `VerifyReport` y CLI con salida no cero: `node lib/verify/cli.js all .` |
| `template/` | Plantilla de plugin nuevo (`cordis.yml`, plugin de tres roles, test, README, `renovate.json5`). |
| barrel raíz | Reexporta todo lo anterior. |

## Permisos y datos

El kit no realiza E/S, acceso a red ni subprocesos por sí mismo. `Stripper`
mantiene los mapeos placeholder→original solo en memoria, y
`stats()`/`redactMapping()` nunca emiten texto plano; un consumidor que
persista un mapeo es dueño de esa decisión y de sus permisos de almacenamiento.

## Límites de seguridad

- `sanitize`/`redact*` son **higiene de presentación**, no un límite de
  seguridad: reducen la fuga en logs y resultados, no autentican ni autorizan.
- Las puertas de aprobación son fail-closed por defecto (`rejected`); la única
  vía de concesión es una opción explícita `allow-once`.
- Los eventos de sesión que el host rechaza se omiten, nunca se reintentan de
  forma que pueda romper la reanudación de la sesión.
- Reporta vulnerabilidades vía GitHub Security Advisories — ver `SECURITY.md`.

## Limitaciones conocidas

- Los hosts cuyo tercer argumento de `Session.append` es un `SurfaceIntent`
  (`0.1.2-alpha.2`) lanzan `validateNext` ante la sonda del sobre ignorable;
  la puerta degrada a omitir-desconocido, de modo que los eventos de auditoría
  se descartan (fail closed) en esos hosts en lugar de registrarse.
- 0.1.2-alpha.2 (adaptado el 2026-08-31): el sobre de sesión conserva su campo ignorable solo para compatibilidad de lectura de logs almacenados - Session.append aún no puede estamparlo, por lo que el comportamiento de la puerta no cambia.
- El kit no trae mitad de UI de navegador: es una biblioteca consumida por las
  mitades Host (y opcionalmente Client) de otros plugins.

## Desarrollo

```sh
pnpm install
pnpm run typecheck        # tsc --noEmit
pnpm run typecheck:ci     # cara CI: tsc -p tsconfig.ci.json --noEmit
pnpm test                 # tests unitarios vitest
pnpm run build            # emite lib/ y declaraciones (también lo hace prepare)
pnpm run verify:self-contained
pnpm run verify:artifacts
```

## Temas

Este repositorio es también el centro de mantenimiento de los 33 repos de
plugins: `scripts/sync-peer-range.mjs` repinnea la banda de peers compartida
en todos los repos con un comando, `renovate/default.json5` es el preset de
Renovate compartido que todos extienden, `.github/workflows/npm-publish.yml`
es un flujo de publicación reutilizable disparado por tag (solo necesita un
secreto `NPM_TOKEN`), y `data/repos.json` es el registro del ecosistema que
consume el portal. Ver [docs/ecosystem-tooling.md](docs/ecosystem-tooling.md).

Palabras clave: dsh, dsh-plugin, deepseek-harness, deepseek, cordis, perrylink,
provider, seam, approval, sanitize, pricing, judge.

## Contribuidores

Mantenido por [PerryLink](https://github.com/PerryLink) con contribuciones
del ecosistema de plugins DSH.

## Licencia

Apache-2.0 — ver [LICENSE](LICENSE).
