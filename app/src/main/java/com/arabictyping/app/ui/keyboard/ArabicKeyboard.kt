package com.arabictyping.app.ui.keyboard

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Backspace
import androidx.compose.material.icons.filled.SpaceBar
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arabictyping.app.ui.theme.BorderSubtle
import com.arabictyping.app.ui.theme.BrandPrimary
import com.arabictyping.app.ui.theme.BrandSecondary
import com.arabictyping.app.ui.theme.FeedbackError
import com.arabictyping.app.ui.theme.FeedbackHint
import com.arabictyping.app.ui.theme.SurfaceCard
import com.arabictyping.app.ui.theme.TextPrimary

@Composable
fun ArabicKeyboard(
    modifier: Modifier = Modifier,
    highlightedChar: Char? = null,
    errorChar: Char? = null,
    isTestMode: Boolean = false,
    onKeyPress: (Char) -> Unit,
    onBackspace: () -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Row 1
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally)
        ) {
            ArabicKeyboardLayout.row1.forEach { char ->
                KeyButton(
                    modifier = Modifier.weight(1f),
                    char = char,
                    isHighlighted = !isTestMode && highlightedChar == char,
                    isError = errorChar == char,
                    onClick = { onKeyPress(char) }
                )
            }
        }

        // Row 2
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally)
        ) {
            ArabicKeyboardLayout.row2.forEach { char ->
                KeyButton(
                    modifier = Modifier.weight(1f),
                    char = char,
                    isHighlighted = !isTestMode && highlightedChar == char,
                    isError = errorChar == char,
                    onClick = { onKeyPress(char) }
                )
            }
        }

        // Row 3
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally)
        ) {
            ArabicKeyboardLayout.row3.forEach { char ->
                KeyButton(
                    modifier = Modifier.weight(1f),
                    char = char,
                    isHighlighted = !isTestMode && highlightedChar == char,
                    isError = errorChar == char,
                    onClick = { onKeyPress(char) }
                )
            }
        }

        // Row 4: Space bar and Backspace
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally)
        ) {
            // Space bar
            val isSpaceHighlighted = !isTestMode && highlightedChar == ' '
            val isSpaceError = errorChar == ' '
            val spaceBg by animateColorAsState(
                targetValue = when {
                    isSpaceError -> FeedbackError
                    isSpaceHighlighted -> FeedbackHint
                    else -> SurfaceCard
                },
                animationSpec = tween(durationMillis = 200),
                label = "spaceBg"
            )

            Surface(
                modifier = Modifier
                    .weight(3.5f)
                    .height(44.dp)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                        onClick = { onKeyPress(' ') }
                    ),
                shape = RoundedCornerShape(8.dp),
                color = spaceBg,
                border = BorderStroke(
                    width = if (isSpaceHighlighted) 2.dp else 1.dp,
                    color = if (isSpaceHighlighted) BrandSecondary else BorderSubtle
                ),
                shadowElevation = if (isSpaceHighlighted) 4.dp else 1.dp
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.SpaceBar,
                            contentDescription = "Space",
                            tint = if (isSpaceHighlighted || isSpaceError) Color.White else TextPrimary
                        )
                        Text(
                            text = "مسافة",
                            fontSize = 13.sp,
                            color = if (isSpaceHighlighted || isSpaceError) Color.White else TextPrimary
                        )
                    }
                }
            }

            // Backspace key
            Surface(
                modifier = Modifier
                    .weight(1.5f)
                    .height(44.dp)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                        onClick = onBackspace
                    ),
                shape = RoundedCornerShape(8.dp),
                color = SurfaceCard,
                border = BorderStroke(1.dp, BorderSubtle),
                shadowElevation = 1.dp
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.Backspace,
                        contentDescription = "Backspace",
                        tint = BrandPrimary
                    )
                }
            }
        }
    }
}

@Composable
private fun KeyButton(
    modifier: Modifier = Modifier,
    char: Char,
    isHighlighted: Boolean,
    isError: Boolean,
    onClick: () -> Unit
) {
    val bgColor by animateColorAsState(
        targetValue = when {
            isError -> FeedbackError
            isHighlighted -> FeedbackHint
            else -> SurfaceCard
        },
        animationSpec = tween(durationMillis = 180),
        label = "keyBg"
    )

    val textColor by animateColorAsState(
        targetValue = when {
            isError || isHighlighted -> Color.White
            else -> TextPrimary
        },
        animationSpec = tween(durationMillis = 180),
        label = "textColor"
    )

    Surface(
        modifier = modifier
            .height(44.dp)
            .scale(if (isHighlighted) 1.05f else 1.0f)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onClick
            ),
        shape = RoundedCornerShape(8.dp),
        color = bgColor,
        border = BorderStroke(
            width = if (isHighlighted) 2.dp else 1.dp,
            color = if (isHighlighted) BrandSecondary else BorderSubtle
        ),
        shadowElevation = if (isHighlighted) 4.dp else 1.dp
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = char.toString(),
                fontSize = 18.sp,
                fontWeight = if (isHighlighted) FontWeight.Bold else FontWeight.Medium,
                color = textColor,
                textAlign = TextAlign.Center
            )
        }
    }
}
