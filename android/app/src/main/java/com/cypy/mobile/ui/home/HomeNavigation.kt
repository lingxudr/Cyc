package com.cypy.mobile.ui.home

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavOptions
import androidx.navigation.compose.composable

/**
 * Navigation route for the Home Screen.
 */
const val HOME_ROUTE = "home_route"

/**
 * Extension function to navigate to the Home Screen.
 *
 * @param navOptions Optional navigation options.
 */
fun NavController.navigateToHome(navOptions: NavOptions? = null) {
    this.navigate(HOME_ROUTE, navOptions)
}

/**
 * Extension function to build the Home Screen destination in the Navigation Graph.
 *
 * @param onNavigateToTranslate Callback to navigate to the translation screen.
 * @param onNavigateToCrop Callback to navigate to the auto crop screen.
 * @param onNavigateToHistory Callback to navigate to the history screen.
 * @param onNavigateToSettings Callback to navigate to the settings screen.
 */
fun NavGraphBuilder.homeScreen(
    onNavigateToTranslate: () -> Unit,
    onNavigateToCrop: () -> Unit,
    onNavigateToHistory: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    composable(route = HOME_ROUTE) {
        HomeScreen(
            onNavigateToTranslate = onNavigateToTranslate,
            onNavigateToCrop = onNavigateToCrop,
            onNavigateToHistory = onNavigateToHistory,
            onNavigateToSettings = onNavigateToSettings
        )
    }
}
