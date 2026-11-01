package com.arabictyping.app.domain.model

data class MistakeRecord(
    val expectedChar: Char,
    val pressedChar: Char,
    val positionIndex: Int,
    val timestamp: Long = System.currentTimeMillis()
)

data class ReportData(
    val exerciseId: String,
    val stageTitle: String,
    val targetText: String,
    val mode: Mode,
    val startedAt: Long,
    val completedAt: Long,
    val elapsedMs: Long,
    val targetCharCount: Int,
    val correctCount: Int,
    val mistakeCount: Int,
    val mistakes: List<MistakeRecord> = emptyList(),
    val isCleanCompletion: Boolean = (mistakeCount == 0 && correctCount >= targetCharCount)
) {
    val totalAttemptedCharacters: Int
        get() = correctCount + mistakeCount

    val accuracyPercent: Double
        get() = if (totalAttemptedCharacters > 0) {
            (correctCount.toDouble() / totalAttemptedCharacters.toDouble()) * 100.0
        } else {
            0.0
        }

    val charactersPerMinute: Double
        get() = if (elapsedMs > 0) {
            val minutes = elapsedMs.toDouble() / 60000.0
            correctCount.toDouble() / minutes
        } else {
            0.0
        }

    val mostMistypedLetters: List<Pair<Char, Int>>
        get() = mistakes
            .groupBy { it.expectedChar }
            .mapValues { it.value.size }
            .toList()
            .sortedByDescending { it.second }
            .take(5)
}
