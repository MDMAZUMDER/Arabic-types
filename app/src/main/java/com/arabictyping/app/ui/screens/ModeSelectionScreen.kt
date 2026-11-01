package com.arabictyping.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Highlight
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arabictyping.app.domain.model.Mode
import com.arabictyping.app.ui.theme.BorderSubtle
import com.arabictyping.app.ui.theme.BrandPrimary
import com.arabictyping.app.ui.theme.BrandSecondary
import com.arabictyping.app.ui.theme.FeedbackHint
import com.arabictyping.app.ui.theme.FeedbackSuccess
import com.arabictyping.app.ui.theme.SurfaceBase
import com.arabictyping.app.ui.theme.SurfaceCard
import com.arabictyping.app.ui.theme.TextPrimary
import com.arabictyping.app.ui.theme.TextSecondary
import com.arabictyping.app.ui.viewmodel.AppViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ModeSelectionScreen(
    exerciseId: String,
    viewModel: AppViewModel,
    onBack: () -> Unit,
    onSelectMode: (Mode) -> Unit
) {
    LaunchedEffect(exerciseId) {
        viewModel.loadExercise(exerciseId)
    }

    val exercise by viewModel.selectedExercise.collectAsState()
    val progress by viewModel.learnerProgress.collectAsState()

    // Unlock rule from PRD:
    // Guided is unlocked.
    // Hint unlocks after clean Guided completion.
    // Test unlocks after clean Guided + Hint completion.
    val isGuidedUnlocked = progress?.guidedUnlocked ?: true
    val isHintUnlocked = progress?.hintUnlocked ?: false
    val isTestUnlocked = progress?.testUnlocked ?: false

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "اختيار وضع التدريب",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = Color.White
                        )
                        Text(
                            text = "Select Learning Mode",
                            fontSize = 12.sp,
                            color = Color.White.copy(alpha = 0.8f)
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
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BrandPrimary)
            )
        },
        containerColor = SurfaceBase
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Target Exercise Preview Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                    border = BorderStroke(1.dp, BorderSubtle),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "النص المستهدف (Target Text)",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = exercise?.targetText ?: "",
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold,
                            color = BrandPrimary
                        )
                    }
                }
            }

            // Mode 1: Guided Mode
            item {
                ModeCard(
                    mode = Mode.GUIDED,
                    titleAr = "الوضع الإرشادي (Guided)",
                    description = "إضاءة الحرف المطلوب مسبقاً على لوحة المفاتيح. لا يتقدم المؤشر إلا عند الضغط الصحيح.",
                    icon = Icons.Default.Highlight,
                    iconColor = BrandSecondary,
                    isUnlocked = isGuidedUnlocked,
                    unlockRequirement = "متاح تلقائياً في البداية",
                    onClick = { onSelectMode(Mode.GUIDED) }
                )
            }

            // Mode 2: Hint Mode
            item {
                ModeCard(
                    mode = Mode.HINT,
                    titleAr = "وضع التلميح (Hint)",
                    description = "بدون إضاءة مسبقة. تظهر إضاءة الحرف فقط كتلميح عند ارتكاب خطأ للمساعدة في التصحيح.",
                    icon = Icons.Default.HelpOutline,
                    iconColor = FeedbackHint,
                    isUnlocked = isHintUnlocked,
                    unlockRequirement = "يُفتح عند إتمام الوضع الإرشادي بدون أي خطأ (Clean Completion)",
                    onClick = { onSelectMode(Mode.HINT) }
                )
            }

            // Mode 3: Test Mode
            item {
                ModeCard(
                    mode = Mode.TEST,
                    titleAr = "وضع الاختبار (Test)",
                    description = "بدون أي إضاءة أو تلميحات. تسجيل دقيق للدقة والسرعة وقائمة الأخطاء الشائعة.",
                    icon = Icons.Default.Speed,
                    iconColor = FeedbackSuccess,
                    isUnlocked = isTestUnlocked,
                    unlockRequirement = "يُفتح بعد إتمام وضعي الإرشاد والتلميح بنجاح تام",
                    onClick = { onSelectMode(Mode.TEST) }
                )
            }
        }
    }
}

@Composable
private fun ModeCard(
    mode: Mode,
    titleAr: String,
    description: String,
    icon: ImageVector,
    iconColor: Color,
    isUnlocked: Boolean,
    unlockRequirement: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = isUnlocked, onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isUnlocked) SurfaceCard else Color(0xFFECEFF1)
        ),
        border = BorderStroke(
            width = 1.dp,
            color = if (isUnlocked) iconColor.copy(alpha = 0.5f) else BorderSubtle
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isUnlocked) 2.dp else 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (isUnlocked) iconColor.copy(alpha = 0.15f) else Color(0xFFCFD8DC),
                        modifier = Modifier.size(38.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = icon,
                                contentDescription = null,
                                tint = if (isUnlocked) iconColor else Color(0xFF78909C)
                            )
                        }
                    }
                    Text(
                        text = titleAr,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = if (isUnlocked) TextPrimary else TextSecondary
                    )
                }

                if (isUnlocked) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Start",
                        tint = iconColor
                    )
                } else {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = "Locked",
                            tint = Color(0xFF78909C),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "مغلق",
                            fontSize = 12.sp,
                            color = Color(0xFF78909C),
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = description,
                fontSize = 13.sp,
                color = if (isUnlocked) TextSecondary else Color(0xFF90A4AE),
                lineHeight = 18.sp
            )

            if (!isUnlocked) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "• الشرط: $unlockRequirement",
                    fontSize = 11.sp,
                    color = BrandSecondary,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
