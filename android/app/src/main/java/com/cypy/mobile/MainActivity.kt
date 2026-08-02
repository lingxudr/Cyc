package com.cypy.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.cypy.mobile.ui.home.HomeScreen
import com.cypy.mobile.ui.home.HOME_ROUTE
import com.cypy.mobile.ui.home.homeScreen
import com.cypy.mobile.ui.upload.UploadScreen
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()

                    NavHost(navController = navController, startDestination = HOME_ROUTE) {
                        homeScreen(
                            onNavigateToTranslate = { navController.navigate("upload_route") },
                            onNavigateToCrop = { },
                            onNavigateToHistory = { },
                            onNavigateToSettings = { }
                        )

                        composable("upload_route") {
                            UploadScreen(
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
