/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';

import { Header } from './components/Header';
import { DropZone, DropZoneTab } from './components/DropZone';
import { GlobalSettings } from './components/GlobalSettings';

import { BatchActions } from './components/BatchActions';
import { PrivacyInfo } from './components/PrivacyInfo';
import type { LegalTab } from './components/LegalModal';

// Code-split heavy modals and subcomponents for instant mobile initial load
// FileCard uses motion/react for swipe gestures — lazy loaded after first file added
const FileCard = React.lazy(() => import('./components/FileCard').then(m => ({ default: m.FileCard })));
const UnitAndCurrencyConverter = React.lazy(() => import('./components/UnitAndCurrencyConverter').then(m => ({ default: m.UnitAndCurrencyConverter })));
const CompareModal = React.lazy(() => import('./components/CompareModal').then(m => ({ default: m.CompareModal })));
const BatchRenameModal = React.lazy(() => import('./components/BatchRenameModal').then(m => ({ default: m.BatchRenameModal })));
const ImageAdjustmentModal = React.lazy(() => import('./components/ImageAdjustmentModal').then(m => ({ default: m.ImageAdjustmentModal })));
const KeyboardShortcutsModal = React.lazy(() => import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));
const LegalModal = React.lazy(() => import('./components/LegalModal').then(m => ({ default: m.LegalModal })));

import {
  ConversionSettings,
  FileItem,
  TargetFormat,
  ImageAdjustments,
} from './types';
import {
  convertFileItem,
  downloadAllAsZip,
  getImageDimensions,
  isHeicFile,
  decodeHeicToBlob,
  isRawFile,
  decodeRawToBlob,
  detectFileCategory,
} from './lib/converter';
import { createDemoPhotoFiles } from './lib/sampleFiles';
import { getUserLocalData, saveUserLocalData } from './lib/userStorage';
import { ProtectedContact } from './components/ProtectedContact';
import { Image, Layers, Sparkles, Filter, RefreshCw, Type, Heart, ShieldCheck, Scale, ExternalLink, UploadCloud } from 'lucide-react';



