import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  X,
  Layers,
  Scissors,
  RotateCw,
  Download,
  UploadCloud,
  CheckCircle2,
  Trash2,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

interface PdfWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme?: boolean;
  initialFile?: File | null;
}

type Mode = 'merge' | 'split' | 'rotate';

export const PdfWorkshopModal: React.FC<PdfWorkshopModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme = true,
  initialFile,
}) => {
  const [mode, setMode] = useState<Mode>('merge');
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState<string>('');
  const [splitRange, setSplitRange] = useState<string>('1-2');
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (!isOpen) return null;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = (Array.from(e.target.files) as File[]).filter((f) =>
        f.name.toLowerCase().endsWith('.pdf')
      );
      if (mode === 'merge') {
        setPdfFiles((prev) => [...prev, ...files]);
      } else {
        setPdfFiles(files.slice(0, 1));
      }
      setResultUrl(null);
      setStatusMessage(null);
    }
  };

  const removeFile = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= pdfFiles.length) return;
    const newArr = [...pdfFiles];
    const temp = newArr[index];
    newArr[index] = newArr[newIdx];
    newArr[newIdx] = temp;
    setPdfFiles(newArr);
  };

  // --- 1. MERGE PDFS ---
  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      setStatusMessage('Будь ласка, додайте щонайменше 2 PDF-файли для об’єднання.');
      return;
    }
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultName(`merged_${Date.now()}.pdf`);
      setStatusMessage(`Успішно об’єднано ${pdfFiles.length} файлів!`);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Помилка об’єднання: ${err.message || 'Некоректний PDF'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 2. SPLIT / EXTRACT PAGES ---
  const handleSplit = async () => {
    if (pdfFiles.length === 0) return;
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const file = pdfFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const totalPages = srcPdf.getPageCount();

      // Parse range like "1-3, 5" (1-indexed)
      const pagesToExtract = new Set<number>();
      const parts = splitRange.split(',').map((p) => p.trim());

      for (const part of parts) {
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
              pagesToExtract.add(p - 1);
            }
          }
        } else {
          const p = parseInt(part, 10);
          if (!isNaN(p) && p >= 1 && p <= totalPages) {
            pagesToExtract.add(p - 1);
          }
        }
      }

      if (pagesToExtract.size === 0) {
        setStatusMessage(`Введіть коректні сторінки (від 1 до ${totalPages}).`);
        setIsProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(
        srcPdf,
        Array.from(pagesToExtract).sort((a, b) => a - b)
      );
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultName(`extracted_p${splitRange.replace(/\s+/g, '')}.pdf`);
      setStatusMessage(`Вилучено ${pagesToExtract.size} стор. із ${totalPages}!`);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Помилка розділення: ${err.message || 'Некоректний діапазон'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. ROTATE PAGES ---
  const handleRotate = async () => {
    if (pdfFiles.length === 0) return;
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const file = pdfFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotationAngle));
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultName(`rotated_${rotationAngle}deg.pdf`);
      setStatusMessage(`Усі ${pages.length} стор. повернуто на ${rotationAngle}°!`);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Помилка ротації: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-2xl animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`rounded-[32px] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border shadow-2xl transition-colors ${
          isDarkTheme
            ? 'bg-slate-900/95 text-slate-100 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.7)]'
            : 'bg-white text-slate-800 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/25 to-amber-500/25 border border-rose-400/40 text-rose-400 flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                PDF Майстерня
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  100% In-Browser
                </span>
              </h3>
              <p className="text-xs text-slate-400">Об’єднання, розділення та ротація сторінок без сервера</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-black/20 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('merge');
                setResultUrl(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                mode === 'merge'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Об'єднати</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('split');
                setResultUrl(null);
                if (pdfFiles.length > 1) setPdfFiles(pdfFiles.slice(0, 1));
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                mode === 'split'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Розділити</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('rotate');
                setResultUrl(null);
                if (pdfFiles.length > 1) setPdfFiles(pdfFiles.slice(0, 1));
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                mode === 'rotate'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RotateCw className="w-4 h-4" />
              <span>Повернути</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto no-scrollbar">
          {/* File Picker Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-white/20 hover:border-blue-400/60 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple={mode === 'merge'}
              onChange={handleFilesSelected}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-sky-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-200">
              {mode === 'merge'
                ? 'Натисніть для вибору 2+ PDF файлів для об’єднання'
                : 'Натисніть для вибору PDF документа'}
            </p>
            <span className="text-[10px] text-slate-400">PDF файли будь-якого розміру</span>
          </div>

          {/* Selected Files List */}
          {pdfFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                <span>Вибрані документи ({pdfFiles.length}):</span>
                {mode === 'merge' && <span className="text-[10px] font-normal">Порядок зверху вниз</span>}
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar">
                {pdfFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-mono text-slate-500 font-bold w-4 text-center">{idx + 1}</span>
                      <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate text-slate-200">{file.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({(file.size / 1024 / 1024).toFixed(2)} МБ)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {mode === 'merge' && (
                        <>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveFile(idx, 'up')}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                            title="Перемістити вище"
                          >
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                        title="Видалити"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode-Specific Settings */}
          {mode === 'split' && pdfFiles.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                Діапазон сторінок для вилучення:
              </label>
              <input
                type="text"
                value={splitRange}
                onChange={(e) => setSplitRange(e.target.value)}
                placeholder="наприклад: 1-3, 5, 8-10"
                className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-blue-400"
              />
              <p className="text-[10px] text-slate-400">
                Введіть номери окремих сторінок або діапазони через кому (наприклад: 1-5, 8).
              </p>
            </div>
          )}

          {mode === 'rotate' && pdfFiles.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <label className="block text-xs font-bold text-slate-200">Кут повороту сторінок:</label>
              <div className="flex items-center gap-2">
                {[90, 180, 270].map((angle) => (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => setRotationAngle(angle)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      rotationAngle === angle
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    +{angle}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-400/30 text-xs text-sky-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Download Output Result */}
          {resultUrl && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-emerald-200 truncate">{resultName}</div>
                  <div className="text-[10px] text-emerald-300/80">Готово до завантаження</div>
                </div>
              </div>

              <a
                href={resultUrl}
                download={resultName}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Зберегти PDF</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Закрити
          </button>

          <button
            type="button"
            disabled={
              isProcessing ||
              (mode === 'merge' ? pdfFiles.length < 2 : pdfFiles.length === 0)
            }
            onClick={
              mode === 'merge'
                ? handleMerge
                : mode === 'split'
                ? handleSplit
                : handleRotate
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 rounded-full transition-all active:scale-95 disabled:opacity-40 shadow-lg shadow-blue-500/25"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Обробка...'
                : mode === 'merge'
                ? `Об’єднати ${pdfFiles.length} файлів`
                : mode === 'split'
                ? 'Вилучити сторінки'
                : `Повернути на ${rotationAngle}°`}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
