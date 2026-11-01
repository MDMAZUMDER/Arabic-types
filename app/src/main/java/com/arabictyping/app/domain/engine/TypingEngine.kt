package com.arabictyping.app.domain.engine

import com.arabictyping.app.domain.model.MistakeRecord
import com.arabictyping.app.domain.model.Mode
import com.arabictyping.app.domain.model.ReportData
import com.arabictyping.app.domain.model.TypingState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class TypingEngineState(
    val exerciseId: String = "",
    val stageTitle: String = "",
    val targetText: String = "",
    val mode: Mode = Mode.GUIDED,
    val expectedIndex: Int = 0,
    val typedText: String = "",
    val highlightedChar: Char? = null,
    val lastErrorChar: Char? = null,
    val mistakeCount: Int = 0,
    val correctCount: Int = 0,
    val typingState: TypingState = TypingState.EXERCISE_READY,
    val isComplete: Boolean = false,
    val reportData: ReportData? = null
)

class TypingEngine {

    private val _state = MutableStateFlow(TypingEngineState())
    val state: StateFlow<TypingEngineState> = _state.asStateFlow()

    private var startTimeMs: Long = 0L
    private val recordedMistakes = mutableListOf<MistakeRecord>()

    fun startExercise(
        exerciseId: String,
        stageTitle: String,
        targetText: String,
        mode: Mode
    ) {
        startTimeMs = 0L
        recordedMistakes.clear()

        val initialHighlight = if (mode == Mode.GUIDED && targetText.isNotEmpty()) {
            targetText[0]
        } else {
            null
        }

        _state.value = TypingEngineState(
            exerciseId = exerciseId,
            stageTitle = stageTitle,
            targetText = targetText,
            mode = mode,
            expectedIndex = 0,
            typedText = "",
            highlightedChar = initialHighlight,
            lastErrorChar = null,
            mistakeCount = 0,
            correctCount = 0,
            typingState = TypingState.EXERCISE_READY,
            isComplete = false,
            reportData = null
        )
    }

    fun handleKeyPress(pressedChar: Char) {
        val current = _state.value
        if (current.isComplete || current.targetText.isEmpty()) return

        if (startTimeMs == 0L) {
            startTimeMs = System.currentTimeMillis()
        }

        val expectedChar = current.targetText[current.expectedIndex]

        if (pressedChar == expectedChar) {
            // Correct key press
            val newIndex = current.expectedIndex + 1
            val newTyped = current.typedText + pressedChar
            val isFinished = newIndex >= current.targetText.length

            val nextHighlight = if (!isFinished && current.mode == Mode.GUIDED) {
                current.targetText[newIndex]
            } else {
                null
            }

            if (isFinished) {
                val endTimeMs = System.currentTimeMillis()
                val elapsed = maxOf(1L, endTimeMs - startTimeMs)
                val report = ReportData(
                    exerciseId = current.exerciseId,
                    stageTitle = current.stageTitle,
                    targetText = current.targetText,
                    mode = current.mode,
                    startedAt = startTimeMs,
                    completedAt = endTimeMs,
                    elapsedMs = elapsed,
                    targetCharCount = current.targetText.length,
                    correctCount = current.correctCount + 1,
                    mistakeCount = current.mistakeCount,
                    mistakes = recordedMistakes.toList()
                )

                _state.value = current.copy(
                    expectedIndex = newIndex,
                    typedText = newTyped,
                    highlightedChar = null,
                    lastErrorChar = null,
                    correctCount = current.correctCount + 1,
                    typingState = TypingState.EXERCISE_COMPLETE,
                    isComplete = true,
                    reportData = report
                )
            } else {
                _state.value = current.copy(
                    expectedIndex = newIndex,
                    typedText = newTyped,
                    highlightedChar = nextHighlight,
                    lastErrorChar = null,
                    correctCount = current.correctCount + 1,
                    typingState = TypingState.EXERCISE_ACTIVE
                )
            }
        } else {
            // Incorrect key press: does NOT advance expectedIndex
            val mistake = MistakeRecord(
                expectedChar = expectedChar,
                pressedChar = pressedChar,
                positionIndex = current.expectedIndex
            )
            recordedMistakes.add(mistake)

            val hintHighlight = when (current.mode) {
                Mode.GUIDED -> expectedChar
                Mode.HINT -> expectedChar // Reveal hint on mistake
                Mode.TEST -> null // Never highlight in test mode
            }

            _state.value = current.copy(
                highlightedChar = hintHighlight,
                lastErrorChar = pressedChar,
                mistakeCount = current.mistakeCount + 1,
                typingState = TypingState.ERROR_FEEDBACK
            )
        }
    }

    fun handleBackspace() {
        val current = _state.value
        if (current.expectedIndex > 0 && !current.isComplete) {
            val newIndex = current.expectedIndex - 1
            val newTyped = current.typedText.dropLast(1)
            val highlight = if (current.mode == Mode.GUIDED) {
                current.targetText[newIndex]
            } else {
                null
            }

            // Note: Retain historical mistake count per PRD policy
            _state.value = current.copy(
                expectedIndex = newIndex,
                typedText = newTyped,
                highlightedChar = highlight,
                lastErrorChar = null,
                typingState = TypingState.EXERCISE_ACTIVE
            )
        }
    }
}
