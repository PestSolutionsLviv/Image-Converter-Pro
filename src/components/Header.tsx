import React from 'react';
import { ShieldCheck, Image, FileCode2, Sparkles, Lock, ArrowRightLeft, Keyboard, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onAddDemoFiles: () => void;
  isProcessingDemo: boolean;
  fileCount: number;
  onOpenShortcuts?: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddDemoFiles,
  isProcessingDemo,
  fileCount,
  onOpenShortcuts,
  isDarkTheme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3 pb-2">
      <div
        className={`max-w-7xl mx-auto backdrop-blur-3xl rounded-[28px] p-3 sm:px-6 border transition-all duration-300 ${
          isDarkTheme
            ? 'bg-slate-900/40 border-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]'
            : 'bg-white/80 border-slate-200/90 text-slate-900 shadow-[0_15px_35px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,1)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(59,130,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/40">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold tracking-tight drop-shadow-sm ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  Universal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-500 font-extrabold">Converter Pro</span>
                </h1>
              </div>
              <p className={`text-xs ${isDarkTheme ? 'text-slate-300/80' : 'text-slate-600'}`}>
                Універсальна конвертація HEIC, RAW, аудіо, відео, документів та величин 100% у браузері
              </p>
            </div>
          </div>

          {/* Action & Privacy Badge & Theme Toggle */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Theme Toggle Button at top of page */}
            <button
              type="button"
              onClick={onToggleTheme}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all active:scale-95 border ${
                isDarkTheme
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 shadow-sm'
              }`}
              title={isDarkTheme ? 'Переключити на світлу тему' : 'Переключити на темну тему'}
            >
              {isDarkTheme ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span>Світла тема</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Темна тема</span>
                </>
              )}
            </button>

            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all border backdrop-blur-2xl active:scale-95 ${
                  isDarkTheme
                    ? 'text-slate-100 bg-white/10 hover:bg-white/20 border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300 shadow-sm'
                }`}
                title="Гарячі клавіші (натисніть ?)"
              >
                <Keyboard className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`} />
                <span className="hidden sm:inline">Клавіші</span>
                <kbd className={`px-1.5 py-0.5 text-[10px] rounded-full border font-mono font-bold ${
                  isDarkTheme ? 'bg-slate-950/80 border-white/20 text-sky-300' : 'bg-white border-slate-300 text-blue-600'
                }`}>
                  ?
                </kbd>
              </button>
            )}

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-200 bg-emerald-500/15 rounded-full border border-emerald-400/30 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Lock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-300" />
              <span className="hidden md:inline">100% Приватно</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
