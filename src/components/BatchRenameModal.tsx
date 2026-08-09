import React, { useState } from 'react';
import { Type, X, Check, RefreshCw, Sparkles, FileText } from 'lucide-react';
import { FileItem } from '../types';

interface BatchRenameModalProps {
  items: FileItem[];
  isOpen: boolean;
  onClose: () => void;
  onApplyRename: (renameFn: (item: FileItem, index: number) => string) => void;
}

export const BatchRenameModal: React.FC<BatchRenameModalProps> = ({
  items,
  isOpen,
  onClose,
  onApplyRename,
}) => {
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [useCustomBase, setUseCustomBase] = useState(false);
  const [customBase, setCustomBase] = useState('Image');
  const [startNumber, setStartNumber] = useState(1);
  const [padDigits, setPadDigits] = useState(2); // e.g. 01, 001
  const [caseMode, setCaseMode] = useState<'original' | 'lowercase' | 'uppercase'>('original');

  if (!isOpen) return null;

  // Helper function to calculate new filename without extension
  const generateNewName = (item: FileItem, index: number) => {
    // Get extension and original base name
    const parts = item.name.split('.');
    const ext = parts.length > 1 ? parts.pop() : '';
    let base = parts.join('.');

    // Base name selection
    if (useCustomBase && customBase.trim()) {
      const numStr = String(startNumber + index).padStart(padDigits, '0');
      base = `${customBase.trim()}_${numStr}`;
    }

    // Apply Case Mode
    if (caseMode === 'lowercase') {
      base = base.toLowerCase();
    } else if (caseMode === 'uppercase') {
      base = base.toUpperCase();
    }

    // Apply Prefix and Suffix
    const finalBase = `${prefix.trim()}${base}${suffix.trim()}`;
    return ext ? `${finalBase}.${ext}` : finalBase;
  };

  const handleApply = () => {
    onApplyRename((item, index) => generateNewName(item, index));
    onClose();
  };

  const handleReset = () => {
    setPrefix('');
    setSuffix('');
    setUseCustomBase(false);
    setCustomBase('Image');
    setStartNumber(1);
    setPadDigits(2);
    setCaseMode('original');
  };

  // Preview samples (first 3 items)
  const sampleItems = items.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl animate-fade-in">
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[32px] max-w-lg w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-gradient-to-tr from-blue-500/25 to-sky-400/25 border border-blue-300/40 text-sky-300 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight drop-shadow-sm">Пакетне перейменування</h3>
              <p className="text-xs text-slate-300/80">Додайте префікс, суфікс або нумерацію до файлів</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/15 rounded-full transition-all active:scale-95 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="space-y-4">
          
          {/* Prefix & Suffix Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Префікс (на початку)
              </label>
              <input
                type="text"
                placeholder="напр. Vacation_"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-black/30 border border-white/20 focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30 text-white rounded-2xl px-3.5 py-2 text-xs outline-none transition-all placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Суфікс (в кінці назви)
              </label>
              <input
                type="text"
                placeholder="напр. _2026"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="w-full bg-black/30 border border-white/20 focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30 text-white rounded-2xl px-3.5 py-2 text-xs outline-none transition-all placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
              />
            </div>
          </div>

          {/* Custom Base Name Toggle */}
          <div className="bg-black/20 rounded-[20px] p-3.5 border border-white/15 space-y-3 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomBase}
                  onChange={(e) => setUseCustomBase(e.target.checked)}
                  className="rounded bg-black/40 border-white/30 text-blue-500 focus:ring-sky-400 w-4 h-4 cursor-pointer"
                />
                Замінити назву з нумерацією
              </label>
              {useCustomBase && (
                <span className="text-[11px] text-sky-200 font-semibold bg-blue-500/25 px-2.5 py-0.5 rounded-full border border-blue-300/30">
                  {customBase}_01, {customBase}_02...
                </span>
              )}
            </div>

            {useCustomBase && (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-300/80 mb-1">Базова назва</label>
                  <input
                    type="text"
                    value={customBase}
                    onChange={(e) => setCustomBase(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-sky-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300/80 mb-1">Формат №</label>
                  <select
                    value={padDigits}
                    onChange={(e) => setPadDigits(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/20 text-white rounded-xl px-2 py-1.5 text-xs outline-none focus:border-sky-300 cursor-pointer"
                  >
                    <option value={1}>1, 2, 3</option>
                    <option value={2}>01, 02, 03</option>
                    <option value={3}>001, 002</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Case Transformation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Регістр букв
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'original', label: 'Оригінальний' },
                { id: 'lowercase', label: 'малі (abc)' },
                { id: 'uppercase', label: 'ВЕЛИКІ (ABC)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCaseMode(m.id as any)}
                  className={`py-2 px-2 text-xs font-semibold rounded-2xl border transition-all active:scale-95 ${
                    caseMode === m.id
                      ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border-blue-300/40 shadow-[0_6px_15px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]'
                      : 'bg-black/20 text-slate-200 border-white/15 hover:bg-white/15 backdrop-blur-xl'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-black/30 rounded-[20px] p-3.5 border border-white/15 backdrop-blur-2xl">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-300" />
              Попередній перегляд (перші файли)
            </span>
            <div className="space-y-1.5">
              {sampleItems.length > 0 ? (
                sampleItems.map((item, idx) => {
                  const newName = generateNewName(item, idx);
                  return (
                    <div key={item.id} className="text-xs flex items-center justify-between gap-2 py-1 border-b border-white/10 last:border-0">
                      <span className="text-slate-400 truncate max-w-[180px]">{item.name}</span>
                      <span className="text-sky-300">→</span>
                      <span className="text-sky-200 font-semibold truncate max-w-[180px]">{newName}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic">Немає файлів для попереднього перегляду</p>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-4 py-2.5 rounded-full hover:bg-white/10 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Скинути
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-full border border-white/15 transition-all active:scale-95"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-full shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all border border-blue-300/40 disabled:opacity-50 active:scale-95"
            >
              <Check className="w-4 h-4" />
              Застосувати до {items.length} файлів
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
