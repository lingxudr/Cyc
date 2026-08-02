'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { TranslationJobState } from '../hooks/useTranslation';

interface ResultViewerProps {
  job: TranslationJobState | null;
  onClose: () => void;
}

export function ResultViewer({ job, onClose }: ResultViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<'compare' | 'result'>('compare');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!job) return null;

  const originalUrl = job.previewUrl;
  const resultUrl = job.downloadUrl || job.previewUrl;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col p-4 md:p-6"
      >
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
                {job.file.name}
              </h3>
              <p className="text-xs text-slate-400">
                Translated to {job.targetLang.toUpperCase()} via {job.provider.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex text-xs">
              <button
                onClick={() => setViewMode('compare')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'compare' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Compare Slider
              </button>
              <button
                onClick={() => setViewMode('result')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'result' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Translated Only
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-300 px-1">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download Button */}
            {job.downloadUrl && (
              <a
                href={job.downloadUrl}
                download
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Result</span>
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Canvas */}
        <div className="flex-1 relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-center">
          <div
            className="relative max-w-full max-h-full transition-transform duration-100 flex items-center justify-center"
            style={{ transform: `scale(${zoom})` }}
          >
            {viewMode === 'compare' && originalUrl ? (
              <div className="relative select-none overflow-hidden rounded-lg shadow-2xl border border-slate-800">
                {/* Original Image (Background) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalUrl}
                  alt="Original"
                  className="max-h-[75vh] w-auto object-contain block"
                />

                {/* Translated Image (Clipped Overlay) */}
                <div
                  className="absolute top-0 left-0 bottom-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultUrl}
                    alt="Translated"
                    className="max-h-[75vh] w-auto object-contain max-w-none block"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>

                {/* Slider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 cursor-ew-resize z-20"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg border border-white">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Range Slider Overlay Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
                />
              </div>
            ) : (
              <div className="relative rounded-lg shadow-2xl border border-slate-800 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultUrl}
                  alt="Translated Result"
                  className="max-h-[75vh] w-auto object-contain block"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 text-center text-xs text-slate-400">
          Drag slider to compare raw manga page with CYPY translated inpainting result.
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
