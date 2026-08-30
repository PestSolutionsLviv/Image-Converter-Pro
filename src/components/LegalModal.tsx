import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  X,
  Scale,
  Lock,
  HardDrive,
  CheckCircle2,
  Code2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { ProtectedContact } from './ProtectedContact';

export type LegalTab = 'privacy' | 'terms' | 'licenses';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
  isDarkTheme?: boolean;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose,
  isDarkTheme = true,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const OPEN_SOURCE_LIBS = [
    {
      name: 'pdf-lib',
      license: 'MIT License',
      url: 'https://github.com/Hopding/pdf-lib',
      purpose: 'Клієнтська маніпуляція, об’єднання, розділення та ротація PDF-документів',
      author: 'Andrew Dillon (Hopding)',
    },
    {
      name: 'tesseract.js',
      license: 'Apache License 2.0',
      url: 'https://github.com/naptha/tesseract.js',
      purpose: 'Оптичне розпізнавання тексту (OCR) на фотографіях та сканованих документах через WASM Worker',
      author: 'Naptha / Jerome Wu',
    },
    {
      name: 'exifreader',
      license: 'MIT License',
      url: 'https://github.com/mattiasw/ExifReader',
      purpose: 'Інспекція метаданих (EXIF, TIFF, GPS) та очищення конфіденційної інформації з медіафайлів',
      author: 'Mattias Erlo',
    },
    {
      name: 'qrcode',
      license: 'MIT License',
      url: 'https://github.com/soldair/node-qrcode',
      purpose: 'Генерація високоякісних векторних та растрових QR-кодів',
      author: 'Ryan Day (Soldair)',
    },
    {
      name: 'mammoth.js',
      license: 'BSD 2-Clause License',
      url: 'https://github.com/mwilliamson/mammoth.js',
      purpose: 'Безпечне вилучення тексту та структури з файлів Microsoft Word (.docx)',
      author: 'Michael Williamson',
    },
    {
      name: 'docx-preview',
      license: 'MIT License',
      url: 'https://github.com/VolodymyrBaydalka/docxjs',
      purpose: 'Клієнтський рендеринг документів Word у формат веб-сторінки',
      author: 'Volodymyr Baydalka',
    },
    {
      name: 'jspdf',
      license: 'MIT License',
      url: 'https://github.com/parallax/jsPDF',
      purpose: 'Генерація та збереження PDF-документів на стороні клієнта',
      author: 'James Hall (Parallax)',
    },
    {
      name: 'jszip',
      license: 'MIT License',
      url: 'https://github.com/Stuk/jszip',
      purpose: 'Локальне архівація та стиснення результатів конвертації у формат ZIP',
      author: 'Stuart Knightley',
    },
    {
      name: 'lucide-react',
      license: 'ISC License',
      url: 'https://lucide.dev',
      purpose: 'Офіційні векторні піктограми та дизайн-система інтерфейсу',
      author: 'Lucide Project Contributors',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-2xl animate-fade-in">
      <div
        className={`rounded-[32px] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 border shadow-[0_25px_60px_rgba(0,0,0,0.6)] ${
          isDarkTheme
            ? 'bg-slate-900/95 text-slate-100 border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
            : 'bg-white text-slate-800 border-slate-200 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
            isDarkTheme ? 'border-white/15 bg-black/20' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-[20px] border flex items-center justify-center shadow-sm ${
                isDarkTheme
                  ? 'bg-gradient-to-tr from-blue-500/25 to-sky-400/25 border-blue-300/40 text-sky-300'
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}
            >
              {activeTab === 'privacy' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : activeTab === 'terms' ? (
                <Scale className="w-6 h-6" />
              ) : (
                <Code2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                {activeTab === 'privacy'
                  ? 'Політика Конфіденційності'
                  : activeTab === 'terms'
                  ? 'Умови Використання (Terms of Service)'
                  : 'Ліцензії та Open Source'}
              </h3>
              <p className={`text-xs ${isDarkTheme ? 'text-slate-300/80' : 'text-slate-500'}`}>
                Юридичні засади, правила та відкритий код Universal Converter Pro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* 3-Tab Switcher */}
            <div
              className={`flex items-center gap-1 p-1 rounded-2xl border ${
                isDarkTheme ? 'bg-black/30 border-white/10' : 'bg-slate-200/60 border-slate-300/60'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  activeTab === 'privacy'
                    ? isDarkTheme
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-xs'
                      : 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                    : isDarkTheme
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Приватність</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  activeTab === 'terms'
                    ? isDarkTheme
                      ? 'bg-blue-500/30 text-sky-300 border border-blue-400/40 shadow-xs'
                      : 'bg-white text-blue-700 shadow-sm border border-slate-200'
                    : isDarkTheme
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Умови</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('licenses')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  activeTab === 'licenses'
                    ? isDarkTheme
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40 shadow-xs'
                      : 'bg-white text-purple-700 shadow-sm border border-slate-200'
                    : isDarkTheme
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Ліцензії</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isDarkTheme
                  ? 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed max-h-[65vh] no-scrollbar">
          {activeTab === 'privacy' ? (
            <>
              {/* PRIVACY POLICY CONTENT */}
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  isDarkTheme ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <Lock className="w-5 h-5 shrink-0 text-emerald-400" />
                <div>
                  <strong>Головний принцип приватності:</strong> Ваші файли, документи, скани та фотографії обробляються виключно в оперативній пам'яті вашого браузера (In-Browser WebAssembly / Canvas API). Вони <u>ніколи не завантажуються на сторонні сервери</u>.
                </div>
              </div>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  1. Збір та зберігання даних
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Universal Converter Pro функціонує за принципом <strong>Zero-Data Retention</strong>. Ми не збираємо, не зберігаємо і не передаємо вміст ваших файлів, назви документів або зображень третім особам. Усі операції конвертації, об'єднання PDF, розпізнавання тексту (OCR) та стиснення виконуються безпосередньо процесором вашого пристрою.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  2. Використання Cookies та LocalStorage
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Веб-додаток використовує локальне сховище вашого браузера (LocalStorage та Cookies) виключно для зберігання налаштувань інтерфейсу (вибрана тема, глобальні пресети конвертації, історія останніх розрахунків величин). Ці дані доступні лише вам і не передаються в мережу.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  3. Безпека даних та конфіденційність документів
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Оскільки файли не залишають межі вашого комп’ютера чи смартфона, сервіс повністю відповідає вимогам <strong>GDPR</strong>, <strong>HIPAA</strong> та українського законодавства про захист персональних даних. Ви можете безпечно обробляти комерційні договори, фінансові звіти, особисті фотографії та скани паспортів.
                </p>
              </section>
            </>
          ) : activeTab === 'terms' ? (
            <>
              {/* TERMS OF SERVICE CONTENT */}
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  isDarkTheme ? 'bg-blue-500/10 border-blue-400/30 text-sky-200' : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <Scale className="w-5 h-5 shrink-0 text-blue-400" />
                <div>
                  <strong>Правила користування:</strong> Використовуючи Universal Converter Pro, ви підтверджуєте, що володієте авторськими правами на завантажені файли або маєте належне право на їх обробку.
                </div>
              </div>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  1. Прийняття умов
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Використовуючи веб-додаток Universal Converter Pro, ви погоджуєтеся дотримуватися цих Умов. Якщо ви не згодні з будь-яким із положень, просимо припинити використання сервісу.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  2. Права інтелектуальної власності на користувацький контент
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Усі права на файли, зображення, відео та документи належать виключно користувачеві. Сервіс не зберігає копій ваших матеріалів і не претендує на жодні майнові права.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  3. Обмеження відповідальності (Disclaimer of Warranties)
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Сервіс надається за принципом <strong>«ЯК Є» («AS IS»)</strong> без будь-яких гарантій. Розробник не несе відповідальності за збої внаслідок нестачі оперативної пам'яті браузера чи за результати розпізнавання OCR / конвертацій специфічних шрифтів.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  4. Авторські права на дизайн та код платформи
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Дизайн, архітектура та оригінальний код платформи Universal Converter Pro є інтелектуальною власністю розробника (Салдан Тарас © 2026).
                </p>
              </section>
            </>
          ) : (
            <>
              {/* OPEN SOURCE LICENSES & ATTRIBUTION */}
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  isDarkTheme ? 'bg-purple-500/10 border-purple-400/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
                }`}
              >
                <Code2 className="w-5 h-5 shrink-0 text-purple-400" />
                <div>
                  <strong>Повна юридична прозорість:</strong> Universal Converter Pro використовує виключно безпечні, вільно ліцензовані Open Source компоненти (MIT, Apache 2.0, BSD), дозволені для комерційного використання без вірусних Copyleft-обмежень.
                </div>
              </div>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  1. Ліцензування та авторські права
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Усі сторонні відкриті бібліотеки, що забезпечують роботу конвертерів у браузері, зберігають оригінальні повідомлення про авторське право їхніх авторів. Нижче наведено офіційну декларацію компонентів та їхніх ліцензійних угод:
                </p>
              </section>

              {/* Libraries List Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {OPEN_SOURCE_LIBS.map((lib, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-colors ${
                      isDarkTheme ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-sm text-sky-400 truncate">{lib.name}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            lib.license.includes('MIT')
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                              : lib.license.includes('Apache')
                              ? 'bg-blue-500/15 text-sky-300 border-blue-400/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                          }`}
                        >
                          {lib.license}
                        </span>
                      </div>

                      <a
                        href={lib.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white p-1 transition-colors"
                        title="Переглянути репозиторій на GitHub"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <p className={`text-[11px] mb-1 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                      {lib.purpose}
                    </p>
                    <span className="text-[10px] text-slate-400">Автор: {lib.author}</span>
                  </div>
                ))}
              </div>

              <section className="space-y-2 pt-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  2. Відсутність вимог Copyleft (AGPL/GPL)
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Проєкт гарантує відсутність використання бібліотек із ліцензіями AGPL/GPL v3, що забезпечує повний захист прав користувачів, комерційну чистоту та незалежність кодової бази сервісу.
                </p>
              </section>
            </>
          )}

          <div
            className={`mt-6 pt-4 border-t text-[11px] flex justify-between items-center ${
              isDarkTheme ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}
          >
            <span>Редакція від: 30 серпня 2026 р.</span>
            <span>Юридичний статус: 100% Client-Side Private App</span>
          </div>
        </div>

        {/* Footer actions */}
        <div
          className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
            isDarkTheme ? 'border-white/15 bg-black/30' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-xs">
            <span className={isDarkTheme ? 'text-slate-300/80' : 'text-slate-600'}>Автор та підтримка:</span>
            <span className="font-bold text-sky-400">Салдан Тарас</span>
            <span className={isDarkTheme ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <ProtectedContact
              className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 hover:underline transition-colors"
              title="Написати листа автору"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:scale-95 rounded-full transition-all border border-blue-300/40 shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] shrink-0"
          >
            Зрозуміло та приймаю
          </button>
        </div>
      </div>
    </div>
  );
};
