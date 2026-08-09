import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, FileImage, Sparkles, FolderPlus, Clipboard } from 'lucide-react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  onAddDemoFiles: () => void;
  isProcessingDemo: boolean;
  hasFiles: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesAdded,
  onAddDemoFiles,
  isProcessingDemo,
  hasFiles,
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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative cursor-pointer group rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden backdrop-blur-2xl ${
        isDragOver
          ? 'border-blue-400 bg-blue-500/20 ring-4 ring-blue-500/20 scale-[1.005] shadow-2xl'
          : hasFiles
          ? 'border-white/20 bg-white/5 hover:border-blue-400/60 hover:bg-white/10 py-6 px-6 shadow-xl'
          : 'border-white/20 bg-white/5 hover:border-blue-400/60 hover:bg-white/10 py-12 px-6 shadow-2xl'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".heic,.heif,.jpg,.jpeg,.png,.webp,.avif,.bmp,.gif,image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center text-center">
        
        {/* Animated Icon Circle */}
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-lg ${
            isDragOver
              ? 'bg-blue-600 text-white shadow-blue-500/40 ring-2 ring-white/30'
              : 'bg-white/10 text-blue-400 border border-white/20 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 shadow-blue-500/20'
          }`}
        >
          <UploadCloud className="w-10 h-10" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          {isDragOver ? 'Відпустіть файли для завантаження' : 'Перетягніть HEIC або інші фото сюди'}
        </h3>

        <p className="text-sm text-slate-300 max-w-md mb-5">
          Натисніть для вибору файлів з комп'ютера або просто вставте зображення з буферу обміну (<span className="font-mono text-xs bg-white/10 text-blue-300 px-2 py-0.5 rounded-md border border-white/15">Ctrl+V</span>)
        </p>

        {/* Formats Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
          {['HEIC', 'HEIF', 'JPG', 'PNG', 'WEBP', 'PDF', 'AVIF', 'GIF', 'BMP'].map((fmt) => (
            <span
              key={fmt}
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border backdrop-blur-md ${
                fmt === 'HEIC' || fmt === 'HEIF'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                  : 'bg-white/5 text-slate-300 border-white/10'
              }`}
            >
              .{fmt.toLowerCase()}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] border border-blue-400/30"
          >
            <FolderPlus className="w-4 h-4" />
            Вибрати файли
          </button>

          {!hasFiles && (
            <button
              type="button"
              onClick={onAddDemoFiles}
              disabled={isProcessingDemo}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 active:bg-white/20 rounded-2xl border border-white/15 backdrop-blur-md transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              {isProcessingDemo ? 'Створення...' : 'Спробувати тестові фото'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
