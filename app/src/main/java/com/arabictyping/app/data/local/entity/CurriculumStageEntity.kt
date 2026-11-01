package com.arabictyping.app.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "curriculum_stage")
data class CurriculumStageEntity(
    @PrimaryKey
    val id: String,

    @ColumnInfo(name = "order_index")
    val orderIndex: Int,

    val title: String,

    @ColumnInfo(name = "title_ar")
    val titleAr: String,

    @ColumnInfo(name = "stage_type")
    val stageType: String,

    @ColumnInfo(name = "is_active")
    val isActive: Boolean = true
)
