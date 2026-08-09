import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
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
  isDarkTheme?: boolean;
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
  isDarkTheme = true,
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

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    window.addEventListener('click', handleClickOutside);
    window.addEventListener('contextmenu', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('contextmenu', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

  // Position refinement for menu bounds
  const menuWidth = 230;
  const menuHeight = 250;
  const adjustedX = contextMenu ? Math.min(contextMenu.x, window.innerWidth - menuWidth - 12) : 0;
  const adjustedY = contextMenu ? Math.min(contextMenu.y, window.innerHeight - menuHeight - 12) : 0;

  // Swipe gesture motion values
  const x = useMotionValue(0);
  const leftBgOpacity = useTransform(x, [10, 60, 120], [0, 0.6, 1]);
  const rightBgOpacity = useTransform(x, [-120, -60, -10], [1, 0.6, 0]);
  const leftBgScale = useTransform(x, [10, 100], [0.85, 1]);
  const rightBgScale = useTransform(x, [-100, -10], [1, 0.85]);

  const handleSwipeDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeDistance = info.offset.x;
    const swipeVelocity = info.velocity.x;

    // Swipe Left: Delete file
    if (swipeDistance < -80 || swipeVelocity < -300) {
      onRemove(item.id);
      return;
    }

    // Swipe Right: Edit / Adjustments / Compare
    if (swipeDistance > 80 || swipeVelocity > 300) {
      if (category === 'image' && onOpenAdjustments) {
        onOpenAdjustments(item);
      } else if (onCompare && item.status === 'completed') {
        onCompare(item);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative overflow-hidden rounded-[24px]"
    >
      {/* Underlay Action Layer for Mobile Swipe */}
      {/* Underlay Action Layer Revealed on Swipe */}
      <div
        className={`absolute inset-0 z-0 flex items-center justify-between px-4 rounded-[24px] transition-colors ${
          isDarkTheme ? 'bg-slate-950/70 border border-white/10' : 'bg-slate-200/90 border border-slate-300/80 shadow-inner'
        }`}
      >
        {/* Left Action (Revealed on Swipe Right) */}
        <motion.button
          type="button"
          style={{ opacity: leftBgOpacity, scale: leftBgScale }}
          onClick={() => {
            if (category === 'image' && onOpenAdjustments) {
              onOpenAdjustments(item);
            } else if (onCompare && item.status === 'completed') {
              onCompare(item);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform"
        >
          <Sliders className="w-4 h-4" />
          <span>{category === 'image' ? 'Корекція' : 'Перегляд'}</span>
        </motion.button>

        {/* Right Action (Revealed on Swipe Left) */}
        <motion.button
          type="button"
          style={{ opacity: rightBgOpacity, scale: rightBgScale }}
          onClick={() => onRemove(item.id)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-red-600 to-rose-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform ml-auto"
        >
          <span>Видалити</span>
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Foreground Draggable Card Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.35}
        dragSnapToOrigin
        onDragEnd={handleSwipeDragEnd}
        style={{ x, touchAction: 'pan-y' }}
        onContextMenu={handleContextMenu}
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
        className={`relative z-10 rounded-[24px] border p-4 transition-all duration-200 select-none ${
          isDragging
            ? 'opacity-30 border-blue-400 border-dashed scale-[0.98]'
            : isDragTarget
            ? 'border-blue-400 bg-blue-500/25 ring-2 ring-blue-400/50 scale-[1.01]'
            : isDarkTheme
            ? 'bg-white/[0.07] backdrop-blur-3xl border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)] hover:border-white/30 hover:bg-white/[0.12]'
            : 'bg-white/90 border-slate-200/90 shadow-md shadow-slate-200/60 hover:bg-white hover:border-blue-300'
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
          <div
            className={`w-14 h-14 rounded-xl border flex-shrink-0 flex items-center justify-center overflow-hidden relative group ${
              isDarkTheme ? 'bg-slate-900/80 border-white/15' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {category === 'image' && (item.previewUrl || item.outputUrl) ? (
              <img
                src={item.outputUrl || item.previewUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : category === 'audio' ? (
              <div className="flex flex-col items-center justify-center text-emerald-500 p-1">
                <Music className="w-6 h-6" />
                <span className="text-[9px] font-bold text-emerald-600 uppercase">AUDIO</span>
              </div>
            ) : category === 'video' ? (
              <div className="flex flex-col items-center justify-center text-purple-500 p-1">
                <Video className="w-6 h-6" />
                <span className="text-[9px] font-bold text-purple-600 uppercase">VIDEO</span>
              </div>
            ) : category === 'document' ? (
              <div className="flex flex-col items-center justify-center text-amber-500 p-1">
                <FileText className="w-6 h-6" />
                <span className="text-[9px] font-bold text-amber-600 uppercase">DOC</span>
              </div>
            ) : (
              <FileImage className="w-6 h-6 text-slate-400" />
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
              className={`text-sm font-bold truncate ${
                isDarkTheme ? 'text-white' : 'text-slate-900'
              }`}
              title={item.name}
            >
              {item.name}
            </h4>

            <div className={`flex items-center gap-2 text-xs mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
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
                  <span className={`truncate max-w-[150px] italic ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
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
                    className={`text-[11px] font-semibold ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}
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
                    className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
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
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg border ${
                        isDarkTheme
                          ? 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30'
                          : 'text-emerald-800 bg-emerald-50 border-emerald-200 shadow-xs'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {formatBytes(item.outputSize)}
                    </span>

                    {savingsPct !== null && (
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                          savingsPct >= 0
                            ? isDarkTheme
                              ? 'text-emerald-300 bg-emerald-500/15'
                              : 'text-emerald-800 bg-emerald-100'
                            : isDarkTheme
                            ? 'text-amber-300 bg-amber-500/15'
                            : 'text-amber-800 bg-amber-100'
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
                    className="text-[11px] font-bold text-red-600 flex items-center gap-1"
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
        <div className={`flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`}>
          
          {/* Format Selection dropdown for individual file */}
          <select
            value={currentTargetFormat}
            onChange={(e) => onFormatChange(item.id, e.target.value as TargetFormat)}
            disabled={item.status === 'converting' || item.status === 'heic_decoding'}
            className={`text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer border transition-all ${
              isDarkTheme
                ? 'bg-slate-900/80 border-white/15 hover:border-white/30 text-slate-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20'
            }`}
          >
            {categoryFormats.map((f) => (
              <option key={f.id} value={f.id} className={isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
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
                    ? 'text-blue-500 bg-blue-500/20 border border-blue-400/40 hover:bg-blue-500/30'
                    : isDarkTheme
                    ? 'text-slate-300 hover:text-blue-400 hover:bg-white/10'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Корекція зображення (яскравість, контраст, ч/б, сепія)"
              >
                <Sliders className="w-4 h-4" />
                {hasAdjustments && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white" />
                )}
              </button>
            )}

            {item.status === 'completed' && item.outputUrl && (
              <>
                {category === 'image' && (
                  <button
                    onClick={() => onCompare(item)}
                    className={`p-2 rounded-xl transition-colors ${
                      isDarkTheme
                        ? 'text-slate-300 hover:text-blue-400 hover:bg-white/10'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                    }`}
                    title="Порівняти та переглянути"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all border border-blue-400/30"
                  title="Завантажити конвертований файл"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Завантажити</span>
                </button>
              </>
            )}

            <button
              onClick={() => onRemove(item.id)}
              className={`p-2 rounded-xl transition-colors ${
                isDarkTheme
                  ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/15'
                  : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
              }`}
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
            className={`w-full rounded-full h-1.5 mt-3 overflow-hidden relative ${
              isDarkTheme ? 'bg-slate-800' : 'bg-slate-200'
            }`}
          >
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.max(item.progress, 5)}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu Popover */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: `${adjustedX}px`,
              top: `${adjustedY}px`,
              zIndex: 9999,
            }}
            className={`w-56 rounded-2xl p-1.5 shadow-xl text-xs font-bold border ${
              isDarkTheme
                ? 'bg-slate-900/95 backdrop-blur-2xl border-white/20 text-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
                : 'bg-white/95 backdrop-blur-2xl border-slate-200 text-slate-800 shadow-xl shadow-slate-300/50'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`px-3 py-1.5 text-[11px] font-bold border-b truncate mb-1 flex items-center justify-between ${
              isDarkTheme ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200'
            }`}>
              <span className="truncate">{item.name}</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono ml-1">{currentTargetFormat}</span>
            </div>

            {category === 'image' && onOpenAdjustments && (
              <button
                type="button"
                onClick={() => {
                  onOpenAdjustments(item);
                  setContextMenu(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                  isDarkTheme ? 'hover:bg-blue-500/20 hover:text-blue-300' : 'hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>Корекція зображення</span>
              </button>
            )}

            {item.status === 'completed' && item.outputUrl && category === 'image' && (
              <button
                type="button"
                onClick={() => {
                  onCompare(item);
                  setContextMenu(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                  isDarkTheme ? 'hover:bg-sky-500/20 hover:text-sky-300' : 'hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                <Eye className="w-4 h-4 text-sky-500" />
                <span>Порівняти результат</span>
              </button>
            )}

            {item.status === 'completed' && item.outputBlob && (
              <button
                type="button"
                onClick={() => {
                  handleDownload();
                  setContextMenu(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                  isDarkTheme ? 'hover:bg-emerald-500/20 hover:text-emerald-300' : 'hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Завантажити файл</span>
              </button>
            )}

            {totalCount > 1 && (
              <>
                <div className={`my-1 border-t ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`} />

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onMoveUp?.(index);
                      setContextMenu(null);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                      isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                    }`}
                  >
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                    <span>Перемістити вгору</span>
                  </button>
                )}

                {index < totalCount - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      onMoveDown?.(index);
                      setContextMenu(null);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                      isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                    <span>Перемістити вниз</span>
                  </button>
                )}
              </>
            )}

            <div className={`my-1 border-t ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`} />

            <button
              type="button"
              onClick={() => {
                onRemove(item.id);
                setContextMenu(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl active:scale-95 transition-all text-left ${
                isDarkTheme
                  ? 'hover:bg-red-500/20 text-red-300 hover:text-red-200'
                  : 'hover:bg-red-50 text-red-600 hover:text-red-700'
              }`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Видалити файл</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
