import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Sparkles, CheckCircle, Info } from 'lucide-react';

interface PrivacyInfoProps {
  isDarkTheme?: boolean;
}

export const PrivacyInfo: React.FC<PrivacyInfoProps> = ({ isDarkTheme = true }) => {
  return (
    <div
      className={`rounded-[32px] p-6 sm:p-8 mt-12 border transition-colors duration-300 ${
        isDarkTheme
          ? 'bg-white/[0.07] backdrop-blur-3xl text-slate-100 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]'
          : 'bg-white/80 text-slate-800 border-slate-200/90 shadow-lg shadow-slate-200/60'
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-12 h-12 rounded-[20px] border flex items-center justify-center ${
            isDarkTheme
              ? 'bg-gradient-to-tr from-blue-500/25 to-sky-400/25 border-blue-300/40 text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
              : 'bg-blue-50 border-blue-200 text-blue-600 shadow-xs'
          }`}
        >
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3
            className={`text-xl font-bold tracking-tight ${
              isDarkTheme ? 'text-white drop-shadow-sm' : 'text-slate-900'
            }`}
          >
            100% Локальна та безпечна обробка
          </h3>
          <p className={isDarkTheme ? 'text-xs text-slate-300/80' : 'text-xs text-slate-600 font-medium'}>
            Конфіденційність вашого фотоархіву гарантована технічно
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          className={`p-5 rounded-[24px] border transition-all ${
            isDarkTheme
              ? 'bg-black/20 border-white/15 backdrop-blur-2xl hover:bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
              : 'bg-slate-50/90 border-slate-200 hover:bg-slate-100/90 shadow-xs'
          }`}
        >
          <div
            className={`flex items-center gap-2 font-bold text-sm mb-2 ${
              isDarkTheme ? 'text-sky-300' : 'text-blue-700'
            }`}
          >
            <Cpu className="w-4 h-4" />
            WASM та Canvas
          </div>
          <p
            className={`text-xs leading-relaxed ${
              isDarkTheme ? 'text-slate-200/90' : 'text-slate-600 font-medium'
            }`}
          >
            Декодування HEIC та конвертація виконуються безпосередньо у вашому браузері за допомогою WebAssembly та HTML5 Canvas.
          </p>
        </div>

        <div
          className={`p-5 rounded-[24px] border transition-all ${
            isDarkTheme
              ? 'bg-black/20 border-white/15 backdrop-blur-2xl hover:bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
              : 'bg-slate-50/90 border-slate-200 hover:bg-slate-100/90 shadow-xs'
          }`}
        >
          <div
            className={`flex items-center gap-2 font-bold text-sm mb-2 ${
              isDarkTheme ? 'text-emerald-300' : 'text-emerald-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Жодного завантаження
          </div>
          <p
            className={`text-xs leading-relaxed ${
              isDarkTheme ? 'text-slate-200/90' : 'text-slate-600 font-medium'
            }`}
          >
            Ваші знімки та особисті фото ніколи не відправляються на сторонні сервери або хмари. Вони залишаються лише на вашому пристрої.
          </p>
        </div>

        <div
          className={`p-5 rounded-[24px] border transition-all ${
            isDarkTheme
              ? 'bg-black/20 border-white/15 backdrop-blur-2xl hover:bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
              : 'bg-slate-50/90 border-slate-200 hover:bg-slate-100/90 shadow-xs'
          }`}
        >
          <div
            className={`flex items-center gap-2 font-bold text-sm mb-2 ${
              isDarkTheme ? 'text-indigo-300' : 'text-indigo-700'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            Висока швидкість
          </div>
          <p
            className={`text-xs leading-relaxed ${
              isDarkTheme ? 'text-slate-200/90' : 'text-slate-600 font-medium'
            }`}
          >
            Без обмежень за розміром файлу та затримок мережі. Швидкість конвертації залежить тільки від потужності вашого пристрою.
          </p>
        </div>
      </div>

      <div
        className={`mt-6 pt-6 border-t text-xs flex flex-wrap items-center justify-between gap-4 ${
          isDarkTheme ? 'border-white/15 text-slate-300/80' : 'border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <Info className={`w-4 h-4 ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`} />
          <span>Підтримувані формати: HEIC, HEIF, JPG, JPEG, PNG, WebP, PDF, BMP, GIF, AVIF</span>
        </div>
        <span
          className={`text-[11px] font-mono px-3 py-1 rounded-full border ${
            isDarkTheme
              ? 'text-slate-400 bg-black/30 border-white/10'
              : 'text-slate-700 bg-slate-100 border-slate-200 font-bold'
          }`}
        >
          HEIC Liquid Engine v2.5 (iOS Glass Client-side)
        </span>
      </div>
    </div>
  );
};
