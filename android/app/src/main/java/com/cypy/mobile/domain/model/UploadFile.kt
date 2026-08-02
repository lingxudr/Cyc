package com.cypy.mobile.domain.model

import android.net.Uri
import java.io.File

/**
 * Represents a file selected by the user for translation or processing.
 * Holds metadata, upload progress, and validation state.
 *
 * @property id Unique identifier for this upload instance.
 * @property uri The original content URI from the Android system.
 * @property file The physical file cached in local storage for upload, if processed.
 * @property name The display name of the file.
 * @property size The size of the file in bytes.
 * @property mimeType The MIME type of the file.
 * @property fileType The categorized type of the file (Image, PDF, Archive).
 * @property status The current status of the file upload process.
 * @property progress The upload progress percentage (0 to 100).
 * @property errorMessage Any error message encountered during validation or upload.
 */
data class UploadFile(
    val id: String,
    val uri: Uri,
    val file: File? = null,
    val name: String,
    val size: Long,
    val mimeType: String,
    val fileType: FileType,
    val status: UploadStatus = UploadStatus.PENDING,
    val progress: Int = 0,
    val errorMessage: String? = null
)

/**
 * Categorized file types supported by the CYPY translator.
 */
enum class FileType {
    IMAGE,
    PDF,
    CBZ,
    ZIP,
    UNKNOWN
}

/**
 * Represents the current lifecycle state of the upload.
 */
enum class UploadStatus {
    PENDING,
    VALIDATING,
    READY,
    UPLOADING,
    COMPLETED,
    FAILED
}
