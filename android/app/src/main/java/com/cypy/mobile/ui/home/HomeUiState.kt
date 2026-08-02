package com.cypy.mobile.ui.home

import com.cypy.mobile.data.model.RecentJob
import com.cypy.mobile.data.model.ServerStatus

/**
 * Represents the UI State for the Home Dashboard.
 * Holds all the data required to render the premium Home Screen.
 */
data class HomeUiState(
    val isLoading: Boolean = true,
    val userName: String = "User",
    val serverStatus: ServerStatus = ServerStatus.Connecting,
    val recentJobs: List<RecentJob> = emptyList(),
    val errorMessage: String? = null
)
