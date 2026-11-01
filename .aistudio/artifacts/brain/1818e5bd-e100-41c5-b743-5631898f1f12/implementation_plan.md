# Architecture Audit & Implementation Plan: Unifying Arabic Typing Game (Preview & Android APK)

## Executive Summary
This document provides a comprehensive technical audit of why the **AI Studio Preview** displays the new **Arabic Endless Typing Game**, while the **Android APK** produced by GitHub Actions installs the legacy Kotlin Compose app. It outlines the safest, zero-loss architectural plan to ensure the Android APK runs the **exact same Arabic Typing Game** seen in Preview, running 100% offline, with preserved custom Gboard keyboard, hidden progression tiers, and persistent local storage.

---

## 1. Current Architecture (বর্তমান আর্কিটেকচার)

বর্তমানে এই রিপোজিটরিতে দুটি সমান্তরাল (Dual-Stack) এবং পরস্পর সম্পূর্ণ সংযোগহীন কোডবেস বিদ্যমান:

```
                          ┌────────────────────────────────────────────────────────┐
                          │               Repository Root                          │
                          └──────────────────────┬─────────────────────────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   ▼                                                           ▼
    ┌─────────────────────────────┐                             ┌─────────────────────────────┐
    │   Web Stack (Vite + React)  │                             │   Native Android (Kotlin)   │
    │   Directory: /src, /        │                             │   Directory: /app           │
    ├─────────────────────────────┤                             ├─────────────────────────────┤
    │ • src/App.tsx               │                             │ • app/src/main/java/...     │
    │ • src/progressionLogic.ts   │                             │ • MainActivity.kt           │
    │ • package.json, vite.config │                             │ • AppNavHost.kt             │
    │ • index.html, index.css     │                             │ • Compose Screens & Room DB │
    └──────────────┬──────────────┘                             └──────────────┬──────────────┘
                   │ (npm run dev)                                             │ (gradle assembleDebug)
                   ▼                                                           ▼
    ┌─────────────────────────────┐                             ┌─────────────────────────────┐
    │      AI Studio Preview      │                             │      GitHub Actions APK     │
    │ (Endless Arabic Typing Game)│                             │   (Old Lesson/Stage App)    │
    └─────────────────────────────┘                             └─────────────────────────────┘
```

1. **Web Stack (`/src`)**:
   - **ফ্রেমওয়ার্ক**: React 19 + TypeScript + Vite + Tailwind CSS v4।
   - **প্রধান কোড**: `src/App.tsx` (Endless Typing Game লজিক, Gboard আরবি কিবোর্ড, অ্যানিমেশন, অডিও সিন্থেসাইজার) এবং `src/progressionLogic.ts` (৭টি টিয়ারের প্রগ্রেসন ও ২০ বার হিট কাউন্ট লজিক)।
   - **রানটাইম**: AI Studio Preview এটি Port 3000-এ সরাসরি লোড করে প্রদর্শন করছে।

2. **Native Android Stack (`/app`)**:
   - **ফ্রেমওয়ার্ক**: Android SDK 35 + Kotlin 2.0.21 + Jetpack Compose BOM + Room DB + DataStore।
   - **প্রধান কোড**: `app/src/main/java/com/arabictyping/app/MainActivity.kt` এবং `AppNavHost.kt` (HomeScreen, StageOverviewScreen, ModeSelectionScreen, ExerciseScreen, ReportScreen)।
   - **বিল্ড রানটাইম**: GitHub Actions `.github/workflows/android-build.yml` সরাসরি Gradle (`gradle assembleDebug`) চালিয়ে শুধু `:app` মডিউল বিল্ড করে।

---

## 2. কেন Preview এবং APK আলাদা app দেখাচ্ছে (Root Cause Analysis)

