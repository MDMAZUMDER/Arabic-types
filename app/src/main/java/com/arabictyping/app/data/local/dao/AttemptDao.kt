package com.arabictyping.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.arabictyping.app.data.local.entity.AttemptMistakeEntity
import com.arabictyping.app.data.local.entity.ExerciseAttemptEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AttemptDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttempt(attempt: ExerciseAttemptEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMistakes(mistakes: List<AttemptMistakeEntity>)

    @Query("SELECT * FROM exercise_attempt WHERE exercise_id = :exerciseId ORDER BY completed_at DESC")
    fun getAttemptsForExercise(exerciseId: String): Flow<List<ExerciseAttemptEntity>>

    @Query("SELECT * FROM exercise_attempt WHERE is_clean_completion = 1 AND exercise_id = :exerciseId AND mode = :mode LIMIT 1")
    suspend fun getCleanAttempt(exerciseId: String, mode: String): ExerciseAttemptEntity?

    @Query("SELECT * FROM attempt_mistake WHERE attempt_id = :attemptId")
    suspend fun getMistakesForAttempt(attemptId: String): List<AttemptMistakeEntity>

    @Query("SELECT * FROM exercise_attempt ORDER BY completed_at DESC LIMIT 20")
    fun getRecentAttempts(): Flow<List<ExerciseAttemptEntity>>
}
