package com.arabictyping.app.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "exercise",
    foreignKeys = [
        ForeignKey(
            entity = CurriculumStageEntity::class,
            parentColumns = ["id"],
            childColumns = ["stage_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["stage_id", "order_index"])
    ]
)
data class ExerciseEntity(
    @PrimaryKey
    val id: String,

    @ColumnInfo(name = "stage_id")
    val stageId: String,

    @ColumnInfo(name = "order_index")
    val orderIndex: Int,

    @ColumnInfo(name = "target_text")
    val targetText: String,

    @ColumnInfo(name = "content_type")
    val contentType: String
)
