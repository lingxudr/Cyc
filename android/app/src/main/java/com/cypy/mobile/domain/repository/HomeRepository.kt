package com.cypy.mobile.domain.repository

import com.cypy.mobile.data.model.RecentJob
import com.cypy.mobile.data.model.ServerStatus
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for the Home Dashboard.
 * Defines the contract for fetching server status and recent jobs.
 * Follows the Clean Architecture pattern by keeping business logic separate from implementation.
 */
interface HomeRepository {
    
    /**
     * Checks the current health status of the FastAPI backend server.
     * 
     * @return A [Flow] emitting the current [ServerStatus].
     */
    fun getServerStatus(): Flow<ServerStatus>

    /**
     * Retrieves a list of recently processed translation or auto-crop jobs.
     * 
     * @return A [Flow] emitting a list of [RecentJob]s.
     */
    fun getRecentJobs(): Flow<List<RecentJob>>

    /**
     * Retrieves the current user's name.
     * 
     * @return A [Flow] emitting the user's name as a [String].
     */
    fun getUserName(): Flow<String>
}
