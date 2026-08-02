'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  FileImage,
  FileText,
  Archive,
  CheckCircle2,
  X,
  ArrowRight,
  Cpu,
  Globe,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface UploadCardProps {
  onStartTranslation: (file: File, targetLang: string, provider: string) => Promise<void> | void;
  isUploading?: boolean;
}

const MAX_FILE_SIZE_MB = 100;
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'zip', 'cbz', 'rar', 'cbr'];

export function UploadCard({ onStartTranslation, isUploading = false }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [targetLang, setTargetLang] = useState('en');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    // Check size
    const fileSizeMb = file.size / (1024 * 1024);
    if (fileSizeMb > MAX_FILE_SIZE_MB) {
      setErrorMessage(`File size exceeds limit (${MAX_FILE_SIZE_MB}MB). Please choose a smaller file.`);
      return;
    }

    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(`Unsupported format .${ext}. Allowed formats: PNG, JPG, WEBP, PDF, ZIP, CBZ, RAR, CBR.`);
      return;
    }

    // Revoke previous URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);

    // Create object URL for image preview if applicable
    const isImage = file?.type ? file.type.startsWith('image/') : Boolean(file?.name && /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name));
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) validateAndSetFile(file);
    }
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || isUploading) return;
    await onStartTranslation(selectedFile, targetLang, selectedProvider);
    handleClear();
  };

  return (
    <div className="relative glass-panel rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-800 space-y-6">
      {/* Settings Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Translation Provider</span>
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            disabled={isUploading}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
          >
            <option value="google">Google Translate Engine</option>
            <option value="gemini">Google Gemini Pro API</option>
            <option value="chatgpt">OpenAI ChatGPT-4o</option>
            <option value="deepl">DeepL Pro Translation</option>
            <option value="openrouter">OpenRouter Multi-LLM</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Language</span>
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            disabled={isUploading}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
          >
            <option value="en">English (US/UK)</option>
            <option value="id">Indonesian (Bahasa Indonesia)</option>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="pt">Portuguese (Português)</option>
            <option value="zh">Chinese (Simplified)</option>
          </select>
        </div>
      </div>

      {/* Drag & Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 md:p-10 text-center transition-all flex flex-col items-center justify-center ${
          isUploading
            ? 'opacity-60 cursor-not-allowed border-slate-800'
            : isDragging
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01] cursor-pointer'
            : selectedFile
            ? 'border-emerald-500/60 bg-slate-900/60 cursor-pointer'
            : 'border-slate-700/80 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-900/40 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.pdf,.zip,.cbz,.rar,.cbr"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3 flex flex-col items-center max-w-md"
            >
              {previewUrl ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-emerald-500/30 shadow-lg group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-white bg-slate-900/90 px-2 py-1 rounded">Image Preview</span>
                  </div>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              )}

              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-white truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                </p>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors pt-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove file</span>
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center shadow-inner transition-transform">
                <Upload className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Drag and drop manga pages or archives here, or <span className="text-emerald-400 hover:underline">browse</span>
                </p>
                <p className="text-xs text-slate-400">
                  Supports single panels, multi-page PDFs, or chapter archives up to 100MB
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                  <FileImage className="w-3 h-3 text-emerald-400" /> PNG, JPG, WEBP
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                  <FileText className="w-3 h-3 text-blue-400" /> PDF Document
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                  <Archive className="w-3 h-3 text-amber-400" /> ZIP, CBZ, RAR
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Action */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">
          Files processed in secure isolated sandbox
        </p>

        <button
          disabled={!selectedFile || isUploading}
          onClick={handleSubmit}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            selectedFile && !isUploading
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          {isUploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Uploading & Queuing...</span>
            </>
          ) : (
            <>
              <span>Start Translation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
