import React, { useState, useEffect } from 'react';
import { Sliders, X, Check, RefreshCw, Sun, Contrast, Sparkles, Wand2, Eye } from 'lucide-react';
import { FileItem, ImageAdjustments } from '../types';

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  saturation: 100,
  sepia: 0,
  blur: 0,
};

interface ImageAdjustmentModalProps {
  item: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAdjustments: (id: string, adjustments: ImageAdjustments) => void;
}

export const ImageAdjustmentModal: React.FC<ImageAdjustmentModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveAdjustments,
}) => {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(
    item?.adjustments || DEFAULT_ADJUSTMENTS
  );

  useEffect(() => {
    if (item) {
      setAdjustments(item.adjustments || DEFAULT_ADJUSTMENTS);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleChange = (key: keyof ImageAdjustments, value: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
  };

  const applyPreset = (preset: Partial<ImageAdjustments>) => {
    setAdjustments({
      ...DEFAULT_ADJUSTMENTS,
      ...preset,
    });
  };

  const handleSave = () => {
    onSaveAdjustments(item.id, adjustments);
    onClose();
  };

  const filterStyle = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) grayscale(${adjustments.grayscale}%) saturate(${adjustments.saturation}%) sepia(${adjustments.sepia}%) blur(${adjustments.blur}px)`;

  const isModified =
    adjustments.brightness !== 100 ||
    adjustments.contrast !== 100 ||
    adjustments.grayscale !== 0 ||
    adjustments.saturation !== 100 ||
    adjustments.sepia !== 0 ||
    adjustments.blur !== 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl animate-fade-in">
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[32px] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-white/20">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/15 flex items-center justify-between bg-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-gradient-to-tr from-blue-500/25 to-sky-400/25 border border-blue-300/40 text-sky-300 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight drop-shadow-sm">Корекція зображення</h3>
              <p className="text-xs text-slate-300/80 truncate max-w-xs">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/15 rounded-full transition-all active:scale-95 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Live Preview Box */}
          <div className="relative bg-black/40 rounded-[24px] border border-white/15 overflow-hidden flex items-center justify-center min-h-[220px] max-h-[300px] shadow-inner backdrop-blur-2xl">
            {item.previewUrl || item.outputUrl ? (
              <img
                src={item.outputUrl || item.previewUrl}
                alt="Попередній перегляд"
                style={{ filter: filterStyle }}
                className="max-h-[280px] w-auto object-contain transition-all duration-150"
              />
            ) : (
              <div className="text-slate-400 text-xs flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-300" />
                Попередній перегляд недоступний
              </div>
            )}

            {isModified && (
              <span className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-sky-400 backdrop-blur-xl text-white text-[10px] font-bold px-3 py-1 rounded-full border border-blue-200/40 shadow-lg">
                Фільтри активовано
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-sky-300" />
              Готові стилі (Пресет)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-black/20 text-slate-200 border border-white/15 hover:bg-white/15 backdrop-blur-xl transition-all active:scale-95"
              >
                Оригінал
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ grayscale: 100, contrast: 110 })}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-black/20 text-slate-200 border border-white/15 hover:bg-white/15 backdrop-blur-xl transition-all active:scale-95"
              >
                Чорно-біле
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ sepia: 80, contrast: 105, brightness: 105 })}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-black/20 text-slate-200 border border-white/15 hover:bg-white/15 backdrop-blur-xl transition-all active:scale-95"
              >
                Сепія / Ретро
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ brightness: 115, saturation: 125, contrast: 105 })}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-black/20 text-slate-200 border border-white/15 hover:bg-white/15 backdrop-blur-xl transition-all active:scale-95"
              >
                Яскраве
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ contrast: 140, saturation: 115 })}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-black/20 text-slate-200 border border-white/15 hover:bg-white/15 backdrop-blur-xl transition-all active:scale-95"
              >
                Високий контраст
              </button>
            </div>
          </div>

          {/* Adjustments Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Brightness */}
            <div className="bg-black/20 p-3.5 rounded-[20px] border border-white/15 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  Яскравість
                </span>
                <span className="text-xs font-mono text-sky-200 font-bold bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-300/30">
                  {adjustments.brightness}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.brightness}
                onChange={(e) => handleChange('brightness', Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-black/40 rounded-full border border-white/10"
              />
            </div>

            {/* Contrast */}
            <div className="bg-black/20 p-3.5 rounded-[20px] border border-white/15 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-sky-300" />
                  Контраст
                </span>
                <span className="text-xs font-mono text-sky-200 font-bold bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-300/30">
                  {adjustments.contrast}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.contrast}
                onChange={(e) => handleChange('contrast', Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-black/40 rounded-full border border-white/10"
              />
            </div>

            {/* Grayscale */}
            <div className="bg-black/20 p-3.5 rounded-[20px] border border-white/15 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-300" />
                  Чорно-біле (Grayscale)
                </span>
                <span className="text-xs font-mono text-sky-200 font-bold bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-300/30">
                  {adjustments.grayscale}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.grayscale}
                onChange={(e) => handleChange('grayscale', Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-black/40 rounded-full border border-white/10"
              />
            </div>

            {/* Saturation */}
            <div className="bg-black/20 p-3.5 rounded-[20px] border border-white/15 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                  Насиченість
                </span>
                <span className="text-xs font-mono text-sky-200 font-bold bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-300/30">
                  {adjustments.saturation}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.saturation}
                onChange={(e) => handleChange('saturation', Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-black/40 rounded-full border border-white/10"
              />
            </div>

            {/* Sepia */}
            <div className="bg-black/20 p-3.5 rounded-[20px] border border-white/15 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  Сепія
                </span>
                <span className="text-xs font-mono text-sky-200 font-bold bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-300/30">
                  {adjustments.sepia}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sepia}
                onChange={(e) => handleChange('sepia', Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-black/40 rounded-full border border-white/10"
              />
            </div>

            {/* Blur */}
            <div className="bg-black/20 p-3.5 rounded-[20px] border border-white/15 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-300" />
                  Розмиття (Blur)
                </span>
                <span className="text-xs font-mono text-sky-200 font-bold bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-300/30">
                  {adjustments.blur} px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={adjustments.blur}
                onChange={(e) => handleChange('blur', Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-black/40 rounded-full border border-white/10"
              />
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/15 bg-white/[0.05] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-4 py-2.5 rounded-full hover:bg-white/10 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Скинути все
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-full border border-white/15 transition-all active:scale-95"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-full shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all border border-blue-300/40 active:scale-95"
            >
              <Check className="w-4 h-4" />
              Зберегти корекцію
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
