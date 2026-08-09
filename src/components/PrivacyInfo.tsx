import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Sparkles, CheckCircle, Info } from 'lucide-react';

export const PrivacyInfo: React.FC = () => {
  return (
    <div className="bg-white/5 backdrop-blur-2xl text-slate-200 rounded-3xl p-6 sm:p-8 mt-12 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            100% Локальна та безпечна обробка
          </h3>
          <p className="text-xs text-slate-400">
            Конфіденційність вашого фотоархіву гарантована технічно
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-2">
            <Cpu className="w-4 h-4" />
            WASM та Canvas
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Декодування HEIC та конвертація виконуються безпосередньо у вашому браузері за допомогою WebAssembly та HTML5 Canvas.
          </p>
        </div>

        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
            <ShieldCheck className="w-4 h-4" />
            Жодного завантаження
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ваші знімки та особисті фото ніколи не відправляються на сторонні сервери або хмари. Вони залишаються лише на вашому пристрої.
          </p>
        </div>

        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm mb-2">
            <HardDrive className="w-4 h-4" />
            Висока швидкість
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Без обмежень за розміром файлу та затримок мережі. Швидкість конвертації залежить тільки від потужності вашого пристрою.
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Підтримувані формати: HEIC, HEIF, JPG, JPEG, PNG, WebP, PDF, BMP, GIF, AVIF</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          HEIC Converter Engine v2.4 (Client-side)
        </span>
      </div>
    </div>
  );
};
