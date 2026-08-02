package com.cypy.mobile.data.model

import java.util.Date

/**
 * Represents a recently processed translation or auto-crop job.
 *
 * @property id Unique identifier for the job.
 * @property title The title of the manga or image being processed.
 * @property status The current status of the job.
 * @property progress The completion percentage of the job (0 to 100).
 * @property timestamp The time the job was created or last updated.
 * @property type The type of job (e.g., Translation, Crop).
 */
data class RecentJob(
    val id: String,
    val title: String,
    val status: JobStatus,
    val progress: Int,
    val timestamp: Date,
    val type: JobType
)

/**
 * Defines the possible statuses for a background job.
 */
enum class JobStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED
}

/**
 * Defines the types of jobs the application handles.
 */
enum class JobType {
    TRANSLATION,
    AUTO_CROP
}
