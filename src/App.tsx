/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { GlobalSettings } from './components/GlobalSettings';
import { FileCard } from './components/FileCard';
import { BatchActions } from './components/BatchActions';
import { CompareModal } from './components/CompareModal';
import { BatchRenameModal } from './components/BatchRenameModal';
import { ImageAdjustmentModal } from './components/ImageAdjustmentModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { PrivacyInfo } from './components/PrivacyInfo';

import {
  ConversionSettings,
  FileItem,
  TargetFormat,
  ImageAdjustments,
} from './types';
import {
  convertSingleImage,
  downloadAllAsZip,
  getImageDimensions,
  isHeicFile,
  decodeHeicToBlob,
} from './lib/converter';
import { createDemoPhotoFiles } from './lib/sampleFiles';
import { Image, Layers, Sparkles, Filter, RefreshCw, Type } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingDemo, setIsProcessingDemo] = useState(false);
  const [compareItem, setCompareItem] = useState<FileItem | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<FileItem | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Drag and drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [globalSettings, setGlobalSettings] = useState<ConversionSettings>({
    targetFormat: 'jpeg',
    quality: 0.88,
    resizeMode: 'original',
    backgroundColor: '#ffffff',
    preserveAspectRatio: true,
    preserveExif: true,
  });

  // Handle files added (drag & drop or picker)
  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const newItems: FileItem[] = [];

      for (const file of files) {
        const id = Math.random().toString(36).substring(2, 11);
        const ext = file.name.split('.').pop()?.toLowerCase() || 'image';

        let previewUrl: string | undefined = undefined;
        let dimensions: { width: number; height: number } | undefined = undefined;

        // Create object URL for standard images
        if (!isHeicFile(file) && file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
          try {
            dimensions = await getImageDimensions(previewUrl);
          } catch (e) {
            console.warn('Could not read image dimensions:', e);
          }
        }

        newItems.push({
          id,
          file,
          name: file.name,
          originalSize: file.size,
          originalFormat: ext,
          previewUrl,
          dimensions,
          status: 'idle',
          progress: 0,
        });
      }

      setItems((prev) => [...prev, ...newItems]);

      // Process HEIC previews asynchronously
      for (const item of newItems) {
        if (isHeicFile(item.file)) {
          decodeHeicToBlob(item.file)
            .then(async (decodedBlob) => {
              const url = URL.createObjectURL(decodedBlob);
              let dims: { width: number; height: number } | undefined = undefined;
              try {
                dims = await getImageDimensions(url);
              } catch (e) {}

              setItems((prev) =>
                prev.map((i) =>
                  i.id === item.id
                    ? { ...i, previewUrl: url, dimensions: dims }
                    : i
                )
              );
            })
            .catch((err) => {
              console.warn('Initial HEIC thumbnail decode failed:', err);
            });
        }
      }
    },
    []
  );

  // Add synthetic demo files for instant testing
  const handleAddDemoFiles = useCallback(async () => {
    setIsProcessingDemo(true);
    try {
      const demoFiles = await createDemoPhotoFiles();
      await handleFilesAdded(demoFiles);
    } catch (e) {
      console.error('Failed to create demo files:', e);
    } finally {
      setIsProcessingDemo(false);
    }
  }, [handleFilesAdded]);

  // Convert single item
  const processItem = async (
    item: FileItem,
    settings: ConversionSettings
  ): Promise<FileItem> => {
    try {
      const isHeic = isHeicFile(item.file);
      
      // Update status
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: isHeic ? 'heic_decoding' : 'converting',
                progress: 10,
              }
            : i
        )
      );

      const result = await convertSingleImage(
        item,
        settings,
        (progress) => {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
          );
        }
      );

      const outputUrl = URL.createObjectURL(result.outputBlob);

      return {
        ...item,
        status: 'completed',
        progress: 100,
        outputBlob: result.outputBlob,
        outputUrl,
        outputSize: result.outputSize,
        outputDimensions: result.outputDimensions,
        outputFormat: result.outputFormat,
      };
    } catch (err: any) {
      return {
        ...item,
        status: 'error',
        progress: 0,
        errorMessage: err?.message || 'Помилка при конвертації зображення',
      };
    }
  };

  // Convert all items in queue
  const handleConvertAll = useCallback(async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);

    const updatedItems = [...items];

    // Process 2 files in parallel for efficiency while keeping UI responsive
    const batchSize = 2;
    for (let i = 0; i < updatedItems.length; i += batchSize) {
      const chunk = updatedItems.slice(i, i + batchSize);
      const promises = chunk.map((item) =>
        processItem(item, globalSettings)
      );

      const results = await Promise.all(promises);

      results.forEach((res) => {
        setItems((prev) => prev.map((i) => (i.id === res.id ? res : i)));
      });
    }

    setIsProcessing(false);
  }, [items, isProcessing, globalSettings]);

  // Individual format override change
  const handleFormatChange = (id: string, format: TargetFormat) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              customSettings: {
                ...(item.customSettings || {}),
                targetFormat: format,
              },
              status: 'idle', // Mark for re-conversion if needed
            }
          : item
      )
    );
  };

  // Remove item
  const handleRemove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.outputUrl) URL.revokeObjectURL(target.outputUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  // Clear all items
  const handleClearAll = useCallback(() => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
    });
    setItems([]);
  }, [items]);

  // Download ZIP
  const handleDownloadZip = useCallback(() => {
    downloadAllAsZip(items, `heic_converted_${Date.now()}.zip`);
  }, [items]);

  // Drag and drop reordering handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      setItems((prev) => {
        const updated = [...prev];
        const [movedItem] = updated.splice(draggedIndex, 1);
        updated.splice(dropIndex, 0, movedItem);
        return updated;
      });

      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleMoveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= items.length) return;
      setItems((prev) => {
        const updated = [...prev];
        const [movedItem] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, movedItem);
        return updated;
      });
    },
    [items.length]
  );

  const handleApplyBatchRename = useCallback(
    (renameFn: (item: FileItem, index: number) => string) => {
      setItems((prev) =>
        prev.map((item, index) => ({
          ...item,
          name: renameFn(item, index),
        }))
      );
    },
    []
  );

  const handleSaveAdjustments = useCallback(
    async (id: string, adjustments: ImageAdjustments) => {
      let updatedItem: FileItem | undefined;

      setItems((prev) => {
        return prev.map((item) => {
          if (item.id === id) {
            updatedItem = { ...item, adjustments };
            return updatedItem;
          }
          return item;
        });
      });

      if (updatedItem) {
        const processed = await processItem(updatedItem, globalSettings);
        setItems((prev) =>
          prev.map((item) => (item.id === id ? processed : item))
        );
      }
    },
    [globalSettings]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keybindings if user is actively typing in an input, textarea, or select
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Ctrl + Enter or Cmd + Enter -> Convert all items
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (items.length > 0 && !isProcessing) {
          handleConvertAll();
        }
        return;
      }

      // Ctrl + O or Cmd + O -> Open file picker
      if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        const dropZoneInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (dropZoneInput) {
          dropZoneInput.click();
        }
        return;
      }

      // Shift + D -> Download ZIP
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        if (items.some((i) => i.status === 'completed')) {
          handleDownloadZip();
        }
        return;
      }

      // Shift + R -> Batch rename modal
      if (e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        if (items.length > 0) {
          setIsRenameModalOpen(true);
        }
        return;
      }

      // Delete or Backspace -> Clear all items
      if (e.key === 'Delete') {
        if (items.length > 0) {
          e.preventDefault();
          handleClearAll();
        }
        return;
      }

      // Escape -> Close active modals
      if (e.key === 'Escape') {
        if (compareItem) setCompareItem(null);
        if (isRenameModalOpen) setIsRenameModalOpen(false);
        if (adjustingItem) setAdjustingItem(null);
        if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
        return;
      }

      // '?' key -> Toggle keyboard shortcuts modal
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    items,
    isProcessing,
    compareItem,
    isRenameModalOpen,
    adjustingItem,
    isShortcutsModalOpen,
    handleConvertAll,
    handleDownloadZip,
    handleClearAll,
  ]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans antialiased flex flex-col relative overflow-x-hidden">
      
      {/* Frosted Glass Background Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/25 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-700/25 rounded-full blur-[130px]" />
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-purple-600/20 rounded-full blur-[110px]" />
        <div className="absolute bottom-[20%] left-[15%] w-[30%] h-[30%] bg-sky-500/15 rounded-full blur-[100px]" />
      </div>

      {/* Top Header */}
      <div className="relative z-20">
        <Header
          onAddDemoFiles={handleAddDemoFiles}
          isProcessingDemo={isProcessingDemo}
          fileCount={items.length}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Upload Dropzone */}
        <DropZone
          onFilesAdded={handleFilesAdded}
          onAddDemoFiles={handleAddDemoFiles}
          isProcessingDemo={isProcessingDemo}
          hasFiles={items.length > 0}
        />

        {/* Global Settings Panel */}
        {items.length > 0 && (
          <GlobalSettings
            settings={globalSettings}
            onChange={setGlobalSettings}
            disabled={isProcessing}
          />
        )}

        {/* File Queue List */}
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Список файлів ({items.length})
                <span className="text-xs text-slate-400 font-normal ml-1 hidden sm:inline">
                  • перетягуйте для зміни порядку
                </span>
              </h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(true)}
                  disabled={isProcessing}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 px-3 py-1 rounded-xl backdrop-blur-md transition-all disabled:opacity-50"
                  title="Додати префікс, суфікс або змінити назви файлів"
                >
                  <Type className="w-3.5 h-3.5" />
                  Перейменувати всі
                </button>

                <button
                  type="button"
                  onClick={handleConvertAll}
                  disabled={isProcessing}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  {isProcessing ? 'Конвертація...' : 'Перезапустити всі'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {items.map((item, index) => (
                <FileCard
                  key={item.id}
                  item={item}
                  index={index}
                  totalCount={items.length}
                  onRemove={handleRemove}
                  onCompare={setCompareItem}
                  onFormatChange={handleFormatChange}
                  onOpenAdjustments={setAdjustingItem}
                  onMoveUp={(idx) => handleMoveItem(idx, idx - 1)}
                  onMoveDown={(idx) => handleMoveItem(idx, idx + 1)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedIndex === index}
                  isDragTarget={dragOverIndex === index && draggedIndex !== index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Batch Actions Bar */}
        <BatchActions
          items={items}
          isProcessing={isProcessing}
          onConvertAll={handleConvertAll}
          onDownloadZip={handleDownloadZip}
          onClearAll={handleClearAll}
        />

        {/* Technical & Privacy Info Card */}
        <PrivacyInfo />

      </main>

      {/* Compare Before/After Modal */}
      <CompareModal
        item={compareItem}
        onClose={() => setCompareItem(null)}
      />

      {/* Batch Rename Modal */}
      <BatchRenameModal
        items={items}
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onApplyRename={handleApplyBatchRename}
      />

      {/* Image Adjustments Modal */}
      <ImageAdjustmentModal
        item={adjustingItem}
        isOpen={!!adjustingItem}
        onClose={() => setAdjustingItem(null)}
        onSaveAdjustments={handleSaveAdjustments}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/40 backdrop-blur-xl py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 HEIC Converter • Онлайн обробка фото без серверів</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Client-side WASM</span>
            <span>•</span>
            <span>Privacy First</span>
            <span>•</span>
            <span>Zero Data Upload</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
