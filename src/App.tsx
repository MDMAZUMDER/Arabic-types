/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FolderTree, 
  Layers, 
  Database, 
  Terminal, 
  CheckCircle2, 
  FileCode2, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Smartphone,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'structure' | 'architecture' | 'commands'>('overview');

  const androidFiles = [
    { category: 'Gradle & Build Configuration', files: [
      { path: 'settings.gradle.kts', desc: 'Plugin management, repositories & root project definition' },
      { path: 'build.gradle.kts', desc: 'Root buildscript with Kotlin 2.0 & AGP 8.7' },
      { path: 'gradle.properties', desc: 'AndroidX, JVM tuning, nonTransitiveRClass' },
      { path: 'gradle/libs.versions.toml', desc: 'Version catalog (Compose BOM, Room, DataStore, Navigation)' },
      { path: 'gradle/wrapper/gradle-wrapper.properties', desc: 'Gradle 8.11 wrapper configuration' },
      { path: 'app/build.gradle.kts', desc: 'Application module configuration & dependencies' },
      { path: 'app/proguard-rules.pro', desc: 'ProGuard / R8 keep rules for Room entities and models' },
      { path: '.github/workflows/android-build.yml', desc: 'GitHub Actions workflow to build and upload debug APK in the cloud' }
    ]},
    { category: 'Android Manifest & Resources', files: [
      { path: 'app/src/main/AndroidManifest.xml', desc: 'App declaration, RTL support, Launcher activity' },
      { path: 'app/src/main/res/values/strings.xml', desc: 'App and mode localized string resources' },
      { path: 'app/src/main/res/values/colors.xml', desc: 'Approved color tokens from 03._TOKENS.md' },
      { path: 'app/src/main/res/values/themes.xml', desc: 'Material 3 NoActionBar theme' }
    ]},
    { category: 'Domain Layer (Typing Engine & States)', files: [
      { path: 'app/src/main/java/com/arabictyping/app/domain/model/Mode.kt', desc: 'GUIDED, HINT, TEST learning modes' },
      { path: 'app/src/main/java/com/arabictyping/app/domain/model/StageType.kt', desc: '7 curriculum stage types' },
      { path: 'app/src/main/java/com/arabictyping/app/domain/model/ContentType.kt', desc: 'LETTER, COMBINATION, WORD, SENTENCE' },
      { path: 'app/src/main/java/com/arabictyping/app/domain/model/TypingState.kt', desc: 'State machine states from 02._STATE.md' },
      { path: 'app/src/main/java/com/arabictyping/app/domain/model/ReportData.kt', desc: 'Accuracy %, CPM, error metrics per SCHEMA.md' },
      { path: 'app/src/main/java/com/arabictyping/app/domain/engine/TypingEngine.kt', desc: 'Stateful typing engine, pointer, key highlight' }
    ]},
    { category: 'Data Layer (Room Database, DataStore & Repo)', files: [
      { path: 'app/src/main/java/com/arabictyping/app/data/local/entity/CurriculumStageEntity.kt', desc: 'Stage entity' },
      { path: 'app/src/main/java/com/arabictyping/app/data/local/entity/ExerciseEntity.kt', desc: 'Exercise entity with foreign key' },
      { path: 'app/src/main/java/com/arabictyping/app/data/local/entity/LearnerProgressEntity.kt', desc: 'Progress & mode unlock entity' },
      { path: 'app/src/main/java/com/arabictyping/app/data/local/entity/ExerciseAttemptEntity.kt', desc: 'Attempt history entity' },
      { path: 'app/src/main/java/com/arabictyping/app/data/local/entity/AttemptMistakeEntity.kt', desc: 'Mistake tracking entity' },
      { path: 'app/src/main/java/com/arabictyping/app/data/local/dao/CurriculumDao.kt', desc: 'Stage and exercise queries' },
      { path: 'app/src/main/java/com/arabictyping/app/data/local/dao/ProgressDao.kt', desc: 'Progress read/write queries' },
      { path: 'app/src/main/java/com/arabictyping/app/data/local/dao/AttemptDao.kt', desc: 'Attempt and mistake queries' },
      { path: 'app/src/main/java/com/arabictyping/app/data/local/ArabicTypingDatabase.kt', desc: 'Room database instance' },
      { path: 'app/src/main/java/com/arabictyping/app/data/local/preferences/UserPreferencesRepository.kt', desc: 'DataStore preferences' },
      { path: 'app/src/main/java/com/arabictyping/app/data/seed/CurriculumSeedData.kt', desc: 'Curriculum database seeds for 7 stages' },
      { path: 'app/src/main/java/com/arabictyping/app/data/repository/ArabicTypingRepository.kt', desc: 'Clean completion unlock logic' }
    ]},
    { category: 'UI Layer (Jetpack Compose & Material 3)', files: [
      { path: 'app/src/main/java/com/arabictyping/app/ui/theme/Color.kt', desc: 'Approved design tokens (#183B4E, #168C83, etc.)' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/theme/Type.kt', desc: 'Material 3 Typography configuration' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/theme/Theme.kt', desc: 'ArabicTypingTheme with status bar integration' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/keyboard/ArabicKeyboardLayout.kt', desc: 'Standard 4-row Arabic mobile layout' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/keyboard/KeyState.kt', desc: 'DEFAULT, HIGHLIGHTED, PRESSED, DISABLED' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/keyboard/ArabicKeyboard.kt', desc: 'Custom Compose in-app keyboard' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/navigation/Screen.kt', desc: 'Navigation Compose routes' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/navigation/AppNavHost.kt', desc: 'NavHost wiring all 5 screens' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/viewmodel/AppViewModel.kt', desc: 'AndroidViewModel managing UI state' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/screens/HomeScreen.kt', desc: 'Curriculum stages list & quick resume' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/screens/StageOverviewScreen.kt', desc: 'Exercises in selected stage' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/screens/ModeSelectionScreen.kt', desc: 'Guided, Hint, Test selection & locks' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/screens/ExerciseScreen.kt', desc: 'RTL practice area & keyboard interaction' },
      { path: 'app/src/main/java/com/arabictyping/app/ui/screens/ReportScreen.kt', desc: 'Speed (CPM), accuracy %, mistake list' },
      { path: 'app/src/main/java/com/arabictyping/app/ArabicTypingApplication.kt', desc: 'Application class' },
      { path: 'app/src/main/java/com/arabictyping/app/MainActivity.kt', desc: 'ComponentActivity setting Compose content' }
    ]}
  ];

  return (
    <div className="min-h-screen bg-[#F6F7F5] text-[#17252D] font-sans">
      {/* Top Header */}
      <header className="bg-[#183B4E] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#168C83] flex items-center justify-center font-bold text-xl text-white shadow-sm">
              ع
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">تعلم الطباعة العربية (Arabic Typing Learning)</h1>
              <p className="text-xs text-teal-200">Native Android Application • Kotlin & Jetpack Compose</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#122b39] px-3 py-1.5 rounded-full border border-teal-800 text-xs font-medium text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>All Approved Docs Intact</span>
          </div>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="bg-white border-b border-[#E2E8E7]">
        <div className="max-w-6xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-2 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#168C83] text-[#168C83]'
                : 'border-transparent text-[#64727A] hover:text-[#17252D]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Project Status & Features
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`py-3.5 px-2 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'structure'
                ? 'border-[#168C83] text-[#168C83]'
                : 'border-transparent text-[#64727A] hover:text-[#17252D]'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Android Project Tree ({androidFiles.reduce((acc, cat) => acc + cat.files.length, 0)} Files)
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3.5 px-2 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-[#168C83] text-[#168C83]'
                : 'border-transparent text-[#64727A] hover:text-[#17252D]'
            }`}
          >
            <Layers className="w-4 h-4" />
            MVVM Architecture & State Rules
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`py-3.5 px-2 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'commands'
                ? 'border-[#168C83] text-[#168C83]'
                : 'border-transparent text-[#64727A] hover:text-[#17252D]'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Build & Run Guide
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Highlight Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-emerald-900">
                  Native Android Project Generated Successfully
                </h2>
                <p className="text-sm text-emerald-800 mt-1 leading-relaxed">
                  The complete Kotlin + Jetpack Compose codebase has been generated in accordance with your specifications.
                  All 6 original project documents (<code className="px-1.5 py-0.5 bg-emerald-100 rounded">01._PRD</code>, <code className="px-1.5 py-0.5 bg-emerald-100 rounded">02._STATE</code>, <code className="px-1.5 py-0.5 bg-emerald-100 rounded">03._TOKENS</code>, <code className="px-1.5 py-0.5 bg-emerald-100 rounded">04._STACK</code>, <code className="px-1.5 py-0.5 bg-emerald-100 rounded">05._SCHEMA</code>, <code className="px-1.5 py-0.5 bg-emerald-100 rounded">06._PLAN</code>) remain 100% intact in <code className="px-1.5 py-0.5 bg-emerald-100 rounded">/public/assets/aistudio/</code>.
                </p>
              </div>
            </div>

            {/* Approved Features Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E2E8E7] shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#168C83] flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#17252D] text-base mb-2">Feature 1: Three Learning Modes</h3>
                <ul className="text-xs text-[#64727A] space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#168C83] font-bold">•</span>
                    <span><strong>Guided Mode:</strong> Highlights the required key in advance. Advances expected pointer on correct input only.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#168C83] font-bold">•</span>
                    <span><strong>Hint Mode:</strong> No initial highlight. Reveals the correct key as a hint only upon a mistake.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#168C83] font-bold">•</span>
                    <span><strong>Test Mode:</strong> No hints or highlights. Records full attempt speed & mistake accuracy.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E2E8E7] shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#17252D] text-base mb-2">Feature 2: 7-Stage Curriculum</h3>
                <ol className="text-xs text-[#64727A] space-y-1.5 list-decimal list-inside">
                  <li>Individual Arabic letters</li>
                  <li>Short combinations using learned letters</li>
                  <li>Small words (3-4 letters)</li>
                  <li>Medium words (5-6 letters)</li>
                  <li>Longer/difficult words</li>
                  <li>Short sentences</li>
                  <li>Longer sentences</li>
                </ol>
                <p className="text-[11px] text-teal-700 bg-teal-50 mt-3 p-2 rounded-lg font-medium">
                  Strict sequential unlock: Next stage unlocks only after clean (0 mistakes) completion.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E2E8E7] shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#17252D] text-base mb-2">Feature 3: Mistake & Speed Report</h3>
                <ul className="text-xs text-[#64727A] space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Total characters attempted & correct count</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Accuracy percentage: <code className="text-[10px] bg-slate-100 p-0.5 rounded">correct / total * 100</code></span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Characters Per Minute (CPM) speed calculation</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Most frequently mistyped Arabic keys</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* In-App Arabic Keyboard Specifications */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8E7] shadow-sm">
              <h3 className="text-base font-bold text-[#17252D] mb-3">Custom Compose Arabic Keyboard UI</h3>
              <p className="text-xs text-[#64727A] mb-4">
                Implemented in <code className="text-teal-700 font-mono">ArabicKeyboard.kt</code> without system IME dependencies. Features touch elevation, dynamic highlight states (<code className="text-slate-700">DEFAULT</code>, <code className="text-slate-700">HIGHLIGHTED</code>, <code className="text-slate-700">PRESSED</code>, <code className="text-slate-700">DISABLED</code>), error flashes, and RTL support.
              </p>
              <div className="bg-[#183B4E] p-4 rounded-xl text-center space-y-2">
                <div className="flex justify-center gap-1.5 flex-wrap">
                  {['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'].map(k => (
                    <span key={k} className="w-8 h-9 rounded bg-white text-[#17252D] font-bold text-sm flex items-center justify-center shadow">
                      {k}
                    </span>
                  ))}
                </div>
                <div className="flex justify-center gap-1.5 flex-wrap">
                  {['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'].map(k => (
                    <span key={k} className="w-8 h-9 rounded bg-white text-[#17252D] font-bold text-sm flex items-center justify-center shadow">
                      {k}
                    </span>
                  ))}
                </div>
                <div className="flex justify-center gap-1.5 flex-wrap">
                  {['ئ', 'ء', 'ؤ', 'ر', 'ى', 'ة', 'و', 'ز', 'ظ'].map(k => (
                    <span key={k} className="w-8 h-9 rounded bg-white text-[#17252D] font-bold text-sm flex items-center justify-center shadow">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8E7] shadow-sm">
              <h2 className="text-lg font-bold text-[#17252D] mb-1">Generated Android Project File Tree</h2>
              <p className="text-xs text-[#64727A] mb-6">
                All source files below exist directly in the project workspace, ready for Android Studio or Gradle CLI.
              </p>

              <div className="space-y-6">
                {androidFiles.map((group, idx) => (
                  <div key={idx} className="border border-[#E2E8E7] rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 font-semibold text-xs text-[#183B4E] border-b border-[#E2E8E7] flex items-center gap-2">
                      <FolderTree className="w-3.5 h-3.5 text-[#168C83]" />
                      <span>{group.category}</span>
                    </div>
                    <div className="divide-y divide-[#E2E8E7]">
                      {group.files.map((file, fIdx) => (
                        <div key={fIdx} className="px-4 py-3 flex items-start justify-between hover:bg-slate-50/50">
                          <div>
                            <span className="font-mono text-xs font-semibold text-teal-800">{file.path}</span>
                            <p className="text-[11px] text-[#64727A] mt-0.5">{file.desc}</p>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">
                            Created
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E2E8E7] shadow-sm">
                <h3 className="font-bold text-[#17252D] mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#168C83]" />
                  Domain & Engine Layer
                </h3>
                <p className="text-xs text-[#64727A] leading-relaxed mb-4">
                  The <code className="text-teal-800 font-mono">TypingEngine.kt</code> is completely decoupled from Android UI, making it 100% unit-testable. It manages:
                </p>
                <ul className="text-xs text-[#64727A] space-y-2">
                  <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong>Expected Index Pointer:</strong> Starts at 0. Only advances when <code className="text-slate-800 font-mono">pressedChar == targetText[expectedIndex]</code>.
                  </li>
                  <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong>Error State Handling:</strong> On mistype, records a <code className="text-slate-800 font-mono">MistakeRecord</code> with timestamp and position. Index does not advance.
                  </li>
                  <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong>Mode Logic:</strong> Guided pre-highlights; Hint only flashes highlight on error; Test stays dark.
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E2E8E7] shadow-sm">
                <h3 className="font-bold text-[#17252D] mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#168C83]" />
                  Room & Offline Data Layer
                </h3>
                <p className="text-xs text-[#64727A] leading-relaxed mb-4">
                  Operates completely offline without network, login, or cloud sync:
                </p>
                <ul className="text-xs text-[#64727A] space-y-2">
                  <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong>Curriculum Seed:</strong> Automatically seeds all 7 curriculum stages and exercises on first boot.
                  </li>
                  <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong>Learner Progress:</strong> Tracks unlocked stages and mode flags (<code className="text-slate-800 font-mono">guidedUnlocked</code>, <code className="text-slate-800 font-mono">hintUnlocked</code>, <code className="text-slate-800 font-mono">testUnlocked</code>).
                  </li>
                  <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong>Attempt History:</strong> Persists every completion with duration, mistakes, and accuracy.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'commands' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8E7] shadow-sm">
              <h2 className="text-lg font-bold text-[#17252D] mb-2 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#168C83]" />
                How to Build & Run the Android APK
              </h2>
              <p className="text-xs text-[#64727A] mb-6">
                Because this cloud sandbox is a lightweight Linux Web/Node container without the multi-gigabyte Android SDK & JDK, you can build the APK on your machine using standard Android Studio or Gradle CLI:
              </p>

              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-sm mb-2">
                    <Smartphone className="w-4 h-4 text-[#168C83]" />
                    <span>Build & Download on Android Phone (No Computer Needed)</span>
                  </div>
                  <ol className="text-xs text-teal-900 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Push this repository to your GitHub account (or sync changes).</li>
                    <li>Open your GitHub repository in your phone's web browser and tap the <strong>Actions</strong> tab.</li>
                    <li>Select <strong>Build Android Debug APK</strong> from the left sidebar.</li>
                    <li>Tap <strong>Run workflow</strong> &gt; <strong>Run workflow</strong> (via <code className="bg-white/80 px-1 py-0.5 rounded text-teal-800">workflow_dispatch</code>).</li>
                    <li>GitHub Actions cloud runners will automatically install JDK 17, Android SDK 35, and official Gradle 8.11.1, compile the APK, and upload it as an artifact.</li>
                    <li>Once finished (green checkmark), scroll down to <strong>Artifacts</strong> and tap <strong>arabic-typing-app-debug-apk</strong> to download the zip file containing the APK directly to your phone.</li>
                  </ol>
                </div>

                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono">
                  <p className="text-slate-400 mb-2"># Alternative: Local build with Gradle (if on a computer)</p>
                  <p className="text-emerald-400">gradle assembleDebug</p>
                  <p className="text-slate-400 mt-3 mb-1"># Generated APK artifact path:</p>
                  <p className="text-teal-300 font-semibold">app/build/outputs/apk/debug/app-debug.apk</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
