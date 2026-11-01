package com.arabictyping.app.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "learner_progress")
data class LearnerProgressEntity(
    @PrimaryKey
    val id: String = "local_learner",

    @ColumnInfo(name = "current_stage_id")
    val currentStageId: String = "stage_1",

    @ColumnInfo(name = "current_exercise_id")
    val currentExerciseId: String = "ex_1_1",

    @ColumnInfo(name = "guided_unlocked")
    val guidedUnlocked: Boolean = true,

    @ColumnInfo(name = "hint_unlocked")
    val hintUnlocked: Boolean = false,

    @ColumnInfo(name = "test_unlocked")
    val testUnlocked: Boolean = false,

    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)
