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

  // Platform detection for Mac/Windows paste hotkey
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.platform);
  const pasteShortcut = isMac ? '⌘V' : 'Ctrl+V';

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

  const CATEGORY_TABS = [
    { 
      id: 'photo' as DropZoneTab, 
      label: 'Фото & RAW', 
      icon: Camera, 
      primaryFormats: ['HEIC', 'RAW', 'JPG', 'PNG'], 
      extraCount: 5 
    },
    { 
      id: 'text' as DropZoneTab, 
      label: 'Документи', 
      icon: FileText, 
      primaryFormats: ['DOCX', 'PDF', 'TXT', 'MD'], 
      extraCount: 6 
    },
    { 
      id: 'video' as DropZoneTab, 
      label: 'Відео & Аудіо', 
      icon: Video, 
      primaryFormats: ['MP4', 'WEBM', 'MP3', 'WAV'], 
      extraCount: 4 
    },
    { 
      id: 'units' as DropZoneTab, 
      label: 'Величини & Валюти', 
      icon: Calculator, 
      primaryFormats: ['Метри', 'Валюти', 'Вага'], 
      extraCount: 6 
    },
  ];

  return (
    <div className="space-y-4">
      {/* Categories Selector Navigation Bar */}
      <div
        className={`grid grid-cols-2 lg:grid-cols-4 items-stretch gap-2 p-1.5 rounded-2xl border backdrop-blur-3xl transition-all duration-300 ${
          isDarkTheme
            ? 'bg-slate-900/70 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)]'
            : 'bg-white/90 border-slate-200 shadow-md shadow-slate-200/50'
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
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-300 active:scale-95 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white border border-blue-300/50 shadow-[0_10px_28px_rgba(37,99,235,0.45),inset_0_1px_1px_rgba(255,255,255,0.5)] scale-[1.02]'
                  : isDarkTheme
                  ? 'bg-white/[0.03] text-slate-200 hover:text-white hover:bg-white/[0.08] border border-white/5 hover:border-white/15'
                  : 'bg-slate-100/80 text-slate-800 hover:text-slate-950 hover:bg-slate-200/90 border border-slate-200/80'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-inner'
                    : isDarkTheme
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-400/20'
                    : 'bg-blue-100 text-blue-600 border border-blue-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-bold tracking-tight leading-tight truncate">
                  {tab.label}
                </div>
                <div className="flex items-center gap-1 mt-0.5 overflow-hidden flex-wrap text-[11px]">
                  {tab.primaryFormats.slice(0, 3).map((f, idx) => (
                    <span
                      key={idx}
                      className={`font-mono ${
                        isActive
                          ? 'text-sky-100/90'
                          : isDarkTheme
                          ? 'text-slate-400/90'
                          : 'text-slate-500'
                      }`}
                    >
                      {f}{idx < 2 ? ',' : ''}
                    </span>
                  ))}
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isDarkTheme
                        ? 'bg-white/10 text-sky-300'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    +{tab.extraCount}
                  </span>
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
                ? 'border-white/10 bg-white/[0.05] hover:border-sky-300/50 hover:bg-white/[0.08] py-6 px-6 shadow-[0_15px_40px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)]'
                : 'border-white/10 bg-white/[0.05] hover:border-sky-300/50 hover:bg-white/[0.08] py-5 sm:py-6 px-5 shadow-[0_25px_60px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]'
              : hasFiles
              ? 'border-slate-200/90 bg-white/80 hover:border-blue-400 hover:bg-white py-6 px-6 shadow-md shadow-slate-200/50'
              : 'border-slate-200/90 bg-white/80 hover:border-blue-400 hover:bg-white py-5 sm:py-6 px-5 shadow-lg shadow-slate-200/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*,text/*,.heic,.heif,.cr2,.cr3,.nef,.nrw,.arw,.dng,.orf,.rw2,.raf,.pef,.raw,.pdf,.txt,.md,.json,.csv,.html,.rtf,.docx,.doc,.mp3,.wav,.ogg,.m4a,.mp4,.webm,.mov,.avi"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center text-center">
            {/* Animated Icon Circle */}
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-2.5 transition-transform duration-300 group-hover:scale-105 shadow-lg ${
                isDragOver
                  ? 'bg-gradient-to-br from-blue-500 to-sky-400 text-white shadow-blue-500/40 border border-white/40'
                  : isDarkTheme
                  ? 'bg-white/10 text-sky-300 border border-white/20 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-sky-400 group-hover:text-white group-hover:border-white/40 shadow-blue-500/20 backdrop-blur-2xl'
                  : 'bg-blue-50 text-blue-600 border border-blue-200 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-sky-500 group-hover:text-white group-hover:border-blue-300 shadow-blue-200/50'
              }`}
            >
              <UploadCloud className="w-6 h-6" />
            </div>

            <h3
              className={`text-base sm:text-xl font-bold mb-1 tracking-tight ${
                isDarkTheme ? 'text-white' : 'text-slate-900'
              }`}
            >
              {activeTab === 'photo'
                ? 'Завантажте фото (HEIC, RAW CR2/NEF/ARW, JPG, PNG, WEBP)'
                : activeTab === 'text'
                ? 'Завантажте документи (DOCX, PDF, TXT, MD, JSON, CSV)'
                : activeTab === 'video'
                ? 'Завантажте відео чи аудіо (MP4, WEBM, MP3, WAV, OGG)'
                : 'Завантажте файли будь-якого формату для конвертації'}
            </h3>

            <p
              className={`text-xs max-w-md mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Натисніть для вибору або просто натисніть{' '}
              <kbd
                className={`font-mono text-xs px-2 py-0.5 rounded-lg border shadow-2xs ${
                  isDarkTheme
                    ? 'bg-white/10 text-slate-200 border-white/20'
                    : 'bg-slate-100 text-slate-800 border-slate-300 font-bold'
                }`}
              >
                {pasteShortcut}
              </kbd>
            </p>

            {/* Formats Tags (Dimmer so buttons stand out) */}
            <div className="flex flex-wrap items-center justify-center gap-1 mb-3.5">
              {(activeTab === 'photo'
                ? ['HEIC', 'CR2', 'NEF', 'ARW', 'DNG', 'JPG', 'PNG', 'WEBP', 'PDF']
                : activeTab === 'text'
                ? ['DOCX', 'PDF', 'TXT', 'MD', 'JSON', 'CSV', 'HTML', 'RTF']
                : activeTab === 'video'
                ? ['MP4', 'WEBM', 'MP3', 'WAV', 'OGG', 'M4A']
                : ['HEIC', 'RAW', 'PDF', 'TXT', 'MP3', 'MP4']
              ).map((fmt) => (
                <span
                  key={fmt}
                  className={`text-[10.5px] font-mono font-medium px-2 py-0.5 rounded-md border transition-all ${
                    isDarkTheme
                      ? 'bg-white/[0.04] text-slate-400 border-white/5'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
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
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:scale-95 rounded-full border border-blue-300/40 transition-all shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)]"
              >
                <FolderPlus className="w-4 h-4" />
                Вибрати файли
              </button>

              <button
                type="button"
                onClick={onAddDemoFiles}
                disabled={isProcessingDemo}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-full border transition-all active:scale-95 disabled:opacity-50 ${
                  isDarkTheme
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200 hover:text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 shadow-xs'
                }`}
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                {isProcessingDemo ? 'Завантаження...' : 'Спробувати демо-файли'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
