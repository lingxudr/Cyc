package com.cypy.mobile.domain.repository

import kotlinx.coroutines.flow.Flow
import java.io.File

/**
 * Repository interface for managing file uploads and job status tracking.
 */
interface UploadRepository {
    /**
     * Uploads a file to the backend for processing.
     *
     * @param file The file to upload.
     * @return A Flow emitting the progress and the final result.
     */
    fun uploadFile(file: File): Flow<UploadResult>

    /**
     * Retrieves the current status of a processing job.
     *
     * @param jobId The unique ID of the job.
     * @return The status of the job.
     */
    suspend fun getJobStatus(jobId: String): JobStatusResult

    /**
     * Downloads the translated file from the provided URL.
     *
     * @param downloadUrl The URL from which to download the file.
     * @param fileName The desired name for the downloaded file.
     * @return The absolute path to the downloaded file, or null if it failed.
     */
    suspend fun downloadTranslatedFile(downloadUrl: String, fileName: String): String?
}

/**
 * Represents the result of an upload operation.
 */
sealed class UploadResult {
    data class Progress(val percentage: Int) : UploadResult()
    data class Success(val jobId: String) : UploadResult()
    data class Error(val message: String) : UploadResult()
}

/**
 * Represents the result of a job status check.
 */
sealed class JobStatusResult {
    data class Completed(val downloadUrl: String) : JobStatusResult()
    data class Failed(val errorMessage: String) : JobStatusResult()
    data object Processing : JobStatusResult()
    data class Error(val message: String) : JobStatusResult()
}
