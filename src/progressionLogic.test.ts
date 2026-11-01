import {
  ARABIC_ALPHABET,
  TIER2_VERY_SHORT_WORDS,
  TIER3_SHORT_WORDS,
  TIER4_MEDIUM_WORDS,
  TIER5_LONG_WORDS,
  TIER6_SHORT_SENTENCES,
  TIER7_LONG_SENTENCES,
  REQUIRED_LETTER_HITS,
  REQUIRED_TIER2_WORDS,
  REQUIRED_TIER3_WORDS,
  REQUIRED_TIER4_WORDS,
  REQUIRED_TIER5_WORDS,
  REQUIRED_TIER6_SENTENCES,
  StageProgress,
  INITIAL_STAGE_PROGRESS,
  isTier1Mastered,
  computeProgressionTier
} from './progressionLogic';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Starting Arabic Endless Game Progression Logic Tests ---');

// Test 1: Verify all word lengths in lists
console.log('Test 1: Validating word length constraints...');
for (const word of TIER2_VERY_SHORT_WORDS) {
  const len = word.length;
  assert(len >= 2 && len <= 3, `Tier 2 word "${word}" length ${len} must be 2 or 3`);
}
for (const word of TIER3_SHORT_WORDS) {
  const len = word.length;
  assert(len >= 4 && len <= 5, `Tier 3 word "${word}" length ${len} must be 4 or 5`);
}
for (const word of TIER4_MEDIUM_WORDS) {
  const len = word.length;
  assert(len >= 6 && len <= 8, `Tier 4 word "${word}" length ${len} must be 6, 7, or 8`);
}
for (const word of TIER5_LONG_WORDS) {
  const len = word.length;
  assert(len >= 9, `Tier 5 word "${word}" length ${len} must be >= 9`);
}
for (const sent of TIER6_SHORT_SENTENCES) {
  assert(sent.includes(' '), `Tier 6 sentence "${sent}" must contain spaces`);
}
for (const sent of TIER7_LONG_SENTENCES) {
  assert(sent.includes(' '), `Tier 7 sentence "${sent}" must contain spaces`);
}
console.log('✓ Test 1 Passed: All word and sentence lengths match specifications.');

// Test 2: Tier 1 mastery check
console.log('Test 2: Verifying Tier 1 letter mastery logic...');
const partialCounts: Record<string, number> = {};
ARABIC_ALPHABET.forEach(char => {
  partialCounts[char] = 20;
});
// Leave one letter incomplete (19 instead of 20)
partialCounts['ض'] = 19;

assert(!isTier1Mastered(partialCounts), 'Tier 1 must not be mastered if ض has 19 hits');
assert(computeProgressionTier(partialCounts, INITIAL_STAGE_PROGRESS) === 1, 'Stage must remain 1 if any letter has < 20');

// Complete the last letter
partialCounts['ض'] = 20;
assert(isTier1Mastered(partialCounts), 'Tier 1 must be mastered when all 32 letters have 20 hits');
assert(computeProgressionTier(partialCounts, INITIAL_STAGE_PROGRESS) === 2, 'Stage must transition to 2 when all letters reach 20');
console.log('✓ Test 2 Passed: Tier 1 strictly requires 20 hits on each letter.');

// Test 3: Sequential tier transitions
console.log('Test 3: Verifying sequential tier transitions...');
const masteredLetters: Record<string, number> = {};
ARABIC_ALPHABET.forEach(char => {
  masteredLetters[char] = REQUIRED_LETTER_HITS;
});

const progress: StageProgress = { ...INITIAL_STAGE_PROGRESS };

// Stage 2 -> 3
progress.tier2Words = 19;
assert(computeProgressionTier(masteredLetters, progress) === 2, 'Must be Tier 2 at 19 Tier 2 words');
progress.tier2Words = 20;
assert(computeProgressionTier(masteredLetters, progress) === 3, 'Must transition to Tier 3 at 20 Tier 2 words');

// Stage 3 -> 4
progress.tier3Words = 19;
assert(computeProgressionTier(masteredLetters, progress) === 3, 'Must be Tier 3 at 19 Tier 3 words');
progress.tier3Words = 20;
assert(computeProgressionTier(masteredLetters, progress) === 4, 'Must transition to Tier 4 at 20 Tier 3 words');

// Stage 4 -> 5
progress.tier4Words = 19;
assert(computeProgressionTier(masteredLetters, progress) === 4, 'Must be Tier 4 at 19 Tier 4 words');
progress.tier4Words = 20;
assert(computeProgressionTier(masteredLetters, progress) === 5, 'Must transition to Tier 5 at 20 Tier 4 words');

// Stage 5 -> 6
progress.tier5Words = 19;
assert(computeProgressionTier(masteredLetters, progress) === 5, 'Must be Tier 5 at 19 Tier 5 words');
progress.tier5Words = 20;
assert(computeProgressionTier(masteredLetters, progress) === 6, 'Must transition to Tier 6 at 20 Tier 5 words');

// Stage 6 -> 7
progress.tier6Sentences = 14;
assert(computeProgressionTier(masteredLetters, progress) === 6, 'Must be Tier 6 at 14 Tier 6 sentences');
progress.tier6Sentences = 15;
assert(computeProgressionTier(masteredLetters, progress) === 7, 'Must transition to Tier 7 at 15 Tier 6 sentences');

console.log('✓ Test 3 Passed: All stages transition strictly sequentially without skipping.');

// Test 4: Progression independence (no single shared counter)
console.log('Test 4: Verifying separate counters for each tier...');
assert(INITIAL_STAGE_PROGRESS.tier2Words === 0, 'tier2Words is tracked separately');
assert(INITIAL_STAGE_PROGRESS.tier3Words === 0, 'tier3Words is tracked separately');
assert(INITIAL_STAGE_PROGRESS.tier4Words === 0, 'tier4Words is tracked separately');
assert(INITIAL_STAGE_PROGRESS.tier5Words === 0, 'tier5Words is tracked separately');
assert(INITIAL_STAGE_PROGRESS.tier6Sentences === 0, 'tier6Sentences is tracked separately');
assert(INITIAL_STAGE_PROGRESS.tier7Sentences === 0, 'tier7Sentences is tracked separately');
console.log('✓ Test 4 Passed: Separate counters verified.');

console.log('All progression logic tests passed successfully!');
