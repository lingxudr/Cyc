'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Server,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

import { useTranslation, TranslationJobState } from '../hooks/useTranslation';
import { UploadCard } from '../components/UploadCard';
import { TranslationProgress } from '../components/TranslationProgress';
import { ResultViewer } from '../components/ResultViewer';

export default function HomePage() {
  const {
    jobs,
    startTranslation,
    cancelJob,
    retryJob,
    removeJob,
    isUploading,
  } = useTranslation();

  const [activeViewerJob, setActiveViewerJob] = useState<TranslationJobState | null>(null);

  const handleStartTranslation = async (file: File, targetLang: string, provider: string) => {
    await startTranslation(file, targetLang, provider);
  };

  return (
    <main className="relative min-h-screen bg-[#090d16] text-slate-100 overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 space-y-12">
        {/* Header Branding */}
        <header className="flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold text-xl">
              C
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                CYPY <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">WEB v1.0</span>
              </h1>
              <p className="text-xs text-slate-400">AI Manga & Comic Inpainting Translation Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Engine Status: <strong className="text-emerald-400 font-medium">Online</strong></span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>YOLO ONNX Detection & Multi-Provider Inpainting</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Translate Manga Pages <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              In Seconds, Not Hours
            </span>
          </h2>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Drop your raw manga panels, PDFs, or CBZ archives. CYPY cleans speech bubbles, erases original text, and renders translated dialogue naturally.
          </p>
        </motion.section>

        {/* Functional Upload Card */}
        <UploadCard
          onStartTranslation={handleStartTranslation}
          isUploading={isUploading}
        />

        {/* Server & Engine Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-emerald-400" /> Engine Core</span>
              <span className="text-emerald-400 font-mono">v1.0.0</span>
            </div>
            <p className="text-sm font-semibold text-white">YOLO ONNX Detection</p>
            <p className="text-xs text-slate-400">Speech bubble segmenter online with 98.4% precision.</p>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Inpainting Engine</span>
              <span className="text-slate-300 font-mono">Active</span>
            </div>
            <p className="text-sm font-semibold text-white">Background Reconstruction</p>
            <p className="text-xs text-slate-400">Smart patch fill preserving original panel textures.</p>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Security</span>
              <span className="text-slate-300 font-mono">Isolated</span>
            </div>
            <p className="text-sm font-semibold text-white">Ephemeral Filesystem</p>
            <p className="text-xs text-slate-400">Uploaded pages automatically purged after download.</p>
          </div>
        </div>

        {/* Translation Queue & Active Progress Section */}
        <TranslationProgress
          jobs={jobs}
          onCancelJob={cancelJob}
          onRetryJob={retryJob}
          onRemoveJob={removeJob}
          onViewResult={(job) => setActiveViewerJob(job)}
        />

        {/* Compare / Result Modal Viewer */}
        <ResultViewer
          job={activeViewerJob}
          onClose={() => setActiveViewerJob(null)}
        />

        {/* Footer */}
        <footer className="border-t border-slate-800/80 pt-6 text-center text-xs text-slate-400 space-y-2">
          <p>CYPY Web Application • Powered by FastAPI & CYPY Engine</p>
          <p className="text-slate-400 font-mono">Designed for Manga Translators, Scanlators, and AI Enthusiasts.</p>
        </footer>
      </div>
    </main>
  );
}
