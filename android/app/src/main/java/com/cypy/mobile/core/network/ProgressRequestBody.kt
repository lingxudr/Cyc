package com.cypy.mobile.core.network

import okhttp3.MediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody
import okio.BufferedSink
import java.io.File
import java.io.FileInputStream

/**
 * A custom RequestBody that tracks upload progress.
 */
class ProgressRequestBody(
    private val file: File,
    private val contentType: String,
    private val onProgressUpdate: (percentage: Int) -> Unit
) : RequestBody() {

    override fun contentType(): MediaType? {
        return contentType.toMediaTypeOrNull()
    }

    override fun contentLength(): Long {
        return file.length()
    }

    override fun writeTo(sink: BufferedSink) {
        val length = file.length()
        val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
        val fileInputStream = FileInputStream(file)
        var uploaded = 0L

        fileInputStream.use { inputStream ->
            var read: Int
            while (inputStream.read(buffer).also { read = it } != -1) {
                uploaded += read
                sink.write(buffer, 0, read)
                val progress = ((uploaded.toDouble() / length.toDouble()) * 100).toInt()
                onProgressUpdate(progress)
            }
        }
    }
}
