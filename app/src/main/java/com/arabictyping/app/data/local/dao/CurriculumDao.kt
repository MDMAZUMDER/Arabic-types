package com.arabictyping.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.arabictyping.app.data.local.entity.CurriculumStageEntity
import com.arabictyping.app.data.local.entity.ExerciseEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CurriculumDao {

    @Query("SELECT * FROM curriculum_stage WHERE is_active = 1 ORDER BY order_index ASC")
    fun getAllStages(): Flow<List<CurriculumStageEntity>>

    @Query("SELECT * FROM curriculum_stage WHERE id = :stageId LIMIT 1")
    suspend fun getStageById(stageId: String): CurriculumStageEntity?

    @Query("SELECT * FROM exercise WHERE stage_id = :stageId ORDER BY order_index ASC")
    fun getExercisesForStage(stageId: String): Flow<List<ExerciseEntity>>

    @Query("SELECT * FROM exercise WHERE id = :exerciseId LIMIT 1")
    suspend fun getExerciseById(exerciseId: String): ExerciseEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStages(stages: List<CurriculumStageEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExercises(exercises: List<ExerciseEntity>)

    @Query("SELECT COUNT(*) FROM curriculum_stage")
    suspend fun getStageCount(): Int
}
