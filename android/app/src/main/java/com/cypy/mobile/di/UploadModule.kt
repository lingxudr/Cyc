package com.cypy.mobile.di

import com.cypy.mobile.data.repository.UploadRepositoryImpl
import com.cypy.mobile.domain.repository.UploadRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class UploadModule {

    @Binds
    @Singleton
    abstract fun bindUploadRepository(
        uploadRepositoryImpl: UploadRepositoryImpl
    ): UploadRepository
}
