# @perrylink/dsh-plugin-kit

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add @perrylink/dsh-plugin-kit
```


PerryLink DSH प्लगइन रिपॉज़िटरीज़ के लिए साझा **शून्य-रनटाइम-निर्भरता** टूलकिट। प्रति-प्रोजेक्ट ऑडिट में पाया गया कि 20+ प्लगइन एक ही Provider seam हाथ से लिखते हैं और एक जैसी sanitize/pricing/निर्णय आकृतियाँ दोहराते हैं, इसलिए यह पैकेज वह सब — प्लगेबल Provider seam, fail-closed अनुमोदन और अनुकूली सत्र-घटना गेट, यांत्रिक verify स्क्रिप्ट और साझा sanitize/pricing/judge शुद्ध मॉड्यूल — एक ESM + TypeScript पैकेज में निकालता है।

> **पैकेज नाम।** यह प्रोजेक्ट npm पर **`@perrylink/dsh-plugin-kit`** के रूप में प्रकाशित होता है। सादा नाम `dsh-plugin-kit` किसी असंबंधित प्रोजेक्ट का है — उसे इंस्टॉल करने से यह पैकेज इंस्टॉल नहीं होता।

- **1024 स्टोर चैनल**: पहले `npm i -g dsh1024`, फिर `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` ([deepseek1024.com](https://deepseek1024.com) इंस्टॉल रैंकिंग में गिना जाता है)।

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-listed-en.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-plugin-kit)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-plugin-kit/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-plugin-kit/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-plugin-kit?label=version)](https://github.com/PerryLink/dsh-plugin-kit/releases)
[![npm downloads](https://img.shields.io/npm/dm/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-plugin-kit?metric=downloads&lang=hi)](https://dshfind.com/hi/plugins/PerryLink/dsh-plugin-kit?ref=badge)

[English](README.md) | [简体中文](README-zh.md) | [Español](README-es.md) | [Português](README-pt.md) | **हिन्दी**

PerryLink DSH प्लगइन रिपॉज़िटरीज़ के लिए साझा **शून्य-रनटाइम-निर्भरता** टूलकिट।
प्रति-प्रोजेक्ट ऑडिट में पाया गया कि 20+ प्लगइन एक ही Provider seam
हाथ से लिखते हैं और एक जैसी sanitize/pricing/निर्णय आकृतियाँ दोहराते हैं, इसलिए
यह पैकेज वह सब — प्लगेबल Provider seam, fail-closed अनुमोदन और अनुकूली
सत्र-घटना गेट, यांत्रिक verify स्क्रिप्ट और साझा sanitize/pricing/judge शुद्ध
मॉड्यूल — एक ESM + TypeScript पैकेज में निकालता है।

## इंस्टॉल और अनइंस्टॉल (Install & uninstall)

इंस्टॉल `pnpm add` है (त्वरित शुरुआत देखें)। यह पैकेज जान-बूझकर खाली `dsh.bundle.patch` परत (`cordis.patch.yml`) भी लाता है, इसलिए जब कोई profile kit को पैकेज के रूप में माउंट करना चाहे तो यह harness के bundle चैनल से भी जाता है:

```sh
# npm चैनल (प्रकाशित रिलीज़)
dsh plugin --profile web add @perrylink/dsh-plugin-kit

# git चैनल (नवीनतम master)
dsh plugin --profile web add github:PerryLink/dsh-plugin-kit
```

हटाने के लिए:

```sh
pnpm remove @perrylink/dsh-plugin-kit
```

कुछ भी वैश्विक स्थिति पंजीकृत नहीं करता: अनइंस्टॉल इंस्टॉल का ठीक उल्टा है।

## What is dsh-plugin-kit?

PerryLink DSH प्लगइन रिपॉज़िटरीज़ के लिए साझा **शून्य-रनटाइम-निर्भरता** टूलकिट। प्रति-प्रोजेक्ट ऑडिट में पाया गया कि 20+ प्लगइन एक ही Provider seam हाथ से लिखते हैं और एक जैसी sanitize/pricing/निर्णय आकृतियाँ दोहराते हैं, इसलिए यह पैकेज वह सब — प्लगेबल Provider seam, fail-closed अनुमोदन और अनुकूली सत्र-घटना गेट, यांत्रिक verify स्क्रिप्ट और साझा sanitize/pricing/judge शुद्ध मॉड्यूल — एक ESM + TypeScript पैकेज में निकालता है।

![dsh-plugin-kit का टर्मिनल डेमो: dsh-plugin-kit — the Provider seam, plus the three verify gates](https://raw.githubusercontent.com/PerryLink/dsh-plugin-kit/main/docs/assets/dsh-plugin-kit-hero.png)

![Animated terminal demo of dsh-plugin-kit](https://raw.githubusercontent.com/PerryLink/dsh-plugin-kit/main/docs/assets/dsh-plugin-kit-demo.gif)

*वही रन, एनिमेटेड।*

## अनुकूलता (Compatibility)

- **DSH harness**: किट रनटाइम पर `@deepseek-ai/*` से कुछ भी import नहीं करता।
  `@deepseek-ai/cordis` (`^4.0.5-alpha.1`), `@deepseek-ai/schemastery` (`^3.18.5-alpha.1`) और
  `@deepseek-ai/dsh-*` पैकेज PerryLink प्लगइन रिपोज़ की साझा `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0 || >=0.1.6-0 <0.2.0 || >=0.1.7-0 <0.2.0 || >=0.2.0-0 <0.3.0 || >=0.2.1-0 <0.3.0` बैंड में
  **वैकल्पिक** peer dependencies हैं; वे केवल टाइप इंटरऑप के लिए हैं।
  2026-09-11 को `dsh-v0.1.7-alpha.1` master checkout के विरुद्ध सत्यापित
  (पूर्ण गेट शृंखला + profile इंस्टॉल स्मोक), और 2026-10-05 को `dsh-v0.2.1-alpha.1`
  checkout के विरुद्ध पुनः सत्यापित (पूर्ण गेट शृंखला + profile इंस्टॉल स्मोक)।
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

```sh
dsh plugin --profile web add github:PerryLink/dsh-plugin-kit
```

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

यह रिपॉज़िटरी पूरे इकोसिस्टम का रखरखाव केंद्र भी है:
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

यह प्रोजेक्ट [PerryLink](https://github.com/PerryLink) के **87 सक्रिय रूप से अनुरक्षित** DeepSeek Harness प्लगइन में से एक है। पूरा परिवार **95** प्लगइन है — **5 फ़्रोज़न**, **3 सेवानिवृत्त** — और नीचे संक्षिप्त रखा गया है ताकि हर README की पहली स्क्रीन छोटी रहे। हर पंक्ति देखने के लिए इसे खोलें; कारण स्थिति कॉलम में है।

<details>
<summary>सभी 95 प्लगइन खोलें</summary>

| प्लगइन | एक पंक्ति | स्थिति |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>