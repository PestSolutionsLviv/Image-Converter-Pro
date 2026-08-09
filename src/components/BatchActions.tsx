import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Download, Trash2, CheckCircle2, Loader2, Archive } from 'lucide-react';
import { FileItem } from '../types';

interface BatchActionsProps {
  items: FileItem[];
  isProcessing: boolean;
  onConvertAll: () => void;
  onDownloadZip: () => void;
  onClearAll: () => void;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  items,
  isProcessing,
  onConvertAll,
  onDownloadZip,
  onClearAll,
}) => {
  const totalCount = items.length;
  if (totalCount === 0) return null;

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const idleCount = items.filter((i) => i.status === 'idle').length;
  const errorCount = items.filter((i) => i.status === 'error').length;

  const isAllCompleted = completedCount === totalCount;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/15 p-4 sm:p-5 shadow-2xl sticky bottom-4 z-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Progress & Stats */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white">
              Файли ({completedCount} / {totalCount} оброблено)
            </h3>
            <AnimatePresence>
              {isAllCompleted && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Готово
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={isProcessing ? 'processing' : isAllCompleted ? 'completed' : 'idle'}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-slate-400"
            >
              {isProcessing
                ? 'Триває обробка фотографій у браузері...'
                : isAllCompleted
                ? 'Усі зображення успішно конвертовано'
                : `Залишилось обробити: ${idleCount} ${
                    errorCount > 0 ? `(${errorCount} помилок)` : ''
                  }`}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          <button
            type="button"
            onClick={onClearAll}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:text-red-400 hover:bg-red-500/15 rounded-2xl transition-all border border-white/10 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Очистити
          </button>

          <AnimatePresence>
            {completedCount > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                type="button"
                onClick={onDownloadZip}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-2xl border border-emerald-400/30 transition-all shadow-xl shadow-emerald-600/30 hover:scale-[1.02]"
              >
                <Archive className="w-4 h-4 text-emerald-200" />
                Завантажити ZIP ({completedCount})
              </motion.button>
            )}
          </AnimatePresence>

          {!isAllCompleted && (
            <button
              type="button"
              onClick={onConvertAll}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-2xl shadow-xl shadow-blue-600/30 transition-all border border-blue-400/30 hover:scale-[1.02] disabled:opacity-50"
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
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden"
          >
            <motion.div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.max(progressPercent, 2)}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
