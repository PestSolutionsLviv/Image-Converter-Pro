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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/20">
        
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-400" />
              Порівняння "До" та "Після"
            </h3>
            <p className="text-xs text-slate-400 font-mono truncate max-w-md">
              {item.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all border border-blue-400/30"
            >
              <Download className="w-4 h-4" />
              Завантажити
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Viewer */}
        <div className="flex-1 bg-slate-950/80 relative overflow-hidden flex items-center justify-center min-h-[360px] max-h-[60vh] select-none">
          
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
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center border-2 border-white text-xs font-bold">
                ↔
              </div>
            </div>

            {/* Side Badges */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-white/15 font-medium">
              До: {item.originalFormat.toUpperCase()} ({formatBytes(originalSize)})
            </div>

            <div className="absolute top-4 right-4 bg-blue-950/90 backdrop-blur-md text-blue-200 text-xs px-3 py-1.5 rounded-xl border border-blue-400/40 font-medium">
              Після: {item.outputFormat?.toUpperCase()} ({formatBytes(outputSize)})
            </div>

          </div>

        </div>

        {/* Modal Footer Statistics */}
        <div className="p-4 px-6 bg-white/5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Оригінальний розмір</span>
              <span className="text-sm font-bold text-slate-200">{formatBytes(originalSize)}</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500" />

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Новий розмір</span>
              <span className="text-sm font-bold text-blue-400">{formatBytes(outputSize)}</span>
            </div>

            {savingsPct !== 0 && (
              <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                savingsPct > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-slate-800 text-slate-300 border-white/10'
              }`}>
                {savingsPct > 0 ? `Економія ${savingsPct}%` : `+${Math.abs(savingsPct)}%`}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Перетягуйте бігунок вліво/вправо для візуального порівняння деталізації
          </p>

        </div>

      </div>
    </div>
  );
};
