import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Keyboard,
  X,
  CornerDownLeft,
  Trash2,
  FolderOpen,
  Type,
  Download,
  HelpCircle,
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutDef {
  macKeys: string[];
  winKeys: string[];
  label: string;
  icon: React.ReactNode;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Platform detection for macOS vs Windows/Linux
  const isMac = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      /Mac|iPod|iPhone|iPad/i.test(navigator.userAgent || navigator.platform || '')
    );
  }, []);

  // Autofocus the primary action button when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key to close modal smoothly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const shortcuts: ShortcutDef[] = [
    {
      macKeys: ['⌘', '↵'],
      winKeys: ['Ctrl', 'Enter'],
      label: 'Запустити конвертацію всіх файлів',
      icon: <CornerDownLeft className="w-4 h-4 text-emerald-400" />,
    },
    {
      macKeys: ['⌘', 'O'],
      winKeys: ['Ctrl', 'O'],
      label: 'Відкрити діалог вибору файлів',
      icon: <FolderOpen className="w-4 h-4 text-blue-400" />,
    },
    {
      macKeys: ['⇧', '⌘', 'D'],
      winKeys: ['Ctrl', 'Shift', 'D'],
      label: 'Завантажити всі готові файли (ZIP)',
      icon: <Download className="w-4 h-4 text-amber-400" />,
    },
    {
      macKeys: ['⇧', '⌘', 'R'],
      winKeys: ['Ctrl', 'Shift', 'R'],
      label: 'Пакетне перейменування файлів',
      icon: <Type className="w-4 h-4 text-purple-400" />,
    },
    {
      macKeys: ['⌫ Backspace'],
      winKeys: ['Delete'],
      label: 'Очистити список файлів',
      icon: <Trash2 className="w-4 h-4 text-rose-400" />,
    },
    {
      macKeys: ['Esc'],
      winKeys: ['Esc'],
      label: 'Закрити будь-яке відкрите вікно',
      icon: <X className="w-4 h-4 text-slate-400" />,
    },
    {
      macKeys: ['?'],
      winKeys: ['?'],
      label: 'Показати або сховати гарячі клавіші',
      icon: <HelpCircle className="w-4 h-4 text-sky-400" />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', duration: 0.28, bounce: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-modal-title"
            className="relative bg-slate-900/90 backdrop-blur-3xl rounded-[32px] max-w-lg w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-white/20 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500/25 to-sky-400/25 border border-blue-300/40 text-sky-300 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="shortcuts-modal-title" className="text-lg font-bold text-white tracking-tight drop-shadow-sm">
                    Гарячі клавіші
                  </h3>
                  <p className="text-xs text-slate-300/80">Швидке управління без використання миші</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Закрити вікно"
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95 border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-0.5">
              {shortcuts.map((sc, idx) => {
                const keys = isMac ? sc.macKeys : sc.winKeys;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="p-1 rounded-lg bg-white/5 shrink-0">{sc.icon}</div>
                      <span className="text-xs font-semibold text-slate-200 truncate">{sc.label}</span>
                    </div>

                    {/* Distinct physical keycaps */}
                    <div className="flex items-center gap-1 shrink-0">
                      {keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-[11px] font-mono font-bold text-sky-200 bg-slate-950/80 border border-white/20 rounded-md shadow-[0_2px_0_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]">
                            {k}
                          </kbd>
                          {kIdx < keys.length - 1 && (
                            <span className="text-[10px] text-slate-500 font-mono select-none px-0.5">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Натисніть</span>
                <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] bg-slate-950/80 rounded border border-white/20 text-sky-200 font-mono shadow-xs">
                  ?
                </kbd>
                <span>або</span>
                <kbd className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 text-[10px] bg-slate-950/80 rounded border border-white/20 text-sky-200 font-mono shadow-xs">
                  {isMac ? '⌘ /' : 'Ctrl + /'}
                </kbd>
                <span>у будь-який момент</span>
              </span>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:scale-95 rounded-full transition-all border border-blue-300/40 shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] focus:ring-2 focus:ring-sky-400 focus:outline-none"
              >
                Зрозуміло
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
