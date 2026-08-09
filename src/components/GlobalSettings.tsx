import React, { useState } from 'react';
import { Settings, Sliders, Maximize2, Palette, FileType, Camera, Archive, FileText, Music, Video, Image as ImageIcon } from 'lucide-react';
import { ConversionSettings, FileCategory, TargetFormat } from '../types';
import { SUPPORTED_FORMATS } from '../lib/converter';

interface GlobalSettingsProps {
  settings: ConversionSettings;
  onChange: (newSettings: ConversionSettings) => void;
  disabled?: boolean;
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  settings,
  onChange,
  disabled = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<FileCategory>('image');

  const getTargetFormatForCategory = (cat: FileCategory): TargetFormat => {
    if (cat === 'document') return settings.documentTargetFormat || 'pdf';
    if (cat === 'audio') return settings.audioTargetFormat || 'wav';
    if (cat === 'video') return settings.videoTargetFormat || 'mp4_audio';
    return settings.targetFormat || 'jpeg';
  };

  const handleFormatSelect = (cat: FileCategory, formatId: TargetFormat) => {
    if (cat === 'document') {
      onChange({ ...settings, documentTargetFormat: formatId });
    } else if (cat === 'audio') {
      onChange({ ...settings, audioTargetFormat: formatId });
    } else if (cat === 'video') {
      onChange({ ...settings, videoTargetFormat: formatId });
    } else {
      onChange({ ...settings, targetFormat: formatId });
    }
  };

  const activeFormatId = getTargetFormatForCategory(activeCategory);
  const activeCategoryFormats = SUPPORTED_FORMATS.filter(
    (f) => f.category === activeCategory
  );
  const currentFormat = SUPPORTED_FORMATS.find((f) => f.id === activeFormatId) || activeCategoryFormats[0];

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...settings,
      quality: parseFloat(e.target.value),
    });
  };

  const handleResizeModeChange = (mode: ConversionSettings['resizeMode']) => {
    onChange({
      ...settings,
      resizeMode: mode,
    });
  };

  const handleExifToggle = () => {
    onChange({
      ...settings,
      preserveExif: !settings.preserveExif,
    });
  };

  const handleAutoDownloadToggle = () => {
    onChange({
      ...settings,
      autoDownloadZip: !settings.autoDownloadZip,
    });
  };

  const categoryTabs = [
    { id: 'image' as FileCategory, label: 'Зображення', icon: ImageIcon, color: 'text-sky-300' },
    { id: 'document' as FileCategory, label: 'Текст / Документи', icon: FileText, color: 'text-amber-300' },
    { id: 'audio' as FileCategory, label: 'Аудіо', icon: Music, color: 'text-emerald-300' },
    { id: 'video' as FileCategory, label: 'Відео', icon: Video, color: 'text-purple-300' },
  ];

  return (
    <div className="bg-white/[0.07] backdrop-blur-3xl rounded-[28px] border border-white/20 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]">
      
      {/* Category selector header tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/15">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <Sliders className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Налаштування конвертації
          </h2>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/15 backdrop-blur-2xl">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border border-blue-300/40 shadow-[0_6px_15px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        
        {/* 1. Target Format Selection for Active Category */}
        <div className="xl:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileType className="w-4 h-4 text-sky-300" />
            Формат для категорії: <span className="text-white font-bold">{categoryTabs.find((t) => t.id === activeCategory)?.label}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeCategoryFormats.map((fmt) => {
              const isSelected = activeFormatId === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleFormatSelect(activeCategory, fmt.id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 border transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border-blue-300/40 shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] font-bold scale-[1.02]'
                      : 'bg-black/20 text-slate-200 border-white/15 hover:bg-white/15 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  }`}
                >
                  <span className="text-xs font-bold text-center leading-tight">{fmt.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    .{fmt.ext}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-300/80 mt-2">
            {currentFormat?.description || 'Конвертує у вибраний формат'}
          </p>
        </div>

        {/* 2. Quality Control / Format info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-300" />
              Якість / Бітрейт
            </label>
            <span className="text-xs font-bold font-mono text-sky-200 bg-blue-500/25 px-2.5 py-0.5 rounded-full border border-blue-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              {Math.round(settings.quality * 100)}%
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.quality}
              disabled={disabled || !currentFormat?.supportsQuality}
              onChange={handleQualityChange}
              className="w-full accent-blue-400 h-2 bg-black/40 rounded-full cursor-pointer border border-white/10 disabled:opacity-40"
            />
            <div className="flex justify-between text-[11px] text-slate-300/80 font-medium">
              <span>Мінімальний розмір</span>
              <span>Баланс</span>
              <span>Максимальна якість</span>
            </div>
          </div>

          {!currentFormat?.supportsQuality && (
            <p className="text-[11px] text-amber-200 bg-amber-500/20 px-3 py-1.5 rounded-2xl border border-amber-300/30 backdrop-blur-xl mt-2">
              Формат {currentFormat?.label} конвертується без втрати точності (Lossless/Exact).
            </p>
          )}
        </div>

        {/* 3. Resize / Background settings */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-sky-300" />
            Розмір графіки
          </label>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {[
              { id: 'original', label: '100%', desc: 'Оригінал' },
              { id: '75', label: '75%', desc: '-25%' },
              { id: '50', label: '50%', desc: '-50%' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => handleResizeModeChange(option.id as any)}
                className={`px-2 py-1.5 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center border transition-all active:scale-95 ${
                  settings.resizeMode === option.id
                    ? 'bg-blue-500/30 text-sky-200 border-blue-300/50 font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                    : 'bg-black/20 text-slate-300 border-white/15 hover:bg-white/15 backdrop-blur-xl'
                }`}
              >
                <span>{option.label}</span>
                <span className="text-[10px] text-slate-400">{option.desc}</span>
              </button>
            ))}
          </div>

          {(settings.targetFormat === 'jpeg' || settings.targetFormat === 'bmp') && (
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/15">
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-sky-300" />
                Фон для прозорості:
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { color: '#ffffff', label: 'Білий' },
                  { color: '#000000', label: 'Чорний' },
                ].map((bg) => (
                  <button
                    key={bg.color}
                    type="button"
                    onClick={() => onChange({ ...settings, backgroundColor: bg.color })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      settings.backgroundColor === bg.color
                        ? 'border-sky-300 scale-110 shadow-lg shadow-sky-500/40'
                        : 'border-white/30'
                    }`}
                    style={{ backgroundColor: bg.color }}
                    title={`Фон: ${bg.label}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Auto ZIP Download Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Archive className="w-4 h-4 text-sky-300" />
            Авто-архів ZIP
          </label>

          <div className="bg-black/20 rounded-2xl p-3.5 border border-white/15 backdrop-blur-2xl h-[calc(100%-28px)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  Авто-завантаження
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleAutoDownloadToggle}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.autoDownloadZip ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border border-white/20'
                  }`}
                  role="switch"
                  aria-checked={!!settings.autoDownloadZip}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      settings.autoDownloadZip ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[11px] text-slate-300/80 leading-snug">
                Автоматично завантажує ZIP-архів одразу після завершення конвертації всіх файлів.
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Статус:</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  settings.autoDownloadZip
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                    : 'bg-black/30 text-slate-400 border-white/10'
                }`}
              >
                {settings.autoDownloadZip ? 'Увімкнено' : 'Вимкнено (Ручно)'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
