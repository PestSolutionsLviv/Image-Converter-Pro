import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileSearch,
  X,
  UploadCloud,
  CheckCircle2,
  Copy,
  Download,
  Sparkles,
  Check,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface OcrExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme?: boolean;
  initialFile?: File | null;
}

export const OcrExtractorModal: React.FC<OcrExtractorModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme = true,
  initialFile,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrLanguage, setOcrLanguage] = useState<'ukr' | 'eng' | 'ukr+eng'>('ukr+eng');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPct, setProgressPct] = useState<number>(0);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (!isOpen) return null;

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRecognizedText('');
      setProgressPct(0);
      setProgressStatus('');
    }
  };

  const handleRecognize = async () => {
    if (!imageFile) return;
    setIsProcessing(true);
    setProgressStatus('Завантаження OCR рушія...');
    setProgressPct(5);

    try {
      const worker = await createWorker(ocrLanguage, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgressStatus('Розпізнавання тексту на зображенні...');
            setProgressPct(Math.round(m.progress * 100));
          } else if (m.status) {
            setProgressStatus(m.status);
          }
        },
      });

      const ret = await worker.recognize(imageFile);
      setRecognizedText(ret.data.text.trim());
      setProgressStatus('Готово!');
      setProgressPct(100);
      await worker.terminate();
    } catch (err: any) {
      console.error('OCR error:', err);
      setProgressStatus(`Помилка OCR: ${err.message || 'Не вдалося обробити'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!recognizedText) return;
    navigator.clipboard.writeText(recognizedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!recognizedText) return;
    const blob = new Blob([recognizedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_text_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/25 to-blue-500/25 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-inner">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                OCR Сканер Тексту
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Tesseract WASM
                </span>
              </h3>
              <p className="text-xs text-slate-400">Розпізнавання тексту зі сканів та фотографій 100% офлайн</p>
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

        {/* Body */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto no-scrollbar">
          {/* File Picker or Image Preview */}
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-white/20 hover:border-cyan-400/60 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleImageSelected}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-200">
                Виберіть фото документа, квитанції чи скріншот
              </p>
              <span className="text-[10px] text-slate-400">PNG, JPG, WebP, BMP</span>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 p-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={previewUrl}
                  alt="OCR preview"
                  className="w-16 h-16 object-cover rounded-xl border border-white/10"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{imageFile?.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {((imageFile?.size || 0) / 1024 / 1024).toFixed(2)} МБ
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(null);
                  setRecognizedText('');
                }}
                className="p-2 rounded-xl border border-white/10 hover:bg-rose-500/20 text-rose-400 transition-all text-xs flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Інше фото</span>
              </button>
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Мова розпізнавання:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'ukr', label: 'Українська' },
                { id: 'eng', label: 'English' },
                { id: 'ukr+eng', label: 'Укр + Eng' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setOcrLanguage(lang.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    ocrLanguage === lang.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress State */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span>{progressStatus}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* OCR Result Box */}
          {recognizedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold px-1 text-slate-300">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Розпізнаний текст:
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Скопійовано' : 'Копіювати'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 transition-all active:scale-95"
                  >
                    <Download className="w-3 h-3" />
                    <span>.TXT</span>
                  </button>
                </div>
              </div>

              <textarea
                value={recognizedText}
                onChange={(e) => setRecognizedText(e.target.value)}
                rows={7}
                className="w-full text-xs font-mono p-3.5 rounded-2xl bg-black/40 border border-white/15 text-slate-200 focus:border-cyan-400 focus:outline-none leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Footer Action */}
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
            disabled={isProcessing || !imageFile}
            onClick={handleRecognize}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 rounded-full transition-all active:scale-95 disabled:opacity-40 shadow-lg shadow-cyan-500/25"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Розпізнавання...' : 'Розпізнати текст'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
