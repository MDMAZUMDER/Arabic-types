/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// The 28 basic Arabic letters + additional common forms
const ARABIC_ALPHABET = [
  'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر',
  'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف',
  'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ة', 'ى',
  'ء', 'ئ', 'ؤ'
];

// Tier 2: Very Short Words (2-3 letters)
const TIER2_VERY_SHORT_WORDS = [
  'يد', 'أب', 'أم', 'دم', 'فم', 'أخ', 'هو', 'هي', 'قل', 'عد',
  'كتب', 'درس', 'علم', 'نور', 'قلم', 'شمس', 'بيت', 'ورد', 'قمر', 'بحر'
];

// Tier 3: Short Words (4-5 letters)
const TIER3_SHORT_WORDS = [
  'كتاب', 'سماء', 'طريق', 'مدينة', 'معلم', 'حياة', 'أزهار', 'حديقة',
  'مدرسة', 'تفاح', 'طبيعة', 'جميل', 'صباح', 'مساء', 'سلام', 'وطن'
];

// Tier 4: Medium Words (6-8 letters)
const TIER4_MEDIUM_WORDS = [
  'المستقبل', 'الاستمرار', 'المعرفة', 'التدريب', 'المتفوق', 'المعلمون',
  'الجامعة', 'المكتبة', 'الكتابة', 'الحدائق', 'المعلومات', 'التكنولوجيا'
];

// Tier 5: Long Words (9+ letters)
const TIER5_LONG_WORDS = [
  'المتفوقين', 'المسؤوليات', 'الاستكشافات', 'المستودعات', 'الاستراتيجية',
  'المواصلات', 'المستشفيات', 'الديمقراطية', 'الاستعدادات', 'المستلزمات'
];

// Tier 6: Short Sentences
const TIER6_SHORT_SENTENCES = [
  'العلم نور',
  'الوقت كالسيف',
  'الصبر مفتاح الفرج',
  'العمل شرف',
  'الصدق منجاة',
  'النظافة من الإيمان'
];

// Tier 7: Long Sentences
const TIER7_LONG_SENTENCES = [
  'من طلب العلا سهر الليالي',
  'التدريب المستمر طريق النجاح والإتقان',
  'لغتنا العربية لغة البيان والبلاغة',
  'خير جليس في الزمان كتاب',
  'في التأني السلامة وفي العجلة الندامة'
];

// Gboard Numbers Row from user screenshot
const GBOARD_NUMBERS = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠'];

// Gboard Row 1: Exactly 11 keys with exact secondary hints from screenshot
const GBOARD_ROW_1 = [
  { char: 'ض', hint: '%' },
  { char: 'ص', hint: '\\' },
  { char: 'ث', hint: '|' },
  { char: 'ق', hint: '=' },
  { char: 'ف', hint: '[' },
  { char: 'غ', hint: ']' },
  { char: 'ع', hint: '<' },
  { char: 'ه', hint: '>' },
  { char: 'خ', hint: '{' },
  { char: 'ح', hint: '}' },
  { char: 'ج', hint: '°' }
];

// Gboard Row 2: Exactly 11 keys with exact secondary hints from screenshot
const GBOARD_ROW_2 = [
  { char: 'ش', hint: '@' },
  { char: 'س', hint: '#' },
  { char: 'ي', hint: '$' },
  { char: 'ب', hint: '_' },
  { char: 'ل', hint: '&' },
  { char: 'ا', hint: '-' },
  { char: 'ت', hint: '+' },
  { char: 'ن', hint: '(' },
  { char: 'م', hint: ')' },
  { char: 'ك', hint: '/' },
  { char: 'ط', hint: '~' }
];

// Gboard Row 3: Exactly 10 letter keys with exact secondary hints from screenshot
// Sequence: ذ, ء, ؤ, ر, ى, ة, و, ز, ظ, د
const GBOARD_ROW_3 = [
  { char: 'ذ', hint: '`' },
  { char: 'ء', hint: '*' },
  { char: 'ؤ', hint: '"' },
  { char: 'ر', hint: '\'' },
  { char: 'ى', hint: ':' },
  { char: 'ة', hint: ';' },
  { char: 'و', hint: '!' },
  { char: 'ز', hint: '?' },
  { char: 'ظ', hint: '\\' },
  { char: 'د', hint: '%' }
];

