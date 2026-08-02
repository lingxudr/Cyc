package com.cypy.mobile.core.file

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.webkit.MimeTypeMap
import com.cypy.mobile.domain.model.FileType
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Utility class to handle file operations, URI resolutions, and validations.
 */
@Singleton
class FileManager @Inject constructor(
    @ApplicationContext private val context: Context
) {

    companion object {
        const val MAX_FILE_SIZE_BYTES = 50L * 1024 * 1024 // 50 MB
        private const val CACHE_DIR_NAME = "cypy_uploads"
    }

    /**
     * Copies the content of a [Uri] to a temporary cached [File] so it can be uploaded.
     * 
     * @param uri The URI of the selected file.
     * @return The cached [File] or null if the operation failed.
     */
    suspend fun getFileFromUri(uri: Uri): File? = withContext(Dispatchers.IO) {
        try {
            val fileName = getFileName(uri) ?: "upload_${System.currentTimeMillis()}"
            val cacheDir = File(context.cacheDir, CACHE_DIR_NAME).apply { mkdirs() }
            val tempFile = File(cacheDir, fileName)

            context.contentResolver.openInputStream(uri)?.use { inputStream ->
                FileOutputStream(tempFile).use { outputStream ->
                    inputStream.copyTo(outputStream)
                }
            }
            tempFile
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Retrieves metadata for a given [Uri].
     * 
     * @param uri The URI of the file.
     * @return A [FileMetadata] object containing the name, size, mime type, and file type.
     */
    fun getFileMetadata(uri: Uri): FileMetadata {
        val name = getFileName(uri) ?: "Unknown"
        val size = getFileSize(uri)
        val mimeType = getMimeType(uri) ?: "application/octet-stream"
        val fileType = determineFileType(mimeType, name)

        return FileMetadata(name, size, mimeType, fileType)
    }

    /**
     * Validates the file based on its size and type.
     */
    fun validateFile(metadata: FileMetadata): ValidationResult {
        if (metadata.size > MAX_FILE_SIZE_BYTES) {
            return ValidationResult.Error("File size exceeds 50MB limit.")
        }
        if (metadata.fileType == FileType.UNKNOWN) {
            return ValidationResult.Error("Unsupported file type.")
        }
        return ValidationResult.Success
    }

    private fun getFileName(uri: Uri): String? {
        var name: String? = null
        if (uri.scheme == "content") {
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (index != -1) {
                        name = cursor.getString(index)
                    }
                }
            }
        }
        if (name == null) {
            name = uri.path?.substringAfterLast('/')
        }
        return name
    }

    private fun getFileSize(uri: Uri): Long {
        var size = 0L
        if (uri.scheme == "content") {
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val index = cursor.getColumnIndex(OpenableColumns.SIZE)
                    if (index != -1) {
                        size = cursor.getLong(index)
                    }
                }
            }
        }
        if (size == 0L) {
            context.contentResolver.openAssetFileDescriptor(uri, "r")?.use {
                size = it.length
            }
        }
        return size
    }

    private fun getMimeType(uri: Uri): String? {
        return if (uri.scheme == "content") {
            context.contentResolver.getType(uri)
        } else {
            val extension = MimeTypeMap.getFileExtensionFromUrl(uri.toString())
            MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.lowercase())
        }
    }

    private fun determineFileType(mimeType: String, fileName: String): FileType {
        return when {
            mimeType.startsWith("image/") -> FileType.IMAGE
            mimeType == "application/pdf" -> FileType.PDF
            mimeType == "application/zip" || mimeType == "application/x-zip-compressed" || fileName.endsWith(".zip", ignoreCase = true) -> FileType.ZIP
            mimeType == "application/x-cbz" || mimeType == "application/vnd.comicbook+zip" || fileName.endsWith(".cbz", ignoreCase = true) -> FileType.CBZ
            else -> FileType.UNKNOWN
        }
    }
}

/**
 * Holds metadata extracted from a file URI.
 */
data class FileMetadata(
    val name: String,
    val size: Long,
    val mimeType: String,
    val fileType: FileType
)

/**
 * Result of a file validation operation.
 */
sealed class ValidationResult {
    data object Success : ValidationResult()
    data class Error(val message: String) : ValidationResult()
}
