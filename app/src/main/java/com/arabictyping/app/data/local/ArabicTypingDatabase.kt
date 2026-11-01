package com.arabictyping.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.arabictyping.app.data.local.dao.AttemptDao
import com.arabictyping.app.data.local.dao.CurriculumDao
import com.arabictyping.app.data.local.dao.ProgressDao
import com.arabictyping.app.data.local.entity.AttemptMistakeEntity
import com.arabictyping.app.data.local.entity.CurriculumStageEntity
import com.arabictyping.app.data.local.entity.ExerciseAttemptEntity
import com.arabictyping.app.data.local.entity.ExerciseEntity
import com.arabictyping.app.data.local.entity.LearnerProgressEntity

@Database(
    entities = [
        CurriculumStageEntity::class,
        ExerciseEntity::class,
        LearnerProgressEntity::class,
        ExerciseAttemptEntity::class,
        AttemptMistakeEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class ArabicTypingDatabase : RoomDatabase() {

    abstract fun curriculumDao(): CurriculumDao
    abstract fun progressDao(): ProgressDao
    abstract fun attemptDao(): AttemptDao

    companion object {
        @Volatile
        private var INSTANCE: ArabicTypingDatabase? = null

        fun getDatabase(context: Context): ArabicTypingDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ArabicTypingDatabase::class.java,
                    "arabic_typing.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