// Normalize Arabic letters so pressing 'ا' matches 'أ', 'إ', 'آ', and 'ي' / 'ء' matches 'ئ'
const normalizeArabic = (c: string): string => {
  if (c === 'أ' || c === 'إ' || c === 'آ' || c === 'ٱ') return 'ا';
  if (c === 'ئ') return 'ي';
  return c;
};

// Physical English keyboard to Arabic standard mapping matching screenshot
const QWERTY_TO_ARABIC: Record<string, string> = {
  '`': 'ذ', '~': 'ذ',
  q: 'ض', w: 'ص', e: 'ث', r: 'ق', t: 'ف', y: 'غ', u: 'ع', i: 'ه', o: 'خ', p: 'ح', '[': 'ج',
  a: 'ش', s: 'س', d: 'ي', f: 'ب', g: 'ل', h: 'ا', j: 'ت', k: 'ن', l: 'م', ';': 'ك', '\'': 'ط',
  z: 'ذ', x: 'ء', c: 'ؤ', v: 'ر', b: 'ل', n: 'ى', m: 'ة', ',': 'و', '.': 'ز', '/': 'ظ', ']': 'د', ' ': ' '
};

interface MovingEntity {
  id: string;
  fullText: string;
  remainingText: string;
  typedText: string;
  x: number; // percentage from left (100 is right, 0 is danger left)
  lane: number; // 0 to 3
  isSentence: boolean;
}

