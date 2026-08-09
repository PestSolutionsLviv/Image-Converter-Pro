import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Sparkles, FolderPlus, FileText, Video, Calculator, Camera } from 'lucide-react';

export type DropZoneTab = 'photo' | 'text' | 'video' | 'units';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  onAddDemoFiles: () => void;
  isProcessingDemo: boolean;
  hasFiles: boolean;
  activeTab: DropZoneTab;
  onTabChange: (tab: DropZoneTab) => void;
  isDarkTheme?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesAdded,
  onAddDemoFiles,
  isProcessingDemo,
  hasFiles,
  activeTab,
  onTabChange,
  isDarkTheme = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesAdded(droppedFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesAdded(selectedFiles);
      e.target.value = ''; // Reset input
    }
  };

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFiles = Array.from(e.clipboardData.files);
        onFilesAdded(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesAdded]);

  const CATEGORY_TABS: { id: DropZoneTab; label: string; icon: React.ElementType; tag: string }[] = [
    { id: 'photo', label: 'Фото & RAW', icon: Camera, tag: 'HEIC, CR2, NEF, ARW, JPG, PNG' },
    { id: 'text', label: 'Текст', icon: FileText, tag: 'PDF, TXT, MD, JSON, CSV, HTML' },
    { id: 'video', label: 'Відео & Аудіо', icon: Video, tag: 'MP4, WEBM, MP3, WAV, OGG' },
    { id: 'units', label: 'Величини & Валюти', icon: Calculator, tag: 'Конвертер одиниць та курсів' },
  ];

  return (
    <div className="space-y-4">
      {/* Categories Selector Navigation Bar */}
      <div
        className={`grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center sm:justify-start gap-2 p-2 rounded-[24px] border backdrop-blur-2xl transition-colors duration-300 ${
          isDarkTheme
            ? 'bg-white/[0.05] border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
            : 'bg-white/80 border-slate-200/90 shadow-sm'
        }`}
      >
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2.5 rounded-[18px] text-xs font-bold transition-all active:scale-95 w-full sm:w-auto ${
                isActive
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border border-blue-300/40 shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  : isDarkTheme
                  ? 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive
                    ? 'text-sky-100'
                    : isDarkTheme
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              />
              <div className="text-left min-w-0 flex-1">
                <div className="leading-tight truncate">{tab.label}</div>
                <div
                  className={`text-[10px] font-normal truncate ${
                    isActive
                      ? 'text-sky-100/90'
                      : isDarkTheme
                      ? 'text-slate-400/80'
                      : 'text-slate-500'
                  }`}
                >
                  {tab.tag}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Drop Zone Box (Only for file-based categories) */}
      {activeTab !== 'units' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer group rounded-[32px] border transition-all duration-300 overflow-hidden backdrop-blur-3xl ${
            isDragOver
              ? isDarkTheme
                ? 'border-sky-300 bg-blue-500/25 ring-4 ring-blue-400/30 scale-[1.005] shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.5)]'
                : 'border-blue-500 bg-blue-50/90 ring-4 ring-blue-300/50 scale-[1.005] shadow-xl'
              : isDarkTheme
              ? hasFiles
                ? 'border-white/20 bg-white/[0.07] hover:border-sky-300/60 hover:bg-white/[0.12] py-6 px-6 shadow-[0_15px_40px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)]'
                : 'border-white/20 bg-white/[0.07] hover:border-sky-300/60 hover:bg-white/[0.12] py-10 px-6 shadow-[0_25px_60px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]'
              : hasFiles
              ? 'border-slate-200/90 bg-white/80 hover:border-blue-400 hover:bg-white py-6 px-6 shadow-md shadow-slate-200/50'
              : 'border-slate-200/90 bg-white/80 hover:border-blue-400 hover:bg-white py-10 px-6 shadow-lg shadow-slate-200/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*,text/*,.heic,.heif,.cr2,.cr3,.nef,.nrw,.arw,.dng,.orf,.rw2,.raf,.pef,.raw,.pdf,.txt,.md,.json,.csv,.html,.rtf,.mp3,.wav,.ogg,.m4a,.mp4,.webm,.mov,.avi"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center text-center">
            {/* Animated Icon Circle */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 shadow-lg ${
                isDragOver
                  ? 'bg-gradient-to-br from-blue-500 to-sky-400 text-white shadow-blue-500/40 border border-white/40'
                  : isDarkTheme
                  ? 'bg-white/10 text-sky-300 border border-white/25 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-sky-400 group-hover:text-white group-hover:border-white/40 shadow-blue-500/20 backdrop-blur-2xl'
                  : 'bg-blue-50 text-blue-600 border border-blue-200 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-sky-500 group-hover:text-white group-hover:border-blue-300 shadow-blue-200/50'
              }`}
            >
              <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <h3
              className={`text-lg sm:text-xl font-bold mb-2 tracking-tight ${
                isDarkTheme ? 'text-white drop-shadow-sm' : 'text-slate-900'
              }`}
            >
              {isDragOver
                ? 'Відпустіть файли для завантаження'
                : activeTab === 'photo'
                ? 'Завантажте фото (HEIC, RAW CR2/NEF/ARW, JPG, PNG, WEBP)'
                : activeTab === 'text'
                ? 'Завантажте документы (PDF, TXT, MD, JSON, CSV)'
                : activeTab === 'video'
                ? 'Завантажте відео чи аудіо (MP4, WEBM, MP3, WAV, OGG)'
                : 'Завантажте файли будь-якого формату для конвертації'}
            </h3>

            <p
              className={`text-xs sm:text-sm max-w-md mb-4 ${
                isDarkTheme ? 'text-slate-200/90' : 'text-slate-600'
              }`}
            >
              Натисніть для вибору файлів або вставте з буферу обміну (
              <span
                className={`font-mono text-xs px-2.5 py-0.5 rounded-full border ${
                  isDarkTheme
                    ? 'bg-black/30 text-sky-300 border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                    : 'bg-slate-100 text-blue-700 border-slate-300 font-bold'
                }`}
              >
                Ctrl+V
              </span>
              )
            </p>

            {/* Formats Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
              {(activeTab === 'photo'
                ? ['HEIC', 'CR2', 'NEF', 'ARW', 'DNG', 'JPG', 'PNG', 'WEBP', 'PDF']
                : activeTab === 'text'
                ? ['PDF', 'TXT', 'MD', 'JSON', 'CSV', 'HTML', 'RTF']
                : activeTab === 'video'
                ? ['MP4', 'WEBM', 'MP3', 'WAV', 'OGG', 'M4A']
                : ['HEIC', 'RAW', 'PDF', 'TXT', 'MP3', 'MP4']
              ).map((fmt) => (
                <span
                  key={fmt}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${
                    isDarkTheme
                      ? 'bg-blue-500/25 text-sky-200 border-blue-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                      : 'bg-blue-50 text-blue-800 border-blue-200 font-extrabold shadow-xs'
                  }`}
                >
                  .{fmt.toLowerCase()}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div
              className="flex flex-wrap items-center justify-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:scale-95 rounded-full shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all border border-blue-300/40"
              >
                <FolderPlus className="w-4 h-4" />
                Вибрати файли
              </button>

              {!hasFiles && (
                <button
                  type="button"
                  onClick={onAddDemoFiles}
                  disabled={isProcessingDemo}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold active:scale-95 rounded-full border transition-all disabled:opacity-50 ${
                    isDarkTheme
                      ? 'text-slate-100 bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300 shadow-sm'
                  }`}
                >
                  <Sparkles
                    className={`w-4 h-4 ${
                      isDarkTheme ? 'text-sky-300' : 'text-blue-600'
                    }`}
                  />
                  {isProcessingDemo ? 'Створення...' : 'Спробувати тестові файли'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