- **বিচ্ছিন্ন বিল্ড পাইপলাইন (Disconnected Build Pipelines)**:
  - যখন AI Studio-তে নতুন Endless Typing Game তৈরি করা হয়েছিল, তখন তা React/TypeScript (`src/App.tsx`) হিসেবে ইমপ্লিমেন্ট করা হয় যাতে ব্যবহারকারী AI Studio Preview-তে সরাসরি গেমটি খেলতে পারেন।
  - কিন্তু `.github/workflows/android-build.yml`-এ Gradle কেবল `app/` ফোল্ডারের পুরোনো Kotlin Jetpack Compose ফাইলগুলো কম্পাইল করছিল।
  - GitHub Actions বিল্ড স্ক্রিপ্টে `npm run build` বা React বিল্ডের কোনো ধাপ ছিল না, এবং Android `MainActivity.kt`-তেও React গেমটিকে লোড করার কোনো ব্যবস্থা ছিল না।
  - ফলে GitHub Actions দ্বারা তৈরি `app-debug.apk` ফাইলে কেবল পুরোনো ৫-স্ক্রিনের লার্নিং অ্যাপটি কম্পাইল হয়ে ইনস্টল হচ্ছিল।

---

## 3. কোন কোন files বর্তমানে Preview control করছে

| ফাইল | ভূমিকা ও বিষয়বস্তু |
| :--- | :--- |
| `src/App.tsx` | সম্পূর্ণ Endless Game স্টেট মেশিন (`START`, `PLAYING`, `GAME_OVER`), রানিং টেক্সট মুভমেন্ট, Google Gboard আরবি কিবোর্ড লেআউট, টাইপিং ডিটেকশন, সাউন্ড ও স্কোর। |
| `src/progressionLogic.ts` | ৭টি ধাপে প্রগ্রেসন লজিক, প্রতি অক্ষরে ২০ বার হিট নিশ্চিতকরণ এবং শব্দ/বাক্যের ডাটাবেজ। |
| `src/main.tsx` | React DOM রুট মাউন্টিং। |
| `src/index.css` | Tailwind CSS v4 স্টাইল এবং গ্লোবাল লেআউট। |
| `index.html` | ওয়েব এন্ট্রি পয়েন্ট এবং ভিউপোর্ট কনফিগারেশন। |
| `vite.config.ts` | Vite সার্ভার ও বান্ডলার কনফিগারেশন। |
| `package.json` | ডিপেন্ডেন্সি এবং `npm run dev`/`build` স্ক্রিপ্ট। |

---

## 4. কোন কোন files বর্তমানে APK control করছে

| ফাইল | ভূমিকা ও বিষয়বস্তু |
| :--- | :--- |
| `.github/workflows/android-build.yml` | GitHub Actions ক্লাউড রানারে Android SDK 35 ও Gradle 8.11.1 দিয়ে APK বিল্ড ও আপলোড করে। |
| `app/build.gradle.kts` | Android অ্যাপ মডিউল কনফিগারেশন, SDK ভার্সন, Compose ও Room লাইব্রেরি। |
| `build.gradle.kts` & `settings.gradle.kts` | Gradle রুট এবং ডিপেন্ডেন্সি রেজোলিউশন। |
| `app/src/main/AndroidManifest.xml` | অ্যাপ প্যাকেজ (`com.arabictyping.app`), অ্যাক্টিভিটি ঘোষণা ও স্ক্রিন অরিয়েন্টেশন। |
| `app/src/main/java/com/arabictyping/app/MainActivity.kt` | নেটিভ অ্যাক্টিভিটি যা Compose `AppNavHost` কে স্ক্রিনে দেখায়। |
| `app/src/main/java/com/arabictyping/app/ui/navigation/AppNavHost.kt` | পুরোনো ৫টি স্ক্রিনের নেভিগেশন গ্রাফ। |
| `app/src/main/java/com/arabictyping/app/ui/screens/*` | পুরোনো HomeScreen, ExerciseScreen, ReportScreen ইত্যাদি। |

---

## 5. Recommended Architecture (প্রস্তাবিত আর্কিটেকচার)

### "Single Source of Truth: Offline Local Asset WebView Packaging"

