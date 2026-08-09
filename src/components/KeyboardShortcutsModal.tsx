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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Гарячі клавіші</h3>
              <p className="text-xs text-slate-400">Швидке управління без використання миші</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2.5">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {sc.icon}
                <span className="text-xs font-semibold text-slate-200">{sc.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2.5 py-1 text-[11px] font-mono font-bold text-blue-300 bg-slate-950 border border-white/20 rounded-lg shadow-inner">
                  {sc.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Command className="w-3.5 h-3.5 text-slate-500" />
            Натисніть <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 rounded border border-white/10 text-slate-300 font-mono">?</kbd> у будь-який момент
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all border border-blue-400/30"
          >
            Зрозуміло
          </button>
        </div>

      </div>
    </div>
  );
};
