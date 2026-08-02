package com.cypy.mobile.core.network

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Interceptor responsible for appending the Authorization token to network requests.
 * Safely reads the authentication token from DataStore and injects it as a Bearer token.
 */
@Singleton
class AuthInterceptor @Inject constructor(
    private val dataStore: DataStore<Preferences>
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()

        // Check if the endpoint is marked as public (skips authentication)
        // Example: @Headers("No-Authentication: true") in Retrofit
        if (request.header(HEADER_NO_AUTH) != null) {
            // Remove the internal header before sending the request to the server
            val cleanRequest = request.newBuilder()
                .removeHeader(HEADER_NO_AUTH)
                .build()
            return chain.proceed(cleanRequest)
        }

        // Retrieve token synchronously (OkHttp interceptors run on background threads)
        val token = runBlocking {
            try {
                dataStore.data.map { preferences ->
                    preferences[PreferencesKeys.AUTH_TOKEN]
                }.first()
            } catch (e: Exception) {
                null
            }
        }

        val requestBuilder = request.newBuilder()

        // Append Bearer token if available
        if (!token.isNullOrBlank()) {
            requestBuilder.addHeader(
                ApiConstants.HEADER_AUTHORIZATION,
                "Bearer $token"
            )
        }

        return chain.proceed(requestBuilder.build())
    }

    companion object {
        /**
         * Header key used to mark API endpoints that do not require an authorization token.
         */
        const val HEADER_NO_AUTH = "No-Authentication"
    }
}

/**
 * Constants for DataStore preference keys used locally within the network layer.
 */
private object PreferencesKeys {
    val AUTH_TOKEN = stringPreferencesKey("auth_token")
}
