import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cypyApi, JobStatusResponse, JobStatusType } from '../services/api';

export interface TranslationJobState {
  id: string;
  file: File;
  previewUrl: string;
  targetLang: string;
  provider: string;
  status: JobStatusType | 'UPLOADING' | 'CANCELED';
  progress: number;
  message: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  resultPreviewUrl?: string;
  error?: string;
}

export function useTranslation() {
  const queryClient = useQueryClient();
  const [jobs, setJobs] = useState<TranslationJobState[]>([]);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Helper to update a specific job in local state
  const updateJob = useCallback((id: string, update: Partial<TranslationJobState>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...update } : job))
    );
  }, []);

  // Submit job mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      targetLang,
      provider,
      clientJobId,
    }: {
      file: File;
      targetLang: string;
      provider: string;
      clientJobId: string;
    }) => {
      const controller = new AbortController();
      abortControllersRef.current.set(clientJobId, controller);

      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const isPdf = fileExt === 'pdf';
      const isArchive = ['zip', 'cbz', 'rar', 'cbr'].includes(fileExt);

      updateJob(clientJobId, { status: 'UPLOADING', progress: 5, message: 'Uploading file...' });

      let response;
      const onProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          updateJob(clientJobId, { progress: Math.min(percentCompleted * 0.3, 30) });
        }
      };

      if (isPdf) {
        response = await cypyApi.translatePdf(file, targetLang, provider, onProgress);
      } else if (isArchive) {
        response = await cypyApi.translateArchive(file, targetLang, provider, onProgress);
      } else {
        response = await cypyApi.translateImage(file, targetLang, provider, onProgress);
      }

      return { response, clientJobId };
    },
    onSuccess: ({ response, clientJobId }) => {
      const serverJobId = response.job_id;
      updateJob(clientJobId, {
        id: serverJobId, // Swap client ID with server job ID
        status: response.status,
        message: response.message,
        progress: 35,
      });
    },
    onError: (error: any, variables) => {
      updateJob(variables.clientJobId, {
        status: 'FAILED',
        error: error?.message || 'Failed to submit translation job',
        message: 'Upload failed',
        progress: 0,
      });
    },
  });

  // Start new translation job
  const startTranslation = useCallback(
    async (file: File, targetLang: string = 'en', provider: string = 'google') => {
      const clientJobId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const isImage = file?.type ? file.type.startsWith('image/') : Boolean(file?.name && /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name));
      const previewUrl = isImage && file ? URL.createObjectURL(file) : '';

      const newJob: TranslationJobState = {
        id: clientJobId,
        file,
        previewUrl,
        targetLang,
        provider,
        status: 'PENDING',
        progress: 0,
        message: 'Job initialized',
        createdAt: new Date().toISOString(),
      };

      setJobs((prev) => [newJob, ...prev]);

      try {
        await uploadMutation.mutateAsync({ file, targetLang, provider, clientJobId });
      } catch (err) {
        // Handled in onError
      }
    },
    [uploadMutation]
  );

  // Poll status for active server jobs
  const activeJobIds = jobs
    .filter((j) => !j.id.startsWith('temp-') && (j.status === 'PENDING' || j.status === 'PROCESSING'))
    .map((j) => j.id);

  useEffect(() => {
    if (activeJobIds.length === 0) return;

    const interval = setInterval(async () => {
      for (const jobId of activeJobIds) {
        try {
          const statusData: JobStatusResponse = await cypyApi.getJobStatus(jobId);
          
          const updates: Partial<TranslationJobState> = {
            status: statusData.status,
            progress: Math.max(statusData.progress, 30),
            message: statusData.message,
            completedAt: statusData.completed_at,
          };

          if (statusData.status === 'COMPLETED') {
            const downloadUrl = cypyApi.getDownloadUrl(jobId);
            updates.downloadUrl = downloadUrl;
            updates.progress = 100;
          }

          updateJob(jobId, updates);
        } catch (error: any) {
          console.error(`Failed to poll job ${jobId}:`, error);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJobIds, updateJob]);

  // Cancel job
  const cancelJob = useCallback((id: string) => {
    const controller = abortControllersRef.current.get(id);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(id);
    }
    updateJob(id, { status: 'CANCELED', message: 'Job canceled by user', progress: 0 });
  }, [updateJob]);

  // Retry job
  const retryJob = useCallback(
    (id: string) => {
      const job = jobs.find((j) => j.id === id);
      if (job) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
        startTranslation(job.file, job.targetLang, job.provider);
      }
    },
    [jobs, startTranslation]
  );

  // Remove job from history
  const removeJob = useCallback((id: string) => {
    setJobs((prev) => {
      const target = prev.find((j) => j.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((j) => j.id !== id);
    });
  }, []);

  return {
    jobs,
    startTranslation,
    cancelJob,
    retryJob,
    removeJob,
    isUploading: uploadMutation.isPending,
  };
}