সবচেয়ে নির্ভরযোগ্য এবং সুরক্ষিত আর্কিটেকচার হলো:
**AI Studio Preview-র React/TypeScript কোডবেসটিকেই মূল অ্যাপ্লিকেশন (Single Source of Truth) হিসেবে রাখা এবং Vite বিল্ডের মাধ্যমে লোকাল অ্যাসেট হিসেবে Android APK-র ভেতরে প্যাকেজ করে একটি অপ্টিমাইজড অফলাইন Android WebView-তে প্রদর্শন করা।**

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        AI Studio Preview & Development Source                          │
│                              src/App.tsx & progressionLogic.ts                         │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
         ┌─────────────────────────────┐       ┌─────────────────────────────┐
         │   Vite Dev Server (:3000)   │       │      Vite Build (npm build) │
         ├─────────────────────────────┤       ├─────────────────────────────┤
         │     AI Studio Preview       │       │    Static Assets in dist/   │
         │   (তাৎক্ষণিক টেস্টিং ও প্লে)  │       │ (index.html, JS, CSS bundle)│
         └─────────────────────────────┘       └──────────────┬──────────────┘
                                                              │ Copy to assets
                                                              ▼
                                               ┌─────────────────────────────┐
                                               │    app/src/main/assets/     │
                                               └──────────────┬──────────────┘
                                                              │
                                                              ▼
                                               ┌─────────────────────────────┐
                                               │     Android Native Shell    │
                                               │ (MainActivity.kt + WebView) │
                                               ├─────────────────────────────┤
                                               │ • 100% Offline (No Internet)│
                                               │ • LocalStorage Persistence  │
                                               │ • Hardware Accelerated      │
                                               │ • Custom Gboard Touch-ready │
                                               └──────────────┬──────────────┘
                                                              │ Gradle assembleDebug
                                                              ▼
                                               ┌─────────────────────────────┐
                                               │      Final Android APK      │
                                               │ (Preview-র হুবহু সেইম গেম)  │
                                               └─────────────────────────────┘
```

---

## 6. কেন এই architecture সবচেয়ে নিরাপদ ও শ্রেষ্ঠ?

1. **শূন্য অমিল (Zero Drift Guarantee)**: আপনি AI Studio Preview-তে যা দেখছেন, ঠিক সেই কোডটিই কম্পাইল হয়ে APK-তে যাবে। কোনো ফন্ট, অ্যানিমেশন টাইমলাইন বা কিবোর্ড লেআউটের পার্থক্য হবে না।
2. **ডাবল মেইনটেন্যান্স থেকে মুক্তি**: যদি একই গেম Kotlin Compose-এ নতুন করে লিখতে হতো, তবে ভবিষ্যতে কোনো একটি লেটার বা স্পিড পরিবর্তন করতে চাইলে React এবং Kotlin দুটোতেই আলাদা করে কোড লিখতে হতো এবং দুটোর মধ্যে সবসময় অমিল থাকার ঝুঁকি তৈরি হতো।
3. **১০০% অফলাইন নিশ্চয়তা**: সমস্ত JS, CSS এবং ফন্ট APK ফাইলের ভেতরের `assets/` ফোল্ডারে এমবেড থাকবে। কোনো ইন্টারনেটের প্রয়োজন নেই (`INTERNET` permission ছাড়াও চলে)।
4. **কোনো পুরোনো কোড বা ডকুমেন্ট ডিলিট হবে না**: পুরোনো Compose ফাইলগুলো এবং `public/assets/aistudio/`-এর ৬টি অনুমোদিত ডকুমেন্ট অক্ষত থাকবে।
5. **স্থায়িত্ব ও প্রগ্রেসন প্রিজার্ভেশন**: Android WebView-তে `domStorageEnabled = true` থাকায় গেমের ২০-হিট কাউন্ট এবং প্রগ্রেসন ডেটা ডিভাইসের ইন্টারনাল স্টোরেজে চিরস্থায়ীভাবে সংরক্ষিত থাকবে।

---

## 7. Exact files that would need modification (যে ফাইলগুলো পরিবর্তন করতে হবে)

আপনার অনুমতির পর শুধুমাত্র নিচের ৪টি ফাইলে সুনির্দিষ্ট সমন্বয় করা হবে:

1. **`vite.config.ts`**:
   - `base: './'` যোগ করা হবে, যাতে বিল্ড করা অ্যাসেটগুলো `file:///` বা লোকাল অ্যান্ড্রয়েড অ্যাসেট রিলেটিভ পাথে সঠিকভাবে লোড হতে পারে।
