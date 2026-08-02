package com.cypy.mobile.data.repository

import com.cypy.mobile.data.model.JobStatus
import com.cypy.mobile.data.model.JobType
import com.cypy.mobile.data.model.RecentJob
import com.cypy.mobile.data.model.ServerStatus
import com.cypy.mobile.data.remote.api.HomeApi
import com.cypy.mobile.domain.repository.HomeRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.util.Date
import javax.inject.Inject

/**
 * Implementation of the [HomeRepository] interface.
 * Handles data fetching from the [HomeApi] and other local sources.
 *
 * @property homeApi The Retrofit API interface for home-related network calls.
 */
class HomeRepositoryImpl @Inject constructor(
    private val homeApi: HomeApi
) : HomeRepository {

    override fun getServerStatus(): Flow<ServerStatus> = flow {
        emit(ServerStatus.Connecting)
        try {
            val response = homeApi.checkServerHealth()
            if (response.isSuccessful) {
                emit(ServerStatus.Online)
            } else {
                emit(ServerStatus.Error("Server returned code: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(ServerStatus.Offline)
        }
    }

    override fun getRecentJobs(): Flow<List<RecentJob>> = flow {
        // Mocking recent jobs data for now. 
        // This can be easily replaced with an actual API or Room database call later.
        val dummyJobs = listOf(
            RecentJob(
                id = "job_1",
                title = "Solo Leveling Ch. 150",
                status = JobStatus.COMPLETED,
                progress = 100,
                timestamp = Date(),
                type = JobType.TRANSLATION
            ),
            RecentJob(
                id = "job_2",
                title = "One Piece Ch. 1090",
                status = JobStatus.PROCESSING,
                progress = 45,
                timestamp = Date(),
                type = JobType.AUTO_CROP
            )
        )
        emit(dummyJobs)
    }

    override fun getUserName(): Flow<String> = flow {
        // Mocking user name for now.
        // Can be replaced with DataStore or Room logic later.
        emit("Alex")
    }
}
