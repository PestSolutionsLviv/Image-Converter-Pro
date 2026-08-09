import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Sparkles, CheckCircle, Info } from 'lucide-react';

export const PrivacyInfo: React.FC = () => {
  return (
    <div className="bg-white/[0.07] backdrop-blur-3xl text-slate-100 rounded-[32px] p-6 sm:p-8 mt-12 border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-[20px] bg-gradient-to-tr from-blue-500/25 to-sky-400/25 border border-blue-300/40 text-sky-300 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">
            100% Локальна та безпечна обробка
          </h3>
          <p className="text-xs text-slate-300/80">
            Конфіденційність вашого фотоархіву гарантована технічно
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-black/20 p-5 rounded-[24px] border border-white/15 backdrop-blur-2xl hover:bg-white/15 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-2 text-sky-300 font-bold text-sm mb-2">
            <Cpu className="w-4 h-4" />
            WASM та Canvas
          </div>
          <p className="text-xs text-slate-200/90 leading-relaxed">
            Декодування HEIC та конвертація виконуються безпосередньо у вашому браузері за допомогою WebAssembly та HTML5 Canvas.
          </p>
        </div>

        <div className="bg-black/20 p-5 rounded-[24px] border border-white/15 backdrop-blur-2xl hover:bg-white/15 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-2">
            <ShieldCheck className="w-4 h-4" />
            Жодного завантаження
          </div>
          <p className="text-xs text-slate-200/90 leading-relaxed">
            Ваші знімки та особисті фото ніколи не відправляються на сторонні сервери або хмари. Вони залишаються лише на вашому пристрої.
          </p>
        </div>

        <div className="bg-black/20 p-5 rounded-[24px] border border-white/15 backdrop-blur-2xl hover:bg-white/15 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm mb-2">
            <HardDrive className="w-4 h-4" />
            Висока швидкість
          </div>
          <p className="text-xs text-slate-200/90 leading-relaxed">
            Без обмежень за розміром файлу та затримок мережі. Швидкість конвертації залежить тільки від потужності вашого пристрою.
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/15 text-xs text-slate-300/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-300" />
          <span>Підтримувані формати: HEIC, HEIF, JPG, JPEG, PNG, WebP, PDF, BMP, GIF, AVIF</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono bg-black/30 px-3 py-1 rounded-full border border-white/10">
          HEIC Liquid Engine v2.5 (iOS Glass Client-side)
        </span>
      </div>
    </div>
  );
};
