package com.cypy.mobile.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cypy.mobile.domain.repository.HomeRepository
import com.cypy.mobile.data.model.ServerStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for the Home Dashboard.
 * Manages the UI state, fetching server status, and recent jobs.
 * 
 * @property homeRepository The repository for fetching home data.
 */
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val homeRepository: HomeRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        fetchDashboardData()
    }

    /**
     * Fetches data for the dashboard (Server status, user data, recent jobs) from the repository.
     */
    private fun fetchDashboardData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            
            combine(
                homeRepository.getUserName(),
                homeRepository.getServerStatus(),
                homeRepository.getRecentJobs()
            ) { userName, serverStatus, recentJobs ->
                HomeUiState(
                    isLoading = false,
                    userName = userName,
                    serverStatus = serverStatus,
                    recentJobs = recentJobs,
                    errorMessage = null
                )
            }.collect { newState ->
                _uiState.value = newState
            }
        }
    }

    /**
     * Refreshes the server status.
     */
    fun refreshServerStatus() {
        viewModelScope.launch {
            _uiState.update { it.copy(serverStatus = ServerStatus.Connecting) }
            homeRepository.getServerStatus().collect { status ->
                _uiState.update { it.copy(serverStatus = status) }
            }
        }
    }
}
