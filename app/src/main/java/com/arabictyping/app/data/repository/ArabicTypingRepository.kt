package com.arabictyping.app.data.repository

import com.arabictyping.app.data.local.dao.AttemptDao
import com.arabictyping.app.data.local.dao.CurriculumDao
import com.arabictyping.app.data.local.dao.ProgressDao
import com.arabictyping.app.data.local.entity.AttemptMistakeEntity
import com.arabictyping.app.data.local.entity.CurriculumStageEntity
import com.arabictyping.app.data.local.entity.ExerciseAttemptEntity
import com.arabictyping.app.data.local.entity.ExerciseEntity
import com.arabictyping.app.data.local.entity.LearnerProgressEntity
import com.arabictyping.app.data.seed.CurriculumSeedData
import com.arabictyping.app.domain.model.Mode
import com.arabictyping.app.domain.model.ReportData
import kotlinx.coroutines.flow.Flow
import java.util.UUID

class ArabicTypingRepository(
    private val curriculumDao: CurriculumDao,
    private val progressDao: ProgressDao,
    private val attemptDao: AttemptDao
) {

    suspend fun initializeDatabaseIfNeeded() {
        val count = curriculumDao.getStageCount()
        if (count == 0) {
            curriculumDao.insertStages(CurriculumSeedData.stages)
            curriculumDao.insertExercises(CurriculumSeedData.exercises)
            progressDao.insertOrUpdateProgress(
                LearnerProgressEntity(
                    id = "local_learner",
                    currentStageId = "stage_1",
                    currentExerciseId = "ex_1_1",
                    guidedUnlocked = true,
                    hintUnlocked = false,
                    testUnlocked = false,
                    updatedAt = System.currentTimeMillis()
                )
            )
        }
    }

    fun getAllStages(): Flow<List<CurriculumStageEntity>> = curriculumDao.getAllStages()

    fun getExercisesForStage(stageId: String): Flow<List<ExerciseEntity>> =
        curriculumDao.getExercisesForStage(stageId)

    suspend fun getExerciseById(exerciseId: String): ExerciseEntity? =
        curriculumDao.getExerciseById(exerciseId)

    suspend fun getStageById(stageId: String): CurriculumStageEntity? =
        curriculumDao.getStageById(stageId)

    fun getLearnerProgress(): Flow<LearnerProgressEntity?> =
        progressDao.getLearnerProgress()

    suspend fun recordAttempt(report: ReportData): Boolean {
        val attemptId = UUID.randomUUID().toString()

        val attemptEntity = ExerciseAttemptEntity(
            id = attemptId,
            exerciseId = report.exerciseId,
            mode = report.mode.name,
            startedAt = report.startedAt,
            completedAt = report.completedAt,
            elapsedMs = report.elapsedMs,
            targetCharCount = report.targetCharCount,
            correctCount = report.correctCount,
            mistakeCount = report.mistakeCount,
            isCleanCompletion = report.isCleanCompletion
        )

        attemptDao.insertAttempt(attemptEntity)

        if (report.mistakes.isNotEmpty()) {
            val mistakeEntities = report.mistakes.map { m ->
                AttemptMistakeEntity(
                    id = UUID.randomUUID().toString(),
                    attemptId = attemptId,
                    expectedChar = m.expectedChar.toString(),
                    pressedChar = m.pressedChar.toString(),
                    positionIndex = m.positionIndex,
                    occurredAt = m.timestamp
                )
            }
            attemptDao.insertMistakes(mistakeEntities)
        }

        // Progression & Unlock logic from PRD & STATE.md:
        // A clean completion (0 mistakes) is required to unlock subsequent modes or stages.
        if (report.isCleanCompletion) {
            val currentProgress = progressDao.getLearnerProgressOnce() ?: LearnerProgressEntity()

            when (report.mode) {
                Mode.GUIDED -> {
                    // Completing Guided unlocks Hint Mode for this exercise
                    val updated = currentProgress.copy(
                        hintUnlocked = true,
                        updatedAt = System.currentTimeMillis()
                    )
                    progressDao.insertOrUpdateProgress(updated)
                }
                Mode.HINT -> {
                    // Completing Hint unlocks Test Mode for this exercise
                    val updated = currentProgress.copy(
                        testUnlocked = true,
                        updatedAt = System.currentTimeMillis()
                    )
                    progressDao.insertOrUpdateProgress(updated)
                }
                Mode.TEST -> {
                    // Clean completion in Test Mode unlocks the next exercise or next stage
                    advanceToNextContent(currentProgress)
                }
            }
            return true
        } else {
            // Any mistake means learner stays on current step and retries
            return false
        }
    }

    private suspend fun advanceToNextContent(currentProgress: LearnerProgressEntity) {
        val allExercises = CurriculumSeedData.exercises
        val currentIndex = allExercises.indexOfFirst { it.id == currentProgress.currentExerciseId }

        if (currentIndex != -1 && currentIndex < allExercises.size - 1) {
            val nextExercise = allExercises[currentIndex + 1]
            val updated = currentProgress.copy(
                currentStageId = nextExercise.stageId,
                currentExerciseId = nextExercise.id,
                guidedUnlocked = true,
                hintUnlocked = false, // Must earn Hint by completing Guided cleanly
                testUnlocked = false, // Must earn Test by completing Hint cleanly
                updatedAt = System.currentTimeMillis()
            )
            progressDao.insertOrUpdateProgress(updated)
        }
    }

    fun getRecentAttempts(): Flow<List<ExerciseAttemptEntity>> =
        attemptDao.getRecentAttempts()
}
