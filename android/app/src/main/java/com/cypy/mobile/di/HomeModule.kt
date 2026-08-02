package com.cypy.mobile.di

import com.cypy.mobile.data.remote.api.HomeApi
import com.cypy.mobile.data.repository.HomeRepositoryImpl
import com.cypy.mobile.domain.repository.HomeRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

/**
 * Hilt module for providing Home module dependencies.
 */
@Module
@InstallIn(SingletonComponent::class)
abstract class HomeModule {

    /**
     * Binds the [HomeRepositoryImpl] to the [HomeRepository] interface.
     */
    @Binds
    @Singleton
    abstract fun bindHomeRepository(
        homeRepositoryImpl: HomeRepositoryImpl
    ): HomeRepository

    // Note: HomeApi provision has been moved to NetworkModule
}
