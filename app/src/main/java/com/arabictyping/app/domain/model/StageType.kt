package com.arabictyping.app.domain.model

enum class StageType(val displayName: String, val arabicName: String) {
    LETTERS("1. Individual Arabic Letters", "الحروف الفردية"),
    COMBINATIONS("2. Short Combinations", "تراكيب قصيرة"),
    SMALL_WORDS("3. Small Words", "كلمات قصيرة"),
    MEDIUM_WORDS("4. Medium Words", "كلمات متوسطة"),
    LONG_WORDS("5. Longer Words", "كلمات طويلة وصعبة"),
    SHORT_SENTENCES("6. Short Sentences", "جمل قصيرة"),
    LONG_SENTENCES("7. Longer Sentences", "جمل طويلة");

    companion object {
        fun fromString(value: String): StageType = try {
            valueOf(value.uppercase())
        } catch (_: Exception) {
            LETTERS
        }
    }
}
