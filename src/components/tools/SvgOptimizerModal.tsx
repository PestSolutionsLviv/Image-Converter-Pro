import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Code,
  X,
  UploadCloud,
  CheckCircle2,
  Copy,
  Download,
  Sparkles,
  Check,
  Zap,
} from 'lucide-react';

interface SvgOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme?: boolean;
  initialFile?: File | null;
}

export const SvgOptimizerModal: React.FC<SvgOptimizerModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme = true,
  initialFile,
}) => {
  const [svgInput, setSvgInput] = useState<string>('');
  const [optimizedSvg, setOptimizedSvg] = useState<string>('');
  const [originalBytes, setOriginalBytes] = useState<number>(0);
  const [optimizedBytes, setOptimizedBytes] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) {
      initialFile.text().then((text) => {
        setSvgInput(text);
        optimizeSvgString(text);
      });
    }
  }, [initialFile]);

  if (!isOpen) return null;

  const optimizeSvgString = (raw: string) => {
    let clean = raw;
    const origLen = new Blob([clean]).size;
    setOriginalBytes(origLen);

    // 1. Remove XML declaration, doctype, and comments
    clean = clean.replace(/<\?xml[\s\S]*?\?>/gi, '');
    clean = clean.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
    clean = clean.replace(/<!--[\s\S]*?-->/g, '');

    // 2. Remove metadata, sodipodi, inkscape, sketch tags
    clean = clean.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    clean = clean.replace(/<(sodipodi|inkscape|sketch):[\s\S]*?\/>/gi, '');
    clean = clean.replace(/<\/?(sodipodi|inkscape|sketch):[\s\S]*?>/gi, '');

    // 3. Remove editor namespaces and attributes
    clean = clean.replace(/\s+(xmlns:(sodipodi|inkscape|sketch|adobe)="[^"]*")/gi, '');
    clean = clean.replace(/\s+(sodipodi|inkscape|sketch):[a-z0-9_-]+="[^"]*"/gi, '');
    clean = clean.replace(/\s+id="[a-z0-9_-]+"/gi, ''); // remove internal IDs if unneeded
    clean = clean.replace(/\s+(version|xml:space)="[^"]*"/gi, '');

    // 4. Collapse whitespace and trim
    clean = clean.replace(/\s{2,}/g, ' ').trim();
    clean = clean.replace(/> </g, '><');

    const optLen = new Blob([clean]).size;
    setOptimizedBytes(optLen);
    setOptimizedSvg(clean);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const text = await file.text();
      setSvgInput(text);
      optimizeSvgString(text);
    }
  };

  const handleManualInput = (val: string) => {
    setSvgInput(val);
    if (val.trim().startsWith('<svg')) {
      optimizeSvgString(val);
    } else {
      setOptimizedSvg('');
    }
  };

  const handleCopy = () => {
    if (!optimizedSvg) return;
    navigator.clipboard.writeText(optimizedSvg);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!optimizedSvg) return;
    const blob = new Blob([optimizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const savingsPct =
    originalBytes > 0
      ? Math.max(0, Math.round(((originalBytes - optimizedBytes) / originalBytes) * 100))
      : 0;

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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500/25 to-pink-500/25 border border-purple-400/40 text-purple-400 flex items-center justify-center shadow-inner">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                SVG Оптимізатор
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Vector Minifier
                </span>
              </h3>
              <p className="text-xs text-slate-400">Стиснення SVG-іконок та очищення від сміття графічних редакторів</p>
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
          {/* Upload or Paste */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all active:scale-95"
            >
              <UploadCloud className="w-4 h-4 text-purple-400" />
              <span>Завантажити .SVG файл</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileSelected}
              className="hidden"
            />
            <span className="text-xs text-slate-400">або вставте код нижче</span>
          </div>

          {/* Code Input */}
          <div>
            <textarea
              value={svgInput}
              onChange={(e) => handleManualInput(e.target.value)}
              placeholder="Вставте SVG код сюди (<svg ...>)..."
              rows={4}
              className="w-full text-xs font-mono p-3 rounded-xl bg-black/40 border border-white/15 text-slate-200 focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* Optimization Stats Banner */}
          {optimizedSvg && (
            <div className="p-4 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold font-mono text-xs shrink-0">
                  -{savingsPct}%
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-200">
                    {originalBytes} байт → {optimizedBytes} байт
                  </div>
                  <div className="text-[10px] text-purple-300/80">
                    Зекономлено {originalBytes - optimizedBytes} байт без втрати геометрії
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all active:scale-95"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Скопійовано' : 'Копіювати'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all active:scale-95 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.SVG</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Preview */}
          {optimizedSvg && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Прев’ю оптимізованого SVG:
              </span>
              <div className="p-6 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-center min-h-[140px]">
                <div
                  dangerouslySetInnerHTML={{ __html: optimizedSvg }}
                  className="max-w-[120px] max-h-[120px] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400">100% клієнтська обробка</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/15"
          >
            Закрити
          </button>
        </div>
      </motion.div>
    </div>
  );
};
