package com.cypy.mobile.data.remote.api

import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

/**
 * Retrofit API interface for Home Dashboard and upload related network calls.
 * Communicates with the FastAPI backend.
 */
interface HomeApi {
    /**
     * Checks the health status of the FastAPI backend server.
     * 
     * @return A Retrofit [Response] containing a Unit representing success or failure.
     */
    @GET("/health")
    suspend fun checkServerHealth(): Response<Unit>

    /**
     * Uploads a file for translation.
     * 
     * @param file The file to translate as a MultipartBody.Part
     * @return A Retrofit [Response] containing the Job ID response.
     */
    @Multipart
    @POST("/translate/image")
    suspend fun uploadFile(
        @Part file: MultipartBody.Part
    ): Response<JobResponse>

    /**
     * Retrieves the status of an ongoing translation job.
     * 
     * @param jobId The ID of the job.
     * @return A Retrofit [Response] containing the Job Status response.
     */
    @GET("/translate/job/{jobId}")
    suspend fun getJobStatus(
        @Path("jobId") jobId: String
    ): Response<JobStatusDto>

    /**
     * Downloads a file from the given URL.
     *
     * @param url The dynamic URL of the file to download.
     * @return A Retrofit [Response] containing the file's ResponseBody.
     */
    @GET
    suspend fun downloadFile(
        @retrofit2.http.Url url: String
    ): Response<okhttp3.ResponseBody>
}

data class JobResponse(
    val job_id: String
)

data class JobStatusDto(
    val status: String,
    val download_url: String?,
    val error_message: String?
)
