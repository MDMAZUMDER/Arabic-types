package com.arabictyping.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = BrandPrimary,
    onPrimary = SurfaceCard,
    secondary = BrandSecondary,
    onSecondary = SurfaceCard,
    background = SurfaceBase,
    onBackground = TextPrimary,
    surface = SurfaceCard,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceBase,
    onSurfaceVariant = TextSecondary,
    outline = BorderSubtle,
    error = FeedbackError,
    onError = SurfaceCard
)

private val DarkColorScheme = darkColorScheme(
    primary = BrandSecondary,
    onPrimary = SurfaceCard,
    secondary = BrandPrimary,
    onSecondary = DarkTextPrimary,
    background = DarkSurfaceBase,
    onBackground = DarkTextPrimary,
    surface = DarkSurfaceCard,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkSurfaceBase,
    onSurfaceVariant = DarkTextSecondary,
    outline = DarkBorderSubtle,
    error = FeedbackError,
    onError = SurfaceCard
)

@Composable
fun ArabicTypingTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = if (darkTheme) DarkSurfaceBase.toArgb() else BrandPrimary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
