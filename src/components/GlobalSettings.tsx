import React from 'react';
import { Settings, Sliders, Maximize2, Palette, FileType, Camera, Info } from 'lucide-react';
import { ConversionSettings, TargetFormat } from '../types';
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
  const currentFormat = SUPPORTED_FORMATS.find(
    (f) => f.id === settings.targetFormat
  ) || SUPPORTED_FORMATS[0];

  const handleFormatSelect = (formatId: TargetFormat) => {
    onChange({
      ...settings,
      targetFormat: formatId,
    });
  };

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

  return (
    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/10">
        <Sliders className="w-5 h-5 text-blue-400" />
        <h2 className="text-base font-bold text-white">
          Налаштування конвертації
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Target Format Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileType className="w-4 h-4 text-slate-500" />
            Формат призначення
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SUPPORTED_FORMATS.map((fmt) => {
              const isSelected = settings.targetFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleFormatSelect(fmt.id)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 font-bold scale-[1.02]'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm font-bold">{fmt.label.split(' ')[0]}</span>
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
          <p className="text-[11px] text-slate-400 mt-2">
            {currentFormat.description}
          </p>
        </div>

        {/* 2. Quality Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-slate-500" />
              Якість зображення
            </label>
            <span className="text-xs font-bold font-mono text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-400/30">
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
              disabled={disabled || !currentFormat.supportsQuality}
              onChange={handleQualityChange}
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>Мінімальний розмір</span>
              <span>Баланс</span>
              <span>Максимальна якість</span>
            </div>
          </div>

          {!currentFormat.supportsQuality && (
            <p className="text-[11px] text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-400/30 mt-2">
              Формат {currentFormat.label} зберігається без втрати якості (Lossless).
            </p>
          )}
        </div>

        {/* 3. Resize / Scale Controls */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-slate-500" />
            Розмір фотографій
          </label>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {[
              { id: 'original', label: '100%', desc: 'Оригінальний' },
              { id: '75', label: '75%', desc: 'Зменшити -25%' },
              { id: '50', label: '50%', desc: 'Зменшити -50%' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => handleResizeModeChange(option.id as any)}
                className={`px-2 py-1.5 rounded-xl text-xs font-medium flex flex-col items-center justify-center border transition-all ${
                  settings.resizeMode === option.id
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/50 font-bold'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>{option.label}</span>
                <span className="text-[10px] text-slate-500">{option.desc}</span>
              </button>
            ))}
          </div>

          {/* Background color selector for non-alpha formats */}
          {(settings.targetFormat === 'jpeg' || settings.targetFormat === 'bmp') && (
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
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
                        ? 'border-blue-400 scale-110 shadow-sm shadow-blue-500/30'
                        : 'border-slate-600'
                    }`}
                    style={{ backgroundColor: bg.color }}
                    title={`Фон: ${bg.label}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. EXIF Metadata Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-slate-500" />
            Метадані EXIF
          </label>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 h-[calc(100%-28px)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  Збереження EXIF
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleExifToggle}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.preserveExif ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={settings.preserveExif}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.preserveExif ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Зберігає дату зйомки, модель камери, орієнтацію та GPS-мітки у збереженому файлі.
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Статус:</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  settings.preserveExif
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-slate-800 text-slate-400 border-white/10'
                }`}
              >
                {settings.preserveExif ? 'Зберігаються' : 'Видаляються (Анонімно)'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
