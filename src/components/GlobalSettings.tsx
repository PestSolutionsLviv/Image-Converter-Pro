import React, { useState } from 'react';
import { Settings, Sliders, Maximize2, Palette, FileType, Camera, Archive, FileText, Music, Video, Image as ImageIcon } from 'lucide-react';
import { ConversionSettings, FileCategory, TargetFormat } from '../types';
import { SUPPORTED_FORMATS } from '../lib/converter';

interface GlobalSettingsProps {
  settings: ConversionSettings;
  onChange: (newSettings: ConversionSettings) => void;
  disabled?: boolean;
  isDarkTheme?: boolean;
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  settings,
  onChange,
  disabled = false,
  isDarkTheme = true,
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
    <div
      className={`rounded-[28px] border p-6 transition-colors duration-300 ${
        isDarkTheme
          ? 'bg-white/[0.07] backdrop-blur-3xl border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]'
          : 'bg-white/80 border-slate-200/90 shadow-lg shadow-slate-200/60'
      }`}
    >
      {/* Category selector header tabs */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b ${
          isDarkTheme ? 'border-white/15' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-xl border ${
              isDarkTheme
                ? 'bg-blue-500/20 border-blue-400/30 text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-blue-50 border-blue-200 text-blue-600 shadow-xs'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </div>
          <h2
            className={`text-base font-bold tracking-tight ${
              isDarkTheme ? 'text-white' : 'text-slate-900'
            }`}
          >
            Налаштування конвертації
          </h2>
        </div>

        {/* Category Tabs */}
        <div
          className={`flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto no-scrollbar w-full sm:w-auto ${
            isDarkTheme
              ? 'bg-black/30 border-white/15 backdrop-blur-2xl'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border border-blue-300/40 shadow-[0_6px_15px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                    : isDarkTheme
                    ? 'text-slate-300 hover:text-white hover:bg-white/10'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isDarkTheme ? tab.color : 'text-slate-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* 1. Target Format Selection for Active Category */}
        <div className="xl:col-span-2">
          <label
            className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isDarkTheme ? 'text-slate-300' : 'text-slate-600 font-bold'
            }`}
          >
            <FileType className={`w-4 h-4 ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`} />
            Формат для категорії:{' '}
            <span className={isDarkTheme ? 'text-white font-bold' : 'text-slate-900 font-extrabold'}>
              {categoryTabs.find((t) => t.id === activeCategory)?.label}
            </span>
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
                      : isDarkTheme
                      ? 'bg-black/20 text-slate-200 border-white/15 hover:bg-white/15 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                      : 'bg-slate-100/90 text-slate-800 border-slate-200 hover:bg-slate-200/90 shadow-xs'
                  }`}
                >
                  <span className="text-xs font-bold text-center leading-tight">{fmt.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? 'text-blue-100' : isDarkTheme ? 'text-slate-400' : 'text-slate-500 font-medium'
                    }`}
                  >
                    .{fmt.ext}
                  </span>
                </button>
              );
            })}
          </div>
          <p className={isDarkTheme ? 'text-[11px] text-slate-300/80 mt-2' : 'text-[11px] text-slate-600 font-medium mt-2'}>
            {currentFormat?.description || 'Конвертує у вибраний формат'}
          </p>
        </div>

        {/* 2. Quality Control / Format info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                isDarkTheme ? 'text-slate-300' : 'text-slate-600 font-bold'
              }`}
            >
              <Sliders className={`w-4 h-4 ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`} />
              Якість / Бітрейт
            </label>
            <span
              className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                isDarkTheme
                  ? 'text-sky-200 bg-blue-500/25 border-blue-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'text-blue-800 bg-blue-50 border-blue-200 font-extrabold'
              }`}
            >
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
              className={`w-full accent-blue-500 h-2 rounded-full cursor-pointer border disabled:opacity-40 ${
                isDarkTheme ? 'bg-black/40 border-white/10' : 'bg-slate-200 border-slate-300'
              }`}
            />
            <div
              className={`flex justify-between text-[11px] font-medium ${
                isDarkTheme ? 'text-slate-300/80' : 'text-slate-600'
              }`}
            >
              <span>Мінімальний розмір</span>
              <span>Баланс</span>
              <span>Максимальна якість</span>
            </div>
          </div>

          {!currentFormat?.supportsQuality && (
            <p
              className={`text-[11px] px-3 py-1.5 rounded-2xl border backdrop-blur-xl mt-2 ${
                isDarkTheme
                  ? 'text-amber-200 bg-amber-500/20 border-amber-300/30'
                  : 'text-amber-900 bg-amber-50 border-amber-200 font-semibold'
              }`}
            >
              Формат {currentFormat?.label} конвертується без втрати точності (Lossless/Exact).
            </p>
          )}
        </div>

        {/* 3. Resize / Background settings */}
        <div>
          <label
            className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isDarkTheme ? 'text-slate-300' : 'text-slate-600 font-bold'
            }`}
          >
            <Maximize2 className={`w-4 h-4 ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`} />
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
                    ? isDarkTheme
                      ? 'bg-blue-500/30 text-sky-200 border-blue-300/50 font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                      : 'bg-blue-600 text-white border-blue-500 font-bold shadow-xs'
                    : isDarkTheme
                    ? 'bg-black/20 text-slate-300 border-white/15 hover:bg-white/15 backdrop-blur-xl'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <span>{option.label}</span>
                <span className={`text-[10px] ${settings.resizeMode === option.id ? 'text-blue-100' : isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{option.desc}</span>
              </button>
            ))}
          </div>

          {(settings.targetFormat === 'jpeg' || settings.targetFormat === 'bmp') && (
            <div
              className={`mt-3 flex items-center justify-between pt-2 border-t ${
                isDarkTheme ? 'border-white/15' : 'border-slate-200'
              }`}
            >
              <span className={`text-xs flex items-center gap-1 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700 font-semibold'}`}>
                <Palette className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`} />
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
                        ? 'border-blue-500 scale-110 shadow-md'
                        : isDarkTheme ? 'border-white/30' : 'border-slate-300'
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
          <label
            className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isDarkTheme ? 'text-slate-300' : 'text-slate-600 font-bold'
            }`}
          >
            <Archive className={`w-4 h-4 ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`} />
            Авто-архів ZIP
          </label>

          <div
            className={`rounded-2xl p-3.5 border h-[calc(100%-28px)] flex flex-col justify-between ${
              isDarkTheme
                ? 'bg-black/20 border-white/15 backdrop-blur-2xl'
                : 'bg-slate-50 border-slate-200/90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  Авто-завантаження
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleAutoDownloadToggle}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.autoDownloadZip
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : isDarkTheme
                      ? 'bg-slate-800 border border-white/20'
                      : 'bg-slate-300 border border-slate-300'
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

              <p className={`text-[11px] leading-snug ${isDarkTheme ? 'text-slate-300/80' : 'text-slate-600'}`}>
                Автоматично завантажує ZIP-архів одразу після завершення конвертації всіх файлів.
              </p>
            </div>

            <div className={`mt-2 pt-2 border-t flex items-center justify-between ${isDarkTheme ? 'border-white/15' : 'border-slate-200'}`}>
              <span className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Статус:</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  settings.autoDownloadZip
                    ? isDarkTheme
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold'
                    : isDarkTheme
                    ? 'bg-black/30 text-slate-400 border-white/10'
                    : 'bg-slate-200 text-slate-600 border-slate-300 font-semibold'
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
