import React, { useState, useEffect } from 'react';
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
  Heart,
  QrCode,
  Film,
  Code,
  FileSearch,
  MessageSquarePlus,
  ExternalLink,
} from 'lucide-react';
import { DropZoneTab } from './DropZone';

interface HeaderProps {
  onAddDemoFiles: () => void;
  isProcessingDemo: boolean;
  fileCount: number;
  isDarkTheme?: boolean;
  onToggleTheme: () => void;
  activeTab?: DropZoneTab;
  onTabChange?: (tab: DropZoneTab) => void;
  onOpenShortcuts?: () => void;
  onOpenTool?: (tool: 'pdf' | 'ocr' | 'exif' | 'svg' | 'qr' | 'gif') => void;
  onResetToHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddDemoFiles,
  isProcessingDemo,
  fileCount,
  isDarkTheme = true,
  onToggleTheme,
  activeTab = 'photo',
  onTabChange,
  onOpenShortcuts,
  onOpenTool,
  onResetToHome,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent background scroll when mobile drawer is open
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

  // Close drawer on Escape key
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const CATEGORIES = [
    { id: 'photo' as DropZoneTab, label: 'Фото & HEIC', icon: Camera, tag: 'RAW, JPG, PNG' },
    { id: 'text' as DropZoneTab, label: 'Документи', icon: FileText, tag: 'DOCX, PDF, TXT' },
    { id: 'video' as DropZoneTab, label: 'Аудіо & Відео', icon: Video, tag: 'MP3, WAV, MP4' },
    { id: 'units' as DropZoneTab, label: 'Величини', icon: Calculator, tag: 'Валюти, Одиниці' },
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
          {/* Logo & Main Title — Click to reset to home */}
          <button
            type="button"
            onClick={onResetToHome}
            className="flex items-center gap-3 min-w-0 text-left group cursor-pointer hover:opacity-90 transition-all active:scale-98 focus:outline-none"
            title="На стартову (скинути файли та дані)"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-sky-400 flex-shrink-0 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(59,130,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/40 group-hover:shadow-[0_8px_25px_rgba(59,130,246,0.6)] group-hover:scale-105 transition-all">
              <ArrowRightLeft className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
            </div>
            <div className="min-w-0">
              <h1 className={`text-lg sm:text-xl font-bold tracking-tight drop-shadow-sm truncate ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                Universal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-500 font-extrabold">Converter Pro</span>
              </h1>
            </div>
          </button>

          {/* Menu Trigger & Desktop Ko-fi Support */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="https://ko-fi.com/tsaldan"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-2xl border transition-all active:scale-95 bg-[#FF5E5B]/15 text-[#FF5E5B] border-[#FF5E5B]/30 hover:bg-[#FF5E5B]/25 shadow-xs"
              title="Підтримати автора на Ko-fi"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Ko-fi ☕</span>
            </a>

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

      {/* Mobile Drawer — CSS-only slide animation */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md animate-[fadeIn_0.2s_ease]"
          />

          {/* Drawer Sheet: Fixed Height 100dvh + Safe Area for iOS */}
          <div
            className={`fixed top-0 right-0 z-50 w-[88vw] max-w-sm h-[100dvh] flex flex-col border-l backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-[slideInRight_0.28s_cubic-bezier(0.22,1,0.36,1)] ${
              isDarkTheme
                ? 'bg-slate-950/95 text-slate-100 border-white/20'
                : 'bg-white/95 text-slate-900 border-slate-300'
            }`}
          >
            {/* 1. Drawer Header (Fixed at top) */}
            <div className="p-5 pb-3 border-b border-white/10 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 flex items-center justify-center text-white shadow-md">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-wide">Converter Pro</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-medium">Private & Fast Tools</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-sky-300 border border-blue-400/30">
                      v1.2
                    </span>
                  </div>
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
                title="Закрити меню (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-5 space-y-5">
              {/* Categories Navigation */}
              {onTabChange && (
                <div className="space-y-2">
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
                              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border-blue-300/40 shadow-lg shadow-blue-500/25'
                              : isDarkTheme
                              ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`p-2 rounded-xl flex-shrink-0 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : isDarkTheme
                                  ? 'bg-blue-500/15 text-blue-400 border border-blue-400/20'
                                  : 'bg-blue-100 text-blue-600 border border-blue-200'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-extrabold tracking-tight">{cat.label}</div>
                              <div className={`text-[11px] font-medium truncate ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                                {cat.tag}
                              </div>
                            </div>
                          </div>
                          {isActive && <div className="w-2 h-2 rounded-full bg-white shadow-md animate-pulse shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Open Source Tools Workshop */}
              {onOpenTool && (
                <div className="space-y-2 pt-1">
                  <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`}>
                    Open Source Майстерня
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenTool('pdf');
                        setIsMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition-all active:scale-95 text-left ${
                        isDarkTheme ? 'bg-white/5 hover:bg-white/10 text-rose-300 border-white/10' : 'bg-slate-100 text-rose-700 border-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">PDF Майстерня</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenTool('ocr');
                        setIsMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition-all active:scale-95 text-left ${
                        isDarkTheme ? 'bg-white/5 hover:bg-white/10 text-cyan-300 border-white/10' : 'bg-slate-100 text-cyan-700 border-slate-200'
                      }`}
                    >
                      <FileSearch className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">OCR Текст</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenTool('exif');
                        setIsMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition-all active:scale-95 text-left ${
                        isDarkTheme ? 'bg-white/5 hover:bg-white/10 text-amber-300 border-white/10' : 'bg-slate-100 text-amber-700 border-slate-200'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">EXIF & Карта</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenTool('svg');
                        setIsMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition-all active:scale-95 text-left ${
                        isDarkTheme ? 'bg-white/5 hover:bg-white/10 text-purple-300 border-white/10' : 'bg-slate-100 text-purple-700 border-slate-200'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">SVG Стиснення</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenTool('qr');
                        setIsMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition-all active:scale-95 text-left ${
                        isDarkTheme ? 'bg-white/5 hover:bg-white/10 text-sky-300 border-white/10' : 'bg-slate-100 text-sky-700 border-slate-200'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">QR Студія</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenTool('gif');
                        setIsMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition-all active:scale-95 text-left ${
                        isDarkTheme ? 'bg-white/5 hover:bg-white/10 text-pink-300 border-white/10' : 'bg-slate-100 text-pink-700 border-slate-200'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="truncate">Відео в GIF</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions & Settings */}
              <div className="space-y-2 pt-1">
                <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold ${isDarkTheme ? 'text-sky-300' : 'text-blue-600'}`}>
                  Швидкі налаштування
                </span>

                {/* Theme Switcher — Neutral Container with Calm Indigo/Sun accents */}
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                    isDarkTheme
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isDarkTheme ? (
                      <Moon className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-xs font-bold">
                      Тема: {isDarkTheme ? 'Темна (Нічна)' : 'Світла (Денна)'}
                    </span>
                  </div>

                  {/* Modern ON/OFF Toggle Switch */}
                  <div
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out ${
                      isDarkTheme ? 'bg-indigo-600' : 'bg-amber-400'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out flex items-center justify-center ${
                        isDarkTheme ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    >
                      {isDarkTheme ? (
                        <Moon className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <Sun className="w-3 h-3 text-amber-600" />
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
                      ? 'bg-sky-500/10 border-sky-400/25 text-sky-200 hover:bg-sky-500/20'
                      : 'bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold">Тестові Демо-файли</span>
                  </div>
                  <span className="text-[10px] font-semibold text-sky-400">+ Завантажити</span>
                </button>

                {/* Feedback / Report a Bug Link */}
                <a
                  href="https://github.com/PestSolutionsLviv/Image-Converter-Pro/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                    isDarkTheme
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold">Повідомити про баг / ідея</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                {/* Shortcuts Modal trigger — Hidden on mobile phones without physical keyboards */}
                {onOpenShortcuts && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenShortcuts();
                      setIsMenuOpen(false);
                    }}
                    className={`hidden md:flex w-full items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 ${
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
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 flex items-start gap-2.5 text-emerald-300">
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="block text-white font-bold mb-0.5">100% Локальна приватність</strong>
                  Всі файли обробляються виключно на вашому пристрої.
                </div>
              </div>
            </div>

            {/* 3. Fixed Drawer Footer: Safe Area for iOS Home Bar */}
            <div className="shrink-0 p-4 border-t border-white/10 text-center space-y-2.5 text-xs text-slate-400 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <p className="font-bold text-slate-200">© 2026 Universal Converter Pro</p>
              <div className="flex items-center justify-center gap-1.5 text-[11px]">
                <span>Created with ❤️ by</span>
                <a
                  href="https://github.com/PestSolutionsLviv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sky-400 hover:underline"
                >
                  Taras Saldan
                </a>
              </div>
              <div className="pt-0.5">
                <a
                  href="https://ko-fi.com/tsaldan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-[#FF5E5B]/15 text-[#FF5E5B] border border-[#FF5E5B]/30 hover:bg-[#FF5E5B]/25 active:scale-95 transition-all shadow-xs"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Support on Ko-fi</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
