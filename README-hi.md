# @perrylink/dsh-plugin-kit
- **1024 स्टोर चैनल**: पहले `npm i -g dsh1024`, फिर `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` ([deepseek1024.com](https://deepseek1024.com) इंस्टॉल रैंकिंग में गिना जाता है)।

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-listed-en.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-plugin-kit)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-plugin-kit/ci.yml?branch=master&label=CI)](https://github.com/PerryLink/dsh-plugin-kit/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-plugin-kit?label=version)](https://github.com/PerryLink/dsh-plugin-kit/releases)
[![npm downloads](https://img.shields.io/npm/dm/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-plugin-kit?metric=downloads&lang=hi)](https://dshfind.com/hi/plugins/PerryLink/dsh-plugin-kit?ref=badge)

[English](README.md) | [简体中文](README-zh.md) | [Español](README-es.md) | [Português](README-pt.md) | **हिन्दी**

PerryLink DSH प्लगइन रिपॉज़िटरीज़ के लिए साझा **शून्य-रनटाइम-निर्भरता** टूलकिट।
प्रति-प्रोजेक्ट ऑडिट में पाया गया कि 33 में से 20+ प्लगइन एक ही Provider seam
हाथ से लिखते हैं और एक जैसी sanitize/pricing/निर्णय आकृतियाँ दोहराते हैं, इसलिए
यह पैकेज वह सब — प्लगेबल Provider seam, fail-closed अनुमोदन और अनुकूली
सत्र-घटना गेट, यांत्रिक verify स्क्रिप्ट और साझा sanitize/pricing/judge शुद्ध
मॉड्यूल — एक ESM + TypeScript पैकेज में निकालता है।

## अनुकूलता (Compatibility)

- **DSH harness**: किट रनटाइम पर `@deepseek-ai/*` से कुछ भी import नहीं करता।
  `@deepseek-ai/cordis` (`^4.0.4`), `@deepseek-ai/schemastery` (`^3.18.4`) और
  `@deepseek-ai/dsh-*` पैकेज PerryLink प्लगइन रिपोज़ की साझा `>=0.1.2-rc.1 <0.2.0` बैंड में
  **वैकल्पिक** peer dependencies हैं; वे केवल टाइप इंटरऑप के लिए हैं।
  2026-09-11 को `dsh-v0.1.7-alpha.1` master checkout के विरुद्ध सत्यापित
  (पूर्ण गेट शृंखला + profile इंस्टॉल स्मोक), और 2026-09-23 को `dsh-v0.1.7-alpha.2`
  checkout के विरुद्ध पुनः सत्यापित।
- **Node**: `^22.19.0 || >=24.0.0`, केवल ESM।
- **वायर अनुकूलता**: नाम और आकृतियाँ `dsh-mask` (sanitize), `dsh-budget`
  (pricing) और `dsh-auto-review` (judge व `fallbackPolicy` शब्दावली) का दर्पण
  हैं, इसलिए माइग्रेशन यांत्रिक है।

## आपको क्या मिलता है (What you get)

- **शून्य रनटाइम निर्भरताएँ** — शुद्ध कोर (`seam`, `gates`, `shared`)
  ब्राउज़र-सुरक्षित है।
- **ESM + सख्त TypeScript** — हर मॉड्यूल पर JSDoc अनुबंध; `strict`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`।
- **Fail-closed और अनुकूली गेट** — अनुमोदन कभी डिफ़ॉल्ट से अनुदान नहीं देता;
  अज्ञात घटना प्रकार अस्वीकार करने वाले होस्ट पर सत्र-घटनाएँ सुंदरता से
  अपमानित होती हैं।
- **नया-प्लगइन कंकाल** — `template/` में `cordis.yml`, तीन-भूमिका वाला
  `src/index.ts` (Service Definition / Provider / Consumer), एक टेस्ट और साझा
  Renovate प्रीसेट।

## त्वरित शुरुआत (Quick start)

npm से:

```sh
pnpm add @perrylink/dsh-plugin-kit
```

git से (`prepare` स्क्रिप्ट केवल उत्पादन निर्भरताओं से `lib/` बनाती है):

```sh
pnpm add github:PerryLink/dsh-plugin-kit
```

हाथ से लिखी रजिस्ट्री एक चरण में बदलें:

```ts
import { ProviderRegistry } from '@perrylink/dsh-plugin-kit/seam'

const registry = new ProviderRegistry<Detector>({
  default: { name: 'regex', impl: new RegexDetector() },
})
ctx.effect(() => registry.register('ner', new NerDetector()))
const active = registry.use('ner') ?? registry.use()
```

## इंस्टॉल और अनइंस्टॉल (Install & uninstall)

इंस्टॉल `pnpm add` है (त्वरित शुरुआत देखें)। यह पैकेज जान-बूझकर खाली `dsh.bundle.patch` परत (`cordis.patch.yml`) भी लाता है, इसलिए जब कोई profile kit को पैकेज के रूप में माउंट करना चाहे तो यह harness के bundle चैनल से भी जाता है:

```sh
# npm चैनल (प्रकाशित रिलीज़)
dsh plugin --profile web add @perrylink/dsh-plugin-kit

# git चैनल (नवीनतम master)
dsh plugin --profile web add "github:PerryLink/dsh-plugin-kit#master"
```

हटाने के लिए:

```sh
pnpm remove @perrylink/dsh-plugin-kit
```

कुछ भी वैश्विक स्थिति पंजीकृत नहीं करता: अनइंस्टॉल इंस्टॉल का ठीक उल्टा है।

## कॉन्फ़िगरेशन (Configuration)

रनटाइम कॉन्फ़िगरेशन नहीं है: गेट और सहायक शुद्ध फ़ंक्शन हैं। एकमात्र
कॉन्फ़िगरेशन सतह `cordis.patch.yml` है — harness प्रोफ़ाइल संयोजन के लिए
वितरित bundle-patch परत; यह कोई प्लगइन पंक्ति नहीं जोड़ती (किट एक लाइब्रेरी
है) और बताती है कि उपभोक्ता प्लगइन अपनी पंक्तियाँ कैसे जोड़ें।

## उपकरण और सतहें (Tools & surfaces)

| उपपथ | उद्देश्य |
|---|---|
| `seam` | `ProviderRegistry<T>` — प्रतिवर्ती, नामित provider रजिस्ट्री जो ज़ोर से विफल होती है। |
| `gates` | `applyFailClosed`; `makeEventGate` / `maybeAppendSessionEvent` / `probeIgnorableAppend`। |
| `shared` | `sanitize` (`Stripper`, `redactText`, `redactMapping`, `sanitizeText`, `sanitizeUrl`), `pricing` (`BUILTIN_PRICES`, `estimateUsageCost`, `tokenCarbon`, `latencyStats`, `formatMoney`, `formatTokens`), `judge` (`parseVerdict`, `VERDICT_SCHEMA`, `riskExceeds`)। |
| `verify` | यांत्रिक CI गेट (`verify-license`, `verify-readme-languages`, `verify-seam`) `VerifyReport` और गैर-शून्य निकास CLI के साथ: `node lib/verify/cli.js all .` |
| `template/` | नए प्लगइन का कंकाल (`cordis.yml`, तीन-भूमिका प्लगइन, टेस्ट, README, `renovate.json5`)। |
| मूल barrel | उपरोक्त सब पुनः निर्यात करता है। |

## अनुमतियाँ और डेटा (Permissions & data)

किट स्वयं कोई I/O, नेटवर्क एक्सेस या सबप्रोसेस नहीं करता। `Stripper`
placeholder→original मैपिंग केवल मेमोरी में रखता है, और
`stats()`/`redactMapping()` कभी प्लेनटेक्स्ट नहीं देते; मैपिंग को स्थायी करने
वाला उपभोक्ता उस निर्णय और उसकी स्टोरेज अनुमतियों का स्वामी है।

## सुरक्षा सीमाएँ (Security boundaries)

- `sanitize`/`redact*` **प्रदर्शन स्वच्छता** हैं, सुरक्षा सीमा नहीं: वे लॉग और
  परिणामों में रिसाव घटाते हैं, प्रमाणित या अधिकृत नहीं करते।
- अनुमोदन गेट डिफ़ॉल्ट से fail closed हैं (`rejected`); अनुदान का एकमात्र रास्ता
  स्पष्ट `allow-once` विकल्प है।
- होस्ट द्वारा अस्वीकृत सत्र-घटनाएँ छोड़ दी जाती हैं, कभी ऐसे पुनर्प्रयास नहीं
  किए जाते जो सत्र रिज़्यूम तोड़ सकें।
- कमज़ोरियाँ GitHub Security Advisories से रिपोर्ट करें — `SECURITY.md` देखें।

## ज्ञात सीमाएँ (Known limitations)

- जिन होस्ट का `Session.append` तीसरा तर्क `SurfaceIntent` है
  (`0.1.2-rc.1`), वे ignorable-लिफ़ाफ़ा जाँच पर `validateNext` फेंकते हैं;
  गेट अज्ञात-छोड़ने में अपमानित होता है, इसलिए ऐसे होस्ट पर ऑडिट घटनाएँ लिखे
  जाने के बजाय छोड़ दी जाती हैं (fail closed)।
- 0.1.2-rc.1 (2026-09-02 को अनुकूलित): सत्र लिफ़ाफ़ा अपना ignorable फ़ील्ड केवल संग्रहीत-लॉग पठन संगतता के लिए रखता है - Session.append अभी भी इसे स्टैम्प नहीं कर सकता, इसलिए गेट व्यवहार अपरिवर्तित है।
- किट में ब्राउज़र UI आधा नहीं है: यह एक लाइब्रेरी है जिसे अन्य प्लगइन के Host
  (और वैकल्पिक Client) आधे उपभोग करते हैं।

## विकास (Development)

```sh
pnpm install
pnpm run typecheck        # tsc --noEmit
pnpm run typecheck:ci     # CI चेहरा: tsc -p tsconfig.ci.json --noEmit
pnpm test                 # vitest यूनिट टेस्ट
pnpm run build            # lib/ व घोषणाएँ उत्सर्जित करता है (prepare भी)
pnpm run verify:self-contained
pnpm run verify:artifacts
```

## विषय (Topics)

यह रिपॉज़िटरी 33 प्लगइन रिपोज़ का रखरखाव केंद्र भी है:
`scripts/sync-peer-range.mjs` एक कमांड में सभी रिपोज़ की साझा peer बैंड फिर से
पिन करता है, `renovate/default.json5` वह साझा Renovate प्रीसेट है जिसे हर
रिपो विस्तारित करता है, `.github/workflows/npm-publish.yml` एक पुन: प्रयोज्य
tag-ट्रिगर प्रकाशन वर्कफ़्लो है (केवल एक `NPM_TOKEN` सीक्रेट चाहिए), और
`data/repos.json` पोर्टल द्वारा उपभोग की जाने वाली इकोसिस्टम रजिस्ट्री है।
[docs/ecosystem-tooling.md](docs/ecosystem-tooling.md) देखें।

कीवर्ड: dsh, dsh-plugin, deepseek-harness, deepseek, cordis, perrylink,
provider, seam, approval, sanitize, pricing, judge।

## योगदानकर्ता (Contributors)

[PerryLink](https://github.com/PerryLink) द्वारा अनुरक्षित, DSH प्लगइन
इकोसिस्टम के योगदान के साथ।

## लाइसेंस (License)

Apache-2.0 — [LICENSE](LICENSE) देखें।

## PerryLink DSH Plugin Family

This project is one of the **45 DeepSeek Harness plugins** maintained by [PerryLink](https://github.com/PerryLink). If this one helps you, the others likely will too:

| Plugin | One-liner |
|---|---|
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default | |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command | |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | |
| **[dsh-catalog](https://github.com/PerryLink/dsh-catalog)** | DSH Desktop Market standard catalog source for the PerryLink family | |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence | |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore | |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. | |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search | |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) | |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review | |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. | |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds | |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval | |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` | |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools | |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. | |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. | |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers | |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer | |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors | |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool | |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. | |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching | |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit | |
| **[dsh-plugin-certification](https://github.com/PerryLink/dsh-plugin-certification)** | Community certification registry with repro-checkable grades and badges | |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins | |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill | |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins | |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card | |
| **[dsh-plugin-upgrade-015](https://github.com/PerryLink/dsh-plugin-upgrade-015)** | Merged `0.1.3-alpha.1` → `0.1.5-rc.1` upgrade corridor card plus a zero-dependency seam scanner | |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions | |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. | |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. | |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review | |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. | |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. | |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools | |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. | |

