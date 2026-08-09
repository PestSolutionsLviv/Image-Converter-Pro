import React, { useState } from 'react';
import { X, Download, ArrowRight, CheckCircle, Sparkles, SlidersHorizontal } from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes, saveBlobAsFile } from '../lib/converter';

interface CompareModalProps {
  item: FileItem | null;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ item, onClose }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  if (!item || !item.outputUrl) return null;

  const originalUrl = item.previewUrl || item.outputUrl;
  const convertedUrl = item.outputUrl;

  const originalSize = item.originalSize;
  const outputSize = item.outputSize || 0;
  const savingsPct =
    originalSize > 0
      ? Math.round(((originalSize - outputSize) / originalSize) * 100)
      : 0;

  const handleDownload = () => {
    if (item.outputBlob) {
      const ext = item.outputFormat === 'jpeg' ? 'jpg' : item.outputFormat || 'jpg';
      const nameWithoutExt =
        item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      saveBlobAsFile(item.outputBlob, `${nameWithoutExt}.${ext}`);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl animate-fade-in">
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[32px] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-white/20">
        
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-white/15 flex items-center justify-between bg-white/[0.05]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 tracking-tight drop-shadow-sm">
              <div className="p-1.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-sky-300">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              Порівняння "До" та "Після"
            </h3>
            <p className="text-xs text-slate-300/80 font-mono truncate max-w-md mt-0.5">
              {item.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-full shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all border border-blue-300/40 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Завантажити
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/15 rounded-full transition-all active:scale-95 border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Viewer */}
        <div className="flex-1 bg-black/40 relative overflow-hidden flex items-center justify-center min-h-[360px] max-h-[60vh] select-none backdrop-blur-2xl">
          
          <div
            className="relative w-full h-full max-w-3xl max-h-[55vh] flex items-center justify-center cursor-ew-resize"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* Converted Image (Right / Bottom) */}
            <img
              src={convertedUrl}
              alt="Converted"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Original Image (Left / Top clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={originalUrl}
                alt="Original"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none max-w-none"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Split Slider Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white/80 shadow-2xl pointer-events-none z-10 backdrop-blur-md"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-gradient-to-b from-blue-500 to-sky-400 text-white shadow-xl flex items-center justify-center border-2 border-white/80 text-xs font-bold backdrop-blur-xl">
                ↔
              </div>
            </div>

            {/* Side Badges */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-2xl text-slate-100 text-xs px-3.5 py-1.5 rounded-full border border-white/20 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              До: {item.originalFormat.toUpperCase()} ({formatBytes(originalSize)})
            </div>

            <div className="absolute top-4 right-4 bg-blue-900/40 backdrop-blur-2xl text-sky-100 text-xs px-3.5 py-1.5 rounded-full border border-blue-300/40 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              Після: {item.outputFormat?.toUpperCase()} ({formatBytes(outputSize)})
            </div>

          </div>

        </div>

        {/* Modal Footer Statistics */}
        <div className="p-4 px-6 bg-white/[0.05] border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] text-slate-300/80 uppercase tracking-wider block">Оригінальний розмір</span>
              <span className="text-sm font-bold text-slate-100">{formatBytes(originalSize)}</span>
            </div>

            <ArrowRight className="w-4 h-4 text-sky-300" />

            <div>
              <span className="text-[11px] text-slate-300/80 uppercase tracking-wider block">Новий розмір</span>
              <span className="text-sm font-bold text-sky-300">{formatBytes(outputSize)}</span>
            </div>

            {savingsPct !== 0 && (
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                savingsPct > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'bg-black/30 text-slate-300 border-white/10'
              }`}>
                {savingsPct > 0 ? `Економія ${savingsPct}%` : `+${Math.abs(savingsPct)}%`}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-300/80">
            Перетягуйте бігунок вліво/вправо для візуального порівняння деталізації
          </p>

        </div>

      </div>
    </div>
  );
};
