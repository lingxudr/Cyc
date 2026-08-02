'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileImage,
  FileText,
  Archive,
  Download,
  RotateCcw,
  Clock
} from 'lucide-react';
import { TranslationJobState } from '../hooks/useTranslation';

interface TranslationProgressProps {
  jobs: TranslationJobState[];
  onCancelJob: (id: string) => void;
  onRetryJob: (id: string) => void;
  onRemoveJob: (id: string) => void;
  onViewResult?: (job: TranslationJobState) => void;
}

export function TranslationProgress({
  jobs,
  onCancelJob,
  onRetryJob,
  onRemoveJob,
  onViewResult,
}: TranslationProgressProps) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Active & Recent Jobs</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono">{jobs.length} total</span>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => {
          const isCompleted = job.status === 'COMPLETED';
          const isFailed = job.status === 'FAILED';
          const isCanceled = job.status === 'CANCELED';
          const isProcessing = job.status === 'PROCESSING' || job.status === 'PENDING' || job.status === 'UPLOADING';

          const ext = job.file.name.split('.').pop()?.toLowerCase() || '';
          const isPdf = ext === 'pdf';
          const isArchive = ['zip', 'cbz', 'rar', 'cbr'].includes(ext);

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-card rounded-xl p-4 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* File info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {isPdf ? (
                      <FileText className="w-5 h-5 text-blue-400" />
                    ) : isArchive ? (
                      <Archive className="w-5 h-5 text-amber-400" />
                    ) : (
                      <FileImage className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate max-w-xs sm:max-w-md">
                      {job.file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{(job.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{job.provider.toUpperCase()}</span>
                      <span>•</span>
                      <span>Target: {job.targetLang.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges & Controls */}
                <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
                  {isCompleted && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>

                      {(job.file?.type ? job.file.type.startsWith('image/') : Boolean(job.file?.name && /\.(png|jpe?g|webp|gif|bmp)$/i.test(job.file.name))) && onViewResult && (
                        <button
                          onClick={() => onViewResult(job)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors"
                        >
                          Preview
                        </button>
                      )}

                      {job.downloadUrl && (
                        <a
                          href={job.downloadUrl}
                          download
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-medium">
                        <RefreshCw className="w-3 h-3 animate-spin" /> {job.progress}%
                      </span>
                      <button
                        onClick={() => onCancelJob(job.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors text-xs"
                        title="Cancel job"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {(isFailed || isCanceled) && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> {isCanceled ? 'Canceled' : 'Failed'}
                      </span>
                      <button
                        onClick={() => onRetryJob(job.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                        title="Retry translation"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                      <button
                        onClick={() => onRemoveJob(job.id)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                        title="Dismiss"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {isProcessing && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, job.progress))}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>{job.message || 'Processing...'}</span>
                    <span>{job.progress}%</span>
                  </div>
                </div>
              )}

              {/* Failure message */}
              {isFailed && job.error && (
                <p className="text-xs text-rose-400 bg-rose-950/20 p-2 rounded-lg border border-rose-900/30">
                  {job.error}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
