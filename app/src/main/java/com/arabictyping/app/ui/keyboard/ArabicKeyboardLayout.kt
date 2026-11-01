package com.arabictyping.app.ui.keyboard

object ArabicKeyboardLayout {

    // Row 1 (12 keys)
    val row1 = listOf('ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د')

    // Row 2 (11 keys)
    val row2 = listOf('ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط')

    // Row 3 (10 keys)
    val row3 = listOf('ئ', 'ء', 'ؤ', 'ر', 'ى', 'ة', 'و', 'ز', 'ظ')

    // All distinct Arabic characters supported on keyboard
    val allChars: Set<Char> by lazy {
        (row1 + row2 + row3 + listOf(' ')).toSet()
    }
}
