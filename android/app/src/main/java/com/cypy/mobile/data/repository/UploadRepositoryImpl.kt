package com.cypy.mobile.data.repository

import android.webkit.MimeTypeMap
import com.cypy.mobile.core.network.ProgressRequestBody
import com.cypy.mobile.data.remote.api.HomeApi
import com.cypy.mobile.domain.repository.JobStatusResult
import com.cypy.mobile.domain.repository.UploadRepository
import com.cypy.mobile.domain.repository.UploadResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MultipartBody
import java.io.File
import java.io.FileOutputStream
import javax.inject.Inject
import javax.inject.Singleton
import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext

@Singleton
class UploadRepositoryImpl @Inject constructor(
    private val api: HomeApi,
    @ApplicationContext private val context: Context
) : UploadRepository {

    override fun uploadFile(file: File): Flow<UploadResult> = callbackFlow {
        val extension = MimeTypeMap.getFileExtensionFromUrl(file.path)
        val mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.lowercase()) ?: "application/octet-stream"

        val progressBody = ProgressRequestBody(file, mimeType) { progress ->
            trySend(UploadResult.Progress(progress))
        }

        val body = MultipartBody.Part.createFormData("file", file.name, progressBody)

        launch(Dispatchers.IO) {
            try {
                val response = api.uploadFile(body)
                if (response.isSuccessful && response.body() != null) {
                    trySend(UploadResult.Success(response.body()!!.job_id))
                } else {
                    trySend(UploadResult.Error("Upload failed: ${response.code()} ${response.message()}"))
                }
            } catch (e: Exception) {
                trySend(UploadResult.Error(e.localizedMessage ?: "Unknown error occurred"))
            } finally {
                close()
            }
        }
        
        awaitClose { }
    }.flowOn(Dispatchers.IO)

    override suspend fun getJobStatus(jobId: String): JobStatusResult {
        return try {
            val response = api.getJobStatus(jobId)
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                when (body.status.lowercase()) {
                    "completed" -> JobStatusResult.Completed(body.download_url ?: "")
                    "failed" -> JobStatusResult.Failed(body.error_message ?: "Unknown error")
                    else -> JobStatusResult.Processing
                }
            } else {
                JobStatusResult.Error("Status check failed: ${response.code()} ${response.message()}")
            }
        } catch (e: Exception) {
            JobStatusResult.Error(e.localizedMessage ?: "Unknown error occurred")
        }
    }

    override suspend fun downloadTranslatedFile(downloadUrl: String, fileName: String): String? {
        return withContext(Dispatchers.IO) {
            try {
                val response = api.downloadFile(downloadUrl)
                if (response.isSuccessful) {
                    val body = response.body()
                    if (body != null) {
                        val downloadsDir = File(context.cacheDir, "cypy_downloads")
                        if (!downloadsDir.exists()) downloadsDir.mkdirs()

                        val destinationFile = File(downloadsDir, fileName)
                        val inputStream = body.byteStream()
                        val outputStream = FileOutputStream(destinationFile)

                        inputStream.use { input ->
                            outputStream.use { output ->
                                input.copyTo(output)
                            }
                        }
                        destinationFile.absolutePath
                    } else {
                        null
                    }
                } else {
                    null
                }
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }
}
