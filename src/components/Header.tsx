import React from 'react';
import { ShieldCheck, Image, FileCode2, Sparkles, Lock, ArrowRightLeft } from 'lucide-react';

interface HeaderProps {
  onAddDemoFiles: () => void;
  isProcessingDemo: boolean;
  fileCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onAddDemoFiles,
  isProcessingDemo,
  fileCount,
}) => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  HEIC<span className="text-blue-400">Swift</span> Конвертер
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  PRO 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Конвертуйте HEIC та HEIF фото у JPG, PNG, WebP, PDF без втрати якості
              </p>
            </div>
          </div>

          {/* Action & Privacy Badge */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onAddDemoFiles}
              disabled={isProcessingDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 active:bg-white/20 rounded-xl transition-all border border-white/15 backdrop-blur-md disabled:opacity-50"
              title="Додати приклад фото для швидкої перевірки"
            >
              <Image className="w-3.5 h-3.5 text-blue-400" />
              {isProcessingDemo ? 'Завантаження...' : 'Тестові фото'}
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/15 rounded-xl border border-emerald-400/30 backdrop-blur-md">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">100% Приватно: </span>
              <span>Без серверів</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