export default function App() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [entities, setEntities] = useState<MovingEntity[]>([]);
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);
  const [errorFlash, setErrorFlash] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Local storage learner mastery counts
  const [letterCounts, setLetterCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('arabic_endless_letter_counts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [wordsCompleted, setWordsCompleted] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('arabic_endless_words_completed');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const entitiesRef = useRef<MovingEntity[]>([]);
  const gameStateRef = useRef<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const lastSpawnTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Keep ref synchronized
  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Save progress locally
  useEffect(() => {
    try {
      localStorage.setItem('arabic_endless_letter_counts', JSON.stringify(letterCounts));
      localStorage.setItem('arabic_endless_words_completed', wordsCompleted.toString());
    } catch {
      // LocalStorage access handling
    }
  }, [letterCounts, wordsCompleted]);

  // Determine current progression tier automatically
  const getProgressionTier = useCallback(() => {
    // Stage 1 Check: Have all 28 basic Arabic letters been typed at least 20 times?
    const basicLetters = ARABIC_ALPHABET.slice(0, 28);
    const allBasicMastered = basicLetters.every(char => (letterCounts[char] || 0) >= 20);

    if (!allBasicMastered) {
      return 1; // Tier 1: Individual Letters
    }

    // Subsequent tiers based on cumulative successful completions
    if (wordsCompleted < 30) return 2; // Very Short Words
    if (wordsCompleted < 65) return 3; // Short Words
    if (wordsCompleted < 105) return 4; // Medium Words
    if (wordsCompleted < 145) return 5; // Long Words
    if (wordsCompleted < 190) return 6; // Short Sentences
    return 7; // Long Sentences
  }, [letterCounts, wordsCompleted]);

  // Spawn new content based on current progression tier
  const spawnNextEntity = useCallback((tier: number, initialX: number = 100, specificLane?: number) => {
    // Select text based on current tier
    let chosenText = '';
    let isSentence = false;

    if (tier === 1) {
      // Pick random letter, prioritizing letters with < 20 correct hits
      const unmastered = ARABIC_ALPHABET.filter(c => (letterCounts[c] || 0) < 20);
      const candidates = unmastered.length > 0 ? unmastered : ARABIC_ALPHABET;
      chosenText = candidates[Math.floor(Math.random() * candidates.length)];
    } else if (tier === 2) {
      chosenText = TIER2_VERY_SHORT_WORDS[Math.floor(Math.random() * TIER2_VERY_SHORT_WORDS.length)];
    } else if (tier === 3) {
      chosenText = TIER3_SHORT_WORDS[Math.floor(Math.random() * TIER3_SHORT_WORDS.length)];
    } else if (tier === 4) {
      chosenText = TIER4_MEDIUM_WORDS[Math.floor(Math.random() * TIER4_MEDIUM_WORDS.length)];
    } else if (tier === 5) {
      chosenText = TIER5_LONG_WORDS[Math.floor(Math.random() * TIER5_LONG_WORDS.length)];
    } else if (tier === 6) {
      chosenText = TIER6_SHORT_SENTENCES[Math.floor(Math.random() * TIER6_SHORT_SENTENCES.length)];
      isSentence = true;
    } else {
      chosenText = TIER7_LONG_SENTENCES[Math.floor(Math.random() * TIER7_LONG_SENTENCES.length)];
      isSentence = true;
    }

    let chosenLane = specificLane;
    if (chosenLane === undefined) {
      // Choose lane with highest x or no entity in it to prevent overlapping
      const laneOccupancy = [100, 100, 100, 100];
      entitiesRef.current.forEach(e => {
        if (e.x > 60) {
          laneOccupancy[e.lane] = Math.min(laneOccupancy[e.lane], e.x);
        }
      });

      let bestLane = 0;
      let minDanger = 0;
      for (let l = 0; l < 4; l++) {
        if (laneOccupancy[l] > minDanger) {
          minDanger = laneOccupancy[l];
          bestLane = l;
        }
      }
      chosenLane = bestLane;
    }

    const newEntity: MovingEntity = {
      id: Math.random().toString(36).substring(2, 9),
      fullText: chosenText,
      remainingText: chosenText,
      typedText: '',
      x: initialX,
      lane: chosenLane % 4,
      isSentence
    };

    return newEntity;
  }, [letterCounts]);

  // Update target and highlight state
  const updateTargetAndHighlight = useCallback((currentEntities: MovingEntity[]) => {
    if (currentEntities.length === 0) {
      setActiveHighlightKey(null);
      return;
    }

    // Target is the entity closest to left edge (lowest x)
    const sorted = [...currentEntities].sort((a, b) => a.x - b.x);
    const target = sorted[0];

    if (!target || target.remainingText.length === 0) {
      setActiveHighlightKey(null);
      return;
    }

    // In sentence tiers (Tier 6 & 7), keyboard highlight is disabled per rules
    if (target.isSentence) {
      setActiveHighlightKey(null);
    } else {
      const nextChar = target.remainingText[0];
      setActiveHighlightKey(normalizeArabic(nextChar));
    }
  }, []);

  // Main game loop (runs via requestAnimationFrame)
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    lastFrameTimeRef.current = performance.now();
    lastSpawnTimeRef.current = performance.now();

    const loop = (time: number) => {
      const deltaMs = time - lastFrameTimeRef.current;
      lastFrameTimeRef.current = time;

      // Current tier governs speed & spawn rate
      const tier = getProgressionTier();
      const baseSpeed = 5.2 + (tier * 0.4); // percentage per second
      const moveDelta = (baseSpeed * deltaMs) / 1000;

      const currentEntities = entitiesRef.current;
      let isGameOver = false;

      // Move entities from right to left
      const updatedEntities = currentEntities.map(e => {
        const nextX = e.x - moveDelta;
        // Game Over condition: Left edge touched (<= 4%)
        if (nextX <= 4) {
          isGameOver = true;
        }
        return { ...e, x: nextX };
      });

      if (isGameOver) {
        setGameState('GAME_OVER');
        setActiveHighlightKey(null);
        return;
      }

      // Dynamic spawn interval: if screen has few entities, spawn fast!
      const count = updatedEntities.length;
      const targetInterval = count <= 1 ? 400 : count === 2 ? 950 : Math.max(1100, 2100 - (tier * 150));
      if (time - lastSpawnTimeRef.current > targetInterval && updatedEntities.length < 5) {
        const spawned = spawnNextEntity(tier, 100);
        if (spawned) {
          updatedEntities.push(spawned);
          lastSpawnTimeRef.current = time;
        }
      }

      setEntities(updatedEntities);
      updateTargetAndHighlight(updatedEntities);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, getProgressionTier, spawnNextEntity, updateTargetAndHighlight]);

  // Handle typing key press (both on-screen and physical keyboard)
  const handleInputChar = useCallback((pressedChar: string) => {
    if (gameStateRef.current !== 'PLAYING') return;

    setPressedKey(pressedChar);
    setTimeout(() => setPressedKey(null), 120);

    const currentEntities = entitiesRef.current;
    if (currentEntities.length === 0) return;

    // Find the target entity closest to the left edge
    const sorted = [...currentEntities].sort((a, b) => a.x - b.x);
    const target = sorted[0];

    if (!target || target.remainingText.length === 0) return;

    const expectedChar = target.remainingText[0];

    // Check correctness (exact match or normalized Arabic match)
    const isMatch = pressedChar === expectedChar || normalizeArabic(pressedChar) === normalizeArabic(expectedChar);

    if (isMatch) {
      // Correct keypress!
      const nextRemaining = target.remainingText.slice(1);
      const nextTyped = target.typedText + expectedChar;

      // Update letter mastery count if single letter
      if (target.fullText.length === 1) {
        setLetterCounts(prev => ({
          ...prev,
          [expectedChar]: (prev[expectedChar] || 0) + 1
        }));
      }

      if (nextRemaining.length === 0) {
        // Complete word/sentence/letter typed -> Pop & disappear!
        const remainingEntities = currentEntities.filter(e => e.id !== target.id);
        entitiesRef.current = remainingEntities;
        setEntities(remainingEntities);
        updateTargetAndHighlight(remainingEntities);
        setWordsCompleted(prev => prev + 1);

        // If few entities remain, speed up next spawn immediately so screen is never empty
        if (remainingEntities.length <= 1) {
          lastSpawnTimeRef.current = 0;
        }
      } else {
        // Advance expected character inside word/sentence
        const updated = currentEntities.map(e => {
          if (e.id === target.id) {
            return {
              ...e,
              remainingText: nextRemaining,
              typedText: nextTyped
            };
          }
          return e;
        });
        entitiesRef.current = updated;
        setEntities(updated);
        updateTargetAndHighlight(updated);
      }
    } else {
      // Incorrect keypress -> Shake / red flash, item remains, pointer does not advance
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 240);
    }
  }, [updateTargetAndHighlight]);

  // Handle backspace action
  const handleBackspace = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;
    const currentEntities = entitiesRef.current;
    if (currentEntities.length === 0) return;

    const sorted = [...currentEntities].sort((a, b) => a.x - b.x);
    const target = sorted[0];

    if (!target || target.typedText.length === 0) return;

    const lastChar = target.typedText[target.typedText.length - 1];
    const newTyped = target.typedText.slice(0, -1);
    const newRemaining = lastChar + target.remainingText;

    const updated = currentEntities.map(e => {
      if (e.id === target.id) {
        return {
          ...e,
          typedText: newTyped,
          remainingText: newRemaining
        };
      }
      return e;
    });

    entitiesRef.current = updated;
    setEntities(updated);
    updateTargetAndHighlight(updated);
  }, [updateTargetAndHighlight]);

  // Listen for physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'PLAYING') return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      // If user typed spacebar
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleInputChar(' ');
        return;
      }

      // Check if key is already an Arabic character
      if (ARABIC_ALPHABET.includes(e.key)) {
        e.preventDefault();
        handleInputChar(e.key);
        return;
      }

      // Check if physical key maps to an Arabic letter
      const lower = e.key.toLowerCase();
      if (QWERTY_TO_ARABIC[lower]) {
        e.preventDefault();
        handleInputChar(QWERTY_TO_ARABIC[lower]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInputChar, handleBackspace]);

  // Start or Restart Game
  const startGame = () => {
    setErrorFlash(false);
    setActiveHighlightKey(null);
    setGameState('PLAYING');

    const tier = getProgressionTier();
    // Pre-spawn 2-3 letters at staggered x positions across different lanes right away
    const e1 = spawnNextEntity(tier, 70, 1);
    const e2 = spawnNextEntity(tier, 88, 2);
    const e3 = spawnNextEntity(tier, 105, 0);
    const initialList = [e1, e2, e3].filter(Boolean) as MovingEntity[];

    entitiesRef.current = initialList;
    setEntities(initialList);
    updateTargetAndHighlight(initialList);
    lastSpawnTimeRef.current = performance.now();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F6F7F5] select-none font-sans flex flex-col justify-between">
      {/* START SCREEN */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#183B4E] text-white p-6">
          <div className="w-16 h-16 rounded-2xl bg-[#168C83] flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-teal-950/40">
            ض
          </div>
          <button
            onClick={startGame}
            className="px-10 py-4 bg-[#168C83] hover:bg-[#147a72] active:scale-95 text-white font-bold text-xl rounded-2xl shadow-xl transition-all duration-150 cursor-pointer"
          >
            Start Game (ابدأ اللعبة)
          </button>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#183B4E]/95 backdrop-blur-sm text-white p-6">
          <div className="text-3xl font-bold text-[#C44747] mb-2 tracking-wide">
            Game Over
          </div>
          <div className="text-xl font-medium text-slate-300 mb-8" dir="rtl">
            انتهت اللعبة
          </div>
          <button
            onClick={startGame}
            className="px-10 py-4 bg-[#168C83] hover:bg-[#147a72] active:scale-95 text-white font-bold text-xl rounded-2xl shadow-xl transition-all duration-150 cursor-pointer"
          >
            Restart Game (إعادة اللعب)
          </button>
        </div>
      )}

      {/* TOP / MIDDLE: MOVING ARABIC CHARACTERS & WORDS */}
      <div className="relative w-full flex-1 overflow-hidden">
        {/* Left Danger Edge / Line */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-[#C44747] to-transparent z-10 opacity-80" />
        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-red-400/40 border-l border-dashed border-red-500/60 z-10" />

        {/* 4 Lanes for smooth non-overlapping vertical spacing */}
        <div className="absolute inset-0 flex flex-col justify-around py-3">
          {[0, 1, 2, 3].map(lane => (
            <div
              key={lane}
              className="relative w-full h-14 flex items-center border-b border-slate-200/50"
            />
          ))}
        </div>

        {/* Moving Arabic Entities */}
        {entities.map(entity => {
          // Lanes distributed vertically
          const laneTopPercentages = [12, 36, 60, 84];
          const topPosition = laneTopPercentages[entity.lane] || 40;
          const isTarget = entities.length > 0 && entity.id === [...entities].sort((a, b) => a.x - b.x)[0]?.id;

          return (
            <div
              key={entity.id}
              className={`absolute transform -translate-y-1/2 flex items-center transition-transform duration-75 ${
                isTarget ? 'scale-105' : 'scale-100 opacity-90'
              }`}
              style={{
                left: `${entity.x}%`,
                top: `${topPosition}%`,
                direction: 'rtl'
              }}
            >
              <div
                className={`px-4 py-2 rounded-xl flex items-center justify-center shadow-md border ${
                  isTarget
                    ? 'bg-white border-[#168C83] shadow-teal-900/10'
                    : 'bg-white/95 border-slate-200 shadow-slate-900/5'
                }`}
              >
                {/* Already Typed Characters in Green */}
                {entity.typedText && (
                  <span className="text-[#23865B] font-bold text-2xl tracking-wide opacity-80 ml-0.5">
                    {entity.typedText}
                  </span>
                )}

                {/* Remaining Characters to Type */}
                <span
                  className={`font-bold text-2xl tracking-wide ${
                    isTarget ? 'text-[#183B4E]' : 'text-[#64727A]'
                  }`}
                >
                  {entity.remainingText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM: EXACT GOOGLE GBOARD ARABIC KEYBOARD (FROM USER SCREENSHOT) */}
      <div
        className={`w-full bg-[#20313f]/95 backdrop-blur-md pt-2 pb-3 px-1.5 shadow-2xl z-20 border-t border-slate-600/40 transition-colors duration-150 ${
          errorFlash ? 'ring-4 ring-[#C44747] ring-inset' : ''
        }`}
      >
        <div className="max-w-xl mx-auto flex flex-col gap-1.5">
          {/* Top Number Row: 10 keys (١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ٠) */}
          <div className="flex justify-center gap-1 w-full">
            {GBOARD_NUMBERS.map(num => (
              <button
                key={num}
                onClick={() => handleInputChar(num)}
                className="flex-1 h-9 rounded-[7px] font-bold text-base flex items-center justify-center transition-all duration-75 cursor-pointer shadow-[0_1px_0_rgba(0,0,0,0.3)] bg-[#4a6374]/80 text-[#f1f5f9] hover:bg-[#577284] active:translate-y-0.5"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Row 1: 11 keys (ض ص ث ق ف غ ع ه خ ح ج) */}
          <div className="flex justify-center gap-1 w-full">
            {GBOARD_ROW_1.map(item => {
              const isHighlight = activeHighlightKey === item.char;
              const isPressed = pressedKey === item.char;

              return (
                <button
                  key={item.char}
                  onClick={() => handleInputChar(item.char)}
                  className={`relative flex-1 h-11 sm:h-12 rounded-[7px] flex items-center justify-center transition-all duration-75 cursor-pointer shadow-[0_1.5px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 ${
                    isPressed
                      ? 'bg-[#3b5160] text-white scale-95'
                      : isHighlight
                      ? 'bg-[#D69A32] text-white ring-2 ring-amber-300 shadow-lg shadow-amber-500/50 scale-105 z-10'
                      : 'bg-[#4a6374]/85 text-[#f1f5f9] hover:bg-[#577284]'
                  }`}
                >
                  {/* Secondary Symbol Hint (Top Right) */}
                  <span className="absolute top-0.5 right-1 text-[9px] text-slate-300/80 font-mono leading-none">
                    {item.hint}
                  </span>
                  {/* Main Arabic Letter */}
                  <span className="text-xl font-bold pt-1">
                    {item.char}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 2: 11 keys (ش س ي ب ل ا ت ن م ك ط) */}
          <div className="flex justify-center gap-1 w-full">
            {GBOARD_ROW_2.map(item => {
              const isHighlight = activeHighlightKey === item.char;
              const isPressed = pressedKey === item.char;

              return (
                <button
                  key={item.char}
                  onClick={() => handleInputChar(item.char)}
                  className={`relative flex-1 h-11 sm:h-12 rounded-[7px] flex items-center justify-center transition-all duration-75 cursor-pointer shadow-[0_1.5px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 ${
                    isPressed
                      ? 'bg-[#3b5160] text-white scale-95'
                      : isHighlight
                      ? 'bg-[#D69A32] text-white ring-2 ring-amber-300 shadow-lg shadow-amber-500/50 scale-105 z-10'
                      : 'bg-[#4a6374]/85 text-[#f1f5f9] hover:bg-[#577284]'
                  }`}
                >
                  {/* Secondary Symbol Hint (Top Right) */}
                  <span className="absolute top-0.5 right-1 text-[9px] text-slate-300/80 font-mono leading-none">
                    {item.hint}
                  </span>
                  {/* Main Arabic Letter */}
                  <span className="text-xl font-bold pt-1">
                    {item.char}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 3: 10 letter keys (ذ ء ؤ ر ى ة و ز ظ د) + Backspace Key */}
          <div className="flex justify-center gap-1 w-full">
            {GBOARD_ROW_3.map(item => {
              const isHighlight = activeHighlightKey === item.char;
              const isPressed = pressedKey === item.char;

              return (
                <button
                  key={item.char}
                  onClick={() => handleInputChar(item.char)}
                  className={`relative flex-1 h-11 sm:h-12 rounded-[7px] flex items-center justify-center transition-all duration-75 cursor-pointer shadow-[0_1.5px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 ${
                    isPressed
                      ? 'bg-[#3b5160] text-white scale-95'
                      : isHighlight
                      ? 'bg-[#D69A32] text-white ring-2 ring-amber-300 shadow-lg shadow-amber-500/50 scale-105 z-10'
                      : 'bg-[#4a6374]/85 text-[#f1f5f9] hover:bg-[#577284]'
                  }`}
                >
                  {/* Secondary Symbol Hint (Top Right) */}
                  <span className="absolute top-0.5 right-1 text-[9px] text-slate-300/80 font-mono leading-none">
                    {item.hint}
                  </span>
                  {/* Main Arabic Letter */}
                  <span className="text-xl font-bold pt-1">
                    {item.char}
                  </span>
                </button>
              );
            })}

            {/* Backspace Key (Far Right of Row 3) */}
            <button
              onClick={handleBackspace}
              className="w-11 sm:w-12 h-11 sm:h-12 rounded-[7px] bg-[#334653]/90 text-slate-200 hover:bg-[#3d5262] active:translate-y-0.5 flex items-center justify-center cursor-pointer shadow-[0_1.5px_0_rgba(0,0,0,0.35)]"
              title="Backspace"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.5-7.5H20a1 1 0 011 1v13a1 1 0 01-1 1H9.5L3 12z" />
              </svg>
            </button>
          </div>

          {/* Row 4: Gboard Utility & Space Row */}
          <div className="flex justify-between items-center gap-1.5 w-full mt-0.5">
            {/* ؟۱۲۳ Button */}
            <button
              onClick={() => handleInputChar('؟')}
              className="w-13 h-10 sm:h-11 rounded-[7px] font-bold text-sm bg-[#334653]/90 text-[#f1f5f9] hover:bg-[#3d5262] shadow-[0_1.5px_0_rgba(0,0,0,0.3)] flex items-center justify-center cursor-pointer active:translate-y-0.5"
            >
              ؟۱۲۳
            </button>

            {/* Emoji Button with Comma Hint */}
            <button
              onClick={() => handleInputChar('،')}
              className="w-10 h-10 sm:h-11 rounded-[7px] bg-[#334653]/90 text-[#f1f5f9] hover:bg-[#3d5262] shadow-[0_1.5px_0_rgba(0,0,0,0.3)] flex flex-col items-center justify-center cursor-pointer active:translate-y-0.5"
            >
              <span className="text-sm leading-none">🙂</span>
              <span className="text-[10px] text-slate-400 leading-none">,</span>
            </button>

            {/* Globe Language Switcher Button */}
            <button
              className="w-10 h-10 sm:h-11 rounded-[7px] bg-[#334653]/90 text-[#f1f5f9] hover:bg-[#3d5262] shadow-[0_1.5px_0_rgba(0,0,0,0.3)] flex items-center justify-center cursor-pointer active:translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </button>

            {/* Wide Spacebar with 'العربية' */}
            <button
              onClick={() => handleInputChar(' ')}
              className={`flex-1 h-10 sm:h-11 rounded-[7px] font-medium text-sm sm:text-base flex items-center justify-center transition-all duration-75 cursor-pointer shadow-[0_1.5px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 ${
                pressedKey === ' '
                  ? 'bg-[#3b5160] text-white scale-95'
                  : activeHighlightKey === ' '
                  ? 'bg-[#D69A32] text-white ring-2 ring-amber-300 shadow-lg shadow-amber-500/50'
                  : 'bg-[#4a6374]/80 text-[#f1f5f9] hover:bg-[#577284]'
              }`}
            >
              العربية
            </button>

            {/* Blue Action / Enter Button ➔ */}
            <button
              onClick={() => handleInputChar(' ')}
              className="w-13 h-10 sm:h-11 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-lg shadow-lg active:scale-95 cursor-pointer"
              title="Enter"
            >
              ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
