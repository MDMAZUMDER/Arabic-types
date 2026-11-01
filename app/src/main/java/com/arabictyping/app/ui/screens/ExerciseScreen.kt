package com.arabictyping.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arabictyping.app.domain.model.Mode
import com.arabictyping.app.domain.model.TypingState
import com.arabictyping.app.ui.keyboard.ArabicKeyboard
import com.arabictyping.app.ui.theme.BorderSubtle
import com.arabictyping.app.ui.theme.BrandPrimary
import com.arabictyping.app.ui.theme.BrandSecondary
import com.arabictyping.app.ui.theme.FeedbackError
import com.arabictyping.app.ui.theme.FeedbackSuccess
import com.arabictyping.app.ui.theme.SurfaceBase
import com.arabictyping.app.ui.theme.SurfaceCard
import com.arabictyping.app.ui.theme.TextPrimary
import com.arabictyping.app.ui.theme.TextSecondary
import com.arabictyping.app.ui.viewmodel.AppViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExerciseScreen(
    exerciseId: String,
    modeString: String,
    viewModel: AppViewModel,
    onBack: () -> Unit,
    onExerciseComplete: () -> Unit
) {
    val mode = try {
        Mode.valueOf(modeString.uppercase())
    } catch (_: Exception) {
        Mode.GUIDED
    }

    LaunchedEffect(exerciseId, mode) {
        viewModel.startExercise(exerciseId, mode)
    }

    val engineState by viewModel.typingEngineState.collectAsState()

    // Trigger navigation to report on completion
    LaunchedEffect(engineState.isComplete) {
        if (engineState.isComplete) {
            onExerciseComplete()
        }
    }

    val target = engineState.targetText
    val expectedIdx = engineState.expectedIndex
    val progressFraction = if (target.isNotEmpty()) {
        (expectedIdx.toFloat() / target.length.toFloat()).coerceIn(0f, 1f)
    } else 0f

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = engineState.stageTitle.ifEmpty { "تمرين الطباعة" },
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = when (mode) {
                                Mode.GUIDED -> "الوضع الإرشادي (Guided Mode)"
                                Mode.HINT -> "وضع التلميح (Hint Mode)"
                                Mode.TEST -> "وضع الاختبار (Test Mode)"
                            },
                            fontSize = 11.sp,
                            color = BrandSecondary
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.retryCurrentExercise() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Restart",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BrandPrimary)
            )
        },
        containerColor = SurfaceBase
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Top Section: Progress and Stats
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
            ) {
                LinearProgressIndicator(
                    progress = { progressFraction },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp),
                    color = BrandSecondary,
                    trackColor = BorderSubtle
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "الموضع: $expectedIdx / ${target.length}",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                    Text(
                        text = "الأخطاء: ${engineState.mistakeCount}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (engineState.mistakeCount > 0) FeedbackError else TextSecondary
                    )
                }
            }

            // Center Section: Arabic Text Display (RTL)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                    border = BorderStroke(1.dp, BorderSubtle),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // RTL text rendering
                        CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                            Row(
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                target.forEachIndexed { index, char ->
                                    val isTyped = index < expectedIdx
                                    val isCurrent = index == expectedIdx

                                    Box(
                                        modifier = Modifier
                                            .padding(horizontal = 2.dp)
                                            .background(
                                                color = if (isCurrent) BrandSecondary.copy(alpha = 0.2f) else Color.Transparent,
                                                shape = RoundedCornerShape(4.dp)
                                            )
                                            .padding(horizontal = 4.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = char.toString(),
                                            fontSize = 38.sp,
                                            fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.SemiBold,
                                            color = when {
                                                isTyped -> FeedbackSuccess
                                                isCurrent -> BrandPrimary
                                                else -> Color(0xFFB0BEC5)
                                            }
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Feedback on error
                        AnimatedVisibility(
                            visible = engineState.typingState == TypingState.ERROR_FEEDBACK,
                            enter = fadeIn(),
                            exit = fadeOut()
                        ) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = FeedbackError.copy(alpha = 0.12f),
                                border = BorderStroke(1.dp, FeedbackError.copy(alpha = 0.3f))
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = null,
                                        tint = FeedbackError,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = if (mode == Mode.HINT) "مفتاح خاطئ - تم تحديد المفتاح الصحيح كتلميح!" else "مفتاح خاطئ - اضغط المفتاح المطلوب للمتابعة",
                                        fontSize = 12.sp,
                                        color = FeedbackError,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Bottom Section: Built-in Arabic Keyboard
            ArabicKeyboard(
                highlightedChar = engineState.highlightedChar,
                errorChar = engineState.lastErrorChar,
                isTestMode = mode == Mode.TEST,
                onKeyPress = { char ->
                    viewModel.onKeyPress(char)
                },
                onBackspace = {
                    viewModel.onBackspace()
                }
            )
        }
    }
}
