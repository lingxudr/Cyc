package com.cypy.mobile.core.network

/**
 * Constants used across the network layer.
 * Defines timeouts, base URL, and common HTTP headers.
 */
object ApiConstants {
    /**
     * Timeout duration for establishing a network connection (in seconds).
     */
    const val CONNECT_TIMEOUT = 60L

    /**
     * Timeout duration for reading data from the network (in seconds).
     */
    const val READ_TIMEOUT = 60L

    /**
     * Timeout duration for writing data to the network (in seconds).
     */
    const val WRITE_TIMEOUT = 60L

    /**
     * Maximum number of automatic retries for failed network requests.
     */
    const val MAX_RETRY_ATTEMPTS = 3

    /**
     * Base URL for the FastAPI backend.
     * Note: In a production environment, this is typically overridden by BuildConfig.BASE_URL.
     * 10.0.2.2 is the default localhost alias for the Android emulator.
     */
    const val BASE_URL = "http://10.0.2.2:8000/"

    /**
     * Standard HTTP Authorization header key.
     */
    const val HEADER_AUTHORIZATION = "Authorization"

    /**
     * Standard HTTP Content-Type header key.
     */
    const val HEADER_CONTENT_TYPE = "Content-Type"

    /**
     * Value for JSON content type.
     */
    const val CONTENT_TYPE_JSON = "application/json"

    /**
     * Value for Multipart form data content type.
     */
    const val CONTENT_TYPE_MULTIPART = "multipart/form-data"
}