2. **`package.json`**:
   - বিল্ড স্ক্রিপ্ট নিরাপদ রাখা এবং অ্যান্ড্রয়েড অ্যাসেটে কপি করার কমান্ড সংযোজন (`npm run build`).
3. **`app/src/main/java/com/arabictyping/app/MainActivity.kt`**:
   - Compose NavHost-এর পরিবর্তে একটি ফুল-স্ক্রিন, নো-স্ক্রোল, অপ্টিমাইজড `WebView` কনফিগার করা হবে যা সরাসরি লোকাল অ্যাসেট `file:///android_asset/index.html` লোড করবে।
   - সেটিংস: `javaScriptEnabled = true`, `domStorageEnabled = true`, `allowFileAccess = true`, নো ভার্টিক্যাল স্ক্রোলবার।
4. **`.github/workflows/android-build.yml`**:
   - Gradle বিল্ডের পূর্বে Node.js সেটআপ (`actions/setup-node@v4`), `npm ci` এবং `npm run build` যোগ করা হবে।
   - বিল্ড হওয়া `dist/` ফোল্ডারটিকে `app/src/main/assets/` ডিরেক্টরিতে কপি করে তারপর `gradle assembleDebug` রান করা হবে।

---

## 8. Exact files that should NOT be modified or deleted (যা স্পর্শ করা হবে না)

- **অনুমোদিত ৬টি Vault ডকুমেন্ট**:
  1. `public/assets/aistudio/01._PRD_d2e34e8c.md`
  2. `public/assets/aistudio/02._STATE_7ab5313f.md`
  3. `public/assets/aistudio/03._TOKENS_169cf0a4.md`
  4. `public/assets/aistudio/04._STACK_73914ed3.md`
  5. `public/assets/aistudio/05._SCHEMA_2c8f3469.md`
  6. `public/assets/aistudio/06._PLAN_a99c064b.md`
- **ইউজার পাঠানো স্ক্রিনশট রেফারেন্স**: `public/assets/aistudio/Screenshot_20261101_205229_a74345bb.jpg`
- **গেমের মূল লজিক ফাইল**: `src/App.tsx` ও `src/progressionLogic.ts` (এদের কোনো ফাংশনালিটি বাদ দেওয়া হবে না)।
- **বিদ্যমান Kotlin Compose আর্কিটেকচার ফাইল**: `AppNavHost.kt`, `HomeScreen.kt`, Room Database ক্লাসরুম ফাইলগুলো কোনোটি ডিলিট করা হবে না।

---

## 9. Required package/dependency changes

- **Node / Web Dependencies**: কোনো অতিরিক্ত প্যাকেজের প্রয়োজন নেই। বিদ্যমান React 19, Tailwind CSS এবং Motion যথেষ্ট।
- **Android Gradle Dependencies**: কোনো এক্সটারনাল হেভি লাইব্রেরির প্রয়োজন নেই; Android-এর বিল্ট-ইন `android.webkit.WebView` সরাসরি ব্যবহার করা হবে। (ঐচ্ছিকভাবে আধুনিক অ্যাসেট হ্যান্ডলিংয়ের জন্য `androidx.webkit:webkit` ব্যবহার করা যেতে পারে)।

---

## 10. GitHub Actions Workflow Changes

`.github/workflows/android-build.yml` ফাইলে নিচের ধাপগুলো অন্তর্ভুক্ত হবে:

```yaml
# ১. কোড চেকআউট
- name: Checkout Code
  uses: actions/checkout@v4

# ২. Node.js ও Web Build (নতুন ধাপ)
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'

- name: Install Dependencies and Build Web App
  run: |
    npm ci
    npm run build

- name: Bundle Web Assets into Android App
  run: |
    mkdir -p app/src/main/assets
    cp -r dist/* app/src/main/assets/

# ৩. বিদ্যমান JDK, Android SDK ও Gradle বিল্ড (অপরিবর্তিত)
- name: Set up JDK 17
  uses: actions/setup-java@v4
  with:
    java-version: '17'
    distribution: 'temurin'

- name: Set up Android SDK
  uses: android-actions/setup-android@v4

- name: Install Android SDK Packages
  run: |
    sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"

- name: Setup Gradle 8.11.1
  uses: gradle/actions/setup-gradle@v4
  with:
    gradle-version: '8.11.1'

- name: Build Debug APK with Gradle
  run: gradle assembleDebug --stacktrace

- name: Upload Debug APK Artifact
  uses: actions/upload-artifact@v4
  with:
    name: arabic-typing-app-debug-apk
    path: app/build/outputs/apk/debug/app-debug.apk
```

