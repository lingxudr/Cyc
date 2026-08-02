package com.cypy.mobile.core.network

import com.cypy.mobile.BuildConfig
import okhttp3.Interceptor
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Interceptor responsible for logging HTTP requests and responses.
 * Logging is only enabled in DEBUG builds to prevent leaking sensitive information in production.
 * Sensitive headers like Authorization and Cookies are automatically redacted.
 * Adjusts logging level dynamically to prevent OutOfMemory errors on large multipart uploads.
 */
@Singleton
class LoggingInterceptor @Inject constructor() : Interceptor {

    private val headersLoggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.HEADERS
        redactSensitiveHeaders(this)
    }

    private val bodyLoggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
        redactSensitiveHeaders(this)
    }

    private val noneLoggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.NONE
    }

    /**
     * Masks sensitive headers to ensure they are never printed in logs.
     *
     * @param interceptor The HttpLoggingInterceptor instance to configure.
     */
    private fun redactSensitiveHeaders(interceptor: HttpLoggingInterceptor) {
        interceptor.redactHeader(ApiConstants.HEADER_AUTHORIZATION)
        interceptor.redactHeader("Cookie")
        interceptor.redactHeader("Set-Cookie")
        interceptor.redactHeader("x-api-key")
        interceptor.redactHeader("api_key")
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        // Disable logging entirely in release builds
        if (!BuildConfig.DEBUG) {
            return noneLoggingInterceptor.intercept(chain)
        }

        val request = chain.request()
        val contentType = request.body?.contentType()?.toString() ?: ""

        // Use HEADERS level for multipart to avoid logging large file bodies.
        // Use BODY level for all other requests (like JSON).
        return if (contentType.contains("multipart", ignoreCase = true)) {
            headersLoggingInterceptor.intercept(chain)
        } else {
            bodyLoggingInterceptor.intercept(chain)
        }
    }
}
