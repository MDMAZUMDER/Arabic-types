package com.arabictyping.app.ui.screens

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportScreen(
    viewModel: AppViewModel,
    onHome: () -> Unit,
    onRetry: (exerciseId: String, mode: String) -> Unit
) {
    val report by viewModel.latestReport.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "تقرير التمرين (Exercise Report)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = Color.White
                        )
                        Text(
                            text = report?.stageTitle ?: "",
                            fontSize = 12.sp,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BrandPrimary)
            )
        },
        containerColor = SurfaceBase
    ) { padding ->
        val rep = report
        if (rep == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "لا توجد بيانات متاحة (No report data)", color = TextSecondary)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Header Result Card (Clean Completion or Retry Needed)
                item {
                    val isClean = rep.isCleanCompletion
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isClean) FeedbackSuccess.copy(alpha = 0.1f) else FeedbackError.copy(alpha = 0.08f)
                        ),
                        border = BorderStroke(
                            1.5.dp,
                            if (isClean) FeedbackSuccess else FeedbackError.copy(alpha = 0.4f)
                        )
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = if (isClean) Icons.Default.CheckCircle else Icons.Default.Error,
                                contentDescription = null,
                                tint = if (isClean) FeedbackSuccess else FeedbackError,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = if (isClean) "إتقان تام بدون أي خطأ!" else "تم إنهاء المحاولة مع وجود أخطاء",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isClean) FeedbackSuccess else FeedbackError
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = if (isClean) {
                                    "أحسنت! تم فتح المستوى التالي وفق شروط الإتقان الصارمة."
                                } else {
                                    "وفق معايير المنهج، يشترط الإتمام بدون أخطاء للانتقال. حاول مرة أخرى!"
                                },
                                fontSize = 13.sp,
                                color = TextPrimary
                            )
                        }
                    }
                }

                // Metrics Grid (Accuracy & CPM)
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        MetricCard(
                            modifier = Modifier.weight(1f),
                            label = "نسبة الدقة (Accuracy)",
                            value = String.format(Locale.US, "%.1f%%", rep.accuracyPercent),
                            subtext = "${rep.correctCount} صحيح من ${rep.totalAttemptedCharacters}"
                        )

                        MetricCard(
                            modifier = Modifier.weight(1f),
                            label = "السرعة (CPM)",
                            value = String.format(Locale.US, "%.0f", rep.charactersPerMinute),
                            subtext = "حرف / دقيقة"
                        )
                    }
                }

                // Detailed Character Breakdown
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                        border = BorderStroke(1.dp, BorderSubtle)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "تفاصيل المدخلات والوقت",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(12.dp))

                            ReportRow(label = "عدد الحروف المستهدفة", value = "${rep.targetCharCount}")
                            ReportRow(label = "الحروف الصحيحة المقبولة", value = "${rep.correctCount}")
                            ReportRow(label = "عدد الضغطات الخاطئة", value = "${rep.mistakeCount}")
                            ReportRow(
                                label = "الوقت المستغرق",
                                value = String.format(Locale.US, "%.1f ثانية", rep.elapsedMs.toDouble() / 1000.0)
                            )
                        }
                    }
                }

                // Most Mistyped Arabic Keys
                if (rep.mostMistypedLetters.isNotEmpty()) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                            border = BorderStroke(1.dp, BorderSubtle)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "الحروف الأكثر تكراراً في الأخطاء",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = TextPrimary
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    rep.mostMistypedLetters.forEach { (char, count) ->
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = FeedbackError.copy(alpha = 0.1f),
                                            border = BorderStroke(1.dp, FeedbackError.copy(alpha = 0.3f))
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                                            ) {
                                                Text(
                                                    text = "'$char'",
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 16.sp,
                                                    color = FeedbackError
                                                )
                                                Text(
                                                    text = "($count)",
                                                    fontSize = 12.sp,
                                                    color = TextSecondary
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Actions: Retry & Home
                item {
                    Spacer(modifier = Modifier.height(10.dp))
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { onRetry(rep.exerciseId, rep.mode.name) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null)
                            Spacer(modifier = Modifier.size(6.dp))
                            Text(text = "إعادة التمرين (Retry Exercise)")
                        }

                        OutlinedButton(
                            onClick = onHome,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Home, contentDescription = null)
                            Spacer(modifier = Modifier.size(6.dp))
                            Text(text = "العودة للرئيسية (Home)")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricCard(
    modifier: Modifier = Modifier,
    label: String,
    value: String,
    subtext: String
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        border = BorderStroke(1.dp, BorderSubtle),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = label, fontSize = 11.sp, color = TextSecondary)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                fontWeight = FontWeight.Bold,
                fontSize = 24.sp,
                color = BrandPrimary
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtext, fontSize = 11.sp, color = BrandSecondary)
        }
    }
}

@Composable
private fun ReportRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 13.sp, color = TextSecondary)
        Text(text = value, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
    }
}