---

## 11. Offline & Persistence Considerations (অফলাইন ও ডাটা সংরক্ষণ)

- **Zero Network Requirement**: অ্যাসেটগুলো `file:///android_asset/` থেকে তাৎক্ষণিকভাবে র‍্যামে লোড হয়। ডিভাইসে ওয়াইফাই বা মোবাইল ডাটা বন্ধ থাকলেও গেমটি নিরবচ্ছিন্নভাবে চলবে।
- **প্রগ্রেসন স্থায়িত্ব (Persistence)**:
  - WebView-তে `settings.domStorageEnabled = true` কনফিগার করার মাধ্যমে ব্রাউজারের `window.localStorage` সরাসরি Android ডিভাইসের প্রাইভেট অ্যাপ ডিরেক্টরিতে সেভ হয়।
  - ব্যবহারকারী প্রতি অক্ষরে ২০ বার হিট করার যে প্রগ্রেস অর্জন করবেন, অ্যাপটি বন্ধ করে পুনরায় চালু করলেও তা পুরোপুরি সুরক্ষিত থাকবে।

---

## 12. Arabic Keyboard & Input Considerations (কিবোর্ড নিয়ন্ত্রণ)

- স্ক্রিনের নিচের অংশে থাকা কাস্টম Google Gboard আরবি কিবোর্ডটি ওয়েব ইন্টারফেসে সার্বক্ষণিক দৃশ্যমান (`h-[40vh]` বা ফিক্সড বটম প্যানেল)।
- Android সিস্টেমের ডিফল্ট সফট কিবোর্ড যেন অনাকাঙ্ক্ষিতভাবে পপ-আপ না হয়, সেজন্য কোনো হাইড করা `<input>` রাখা হবে না। সমস্ত ক্লিক ও টাচ সরাসরি কাস্টম কিবোর্ড কী-গুলোর মাধ্যমে সরাসরি স্টেট মেশিনে ট্রিগার হবে।
- টাচ রেসপন্স যাতে ল্যাগমুক্ত থাকে, সেজন্য CSS `touch-action: manipulation` এবং অন-টাচ ইনস্ট্যান্ট ইভেন্ট হ্যান্ডলার সক্রিয় থাকবে।

---

## 13. Animation & Performance Considerations

- **Hardware Acceleration**: `AndroidManifest.xml`-এ `android:hardwareAccelerated="true"` নিশ্চিত থাকবে।
- **Smooth 60 FPS**: অক্ষরের ডান থেকে বামে মুভমেন্ট `requestAnimationFrame` দিয়ে চালিত হওয়ায় কোনো ফ্রেম ড্রপ বা মাইক্রো-স্টাটারিং হবে না।
- **Web Audio API**: টাইপিং ক্লিক ও মিস-টাইপ সাউন্ড অ্যান্ড্রয়েড ওয়েবভিউ অডিও ইঞ্জিন দ্বারা অফলাইনে কোনো বাহ্যিক অডিও ফাইল ডাউনলোড ছাড়াই سنتেসাইজড হবে।

---

## 14. Testing Plan (টেস্টিং পরিকল্পনা)

1. **Local Vite Build Test**: `npm run build` চালিয়ে নিশ্চিত করা যে `dist/` ফোল্ডারে `index.html` ও সংশ্লিষ্ট অ্যাসেট তৈরি হচ্ছে কোনো বিল্ড এরর ছাড়াই।
2. **Android Asset Linkage Test**: `dist/` কনটেন্ট `app/src/main/assets/` ডিরেক্টরিতে সঠিকভাবে প্লেস হচ্ছে কি না যাচাই।
3. **TypeScript & Linter Check**: `compile_applet` চালিয়ে সব কোডের সিনট্যাক্স ও কম্পাইলেশন যাচাই।

---

## 15. APK Verification Plan

