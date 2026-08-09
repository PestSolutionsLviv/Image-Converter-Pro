import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileImage,
  FileText,
  Music,
  Video,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Sliders,
} from 'lucide-react';
import { FileItem, TargetFormat } from '../types';
import { formatBytes, saveBlobAsFile, SUPPORTED_FORMATS, detectFileCategory } from '../lib/converter';

interface FileCardProps {
  item: FileItem;
  index: number;
  totalCount: number;
  onRemove: (id: string) => void;
  onCompare: (item: FileItem) => void;
  onFormatChange: (id: string, format: TargetFormat) => void;
  onOpenAdjustments?: (item: FileItem) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragTarget?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  item,
  index,
  totalCount,
  onRemove,
  onCompare,
  onFormatChange,
  onOpenAdjustments,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragTarget,
}) => {
  const category = item.category || detectFileCategory(item.file);
  const isHeic = item.originalFormat === 'heic' || item.originalFormat === 'heif';

  const categoryFormats = SUPPORTED_FORMATS.filter(
    (f) => f.category === category
  );

  const hasAdjustments =
    item.adjustments &&
    (item.adjustments.brightness !== 100 ||
      item.adjustments.contrast !== 100 ||
      item.adjustments.grayscale !== 0 ||
      item.adjustments.saturation !== 100 ||
      item.adjustments.sepia !== 0 ||
      item.adjustments.blur !== 0);

  const currentTargetFormat = item.customSettings?.targetFormat || item.outputFormat || (categoryFormats[0]?.id || 'jpeg');
  const formatInfo = SUPPORTED_FORMATS.find((f) => f.id === currentTargetFormat) || categoryFormats[0];

  const handleDownload = () => {
    if (item.outputBlob) {
      const ext = formatInfo ? formatInfo.ext : 'jpg';
      const nameWithoutExt =
        item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      saveBlobAsFile(item.outputBlob, `${nameWithoutExt}.${ext}`);
    }
  };

  const savingsPct =
    item.originalSize > 0 && item.outputSize
      ? Math.round(((item.originalSize - item.outputSize) / item.originalSize) * 100)
      : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      draggable
      onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent, index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e as unknown as React.DragEvent, index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.(e as unknown as React.DragEvent, index);
      }}
      onDragEnd={onDragEnd}
      className={`bg-white/[0.07] backdrop-blur-3xl rounded-[24px] border p-4 shadow-[0_15px_35px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all duration-200 select-none ${
        isDragging
          ? 'opacity-30 border-sky-400 border-dashed scale-[0.98]'
          : isDragTarget
          ? 'border-sky-300 bg-blue-500/25 ring-2 ring-sky-300/50 scale-[1.01]'
          : 'border-white/20 hover:border-white/30 hover:bg-white/[0.12]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Drag Handle, Thumbnail & Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          
          {/* Drag Handle & Up/Down Arrows */}
          <div className="flex items-center gap-0.5 text-slate-500 flex-shrink-0">
            <div
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 cursor-grab active:cursor-grabbing transition-colors"
              title="Перетягніть для зміни порядку"
            >
              <GripVertical className="w-5 h-5" />
            </div>

            {totalCount > 1 && (
              <div className="hidden sm:flex flex-col -space-y-1">
                <button
                  type="button"
                  onClick={() => onMoveUp?.(index)}
                  disabled={index === 0}
                  className="p-0.5 text-slate-400 hover:text-blue-400 disabled:opacity-20 disabled:hover:text-slate-400 transition-colors"
                  title="Перемістити вгору"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveDown?.(index)}
                  disabled={index === totalCount - 1}
                  className="p-0.5 text-slate-400 hover:text-blue-400 disabled:opacity-20 disabled:hover:text-slate-400 transition-colors"
                  title="Перемістити вниз"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          
          {/* Thumbnail / Category Icon Box */}
          <div className="w-14 h-14 rounded-xl bg-slate-900/80 border border-white/15 flex-shrink-0 flex items-center justify-center overflow-hidden relative group">
            {category === 'image' && (item.previewUrl || item.outputUrl) ? (
              <img
                src={item.outputUrl || item.previewUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : category === 'audio' ? (
              <div className="flex flex-col items-center justify-center text-emerald-400 p-1">
                <Music className="w-6 h-6" />
                <span className="text-[9px] font-bold text-emerald-300 uppercase">AUDIO</span>
              </div>
            ) : category === 'video' ? (
              <div className="flex flex-col items-center justify-center text-purple-400 p-1">
                <Video className="w-6 h-6" />
                <span className="text-[9px] font-bold text-purple-300 uppercase">VIDEO</span>
              </div>
            ) : category === 'document' ? (
              <div className="flex flex-col items-center justify-center text-amber-400 p-1">
                <FileText className="w-6 h-6" />
                <span className="text-[9px] font-bold text-amber-300 uppercase">DOC</span>
              </div>
            ) : (
              <FileImage className="w-6 h-6 text-slate-500" />
            )}

            {isHeic && (
              <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold px-1 rounded bg-blue-600 text-white shadow-xs">
                HEIC
              </span>
            )}
          </div>

          {/* Text & Specs */}
          <div className="min-w-0 flex-1">
            <h4
              className="text-sm font-semibold text-white truncate"
              title={item.name}
            >
              {item.name}
            </h4>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{formatBytes(item.originalSize)}</span>

              {item.dimensions && (
                <>
                  <span>•</span>
                  <span>
                    {item.dimensions.width}×{item.dimensions.height} px
                  </span>
                </>
              )}

              {item.textPreview && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[150px] italic text-slate-400">
                    "{item.textPreview.slice(0, 30)}..."
                  </span>
                </>
              )}
            </div>

            {/* Status / Error Message */}
            <div className="mt-1 min-h-[22px] flex items-center">
              <AnimatePresence mode="wait">
                {item.status === 'idle' && (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="text-[11px] font-medium text-slate-400"
                  >
                    В черзі...
                  </motion.span>
                )}

                {(item.status === 'heic_decoding' || item.status === 'converting') && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {item.status === 'heic_decoding'
                        ? 'Декодування HEIC...'
                        : 'Конвертація...'}
                    </span>
                  </motion.div>
                )}

                {item.status === 'completed' && item.outputSize && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, scale: 0.9, y: 3 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-400/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {formatBytes(item.outputSize)}
                    </span>

                    {savingsPct !== null && (
                      <span
                        className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                          savingsPct >= 0
                            ? 'text-emerald-300 bg-emerald-500/15'
                            : 'text-amber-300 bg-amber-500/15'
                        }`}
                      >
                        {savingsPct >= 0 ? `-${savingsPct}%` : `+${Math.abs(savingsPct)}%`}
                      </span>
                    )}
                  </motion.div>
                )}

                {item.status === 'error' && (
                  <motion.span
                    key="error"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="text-[11px] font-medium text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {item.errorMessage || 'Помилка'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Right: Format Selector & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          
          {/* Format Selection dropdown for individual file */}
          <select
            value={currentTargetFormat}
            onChange={(e) => onFormatChange(item.id, e.target.value as TargetFormat)}
            disabled={item.status === 'converting' || item.status === 'heic_decoding'}
            className="text-xs font-semibold bg-slate-900/80 border border-white/15 hover:border-white/30 text-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none cursor-pointer"
          >
            {categoryFormats.map((f) => (
              <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                {f.label} (. {f.ext})
              </option>
            ))}
          </select>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            
            {category === 'image' && (
              <button
                type="button"
                onClick={() => onOpenAdjustments?.(item)}
                className={`p-2 rounded-xl transition-all relative ${
                  hasAdjustments
                    ? 'text-blue-400 bg-blue-500/20 border border-blue-400/40 hover:bg-blue-500/30'
                    : 'text-slate-300 hover:text-blue-400 hover:bg-white/10'
                }`}
                title="Корекція зображення (яскравість, контраст, ч/б, сепія)"
              >
                <Sliders className="w-4 h-4" />
                {hasAdjustments && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full ring-2 ring-slate-900" />
                )}
              </button>
            )}

            {item.status === 'completed' && item.outputUrl && (
              <>
                {category === 'image' && (
                  <button
                    onClick={() => onCompare(item)}
                    className="p-2 text-slate-300 hover:text-blue-400 hover:bg-white/10 rounded-xl transition-colors"
                    title="Порівняти та переглянути"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all border border-blue-400/30"
                  title="Завантажити конвертований файл"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Завантажити</span>
                </button>
              </>
            )}

            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/15 rounded-xl transition-colors"
              title="Видалити зі списку"
            >
              <Trash2 className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {(item.status === 'heic_decoding' || item.status === 'converting') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden relative"
          >
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-indigo-400 h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.max(item.progress, 5)}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
