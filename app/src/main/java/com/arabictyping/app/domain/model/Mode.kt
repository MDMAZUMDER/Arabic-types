package com.arabictyping.app.domain.model

enum class Mode(val title: String, val description: String) {
    GUIDED(
        title = "Guided Mode (الإرشادي)",
        description = "Shows the target text and highlights the next key. Advances only on correct input."
    ),
    HINT(
        title = "Hint Mode (التلميح)",
        description = "No initial highlights. If you make a mistake, the correct key flashes as a hint."
    ),
    TEST(
        title = "Test Mode (الاختبار)",
        description = "No highlights or hints. Type independently and record your accuracy and speed."
    )
}
