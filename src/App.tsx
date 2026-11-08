/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

import {
  ARABIC_ALPHABET,
  TIER2_VERY_SHORT_WORDS,
  TIER3_SHORT_WORDS,
  TIER4_MEDIUM_WORDS,
  TIER5_LONG_WORDS,
  TIER6_SHORT_SENTENCES,
  TIER7_LONG_SENTENCES,
  REQUIRED_LETTER_HITS,
  StageProgress,
  INITIAL_STAGE_PROGRESS,
  computeProgressionTier
} from './progressionLogic';

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

// Cross-platform haptic feedback (works in browser and native Android APK via AndroidBridge)
const triggerHaptic = (type: 'tap' | 'complete' | 'error') => {
  try {
    const bridge = (window as unknown as { AndroidBridge?: { vibrate: (ms: number) => void } })?.AndroidBridge;
    if (bridge && typeof bridge.vibrate === 'function') {
      if (type === 'tap') bridge.vibrate(25);
      else if (type === 'complete') bridge.vibrate(45);
      else if (type === 'error') bridge.vibrate(90);
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'tap') navigator.vibrate(25);
      else if (type === 'complete') navigator.vibrate(45);
      else if (type === 'error') navigator.vibrate(90);
    }
  } catch {
    // Ignore haptic errors if unsupported
  }
};

interface MovingEntity {
  id: string;
  fullText: string;
  remainingText: string;
  typedText: string;
  x: number; // percentage from left (100 is right, 0 is danger left)
  lane: number; // 0 to 3
  isSentence: boolean;
  tier: number;
}

