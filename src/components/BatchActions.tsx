import React from 'react';
import { Play, Download, Trash2, CheckCircle2, Loader2, Archive } from 'lucide-react';
import { FileItem } from '../types';

interface BatchActionsProps {
  items: FileItem[];
  isProcessing: boolean;
  onConvertAll: () => void;
  onDownloadZip: () => void;
  onClearAll: () => void;
  isDarkTheme?: boolean;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  items,
  isProcessing,
  onConvertAll,
  onDownloadZip,
  onClearAll,
  isDarkTheme = true,
}) => {
  const totalCount = items.length;
  if (totalCount === 0) return null;

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const idleCount = items.filter((i) => i.status === 'idle').length;
  const errorCount = items.filter((i) => i.status === 'error').length;

  const isAllCompleted = completedCount === totalCount;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      className={`rounded-[28px] border p-4 sm:p-5 sticky bottom-4 z-20 backdrop-blur-3xl transition-colors duration-300 animate-[fadeSlideUp_0.3s_cubic-bezier(0.22,1,0.36,1)] ${
        isDarkTheme
          ? 'bg-slate-900/80 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)]'
          : 'bg-white/95 border-slate-200/90 shadow-xl shadow-slate-300/60'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Progress & Stats */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
              Файли ({completedCount} / {totalCount} оброблено)
            </h3>
            {isAllCompleted && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border animate-[fadeScaleIn_0.2s_ease] ${
                  isDarkTheme
                    ? 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30'
                    : 'text-emerald-800 bg-emerald-100 border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Готово
              </span>
            )}
          </div>

          <p className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
            {isProcessing
              ? 'Триває обробка файлів у браузері...'
              : isAllCompleted
              ? 'Усі файли успішно конвертовано'
              : `Залишилось обробити: ${idleCount} ${
                  errorCount > 0 ? `(${errorCount} помилок)` : ''
                }`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onClearAll}
            disabled={isProcessing}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold active:scale-95 rounded-full border transition-all disabled:opacity-50 ${
              isDarkTheme
                ? 'text-slate-200 hover:text-red-300 bg-white/10 hover:bg-red-500/20 border-white/20'
                : 'text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-red-50 border-slate-300'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Очистити
          </button>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={onDownloadZip}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-95 rounded-full border border-emerald-300/40 transition-all shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)]"
            >
              <Archive className="w-4 h-4 text-emerald-100" />
              Завантажити ZIP ({completedCount})
            </button>
          )}

          {!isAllCompleted && (
            <button
              type="button"
              onClick={onConvertAll}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:scale-95 rounded-full transition-all border border-blue-300/40 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Конвертація... ({progressPercent}%)
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Конвертувати всі ({idleCount || totalCount})
                </>
              )}
            </button>
          )}

        </div>

      </div>

      {/* Global Progress Bar */}
      {isProcessing && (
        <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(progressPercent, 2)}%` }}
          />
        </div>
      )}
    </div>
  );
};
