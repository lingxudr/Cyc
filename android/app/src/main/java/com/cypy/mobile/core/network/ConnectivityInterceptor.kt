package com.cypy.mobile.core.network

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import dagger.hilt.android.qualifiers.ApplicationContext
import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Custom exception thrown when there is no internet connection available.
 */
class NoInternetException(message: String = "No internet connection available") : IOException(message)

/**
 * Interceptor that checks for internet connectivity before proceeding with a network request.
 * Throws a [NoInternetException] if the device is currently offline.
 */
@Singleton
class ConnectivityInterceptor @Inject constructor(
    @ApplicationContext private val context: Context
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        if (!isConnected()) {
            throw NoInternetException()
        }
        return chain.proceed(chain.request())
    }

    /**
     * Checks if the device has an active internet connection.
     * Uses NetworkCapabilities to verify actual internet access.
     *
     * @return true if connected to the internet, false otherwise.
     */
    private fun isConnected(): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false

        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }
}
