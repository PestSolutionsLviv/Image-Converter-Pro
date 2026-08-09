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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Пакетне перейменування</h3>
              <p className="text-xs text-slate-400">Додайте префікс, суфікс або нумерацію до файлів</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
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
                className="w-full bg-slate-950/80 border border-white/15 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-white rounded-xl px-3 py-2 text-xs outline-none transition-all placeholder:text-slate-600"
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
                className="w-full bg-slate-950/80 border border-white/15 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-white rounded-xl px-3 py-2 text-xs outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Custom Base Name Toggle */}
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomBase}
                  onChange={(e) => setUseCustomBase(e.target.checked)}
                  className="rounded bg-slate-900 border-white/20 text-blue-500 focus:ring-blue-400 w-4 h-4 cursor-pointer"
                />
                Замінити назву з нумерацією
              </label>
              {useCustomBase && (
                <span className="text-[11px] text-blue-300 font-semibold bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-400/30">
                  {customBase}_01, {customBase}_02...
                </span>
              )}
            </div>

            {useCustomBase && (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Базова назва</label>
                  <input
                    type="text"
                    value={customBase}
                    onChange={(e) => setCustomBase(e.target.value)}
                    className="w-full bg-slate-950/90 border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Формат №</label>
                  <select
                    value={padDigits}
                    onChange={(e) => setPadDigits(Number(e.target.value))}
                    className="w-full bg-slate-950/90 border border-white/15 text-white rounded-xl px-2 py-1.5 text-xs outline-none focus:border-blue-400 cursor-pointer"
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
                  className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                    caseMode === m.id
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Попередній перегляд (перші файли)
            </span>
            <div className="space-y-1.5">
              {sampleItems.length > 0 ? (
                sampleItems.map((item, idx) => {
                  const newName = generateNewName(item, idx);
                  return (
                    <div key={item.id} className="text-xs flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0">
                      <span className="text-slate-400 truncate max-w-[180px]">{item.name}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-blue-300 font-semibold truncate max-w-[180px]">{newName}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic">Немає файлів для попереднього перегляду</p>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Скинути
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all border border-blue-400/30 disabled:opacity-50"
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
