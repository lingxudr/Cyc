package com.cypy.mobile.data.model

/**
 * Represents the current connectivity and operational status of the FastAPI backend server.
 * Used across the application to display real-time server health.
 */
sealed class ServerStatus {
    /**
     * The server is online, reachable, and operating normally.
     */
    data object Online : ServerStatus()

    /**
     * The server is currently offline or cannot be reached.
     */
    data object Offline : ServerStatus()

    /**
     * The application is currently attempting to establish a connection with the server.
     */
    data object Connecting : ServerStatus()

    /**
     * An error occurred while communicating with the server.
     * 
     * @property message A descriptive error message explaining the failure.
     */
    data class Error(val message: String) : ServerStatus()
}
