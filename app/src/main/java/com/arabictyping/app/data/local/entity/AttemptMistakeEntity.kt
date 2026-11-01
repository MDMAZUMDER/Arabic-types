package com.arabictyping.app.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "attempt_mistake",
    foreignKeys = [
        ForeignKey(
            entity = ExerciseAttemptEntity::class,
            parentColumns = ["id"],
            childColumns = ["attempt_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["attempt_id"])
    ]
)
data class AttemptMistakeEntity(
    @PrimaryKey
    val id: String,

    @ColumnInfo(name = "attempt_id")
    val attemptId: String,

    @ColumnInfo(name = "expected_char")
    val expectedChar: String,

    @ColumnInfo(name = "pressed_char")
    val pressedChar: String,

    @ColumnInfo(name = "position_index")
    val positionIndex: Int,

    @ColumnInfo(name = "occurred_at")
    val occurredAt: Long
)