export default function App() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [entities, setEntities] = useState<MovingEntity[]>([]);
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [errorFlash, setErrorFlash] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Stats: Speed (CPM), Total Points, Mistakes, Streak
  const [score, setScore] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [cpm, setCpm] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Local storage learner mastery counts (each letter must reach 20, capped at 20)
  const [letterCounts, setLetterCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('arabic_endless_letter_counts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Local storage distinct stage progress (each tier tracked independently)
  const [stageProgress, setStageProgress] = useState<StageProgress>(() => {
    try {
      const saved = localStorage.getItem('arabic_endless_stage_progress');
      if (saved) {
        return { ...INITIAL_STAGE_PROGRESS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return INITIAL_STAGE_PROGRESS;
  });

  const entitiesRef = useRef<MovingEntity[]>([]);
  const gameStateRef = useRef<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const lastSpawnTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);

  // Rolling window of correct hit timestamps for CPM calculation
  const correctHitsRef = useRef<number[]>([]);
  const smoothedCpmRef = useRef<number>(0);
  const lastCpmUpdateRef = useRef<number>(0);
  const streakRef = useRef<number>(0);
  const wrongKeyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs synchronized
  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Clean up wrongKey timeout on unmount
  useEffect(() => {
    return () => {
      if (wrongKeyTimeoutRef.current) {
        clearTimeout(wrongKeyTimeoutRef.current);
      }
    };
  }, []);

  // Save progress locally (persisted across reloads and game over)
  useEffect(() => {
    try {
      localStorage.setItem('arabic_endless_letter_counts', JSON.stringify(letterCounts));
      localStorage.setItem('arabic_endless_stage_progress', JSON.stringify(stageProgress));
    } catch {
      // LocalStorage access handling
    }
  }, [letterCounts, stageProgress]);

  // Determine current progression tier automatically
  const getProgressionTier = useCallback(() => {
    return computeProgressionTier(letterCounts, stageProgress);
  }, [letterCounts, stageProgress]);

  // Spawn new content based on current progression tier
  const spawnNextEntity = useCallback((tier: number, initialX: number = 100, specificLane?: number) => {
    // Select text based on current tier
    let chosenText = '';
    let isSentence = false;

    if (tier === 1) {
      // Pick random letter, prioritizing letters with < 20 correct hits
      const unmastered = ARABIC_ALPHABET.filter(c => (letterCounts[c] || 0) < REQUIRED_LETTER_HITS);
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
      isSentence,
      tier
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
    lastCpmUpdateRef.current = performance.now();

    const loop = (time: number) => {
      const deltaMs = time - lastFrameTimeRef.current;
      lastFrameTimeRef.current = time;

      // 1. Calculate CPM from rolling window (last 30 seconds)
      const windowMs = 30000;
      correctHitsRef.current = correctHitsRef.current.filter(t => time - t <= windowMs);
      const sessionElapsedSec = Math.max(1.5, (time - gameStartTimeRef.current) / 1000);
      const effectiveWindowSec = Math.min(sessionElapsedSec, windowMs / 1000);
      const instantCpm = effectiveWindowSec > 0
        ? (correctHitsRef.current.length / effectiveWindowSec) * 60
        : 0;

      // Smooth CPM with exponential moving average (EMA)
      if (smoothedCpmRef.current === 0 && instantCpm > 0) {
        smoothedCpmRef.current = instantCpm;
      } else {
        smoothedCpmRef.current = smoothedCpmRef.current * 0.92 + instantCpm * 0.08;
      }

      // Update state CPM at throttled interval (every ~200ms) to ensure smooth rendering
      if (time - lastCpmUpdateRef.current > 200) {
        lastCpmUpdateRef.current = time;
        setCpm(Math.round(smoothedCpmRef.current));
      }

      // 2. Current tier and CPM govern speed & spawn rate
      const tier = getProgressionTier();
      const currentSmoothedCpm = smoothedCpmRef.current;

      // Smooth entity movement speed: base 5.0% + slight scaling with tier and CPM
      const baseSpeed = 5.0 + (tier * 0.35) + (Math.min(220, currentSmoothedCpm) * 0.012);
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
        setWrongKey(null);
        return;
      }

      // 3. Dynamic Spawn Interval:
      // High CPM -> faster spawns (shorter interval)
      // Low CPM -> slower spawns (longer interval)
      // Smooth gradual transition
      const count = updatedEntities.length;
      const clampedCpm = Math.max(0, Math.min(240, currentSmoothedCpm));
      const cpmSpawnInterval = 2500 - (clampedCpm * 6.5) - (tier * 50);
      const baseInterval = Math.max(900, Math.min(2700, cpmSpawnInterval));

      // Fast-spawn fallback if screen is nearly empty so user is never stalled
      let targetInterval: number;
      if (count <= 1) {
        targetInterval = 420;
      } else if (count === 2) {
        targetInterval = Math.max(650, baseInterval * 0.65);
      } else {
        targetInterval = baseInterval;
      }

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

      // 1. Record correct hit timestamp for CPM tracking
      correctHitsRef.current.push(performance.now());

      // 2. Points & Bonus calculation:
      // Base points per correct char: 10
      let pointsEarned = 10;

      // Speed bonus: +1 point per 20 CPM
      const speedBonus = Math.floor(smoothedCpmRef.current / 20);
      pointsEarned += speedBonus;

      // Streak tracking & bonus
      const currentStreak = streakRef.current + 1;
      streakRef.current = currentStreak;
      setStreak(currentStreak);
      if (currentStreak >= 50) {
        pointsEarned += 10;
      } else if (currentStreak >= 25) {
        pointsEarned += 5;
      } else if (currentStreak >= 10) {
        pointsEarned += 2;
      }

      // Stage completion bonus when full word/sentence is completed
      if (nextRemaining.length === 0) {
        const completionBonus = target.tier === 1 ? 5
          : target.tier === 2 ? 20
          : target.tier === 3 ? 40
          : target.tier === 4 ? 70
          : target.tier === 5 ? 100
          : target.tier === 6 ? 150
          : 250;
        pointsEarned += completionBonus;
      }

      setScore(prev => prev + pointsEarned);

      // 3. Update letter mastery count if single letter (capped at REQUIRED_LETTER_HITS = 20)
      if (target.fullText.length === 1) {
        setLetterCounts(prev => ({
          ...prev,
          [expectedChar]: Math.min(REQUIRED_LETTER_HITS, (prev[expectedChar] || 0) + 1)
        }));
      }

      if (nextRemaining.length === 0) {
        // Complete word/sentence/letter typed -> Pop & disappear!
        triggerHaptic('complete');
        const remainingEntities = currentEntities.filter(e => e.id !== target.id);
        entitiesRef.current = remainingEntities;
        setEntities(remainingEntities);
        updateTargetAndHighlight(remainingEntities);

        // Update progress strictly for this entity's specific stage
        if (target.tier === 2) {
          setStageProgress(prev => ({ ...prev, tier2Words: prev.tier2Words + 1 }));
        } else if (target.tier === 3) {
          setStageProgress(prev => ({ ...prev, tier3Words: prev.tier3Words + 1 }));
        } else if (target.tier === 4) {
          setStageProgress(prev => ({ ...prev, tier4Words: prev.tier4Words + 1 }));
        } else if (target.tier === 5) {
          setStageProgress(prev => ({ ...prev, tier5Words: prev.tier5Words + 1 }));
        } else if (target.tier === 6) {
          setStageProgress(prev => ({ ...prev, tier6Sentences: prev.tier6Sentences + 1 }));
        } else if (target.tier === 7) {
          setStageProgress(prev => ({ ...prev, tier7Sentences: prev.tier7Sentences + 1 }));
        }

        // If few entities remain, speed up next spawn immediately so screen is never empty
        if (remainingEntities.length <= 1) {
          lastSpawnTimeRef.current = 0;
        }
      } else {
        // Advance expected character inside word/sentence
        triggerHaptic('tap');
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
      // Incorrect keypress -> No points, streak reset, mistake count incremented
      streakRef.current = 0;
      setStreak(0);
      setMistakes(prev => prev + 1);

      // Highlight the pressed wrong key in RED on virtual keyboard for 380ms
      setWrongKey(pressedChar);
      if (wrongKeyTimeoutRef.current) {
        clearTimeout(wrongKeyTimeoutRef.current);
      }
      wrongKeyTimeoutRef.current = setTimeout(() => {
        setWrongKey(null);
      }, 380);

      triggerHaptic('error');
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

    triggerHaptic('tap');
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
      // Prevent repeated trigger on key hold
      if (e.repeat) return;

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
    setWrongKey(null);
    if (wrongKeyTimeoutRef.current) clearTimeout(wrongKeyTimeoutRef.current);

    // Reset round metrics
    setScore(0);
    setMistakes(0);
    setStreak(0);
    streakRef.current = 0;
    correctHitsRef.current = [];
    smoothedCpmRef.current = 0;
    setCpm(0);
    gameStartTimeRef.current = performance.now();
    lastCpmUpdateRef.current = performance.now();

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

  // Helper to determine styling for any keyboard key
  const getKeyClasses = (char: string, baseClass: string) => {
    const isWrong = wrongKey !== null && (wrongKey === char || normalizeArabic(wrongKey) === normalizeArabic(char));
    const isHighlight = activeHighlightKey === char || (activeHighlightKey && normalizeArabic(activeHighlightKey) === normalizeArabic(char));
    const isPressed = pressedKey === char;

    if (isWrong) {
      // Intense Red Glow for wrong key pressed
      return 'bg-[#DC2626] text-white ring-4 ring-red-400 shadow-[0_0_24px_rgba(239,68,68,1),inset_0_0_10px_rgba(255,255,255,0.4)] scale-105 z-20 transition-all duration-75 animate-pulse';
    }
    if (isHighlight) {
      // Gold/Amber Highlight for expected target key
      return 'bg-[#D69A32] text-white ring-2 ring-amber-300 shadow-lg shadow-amber-500/50 scale-105 z-10 transition-colors duration-75';
    }
    if (isPressed) {
      return 'bg-[#3b5160] text-white scale-95 transition-all duration-75';
    }
    return baseClass;
  };

  const currentTier = getProgressionTier();

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
          <div className="text-3xl font-bold text-[#C44747] mb-1 tracking-wide">
            Game Over
          </div>
          <div className="text-xl font-medium text-slate-300 mb-6" dir="rtl">
            انتهت اللعبة
          </div>

          {/* Round Summary Stats - Shared Design Language */}
          <div className="w-full max-w-sm grid grid-cols-3 gap-2 py-3 px-3 bg-white/10 rounded-2xl border border-white/10 mb-8 text-center backdrop-blur-md">
            {/* Speed (Blue-Cyan) */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-sky-950/50 border border-sky-400/30">
              <div className="flex items-center gap-1 text-[11px] text-cyan-300 font-bold uppercase tracking-wider mb-1">
                <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 14l3-4" />
                  <path d="M3.34 17a10 10 0 1 1 17.32 0" />
                </svg>
                Speed
              </div>
              <div className="text-2xl font-black font-mono text-cyan-300">{cpm}</div>
              <div className="text-[10px] text-cyan-400/80 font-bold">CPM</div>
            </div>

            {/* Mistakes (Red) */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-rose-950/50 border border-rose-400/30">
              <div className="flex items-center gap-1 text-[11px] text-rose-300 font-bold uppercase tracking-wider mb-1">
                <svg className="w-3 h-3 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Errors
              </div>
              <div className="text-2xl font-black font-mono text-rose-300">{mistakes}</div>
              <div className="text-[10px] text-rose-400/80 font-bold">Mistakes</div>
            </div>

            {/* Points (Purple-Gold) */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-purple-950/50 border border-amber-400/30">
              <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold uppercase tracking-wider mb-1">
                <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 4h16v6a7 7 0 0 1-14 0V4z" />
                  <path d="M12 17v4M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Points
              </div>
              <div className="text-2xl font-black font-mono text-amber-300">{score.toLocaleString()}</div>
              <div className="text-[10px] text-purple-300/80 font-bold">PTS</div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-10 py-4 bg-[#168C83] hover:bg-[#147a72] active:scale-95 text-white font-bold text-xl rounded-2xl shadow-xl transition-all duration-150 cursor-pointer"
          >
            Restart Game (إعادة اللعب)
          </button>
        </div>
      )}

      {/* TOP STATUS HEADER BAR - COHESIVE COMPACT DESIGN */}
      <div className="w-full h-11 sm:h-12 px-2 sm:px-3 flex items-center justify-between gap-1.5 sm:gap-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200/90 z-20 shadow-xs shrink-0">
        {/* 1. SPEED POD (Blue-Cyan Theme) */}
        <div className="flex-1 max-w-[135px] sm:max-w-[150px] h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg bg-sky-50/85 border border-sky-200/90 flex items-center justify-between gap-1 shadow-xs">
          <div className="flex items-center gap-1 min-w-0">
            <svg className="w-3.5 h-3.5 text-cyan-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 14l3-4" />
              <path d="M3.34 17a10 10 0 1 1 17.32 0" />
            </svg>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-800 hidden xs:inline">Speed</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base sm:text-xl font-black font-mono text-[#0284c7] tabular-nums leading-none">
              {cpm}
            </span>
            <span className="text-[9px] font-bold text-cyan-600">CPM</span>
          </div>
        </div>

        {/* 2. MISTAKES POD (Red Theme) */}
        <div className="flex-1 max-w-[125px] sm:max-w-[140px] h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg bg-rose-50/85 border border-rose-200/90 flex items-center justify-between gap-1 shadow-xs">
          <div className="flex items-center gap-1 min-w-0">
            <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800 hidden xs:inline">Mistakes</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-base sm:text-xl font-black font-mono tabular-nums leading-none ${mistakes > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
              {mistakes}
            </span>
          </div>
        </div>

        {/* 3. POINTS POD (Purple-Gold Theme) */}
        <div className="flex-1 max-w-[145px] sm:max-w-[160px] h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg bg-purple-50/85 border border-purple-200/90 flex items-center justify-between gap-1 shadow-xs">
          <div className="flex items-center gap-1 min-w-0">
            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 4h16v6a7 7 0 0 1-14 0V4z" />
              <path d="M12 17v4M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-800 hidden xs:inline">Points</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base sm:text-xl font-black font-mono text-purple-800 tabular-nums leading-none">
              {score.toLocaleString()}
            </span>
            <span className="text-[9px] font-bold text-amber-600">PTS</span>
          </div>
        </div>
      </div>

      {/* MIDDLE: MOVING ARABIC CHARACTERS & WORDS */}
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
            {GBOARD_NUMBERS.map(num => {
              const numClass = getKeyClasses(num, 'bg-[#4a6374]/80 text-[#f1f5f9] hover:bg-[#577284]');
              return (
                <button
                  key={num}
                  onClick={() => handleInputChar(num)}
                  className={`flex-1 h-9 rounded-[7px] font-bold text-base flex items-center justify-center transition-all duration-75 cursor-pointer shadow-[0_1px_0_rgba(0,0,0,0.3)] active:translate-y-0.5 ${numClass}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Row 1: 11 keys (ض ص ث ق ف غ ع ه خ ح ج) */}
          <div className="flex justify-center gap-1 w-full">
            {GBOARD_ROW_1.map(item => {
              const keyClass = getKeyClasses(item.char, 'bg-[#4a6374]/85 text-[#f1f5f9] hover:bg-[#577284]');
              return (
                <button
                  key={item.char}
                  onClick={() => handleInputChar(item.char)}
                  className={`relative flex-1 h-11 sm:h-12 rounded-[7px] flex items-center justify-center transition-all duration-75 cursor-pointer shadow-[0_1.5px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 ${keyClass}`}
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
              const keyClass = getKeyClasses(item.char, 'bg-[#4a6374]/85 text-[#f1f5f9] hover:bg-[#577284]');
              return (
                <button
                  key={item.char}
                  onClick={() => handleInputChar(item.char)}
                  className={`relative flex-1 h-11 sm:h-12 rounded-[7px] flex items-center justify-center transition-all duration-75 cursor-pointer shadow-[0_1.5px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 ${keyClass}`}
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
              const keyClass = getKeyClasses(item.char, 'bg-[#4a6374]/85 text-[#f1f5f9] hover:bg-[#577284]');
              return (
                <button
                  key={item.char}
                  onClick={() => handleInputChar(item.char)}
                  className={`relative flex-1 h-11 sm:h-12 rounded-[7px] flex items-center justify-center transition-all duration-75 cursor-pointer shadow-[0_1.5px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 ${keyClass}`}
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
              className={`flex-1 h-10 sm:h-11 rounded-[7px] font-medium text-sm sm:text-base flex items-center justify-center transition-all duration-75 cursor-pointer shadow-[0_1.5px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 ${getKeyClasses(
                ' ',
                'bg-[#4a6374]/80 text-[#f1f5f9] hover:bg-[#577284]'
              )}`}
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
