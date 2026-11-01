package com.arabictyping.app.data.seed

import com.arabictyping.app.data.local.entity.CurriculumStageEntity
import com.arabictyping.app.data.local.entity.ExerciseEntity

object CurriculumSeedData {

    val stages = listOf(
        CurriculumStageEntity(
            id = "stage_1",
            orderIndex = 1,
            title = "Stage 1: Individual Letters",
            titleAr = "المرحلة الأولى: الحروف الفردية",
            stageType = "LETTERS",
            isActive = true
        ),
        CurriculumStageEntity(
            id = "stage_2",
            orderIndex = 2,
            title = "Stage 2: Short Combinations",
            titleAr = "المرحلة الثانية: تراكيب قصيرة",
            stageType = "COMBINATIONS",
            isActive = true
        ),
        CurriculumStageEntity(
            id = "stage_3",
            orderIndex = 3,
            title = "Stage 3: Small Words",
            titleAr = "المرحلة الثالثة: كلمات قصيرة",
            stageType = "SMALL_WORDS",
            isActive = true
        ),
        CurriculumStageEntity(
            id = "stage_4",
            orderIndex = 4,
            title = "Stage 4: Medium Words",
            titleAr = "المرحلة الرابعة: كلمات متوسطة",
            stageType = "MEDIUM_WORDS",
            isActive = true
        ),
        CurriculumStageEntity(
            id = "stage_5",
            orderIndex = 5,
            title = "Stage 5: Longer Words",
            titleAr = "المرحلة الخامسة: كلمات أطول وأصعب",
            stageType = "LONG_WORDS",
            isActive = true
        ),
        CurriculumStageEntity(
            id = "stage_6",
            orderIndex = 6,
            title = "Stage 6: Short Sentences",
            titleAr = "المرحلة السادسة: جمل قصيرة",
            stageType = "SHORT_SENTENCES",
            isActive = true
        ),
        CurriculumStageEntity(
            id = "stage_7",
            orderIndex = 7,
            title = "Stage 7: Longer Sentences",
            titleAr = "المرحلة السابعة: جمل طويلة متكاملة",
            stageType = "LONG_SENTENCES",
            isActive = true
        )
    )

    val exercises = listOf(
        // Stage 1: Individual Letters
        ExerciseEntity("ex_1_1", "stage_1", 1, "ب", "LETTER"),
        ExerciseEntity("ex_1_2", "stage_1", 2, "ت", "LETTER"),
        ExerciseEntity("ex_1_3", "stage_1", 3, "ث", "LETTER"),
        ExerciseEntity("ex_1_4", "stage_1", 4, "ن", "LETTER"),
        ExerciseEntity("ex_1_5", "stage_1", 5, "ي", "LETTER"),
        ExerciseEntity("ex_1_6", "stage_1", 6, "س", "LETTER"),
        ExerciseEntity("ex_1_7", "stage_1", 7, "ش", "LETTER"),
        ExerciseEntity("ex_1_8", "stage_1", 8, "م", "LETTER"),
        ExerciseEntity("ex_1_9", "stage_1", 9, "ل", "LETTER"),
        ExerciseEntity("ex_1_10", "stage_1", 10, "ا", "LETTER"),

        // Stage 2: Short Combinations
        ExerciseEntity("ex_2_1", "stage_2", 1, "بت", "COMBINATION"),
        ExerciseEntity("ex_2_2", "stage_2", 2, "تب", "COMBINATION"),
        ExerciseEntity("ex_2_3", "stage_2", 3, "نت", "COMBINATION"),
        ExerciseEntity("ex_2_4", "stage_2", 4, "يس", "COMBINATION"),
        ExerciseEntity("ex_2_5", "stage_2", 5, "من", "COMBINATION"),
        ExerciseEntity("ex_2_6", "stage_2", 6, "لا", "COMBINATION"),
        ExerciseEntity("ex_2_7", "stage_2", 7, "بل", "COMBINATION"),
        ExerciseEntity("ex_2_8", "stage_2", 8, "سم", "COMBINATION"),

        // Stage 3: Small Words
        ExerciseEntity("ex_3_1", "stage_3", 1, "كتب", "WORD"),
        ExerciseEntity("ex_3_2", "stage_3", 2, "درس", "WORD"),
        ExerciseEntity("ex_3_3", "stage_3", 3, "علم", "WORD"),
        ExerciseEntity("ex_3_4", "stage_3", 4, "قلم", "WORD"),
        ExerciseEntity("ex_3_5", "stage_3", 5, "نور", "WORD"),
        ExerciseEntity("ex_3_6", "stage_3", 6, "شمس", "WORD"),
        ExerciseEntity("ex_3_7", "stage_3", 7, "بيت", "WORD"),

        // Stage 4: Medium Words
        ExerciseEntity("ex_4_1", "stage_4", 1, "مكتبة", "WORD"),
        ExerciseEntity("ex_4_2", "stage_4", 2, "مدرسة", "WORD"),
        ExerciseEntity("ex_4_3", "stage_4", 3, "كتابة", "WORD"),
        ExerciseEntity("ex_4_4", "stage_4", 4, "معلمة", "WORD"),
        ExerciseEntity("ex_4_5", "stage_4", 5, "طبيبة", "WORD"),
        ExerciseEntity("ex_4_6", "stage_4", 6, "مدينة", "WORD"),

        // Stage 5: Longer Words
        ExerciseEntity("ex_5_1", "stage_5", 1, "المستقبل", "WORD"),
        ExerciseEntity("ex_5_2", "stage_5", 2, "الاستمرار", "WORD"),
        ExerciseEntity("ex_5_3", "stage_5", 3, "المعرفة", "WORD"),
        ExerciseEntity("ex_5_4", "stage_5", 4, "التدريب", "WORD"),
        ExerciseEntity("ex_5_5", "stage_5", 5, "المتفوقين", "WORD"),

        // Stage 6: Short Sentences
        ExerciseEntity("ex_6_1", "stage_6", 1, "العلم نور", "SENTENCE"),
        ExerciseEntity("ex_6_2", "stage_6", 2, "الصبر مفتاح الفرج", "SENTENCE"),
        ExerciseEntity("ex_6_3", "stage_6", 3, "الوقت كالسيف", "SENTENCE"),
        ExerciseEntity("ex_6_4", "stage_6", 4, "العمل شرف", "SENTENCE"),

        // Stage 7: Longer Sentences
        ExerciseEntity("ex_7_1", "stage_7", 1, "من طلب العلا سهر الليالي", "SENTENCE"),
        ExerciseEntity("ex_7_2", "stage_7", 2, "التدريب المستمر طريق النجاح والإتقان", "SENTENCE"),
        ExerciseEntity("ex_7_3", "stage_7", 3, "لغتنا العربية لغة البيان والبلاغة", "SENTENCE")
    )
}
