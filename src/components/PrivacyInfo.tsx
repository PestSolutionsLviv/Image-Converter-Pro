import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Zap, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

interface PrivacyInfoProps {
  isDarkTheme?: boolean;
}

const SUPPORTED_FORMATS = [
  'HEIC/HEIF',
  'RAW (CR2/NEF/ARW/DNG)',
  'JPG',
  'PNG',
  'WebP',
  'AVIF',
  'SVG',
  'PDF',
  'DOCX',
  'TXT',
  'MD',
  'JSON',
  'CSV',
  'MP3',
  'WAV',
  'OGG',
  'MP4',
  'WEBM',
];

export const PrivacyInfo: React.FC<PrivacyInfoProps> = ({ isDarkTheme = true }) => {
  const [isFormatsOpen, setIsFormatsOpen] = useState(false);

  return (
    <div className="mt-2.5 space-y-1.5">
      {/* Ultra-compact benefits bar (~44px) */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border transition-all text-xs ${
          isDarkTheme
            ? 'bg-white/[0.03] border-white/10 text-slate-300 shadow-xs'
            : 'bg-white border-slate-200 text-slate-700 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <span className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            100% Локальна обробка
          </span>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Без передачі на сервер
          </span>

          <span className="hidden md:inline-flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            WebAssembly & Canvas
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Interactive Formats Tooltip/Dropdown Trigger */}
          <button
            type="button"
            onClick={() => setIsFormatsOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-lg border transition-all active:scale-95 ${
              isFormatsOpen
                ? isDarkTheme
                  ? 'bg-blue-500/20 text-sky-300 border-blue-400/40'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                : isDarkTheme
                ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <span>Формати (18+)</span>
            {isFormatsOpen ? (
              <ChevronUp className="w-3 h-3 text-sky-400" />
            ) : (
              <ChevronDown className="w-3 h-3 opacity-60" />
            )}
          </button>


        </div>
      </div>

      {/* Expanded Formats Tray (Smoothly reveals when clicked) */}
      {isFormatsOpen && (
        <div
          className={`p-4 rounded-2xl border text-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
            isDarkTheme
              ? 'bg-slate-900/90 border-white/15 text-slate-200 shadow-xl backdrop-blur-xl'
              : 'bg-slate-50 border-slate-200 text-slate-800 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Усі підтримувані формати:
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% In-Browser
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_FORMATS.map((fmt) => (
              <span
                key={fmt}
                className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                  isDarkTheme
                    ? 'bg-white/5 text-sky-200 border-white/10'
                    : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
