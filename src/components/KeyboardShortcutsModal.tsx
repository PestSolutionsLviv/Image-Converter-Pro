import React from 'react';
import { Keyboard, X, Command, CornerDownLeft, Trash2, FolderOpen, Type, Download, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      key: 'Ctrl + Enter',
      macKey: '⌘ + Enter',
      label: 'Запустити / переконвертувати всі файли',
      icon: <CornerDownLeft className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'Ctrl + O',
      macKey: '⌘ + O',
      label: 'Відкрити вибір файлів',
      icon: <FolderOpen className="w-4 h-4 text-blue-400" />,
    },
    {
      key: 'Shift + D',
      macKey: 'Shift + D',
      label: 'Завантажити всі готовий архів (ZIP)',
      icon: <Download className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'Shift + R',
      macKey: 'Shift + R',
      label: 'Пакетне перейменування файлів',
      icon: <Type className="w-4 h-4 text-purple-400" />,
    },
    {
      key: 'Delete / Backspace',
      macKey: 'Delete',
      label: 'Очистити список файлів',
      icon: <Trash2 className="w-4 h-4 text-rose-400" />,
    },
    {
      key: 'Esc',
      macKey: 'Esc',
      label: 'Закрити будь-яке модальне вікно',
      icon: <X className="w-4 h-4 text-slate-400" />,
    },
    {
      key: '?',
      macKey: '?',
      label: 'Показати / сховати гарячі клавіші',
      icon: <HelpCircle className="w-4 h-4 text-sky-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl animate-fade-in">
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[32px] max-w-lg w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-gradient-to-tr from-blue-500/25 to-sky-400/25 border border-blue-300/40 text-sky-300 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight drop-shadow-sm">Гарячі клавіші</h3>
              <p className="text-xs text-slate-300/80">Швидке управління без використання миші</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/15 rounded-full transition-all active:scale-95 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/15 hover:bg-white/10 transition-colors backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center gap-3">
                {sc.icon}
                <span className="text-xs font-semibold text-slate-100">{sc.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-3 py-1 text-[11px] font-mono font-bold text-sky-300 bg-black/40 border border-white/20 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  {sc.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
          <span className="text-[11px] text-slate-300/80 flex items-center gap-1">
            <Command className="w-3.5 h-3.5 text-sky-300" />
            Натисніть <kbd className="px-2 py-0.5 text-[10px] bg-black/40 rounded-full border border-white/20 text-sky-200 font-mono">?</kbd> у будь-який момент
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:scale-95 rounded-full transition-all border border-blue-300/40 shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]"
          >
            Зрозуміло
          </button>
        </div>

      </div>
    </div>
  );
};
