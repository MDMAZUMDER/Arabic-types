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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
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
import com.arabictyping.app.data.local.entity.CurriculumStageEntity
import com.arabictyping.app.ui.theme.BorderSubtle
import com.arabictyping.app.ui.theme.BrandPrimary
import com.arabictyping.app.ui.theme.BrandSecondary
import com.arabictyping.app.ui.theme.FeedbackSuccess
import com.arabictyping.app.ui.theme.SurfaceBase
import com.arabictyping.app.ui.theme.SurfaceCard
import com.arabictyping.app.ui.theme.TextPrimary
import com.arabictyping.app.ui.theme.TextSecondary
import com.arabictyping.app.ui.viewmodel.AppViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: AppViewModel,
    onNavigateToStage: (String) -> Unit,
    onNavigateToExercise: (String, String) -> Unit
) {
    val stages by viewModel.stages.collectAsState()
    val progress by viewModel.learnerProgress.collectAsState()

    val currentStageId = progress?.currentStageId ?: "stage_1"
    val currentExerciseId = progress?.currentExerciseId ?: "ex_1_1"

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "تعلم الطباعة العربية",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp,
                            color = Color.White
                        )
                        Text(
                            text = "Arabic Typing Learning",
                            fontSize = 12.sp,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = BrandPrimary
                )
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
            // Quick Resume Banner Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = BrandPrimary),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp)
                    ) {
                        Text(
                            text = "المستوى الحالي • Current Progress",
                            color = BrandSecondary,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "المرحلة الأولى: الحروف الفردية",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {
                                onNavigateToExercise(currentExerciseId, "GUIDED")
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = BrandSecondary),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(modifier = Modifier.size(6.dp))
                            Text(text = "متابعة التدريب (Continue)")
                        }
                    }
                }
            }

            // Curriculum Title
            item {
                Text(
                    text = "منهج التدريب المتدرج (Curriculum)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = TextPrimary,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            // Stage List
            itemsIndexed(stages) { index, stage ->
                val stageNum = index + 1
                val isUnlocked = when {
                    stage.id == "stage_1" -> true
                    stage.id == currentStageId -> true
                    else -> {
                        // Check if stage order is <= current stage index
                        val currentStageOrder = stages.find { it.id == currentStageId }?.orderIndex ?: 1
                        stage.orderIndex <= currentStageOrder
                    }
                }

                StageCard(
                    stage = stage,
                    stageNumber = stageNum,
                    isUnlocked = isUnlocked,
                    isCurrent = stage.id == currentStageId,
                    onClick = {
                        if (isUnlocked) {
                            onNavigateToStage(stage.id)
                        }
                    }
                )
            }
        }
    }
}

@Composable
private fun StageCard(
    stage: CurriculumStageEntity,
    stageNumber: Int,
    isUnlocked: Boolean,
    isCurrent: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = isUnlocked, onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isCurrent) SurfaceCard else if (isUnlocked) SurfaceCard else Color(0xFFECEFF1)
        ),
        border = BorderStroke(
            width = if (isCurrent) 2.dp else 1.dp,
            color = if (isCurrent) BrandSecondary else BorderSubtle
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isCurrent) 3.dp else 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.weight(1f)
            ) {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (isCurrent) BrandSecondary else if (isUnlocked) BrandPrimary else Color(0xFFB0BEC5),
                    modifier = Modifier.size(42.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = stageNumber.toString(),
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }
                }

                Column {
                    Text(
                        text = stage.titleAr,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = if (isUnlocked) TextPrimary else TextSecondary
                    )
                    Text(
                        text = stage.title,
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
            }

            if (isUnlocked) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Open",
                    tint = if (isCurrent) BrandSecondary else TextSecondary
                )
            } else {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = "Locked",
                    tint = Color(0xFF90A4AE)
                )
            }
        }
    }
}
