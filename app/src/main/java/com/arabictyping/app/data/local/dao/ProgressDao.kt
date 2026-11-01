package com.arabictyping.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.arabictyping.app.data.local.entity.LearnerProgressEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ProgressDao {

    @Query("SELECT * FROM learner_progress WHERE id = :id LIMIT 1")
    fun getLearnerProgress(id: String = "local_learner"): Flow<LearnerProgressEntity?>

    @Query("SELECT * FROM learner_progress WHERE id = :id LIMIT 1")
    suspend fun getLearnerProgressOnce(id: String = "local_learner"): LearnerProgressEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateProgress(progress: LearnerProgressEntity)

    @Update
    suspend fun updateProgress(progress: LearnerProgressEntity)
}