export default function App() {
  const [activeCategoryTab, setActiveCategoryTab] = useState<DropZoneTab>('photo');
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const dragCounterRef = React.useRef(0);

  React.useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current++;
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsWindowDragging(true);
      }
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsWindowDragging(false);
      }
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsWindowDragging(false);
      if (e.dataTransfer?.files?.length) {
        handleFilesAdded(Array.from(e.dataTransfer.files));
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleFilesAdded]);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    return getUserLocalData<boolean>('converter_theme', true);
  });
  const [items, setItems] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingDemo, setIsProcessingDemo] = useState(false);
  const [compareItem, setCompareItem] = useState<FileItem | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<FileItem | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [legalModalState, setLegalModalState] = useState<{ isOpen: boolean; tab: LegalTab }>({
    isOpen: false,
    tab: 'privacy',
  });


  // Save theme changes locally in user cookies & localStorage
  useEffect(() => {
    saveUserLocalData('converter_theme', isDarkTheme);
  }, [isDarkTheme]);

  // Drag and drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [globalSettings, setGlobalSettings] = useState<ConversionSettings>(() => {
    return getUserLocalData<ConversionSettings>('converter_global_settings', {
      targetFormat: 'jpeg',
      documentTargetFormat: 'pdf',
      audioTargetFormat: 'wav',
      videoTargetFormat: 'mp4_audio',
      quality: 0.88,
      resizeMode: 'original',
      backgroundColor: '#ffffff',
      preserveAspectRatio: true,
      preserveExif: true,
      autoDownloadZip: false,
    });
  });

  // Save global settings locally in user cookies & localStorage
  useEffect(() => {
    saveUserLocalData('converter_global_settings', globalSettings);
  }, [globalSettings]);


  // Handle files added (drag & drop or picker)
  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const newItems: FileItem[] = [];

      for (const file of files) {
        const id = Math.random().toString(36).substring(2, 11);
        const ext = file.name.split('.').pop()?.toLowerCase() || 'file';
        const category = detectFileCategory(file);

        let previewUrl: string | undefined = undefined;
        let dimensions: { width: number; height: number } | undefined = undefined;
        let textPreview: string | undefined = undefined;

        if (category === 'image' && !isHeicFile(file) && !isRawFile(file)) {
          previewUrl = URL.createObjectURL(file);
          try {
            dimensions = await getImageDimensions(previewUrl);
          } catch (e) {
            console.warn('Could not read image dimensions:', e);
          }
        } else if (category === 'audio' || category === 'video') {
          previewUrl = URL.createObjectURL(file);
        } else if (category === 'document') {
          try {
            if (ext === 'docx') {
              const mammothModule = await import('mammoth/mammoth.browser');
              const mammoth = (mammothModule.default || mammothModule) as any;
              const res = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
              const clean = (res.value || '').replace(/\s+/g, ' ').trim();
              if (clean.length > 0) {
                textPreview = clean.slice(0, 120);
              }
            } else if (['txt', 'md', 'json', 'csv', 'html', 'rtf', 'xml'].includes(ext)) {
              const rawText = await file.text();
              if (!/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(rawText.slice(0, 80))) {
                textPreview = rawText.replace(/\s+/g, ' ').trim().slice(0, 120);
              }
            }
          } catch (e) {
            textPreview = undefined;
          }
        }

        newItems.push({
          id,
          file,
          name: file.name,
          category,
          originalSize: file.size,
          originalFormat: ext,
          previewUrl,
          textPreview,
          dimensions,
          status: 'idle',
          progress: 0,
        });
      }

      setItems((prev) => [...prev, ...newItems]);

      // Process HEIC & RAW previews asynchronously
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
        } else if (isRawFile(item.file)) {
          decodeRawToBlob(item.file)
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
              console.warn('Initial RAW thumbnail decode failed:', err);
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

      const result = await convertFileItem(
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
        errorMessage: err?.message || 'Помилка при конвертації файлу',
      };
    }
  };

  // Convert all items in queue
  const handleConvertAll = useCallback(async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);

    const updatedItems = [...items];
    const finalConvertedItems: FileItem[] = [];

    // Process 2 files in parallel for efficiency while keeping UI responsive
    const batchSize = 2;
    for (let i = 0; i < updatedItems.length; i += batchSize) {
      const chunk = updatedItems.slice(i, i + batchSize);
      const promises = chunk.map((item) =>
        processItem(item, globalSettings)
      );

      const results = await Promise.all(promises);

      results.forEach((res) => {
        finalConvertedItems.push(res);
        setItems((prev) => prev.map((i) => (i.id === res.id ? res : i)));
      });
    }

    setIsProcessing(false);

    // If auto-download ZIP is enabled, trigger automatic download for all successfully converted files
    if (globalSettings.autoDownloadZip) {
      const completedItems = finalConvertedItems.filter((i) => i.status === 'completed');
      if (completedItems.length > 0) {
        downloadAllAsZip(finalConvertedItems, `heic_converted_${Date.now()}.zip`);
      }
    }
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
        if (legalModalState.isOpen) setLegalModalState((prev) => ({ ...prev, isOpen: false }));
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
    legalModalState,

    handleConvertAll,
    handleDownloadZip,
    handleClearAll,
  ]);

  return (
    <div
      className={`min-h-screen font-sans antialiased flex flex-col relative overflow-x-hidden transition-colors duration-300 ${
        isDarkTheme ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      
      {/* Frosted Glass Background Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {isDarkTheme ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/25 rounded-full blur-[130px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-700/25 rounded-full blur-[130px]" />
            <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-purple-600/20 rounded-full blur-[110px]" />
            <div className="absolute bottom-[20%] left-[15%] w-[30%] h-[30%] bg-sky-500/15 rounded-full blur-[100px]" />
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-300/30 rounded-full blur-[130px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-300/35 rounded-full blur-[130px]" />
            <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-indigo-200/40 rounded-full blur-[110px]" />
            <div className="absolute bottom-[20%] left-[15%] w-[30%] h-[30%] bg-blue-200/30 rounded-full blur-[100px]" />
          </>
        )}
      </div>

      {/* Top Header */}
      <div className="relative z-20">
        <Header
          onAddDemoFiles={handleAddDemoFiles}
          isProcessingDemo={isProcessingDemo}
          fileCount={items.length}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          isDarkTheme={isDarkTheme}
          onToggleTheme={() => setIsDarkTheme((prev) => !prev)}
          activeTab={activeCategoryTab}
          onTabChange={setActiveCategoryTab}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Upload Dropzone and Category Selector */}
        <DropZone
          onFilesAdded={handleFilesAdded}
          onAddDemoFiles={handleAddDemoFiles}
          isProcessingDemo={isProcessingDemo}
          hasFiles={items.length > 0}
          activeTab={activeCategoryTab}
          onTabChange={setActiveCategoryTab}
          isDarkTheme={isDarkTheme}
        />

        {/* Units and Currency Converter View */}
        {activeCategoryTab === 'units' && (
          <div className="pt-2">
            <React.Suspense fallback={<div className="p-12 text-center text-xs font-semibold text-slate-400">Завантаження конвертера величин...</div>}>
              <UnitAndCurrencyConverter
                isDarkTheme={isDarkTheme}
                onToggleTheme={() => setIsDarkTheme((prev) => !prev)}
              />
            </React.Suspense>
          </div>
        )}


        {/* Global Settings Panel */}
        {items.length > 0 && (
          <GlobalSettings
            settings={globalSettings}
            onChange={setGlobalSettings}
            disabled={isProcessing}
            isDarkTheme={isDarkTheme}
          />
        )}

        {/* File Queue List */}
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className={`text-sm font-bold flex items-center gap-2 ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>
                <Layers className={`w-4 h-4 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} />
                Список файлів ({items.length})
                <span className={`text-xs font-normal ml-1 hidden sm:inline ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                  • перетягуйте для зміни порядку або свайпайте для дій
                </span>
              </h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(true)}
                  disabled={isProcessing}
                  className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1 rounded-xl backdrop-blur-md transition-all disabled:opacity-50 ${
                    isDarkTheme
                      ? 'text-blue-400 hover:text-blue-300 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30'
                      : 'text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-xs'
                  }`}
                  title="Додати префікс, суфікс або змінити назви файлів"
                >
                  <Type className="w-3.5 h-3.5" />
                  Перейменувати всі
                </button>

                <button
                  type="button"
                  onClick={handleConvertAll}
                  disabled={isProcessing}
                  className={`text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors ${
                    isDarkTheme ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-800'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  {isProcessing ? 'Конвертація...' : 'Перезапустити всі'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <React.Suspense fallback={null}>
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
                    isDarkTheme={isDarkTheme}
                  />
                ))}
              </React.Suspense>
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
          isDarkTheme={isDarkTheme}
        />

        {/* Technical & Privacy Info Card (Only on home file view without clutter) */}
        {activeCategoryTab !== 'units' && !hasFiles && (
          <PrivacyInfo isDarkTheme={isDarkTheme} />
        )}

      </main>

      <React.Suspense fallback={null}>
        {/* Compare Before/After Modal */}
        {compareItem && (
          <CompareModal
            item={compareItem}
            onClose={() => setCompareItem(null)}
          />
        )}

        {/* Batch Rename Modal */}
        {isRenameModalOpen && (
          <BatchRenameModal
            items={items}
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            onApplyRename={handleApplyBatchRename}
          />
        )}

        {/* Image Adjustments Modal */}
        {adjustingItem && (
          <ImageAdjustmentModal
            item={adjustingItem}
            isOpen={!!adjustingItem}
            onClose={() => setAdjustingItem(null)}
            onSaveAdjustments={handleSaveAdjustments}
          />
        )}

        {/* Keyboard Shortcuts Modal */}
        {isShortcutsModalOpen && (
          <KeyboardShortcutsModal
            isOpen={isShortcutsModalOpen}
            onClose={() => setIsShortcutsModalOpen(false)}
          />
        )}

        {/* Privacy Policy & Terms Modal */}
        {legalModalState.isOpen && (
          <LegalModal
            isOpen={legalModalState.isOpen}
            initialTab={legalModalState.tab}
            onClose={() => setLegalModalState((prev) => ({ ...prev, isOpen: false }))}
            isDarkTheme={isDarkTheme}
          />
        )}
      </React.Suspense>


      {/* Footer */}
      <footer
        className={`relative z-10 border-t py-8 mt-12 text-center text-xs backdrop-blur-xl transition-colors duration-300 ${
          isDarkTheme
            ? 'border-white/10 bg-slate-950/40 text-slate-400'
            : 'border-slate-200 bg-white/70 text-slate-600 shadow-sm'
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center justify-center gap-2.5">
          <p className={`font-bold text-sm tracking-wide ${isDarkTheme ? 'text-slate-200' : 'text-slate-800'}`}>
            © 2026 Universal Converter Pro
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 my-0.5 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <span>Створено з ❤️</span>
              <a
                href="https://github.com/PestSolutionsLviv"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sky-400 hover:text-sky-300 hover:underline transition-colors inline-flex items-center gap-1"
              >
                <span>Тарас Салдан</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
            <span className={isDarkTheme ? 'text-slate-700' : 'text-slate-300'}>•</span>
            <ProtectedContact
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline transition-colors"
              title="Служба підтримки"
            />
            <span className={isDarkTheme ? 'text-slate-700' : 'text-slate-300'}>•</span>
            <a
              href="https://www.buymeacoffee.com/pestsolutions"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all active:scale-95 ${
                isDarkTheme
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-400/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 shadow-xs'
              }`}
              title="Підтримати проєкт (Buy Me a Coffee)"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Buy Me a Coffee ☕</span>
            </a>
          </div>



          {/* Legal Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-1">
            <button
              type="button"
              onClick={() => setLegalModalState({ isOpen: true, tab: 'privacy' })}
              className={`inline-flex items-center gap-1.5 font-semibold hover:underline transition-colors ${
                isDarkTheme ? 'text-slate-300 hover:text-sky-300' : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Політика конфіденційності
            </button>
            <span className={isDarkTheme ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <button
              type="button"
              onClick={() => setLegalModalState({ isOpen: true, tab: 'terms' })}
              className={`inline-flex items-center gap-1.5 font-semibold hover:underline transition-colors ${
                isDarkTheme ? 'text-slate-300 hover:text-sky-300' : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              Умови використання
            </button>
          </div>

          <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            100% локальна обробка у браузері без передачі файлів на сервери
          </p>
        </div>
      </footer>


    </div>
  );
}
