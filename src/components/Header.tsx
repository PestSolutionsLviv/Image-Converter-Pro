import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRightLeft,
  Keyboard,
  Sun,
  Moon,
  Menu,
  X,
  Camera,
  FileText,
  Video,
  Calculator,
  Layers,
  Info,
} from 'lucide-react';
import { DropZoneTab } from './DropZone';

interface HeaderProps {
  onAddDemoFiles: () => void;
  isProcessingDemo: boolean;
  fileCount: number;
  onOpenShortcuts?: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  activeTab?: DropZoneTab;
  onTabChange?: (tab: DropZoneTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddDemoFiles,
  isProcessingDemo,
  fileCount,
  onOpenShortcuts,
  isDarkTheme,
  onToggleTheme,
  activeTab = 'photo',
  onTabChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const CATEGORIES = [
    { id: 'photo' as DropZoneTab, label: 'Фото & HEIC', icon: Camera, tag: 'RAW, JPG, PNG' },
    { id: 'text' as DropZoneTab, label: 'Документи', icon: FileText, tag: 'PDF, TXT, HTML' },
    { id: 'video' as DropZoneTab, label: 'Аудіо & Відео', icon: Video, tag: 'MP3, WAV, MP4' },
    { id: 'units' as DropZoneTab, label: 'Величини', icon: Calculator, tag: 'Валюти, Довжина' },
  ];

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3 pb-2">
      <div
        className={`max-w-7xl mx-auto backdrop-blur-3xl rounded-[28px] p-3 sm:px-6 border transition-all duration-300 ${
          isDarkTheme
            ? 'bg-slate-900/40 border-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]'
            : 'bg-white/80 border-slate-200/90 text-slate-900 shadow-[0_15px_35px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,1)]'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-sky-400 flex-shrink-0 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(59,130,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/40">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className={`text-lg sm:text-xl font-bold tracking-tight drop-shadow-sm truncate ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  Universal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-500 font-extrabold">Converter Pro</span>
                </h1>
              </div>
              <p className={`text-[11px] sm:text-xs truncate hidden sm:block ${isDarkTheme ? 'text-slate-300/80' : 'text-slate-600'}`}>
                HEIC, RAW, аудіо, відео, документи та величини 100% у браузері
              </p>
            </div>
          </div>

          {/* Menu Trigger */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl transition-all active:scale-95 border ${
                isDarkTheme
                  ? 'bg-gradient-to-r from-blue-600/30 to-sky-500/30 text-white border-blue-400/40 hover:bg-blue-500/40 shadow-[0_4px_15px_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-md'
              }`}
            >
              <Menu className="w-4 h-4" />
              <span>Меню</span>
              {fileCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                  {fileCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Liquid Glass Drawer / Slide-over Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Drawer Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className={`fixed top-0 right-0 bottom-0 z-50 w-[88vw] max-w-sm flex flex-col justify-between p-6 border-l backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] ${
                isDarkTheme
                  ? 'bg-slate-950/90 text-slate-100 border-white/20'
                  : 'bg-white/95 text-slate-900 border-slate-300'
              }`}
            >
              <div className="space-y-6 overflow-y-auto no-scrollbar pr-1">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 flex items-center justify-center text-white shadow-md">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm tracking-wide">Converter Pro</h2>
                      <p className="text-[10px] text-slate-400">Мобільне меню інструментів</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-2 rounded-xl border transition-all active:scale-90 ${
                      isDarkTheme
                        ? 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories Navigation */}
                {onTabChange && (
                  <div className="space-y-2.5">
                    <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`}>
                      Категорії інструментів
                    </span>

                    <div className="grid grid-cols-1 gap-2">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeTab === cat.id;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              onTabChange(cat.id);
                              setIsMenuOpen(false);
                            }}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border-blue-300/40 shadow-lg'
                                : isDarkTheme
                                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                              <div>
                                <div className="text-xs font-bold">{cat.label}</div>
                                <div className={`text-[10px] ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                                  {cat.tag}
                                </div>
                              </div>
                            </div>
                            {isActive && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Actions & Settings */}
                <div className="space-y-2.5 pt-2">
                  <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`}>
                    Швидкі налаштування
                  </span>

                  {/* Theme Switcher */}
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                      isDarkTheme
                        ? 'bg-amber-500/15 border-amber-400/30 text-amber-200 hover:bg-amber-500/25'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDarkTheme ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                      <span className="text-xs font-bold">
                        Тема: {isDarkTheme ? 'Темна (Нічна)' : 'Світла (Денна)'}
                      </span>
                    </div>

                    {/* Modern ON/OFF Toggle Switch */}
                    <div
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out ${
                        isDarkTheme ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out flex items-center justify-center ${
                          isDarkTheme ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      >
                        {isDarkTheme ? (
                          <Sun className="w-3 h-3 text-amber-600" />
                        ) : (
                          <Moon className="w-3 h-3 text-indigo-700" />
                        )}
                      </span>
                    </div>
                  </button>

                  {/* Demo Files trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      onAddDemoFiles();
                      setIsMenuOpen(false);
                    }}
                    disabled={isProcessingDemo}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 disabled:opacity-50 ${
                      isDarkTheme
                        ? 'bg-sky-500/15 border-sky-400/30 text-sky-200 hover:bg-sky-500/25'
                        : 'bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold">Тестові Демо-файли</span>
                    </div>
                    <span className="text-[11px] font-semibold">+ Завантажити</span>
                  </button>

                  {/* Shortcuts Modal trigger */}
                  {onOpenShortcuts && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenShortcuts();
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                        isDarkTheme
                          ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Keyboard className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold">Гарячі клавіші</span>
                      </div>
                      <kbd className="px-2 py-0.5 text-[10px] font-mono rounded bg-black/30 border border-white/20 text-sky-300">
                        ?
                      </kbd>
                    </button>
                  )}
                </div>

                {/* Queue Summary if files loaded */}
                {fileCount > 0 && (
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-400/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-400" />
                        У черзі файлів:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-mono text-[11px]">
                        {fileCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Використовуйте контекстне меню або панель масових дій для обробки.
                    </p>
                  </div>
                )}

                {/* Privacy Badge Card */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-start gap-3 text-emerald-300">
                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                  <div className="text-[11px] leading-relaxed">
                    <strong className="block text-white font-bold mb-0.5">100% Локальна приватність</strong>
                    Всі фото та файли конвертуються лише у вашому браузері за допомогою WebAssembly.
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-white/10 text-center space-y-1 text-xs text-slate-400">
                <p className="font-bold text-slate-200">© 2026 Universal Converter Pro</p>
                <p className="text-[11px] font-semibold text-blue-400">Розробник: Салдан Тарас</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

