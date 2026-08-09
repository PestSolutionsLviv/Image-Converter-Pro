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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Корекція зображення</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Live Preview Box */}
          <div className="relative bg-slate-950 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center min-h-[220px] max-h-[300px] shadow-inner">
            {item.previewUrl || item.outputUrl ? (
              <img
                src={item.outputUrl || item.previewUrl}
                alt="Попередній перегляд"
                style={{ filter: filterStyle }}
                className="max-h-[280px] w-auto object-contain transition-all duration-150"
              />
            ) : (
              <div className="text-slate-500 text-xs flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Попередній перегляд недоступний
              </div>
            )}

            {isModified && (
              <span className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/20 shadow-lg">
                Фільтри активовано
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-blue-400" />
              Готові стилі (Пресет)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
              >
                Оригінал
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ grayscale: 100, contrast: 110 })}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
              >
                Чорно-біле
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ sepia: 80, contrast: 105, brightness: 105 })}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
              >
                Сепія / Ретро
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ brightness: 115, saturation: 125, contrast: 105 })}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
              >
                Яскраве
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ contrast: 140, saturation: 115 })}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
              >
                Високий контраст
              </button>
            </div>
          </div>

          {/* Adjustments Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Brightness */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Яскравість
                </span>
                <span className="text-xs font-mono text-blue-400 font-bold">
                  {adjustments.brightness}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.brightness}
                onChange={(e) => handleChange('brightness', Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Contrast */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-sky-400" />
                  Контраст
                </span>
                <span className="text-xs font-mono text-blue-400 font-bold">
                  {adjustments.contrast}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.contrast}
                onChange={(e) => handleChange('contrast', Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Grayscale */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  Чорно-біле (Grayscale)
                </span>
                <span className="text-xs font-mono text-blue-400 font-bold">
                  {adjustments.grayscale}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.grayscale}
                onChange={(e) => handleChange('grayscale', Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Saturation */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  Насиченість
                </span>
                <span className="text-xs font-mono text-blue-400 font-bold">
                  {adjustments.saturation}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.saturation}
                onChange={(e) => handleChange('saturation', Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Sepia */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  Сепія
                </span>
                <span className="text-xs font-mono text-blue-400 font-bold">
                  {adjustments.sepia}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sepia}
                onChange={(e) => handleChange('sepia', Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Blur */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  Розмиття (Blur)
                </span>
                <span className="text-xs font-mono text-blue-400 font-bold">
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
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-white/5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Скинути все
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all border border-blue-400/30"
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
