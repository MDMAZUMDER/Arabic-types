package com.arabictyping.app.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "exercise_attempt",
    indices = [
        Index(value = ["exercise_id", "mode", "completed_at"])
    ]
)
data class ExerciseAttemptEntity(
    @PrimaryKey
    val id: String,

    @ColumnInfo(name = "exercise_id")
    val exerciseId: String,

    val mode: String,

    @ColumnInfo(name = "started_at")
    val startedAt: Long,

    @ColumnInfo(name = "completed_at")
    val completedAt: Long?,

    @ColumnInfo(name = "elapsed_ms")
    val elapsedMs: Long,

    @ColumnInfo(name = "target_char_count")
    val targetCharCount: Int,

    @ColumnInfo(name = "correct_count")
    val correctCount: Int,

    @ColumnInfo(name = "mistake_count")
    val mistakeCount: Int,

    @ColumnInfo(name = "is_clean_completion")
    val isCleanCompletion: Boolean
)
