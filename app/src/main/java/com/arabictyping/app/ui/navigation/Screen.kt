package com.arabictyping.app.ui.navigation

sealed class Screen(val route: String) {
    data object Home : Screen("home")
    data object StageOverview : Screen("stage_overview/{stageId}") {
        fun createRoute(stageId: String) = "stage_overview/$stageId"
    }
    data object ModeSelection : Screen("mode_selection/{exerciseId}") {
        fun createRoute(exerciseId: String) = "mode_selection/$exerciseId"
    }
    data object Exercise : Screen("exercise/{exerciseId}/{mode}") {
        fun createRoute(exerciseId: String, mode: String) = "exercise/$exerciseId/$mode"
    }
    data object Report : Screen("report")
}
