package com.arabictyping.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.arabictyping.app.ui.screens.ExerciseScreen
import com.arabictyping.app.ui.screens.HomeScreen
import com.arabictyping.app.ui.screens.ModeSelectionScreen
import com.arabictyping.app.ui.screens.ReportScreen
import com.arabictyping.app.ui.screens.StageOverviewScreen
import com.arabictyping.app.ui.viewmodel.AppViewModel

@Composable
fun AppNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController,
    viewModel: AppViewModel = viewModel()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route,
        modifier = modifier
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                viewModel = viewModel,
                onNavigateToStage = { stageId ->
                    navController.navigate(Screen.StageOverview.createRoute(stageId))
                },
                onNavigateToExercise = { exerciseId, mode ->
                    navController.navigate(Screen.Exercise.createRoute(exerciseId, mode))
                }
            )
        }

        composable(
            route = Screen.StageOverview.route,
            arguments = listOf(navArgument("stageId") { type = NavType.StringType })
        ) { backStackEntry ->
            val stageId = backStackEntry.arguments?.getString("stageId") ?: "stage_1"
            StageOverviewScreen(
                stageId = stageId,
                viewModel = viewModel,
                onBack = { navController.popBackStack() },
                onSelectExercise = { exerciseId ->
                    navController.navigate(Screen.ModeSelection.createRoute(exerciseId))
                }
            )
        }

        composable(
            route = Screen.ModeSelection.route,
            arguments = listOf(navArgument("exerciseId") { type = NavType.StringType })
        ) { backStackEntry ->
            val exerciseId = backStackEntry.arguments?.getString("exerciseId") ?: "ex_1_1"
            ModeSelectionScreen(
                exerciseId = exerciseId,
                viewModel = viewModel,
                onBack = { navController.popBackStack() },
                onSelectMode = { mode ->
                    navController.navigate(Screen.Exercise.createRoute(exerciseId, mode.name))
                }
            )
        }

        composable(
            route = Screen.Exercise.route,
            arguments = listOf(
                navArgument("exerciseId") { type = NavType.StringType },
                navArgument("mode") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val exerciseId = backStackEntry.arguments?.getString("exerciseId") ?: "ex_1_1"
            val mode = backStackEntry.arguments?.getString("mode") ?: "GUIDED"
            ExerciseScreen(
                exerciseId = exerciseId,
                modeString = mode,
                viewModel = viewModel,
                onBack = { navController.popBackStack() },
                onExerciseComplete = {
                    navController.navigate(Screen.Report.route) {
                        popUpTo(Screen.Exercise.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Report.route) {
            ReportScreen(
                viewModel = viewModel,
                onHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                },
                onRetry = { exerciseId, mode ->
                    navController.navigate(Screen.Exercise.createRoute(exerciseId, mode)) {
                        popUpTo(Screen.Report.route) { inclusive = true }
                    }
                }
            )
        }
    }
}