1. GitHub Actions রান সম্পন্ন হলে `app-debug.apk` আর্টিফ্যাক্ট আনপ্যাক করে তার ভেতরে `assets/index.html` উপস্থিত থাকা নিশ্চিত করা।
2. ফোনে ইনস্টল করার পর:
   - অ্যাপ চালুর সাথে সাথে "Start Game" বাটন দেখা যাবে।
   - স্টার্ট বাটনে চাপ দিলে ডান দিক থেকে আরবি অক্ষর চলমান থাকবে।
   - নিচে সার্বক্ষণিক Google Gboard লেআউটের আরবি কিবোর্ড উপস্থিত থাকবে।
   - সঠিক অক্ষর চাপলে অক্ষর ফেটে যাবে এবং ভুল হলে রেড ফ্ল্যাশ করবে।
   - পুরোনো ৫-স্ক্রিনের কোনো ইন্টারফেস আসবে না।

---

## 16. Possible Risks & Mitigation (সম্ভাব্য ঝুঁকি ও সমাধান)

| ঝুঁকি | কারণ | প্রতিকার |
| :--- | :--- | :--- |
| হোয়াইট স্ক্রিন (Blank Screen) | অ্যাসেট পাথ `/assets/` (অ্যাবসলিউট) থাকলে লোকাল ফাইলে লোড হয় না | `vite.config.ts`-এ `base: './'` সেট করে রিলেটিভ পাথ নিশ্চিত করা। |
| লোকাল স্টোরেজ রিসেট হওয়া | WebView ডোম স্টোরেজ অফ থাকা | `settings.domStorageEnabled = true` এবং `settings.databaseEnabled = true` কনফিগার করা। |
| অডিও প্লেব্যাক ব্লক হওয়া | অ্যান্ড্রয়েড ওয়েবভিউ অটোপ্লে পলিসি | ইউজার "Start Game" বাটনে প্রেস করার সময় ইউজার জেসচারের মাধ্যমে অডিও কনটেক্সট রেজ্যুম করা। |

---

## 17. Rollback Plan (রোলব্যাক পরিকল্পনা)

- যেহেতু বিদ্যমান কোনো Kotlin ফাইল বা ডাটাবেজ ডিলিট করা হচ্ছে না, যেকোনো মুহূর্তে `MainActivity.kt`-তে এক লাইনে `AppNavHost` ফিরিয়ে দিলে পুরোনো Compose অ্যাপে ফিরে যাওয়া সম্ভব।
- Git হিস্ট্রি সম্পূর্ণ অক্ষত থাকবে।

---

## 18. Step-by-Step Implementation Order (বাস্তবায়নের ধাপ)

ব্যবহারকারীর অনুমোদনের পর নিচের ধাপে কাজগুলো সম্পন্ন করা হবে:
1. **Step 1**: `vite.config.ts`-এ `base: './'` কনফিগারেশন আপডেট।
2. **Step 2**: `package.json`-এ বিল্ড স্ক্রিপ্ট ভেরিফিকেশন।
3. **Step 3**: `app/src/main/java/com/arabictyping/app/MainActivity.kt`-তে অফলাইন WebView কনফিগারেশন যোগ।
4. **Step 4**: `.github/workflows/android-build.yml`-এ Node.js সেটআপ, Web Build এবং Asset কপি করার স্টেপ যুক্তকরণ।
5. **Step 5**: `compile_applet` রান করে নিশ্চিতকরণ।
6. **Step 6**: ব্যবহারকারীকে গিট পুশ ও অ্যাকশন রান সম্পর্কিত রিপোর্ট প্রদান।

---

## Section 7 Practical Checklist Summary

- [x] Full offline capability (No internet needed)
- [x] Local asset loading via `app/src/main/assets/`
- [x] Zero internet dependency (no external CDN or API)
- [x] No external server requirement
- [x] Arabic keyboard always visible at screen bottom
- [x] Custom Gboard key layout preserved 1:1
- [x] Full touch responsiveness with no virtual keyboard collision
- [x] Hidden progression system intact (20-hit letter verification before words)
- [x] Local storage / persistence intact for progress tracking
- [x] Sound/audio effects working via Web Audio
- [x] Zero regressions in current web preview
