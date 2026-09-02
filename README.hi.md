# @perrylink/dsh-plugin-kit
- **1024 स्टोर चैनल**: पहले `npm i -g dsh1024`, फिर `dsh1024 plugin --profile web add @perrylink/dsh-plugin-kit` ([deepseek1024.com](https://deepseek1024.com) इंस्टॉल रैंकिंग में गिना जाता है)।

[![npm version](https://img.shields.io/npm/v/@perrylink/dsh-plugin-kit)](https://www.npmjs.com/package/@perrylink/dsh-plugin-kit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

PerryLink DSH प्लगइन रिपॉज़िटरीज़ के लिए साझा **शून्य-रनटाइम-निर्भरता** टूलकिट।
प्रति-प्रोजेक्ट ऑडिट में पाया गया कि 33 में से 20+ प्लगइन एक ही Provider seam
हाथ से लिखते हैं और एक जैसी sanitize/pricing/निर्णय आकृतियाँ दोहराते हैं, इसलिए
यह पैकेज वह सब — प्लगेबल Provider seam, fail-closed अनुमोदन और अनुकूली
सत्र-घटना गेट, यांत्रिक verify स्क्रिप्ट और साझा sanitize/pricing/judge शुद्ध
मॉड्यूल — एक ESM + TypeScript पैकेज में निकालता है।

## अनुकूलता (Compatibility)

- **DSH harness**: किट रनटाइम पर `@deepseek-ai/*` से कुछ भी import नहीं करता।
  `@deepseek-ai/cordis` (`^4.0.2`), `@deepseek-ai/schemastery` (`^3.18.2`) और
  `@deepseek-ai/dsh-*` पैकेज 33 रिपोज़ की साझा `>=0.1.0-rc.8 <0.2.0` बैंड में
  **वैकल्पिक** peer dependencies हैं; वे केवल टाइप इंटरऑप के लिए हैं।
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

इंस्टॉल `pnpm add` है (त्वरित शुरुआत देखें)। हटाने के लिए:

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
  (`0.1.2-alpha.5`), वे ignorable-लिफ़ाफ़ा जाँच पर `validateNext` फेंकते हैं;
  गेट अज्ञात-छोड़ने में अपमानित होता है, इसलिए ऐसे होस्ट पर ऑडिट घटनाएँ लिखे
  जाने के बजाय छोड़ दी जाती हैं (fail closed)।
- 0.1.2-alpha.5 (2026-09-02 को अनुकूलित): सत्र लिफ़ाफ़ा अपना ignorable फ़ील्ड केवल संग्रहीत-लॉग पठन संगतता के लिए रखता है - Session.append अभी भी इसे स्टैम्प नहीं कर सकता, इसलिए गेट व्यवहार अपरिवर्तित है।
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
