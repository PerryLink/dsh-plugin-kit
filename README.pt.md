# @perrylink/dsh-plugin-kit
- **Canal da loja 1024**: primeiro `npm i -g dsh1024`, depois `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` (conta para o ranking de instalações do [deepseek1024.com](https://deepseek1024.com)).

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

Kit compartilhado **sem dependências em tempo de execução** para os
repositórios de plugins DSH da PerryLink. A auditoria por projeto encontrou
mais de 20 dos 33 plugins reimplementando o mesmo seam Provider e duplicando
as mesmas formas de sanitização, precificação e veredicto, então este pacote
extrai tudo isso — o seam Provider plugável, as portas de aprovação
fail-closed e de eventos de sessão adaptativos, os scripts de verificação
mecânica e os módulos puros sanitize/pricing/judge — em um único pacote
ESM + TypeScript.

## Compatibilidade

- **DSH harness**: o kit não importa nada de `@deepseek-ai/*` em tempo de
  execução. `@deepseek-ai/cordis` (`^4.0.2`), `@deepseek-ai/schemastery`
  (`^3.18.2`) e os pacotes `@deepseek-ai/dsh-*` são peer dependencies
  **opcionais** na faixa `>=0.1.0-rc.8 <0.2.0` compartilhada pelos 33 repos;
  existem apenas para interoperação de tipos.
- **Node**: `^22.19.0 || >=24.0.0`, somente ESM.
- **Compatibilidade de formato**: nomes e formas espelham `dsh-mask`
  (sanitize), `dsh-budget` (pricing) e `dsh-auto-review` (judge e o
  vocabulário `fallbackPolicy`), então a migração é mecânica.

## O que você recebe

- **Zero dependências em tempo de execução** — o núcleo puro (`seam`,
  `gates`, `shared`) é seguro para o navegador.
- **ESM + TypeScript estrito** — contratos JSDoc em cada módulo; `strict`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **Portas fail-closed e adaptativas** — a aprovação nunca concede por
  padrão; os eventos de sessão degradam com elegância em hosts que rejeitam
  tipos de evento desconhecidos.
- **Esqueleto de plugin** — `template/` com `cordis.yml`, um `src/index.ts`
  de três papéis (Service Definition / Provider / Consumer), um teste e o
  preset compartilhado do Renovate.

## Início rápido

Pelo npm:

```sh
pnpm add @perrylink/dsh-plugin-kit
```

Pelo git (o script `prepare` constrói `lib/` usando apenas dependências de
produção):

```sh
pnpm add github:PerryLink/dsh-plugin-kit
```

Substitua um registro escrito à mão em um passo:

```ts
import { ProviderRegistry } from '@perrylink/dsh-plugin-kit/seam'

const registry = new ProviderRegistry<Detector>({
  default: { name: 'regex', impl: new RegexDetector() },
})
ctx.effect(() => registry.register('ner', new NerDetector()))
const active = registry.use('ner') ?? registry.use()
```

## Instalar e desinstalar

A instalação é `pnpm add` (ver Início rápido). Para remover:

```sh
pnpm remove @perrylink/dsh-plugin-kit
```

Nada registra estado global: desinstalar é exatamente o inverso de instalar.

## Configuração

Sem configuração em tempo de execução: as portas e utilitários são funções
puras. A única superfície de configuração é `cordis.patch.yml`, a camada de
patch de bundle distribuída para a composição de perfis do harness; ela não
monta nenhuma linha de plugin (o kit é uma biblioteca) e documenta como
plugins consumidores adicionam as suas.

## Ferramentas e superfícies

| Subcaminho | Propósito |
|---|---|
| `seam` | `ProviderRegistry<T>` — registro nomeado de providers, reversível e que falha em voz alta. |
| `gates` | `applyFailClosed`; `makeEventGate` / `maybeAppendSessionEvent` / `probeIgnorableAppend`. |
| `shared` | `sanitize` (`Stripper`, `redactText`, `redactMapping`, `sanitizeText`, `sanitizeUrl`), `pricing` (`BUILTIN_PRICES`, `estimateUsageCost`, `tokenCarbon`, `latencyStats`, `formatMoney`, `formatTokens`), `judge` (`parseVerdict`, `VERDICT_SCHEMA`, `riskExceeds`). |
| `verify` | Portas CI mecânicas (`verify-license`, `verify-readme-languages`, `verify-seam`) com `VerifyReport` e CLI com saída não zero: `node lib/verify/cli.js all .` |
| `template/` | Esqueleto de plugin novo (`cordis.yml`, plugin de três papéis, teste, README, `renovate.json5`). |
| barrel raiz | Reexporta tudo acima. |

## Permissões e dados

O kit não faz E/S, acesso à rede nem subprocessos por conta própria. O
`Stripper` mantém os mapeamentos placeholder→original apenas em memória, e
`stats()`/`redactMapping()` nunca emitem texto puro; um consumidor que
persista um mapeamento é dono dessa decisão e das permissões de armazenamento.

## Limites de segurança

- `sanitize`/`redact*` são **higiene de exibição**, não um limite de
  segurança: reduzem vazamentos em logs e resultados, não autenticam nem
  autorizam.
- As portas de aprovação são fail-closed por padrão (`rejected`); o único
  caminho de concessão é uma opção explícita `allow-once`.
- Eventos de sessão que o host recusa são pulados, nunca tentados de novo de
  forma que possa quebrar a retomada da sessão.
- Reporte vulnerabilidades via GitHub Security Advisories — ver `SECURITY.md`.

## Limitações conhecidas

- Hosts cujo terceiro argumento de `Session.append` é um `SurfaceIntent`
  (`0.1.2-alpha.5`) lançam `validateNext` na sonda do envelope ignorable; a
  porta degrada para pular-desconhecido, então eventos de auditoria são
  descartados (fail closed) nesses hosts em vez de registrados.
- 0.1.2-alpha.5 (adaptado em 2026-09-02): o envelope de sessão mantém seu campo ignorable apenas para compatibilidade de leitura de logs armazenados - o Session.append ainda não consegue estampá-lo, então o comportamento da porta não muda.
- O kit não traz metade de UI de navegador: é uma biblioteca consumida pelas
  metades Host (e opcionalmente Client) de outros plugins.

## Desenvolvimento

```sh
pnpm install
pnpm run typecheck        # tsc --noEmit
pnpm run typecheck:ci     # face CI: tsc -p tsconfig.ci.json --noEmit
pnpm test                 # testes unitários vitest
pnpm run build            # emite lib/ e declarações (prepare também faz)
pnpm run verify:self-contained
pnpm run verify:artifacts
```

## Tópicos

Este repositório também é o hub de manutenção dos 33 repos de plugins:
`scripts/sync-peer-range.mjs` reaponta a faixa de peers compartilhada em todos
os repos com um comando, `renovate/default.json5` é o preset compartilhado do
Renovate que todos estendem, `.github/workflows/npm-publish.yml` é um fluxo de
publicação reutilizável disparado por tag (precisa apenas de um segredo
`NPM_TOKEN`), e `data/repos.json` é o registro do ecossistema consumido pelo
portal. Ver [docs/ecosystem-tooling.md](docs/ecosystem-tooling.md).

Palavras-chave: dsh, dsh-plugin, deepseek-harness, deepseek, cordis, perrylink,
provider, seam, approval, sanitize, pricing, judge.

## Contribuidores

Mantido por [PerryLink](https://github.com/PerryLink) com contribuições do
ecossistema de plugins DSH.

## Licença

Apache-2.0 — ver [LICENSE](LICENSE).
