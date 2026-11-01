/**
 * Arabic Typing Game - Progression Logic
 * Strict, sequential learning progression without skips.
 */

// All standard Arabic letters that must be mastered in Stage 1
export const ARABIC_ALPHABET = [
  'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر',
  'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف',
  'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ة', 'ى',
  'ء', 'ؤ'
];

// Tier 2: Very Short Words (strictly 2–3 letters)
export const TIER2_VERY_SHORT_WORDS = [
  'يد', 'أب', 'أم', 'دم', 'فم', 'أخ', 'هو', 'هي', 'قل', 'عد',
  'كتب', 'درس', 'علم', 'نور', 'قلم', 'شمس', 'بيت', 'ورد', 'قمر', 'بحر'
];

// Tier 3: Short Words (strictly 4–5 letters)
export const TIER3_SHORT_WORDS = [
  'كتاب', 'سماء', 'طريق', 'مدينة', 'معلم', 'حياة', 'أزهار', 'حديقة',
  'مدرسة', 'طبيعة', 'جميل', 'صباح', 'مساء', 'سلام', 'أشجار', 'بلادي'
];

// Tier 4: Medium Words (strictly 6–8 letters)
export const TIER4_MEDIUM_WORDS = [
  'المعرفة', 'التدريب', 'المتفوق', 'المعلمون', 'الجامعة', 'المكتبة',
  'الكتابة', 'الحدائق', 'المستقبل', 'المدارس', 'التعليم', 'الأصدقاء'
];

// Tier 5: Long Words (strictly 9+ letters)
export const TIER5_LONG_WORDS = [
  'المتفوقين', 'المسؤوليات', 'الاستكشافات', 'المستودعات', 'الاستراتيجية',
  'المواصلات', 'المستشفيات', 'الديمقراطية', 'الاستعدادات', 'الاستمرار'
];

// Tier 6: Short Sentences
export const TIER6_SHORT_SENTENCES = [
  'العلم نور',
  'الوقت كالسيف',
  'الصبر مفتاح الفرج',
  'العمل شرف',
  'الصدق منجاة',
  'النظافة من الإيمان'
];

// Tier 7: Long Sentences
export const TIER7_LONG_SENTENCES = [
  'من طلب العلا سهر الليالي',
  'التدريب المستمر طريق النجاح والإتقان',
  'لغتنا العربية لغة البيان والبلاغة',
  'خير جليس في الزمان كتاب',
  'في التأني السلامة وفي العجلة الندامة'
];

// Target requirements for each stage
export const REQUIRED_LETTER_HITS = 20; // Each letter must be typed at least 20 times
export const REQUIRED_TIER2_WORDS = 20;  // 2-3 letter words
export const REQUIRED_TIER3_WORDS = 20;  // 4-5 letter words
export const REQUIRED_TIER4_WORDS = 20;  // 6-8 letter words
export const REQUIRED_TIER5_WORDS = 20;  // 9+ letter words
export const REQUIRED_TIER6_SENTENCES = 15; // Short sentences

export interface StageProgress {
  tier2Words: number;
  tier3Words: number;
  tier4Words: number;
  tier5Words: number;
  tier6Sentences: number;
  tier7Sentences: number;
}

export const INITIAL_STAGE_PROGRESS: StageProgress = {
  tier2Words: 0,
  tier3Words: 0,
  tier4Words: 0,
  tier5Words: 0,
  tier6Sentences: 0,
  tier7Sentences: 0
};

/**
 * Checks if Tier 1 (Individual letters) is 100% completed.
 * Every letter in ARABIC_ALPHABET must have count >= REQUIRED_LETTER_HITS (20).
 */
export function isTier1Mastered(letterCounts: Record<string, number>): boolean {
  return ARABIC_ALPHABET.every(char => (letterCounts[char] || 0) >= REQUIRED_LETTER_HITS);
}

/**
 * Computes the active progression tier strictly and sequentially.
 * A stage is unlocked ONLY when the previous stage has fully met its requirement.
 */
export function computeProgressionTier(
  letterCounts: Record<string, number>,
  stageProgress: StageProgress
): number {
  // Stage 1: Individual Letters
  if (!isTier1Mastered(letterCounts)) {
    return 1;
  }

  // Stage 2: Very Short Words (2–3 letters)
  if (stageProgress.tier2Words < REQUIRED_TIER2_WORDS) {
    return 2;
  }

  // Stage 3: Short Words (4–5 letters)
  if (stageProgress.tier3Words < REQUIRED_TIER3_WORDS) {
    return 3;
  }

  // Stage 4: Medium Words (6–8 letters)
  if (stageProgress.tier4Words < REQUIRED_TIER4_WORDS) {
    return 4;
  }

  // Stage 5: Long Words (9+ letters)
  if (stageProgress.tier5Words < REQUIRED_TIER5_WORDS) {
    return 5;
  }

  // Stage 6: Short Sentences
  if (stageProgress.tier6Sentences < REQUIRED_TIER6_SENTENCES) {
    return 6;
  }

  // Stage 7: Long Sentences (Ongoing Mastery)
  return 7;
}
