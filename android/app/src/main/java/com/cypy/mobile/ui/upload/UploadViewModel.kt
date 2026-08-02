package com.cypy.mobile.ui.upload

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cypy.mobile.core.file.FileManager
import com.cypy.mobile.core.file.ValidationResult
import com.cypy.mobile.domain.repository.JobStatusResult
import com.cypy.mobile.domain.repository.UploadRepository
import com.cypy.mobile.domain.repository.UploadResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

/**
 * Represents the UI state for the Upload screen.
 */
sealed class UploadUiState {
    data object Idle : UploadUiState()
    data class FileSelected(val uri: Uri, val name: String, val size: Long, val file: File) : UploadUiState()
    data class Uploading(val progress: Int) : UploadUiState()
    data class Processing(val jobId: String) : UploadUiState()
    data class Completed(val localFilePath: String) : UploadUiState()
    data class Error(val message: String) : UploadUiState()
}

/**
 * ViewModel for managing the file upload process.
 * Handles file selection, validation, uploading, and job status polling.
 */
@HiltViewModel
class UploadViewModel @Inject constructor(
    private val fileManager: FileManager,
    private val uploadRepository: UploadRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<UploadUiState>(UploadUiState.Idle)
    val uiState: StateFlow<UploadUiState> = _uiState.asStateFlow()

    private var pollingJob: Job? = null

    /**
     * Handles the selection of a file, extracting metadata and validating it.
     *
     * @param uri The URI of the selected file.
     */
    fun selectFile(uri: Uri) {
        viewModelScope.launch {
            val metadata = fileManager.getFileMetadata(uri)
            val validationResult = fileManager.validateFile(metadata)

            if (validationResult is ValidationResult.Error) {
                _uiState.update { UploadUiState.Error(validationResult.message) }
                return@launch
            }

            val file = fileManager.getFileFromUri(uri)
            if (file == null) {
                _uiState.update { UploadUiState.Error("Failed to process the selected file.") }
                return@launch
            }

            _uiState.update { 
                UploadUiState.FileSelected(
                    uri = uri,
                    name = metadata.name,
                    size = metadata.size,
                    file = file
                ) 
            }
        }
    }

    /**
     * Starts the upload process for the selected file.
     */
    fun startUpload() {
        val currentState = _uiState.value
        if (currentState !is UploadUiState.FileSelected) return

        viewModelScope.launch {
            _uiState.update { UploadUiState.Uploading(0) }
            
            uploadRepository.uploadFile(currentState.file).collect { result ->
                when (result) {
                    is UploadResult.Progress -> {
                        _uiState.update { UploadUiState.Uploading(result.percentage) }
                    }
                    is UploadResult.Success -> {
                        val jobId = result.jobId
                        _uiState.update { UploadUiState.Processing(jobId) }
                        startPollingJobStatus(jobId)
                    }
                    is UploadResult.Error -> {
                        _uiState.update { UploadUiState.Error(result.message) }
                    }
                }
            }
        }
    }

    /**
     * Polls the backend every 2 seconds to check the status of the processing job.
     * Includes a maximum number of retries for network errors and an overall timeout.
     *
     * @param jobId The unique ID of the job being processed.
     */
    private fun startPollingJobStatus(jobId: String) {
        pollingJob?.cancel()
        pollingJob = viewModelScope.launch {
            var errorCount = 0
            val maxErrors = 5
            val startTime = System.currentTimeMillis()
            val timeoutMs = 5 * 60 * 1000L // 5 minutes timeout

            while (true) {
                if (System.currentTimeMillis() - startTime > timeoutMs) {
                    _uiState.update { UploadUiState.Error("Job processing timed out.") }
                    break
                }

                val statusResult = uploadRepository.getJobStatus(jobId)
                
                when (statusResult) {
                    is JobStatusResult.Completed -> {
                        val downloadedFilePath = uploadRepository.downloadTranslatedFile(
                            statusResult.downloadUrl,
                            "translated_${jobId}_${System.currentTimeMillis()}"
                        )
                        if (downloadedFilePath != null) {
                            _uiState.update { UploadUiState.Completed(downloadedFilePath) }
                        } else {
                            _uiState.update { UploadUiState.Error("Failed to download translated file.") }
                        }
                        break
                    }
                    is JobStatusResult.Failed -> {
                        _uiState.update { UploadUiState.Error(statusResult.errorMessage) }
                        break
                    }
                    is JobStatusResult.Processing -> {
                        errorCount = 0 // Reset error count on successful status fetch
                        // Continue polling
                    }
                    is JobStatusResult.Error -> {
                        errorCount++
                        if (errorCount >= maxErrors) {
                            _uiState.update { UploadUiState.Error("Failed to check status after multiple attempts: ${statusResult.message}") }
                            break
                        }
                    }
                }
                delay(2000)
            }
        }
    }

    /**
     * Resets the UI state back to Idle and cancels any ongoing polling.
     */
    fun reset() {
        pollingJob?.cancel()
        _uiState.update { UploadUiState.Idle }
    }
    
    override fun onCleared() {
        super.onCleared()
        pollingJob?.cancel()
    }
}
