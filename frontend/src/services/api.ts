import axios from 'axios';

// API Base URL - default to backend endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for file uploads
  headers: {
    'Accept': 'application/json',
  },
});

console.log("API BASE URL =", API_BASE_URL);

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  cypy_engine_available: boolean;
}

export interface EngineInfo {
  name: string;
  version: string;
  supported_formats: string[];
  features: string[];
  default_target_lang: string;
  available_providers: string[];
}

export type JobStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface JobStatusResponse {
  job_id: string;
  status: JobStatusType;
  message: string;
  progress: number;
  created_at: string;
  completed_at?: string;
  input_filename: string;
  output_filename?: string;
}

export interface TranslationSubmitResponse {
  job_id: string;
  status: JobStatusType;
  message: string;
}

export const cypyApi = {
  /**
   * Health check for API and CYPY engine
   */
  async checkHealth(): Promise<HealthStatus> {
    const response = await apiClient.get<HealthStatus>('/health');
    return response.data;
  },

  /**
   * Get engine capabilities and supported providers
   */
  async getEngineInfo(): Promise<EngineInfo> {
    const response = await apiClient.get<EngineInfo>('/engine');
    return response.data;
  },

  /**
   * Submit single image for translation
   */
  async translateImage(
    file: File,
    targetLang: string = 'en',
    provider: string = 'google',
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<TranslationSubmitResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<TranslationSubmitResponse>(
      '/translate/image',
      formData,
      {
        params: { target_lang: targetLang, provider },
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      }
    );
    return response.data;
  },

  /**
   * Submit PDF document for translation
   */
  async translatePdf(
    file: File,
    targetLang: string = 'en',
    provider: string = 'google',
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<TranslationSubmitResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<TranslationSubmitResponse>(
      '/translate/pdf',
      formData,
      {
        params: { target_lang: targetLang, provider },
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      }
    );
    return response.data;
  },

  /**
   * Submit compressed archive (ZIP/CBZ/RAR) for translation
   */
  async translateArchive(
    file: File,
    targetLang: string = 'en',
    provider: string = 'google',
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<TranslationSubmitResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<TranslationSubmitResponse>(
      '/translate/archive',
      formData,
      {
        params: { target_lang: targetLang, provider },
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      }
    );
    return response.data;
  },

  /**
   * Get status & progress for a specific translation job
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await apiClient.get<JobStatusResponse>(`/job/${jobId}`);
    return response.data;
  },

  /**
   * Get direct download URL for a completed job result
   */
  getDownloadUrl(jobId: string): string {
    const baseURL = apiClient.defaults.baseURL || '/api/v1';
    return `${baseURL}/download/${jobId}`;
  },
};
