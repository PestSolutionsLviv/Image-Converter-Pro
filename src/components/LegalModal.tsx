import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, X, Scale, Lock, HardDrive, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { ProtectedContact } from './ProtectedContact';

export type LegalTab = 'privacy' | 'terms';



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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-2xl animate-fade-in">
      <div
        className={`rounded-[32px] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 border shadow-[0_25px_60px_rgba(0,0,0,0.6)] ${
          isDarkTheme
            ? 'bg-slate-900/90 text-slate-100 border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
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
              ) : (
                <Scale className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                {activeTab === 'privacy' ? 'Політика Конфіденційності' : 'Умови Використання (Terms of Service)'}
              </h3>
              <p className={`text-xs ${isDarkTheme ? 'text-slate-300/80' : 'text-slate-500'}`}>
                Юридичні правила та захист персональних даних Universal Converter Pro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Tab Switcher */}
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
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDarkTheme
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Конфіденційність</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  activeTab === 'terms'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDarkTheme
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Умови</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-full border transition-all active:scale-95 ${
                isDarkTheme
                  ? 'text-slate-300 hover:text-white hover:bg-white/15 border-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Legal Document Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm leading-relaxed scrollbar-thin">
          {activeTab === 'privacy' ? (
            <>
              {/* PRIVACY POLICY CONTENT */}
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  isDarkTheme ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <div>
                  <strong>Головна гарантія безпеки:</strong> Ваші файли, фотографії та документи <strong>НІКОЛИ</strong> не передаються на зовнішні сервери. Уся обробка виконується на 100% у браузері вашого пристрою.
                </div>
              </div>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  1. Збір та обробка персональних даних
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Сервіс <strong>Universal Converter Pro</strong> розроблено за принципом <em>Privacy by Design</em> (Приватність за замовчуванням). Ми не збираємо, не реєструємо, не зберігаємо та не передаємо третім особам ваші особисті файли, персональні дані, номери телефонів чи електронні адреси.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  2. Локальна обробка файлів (Client-Side Storage)
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Усі операції конвертації графічних форматів (HEIC, RAW, JPG, PNG, WebP), відео/аудіо матеріалів та документів виконуються локально за допомогою технологій HTML5 Canvas, WebAssembly (WASM) та локальних веб-воркерів (Web Workers). Жоден файл не залишає оперативну пам’ять вашого пристрою.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  3. Використання файлів Cookie та LocalStorage
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Веб-додаток використовує локальні кукі (Cookies) та браузерне сховище (LocalStorage) виключно для забезпечення технічної функціональності сервісу:
                </p>
                <ul className={`list-disc pl-5 space-y-1 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>Збереження ваших персональних пресетів конвертації величин та валют;</li>
                  <li>Збереження історії ваших останніх обчислень на поточному пристрої;</li>
                  <li>Запам’ятовування обраної кольорової теми (темна або світла) та налаштувань якості.</li>
                </ul>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Ми <strong>не використовуємо</strong> сторонні відстежувальні файли cookie (Third-party tracking cookies) для маркетингу чи аналітики.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  4. Зовнішні API та джерела даних
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Для відображення актуальних курсів валют додаток робить знеособлені анонімні мережеві запити до відкритих API (Exchange Rates API). Під час цих запитів персональні дані чи файли користувача не передаються.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  5. Безпека даних
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Оскільки ваші файли залишаються виключно на вашому пристрої, рівень безпеки ваших документів повністю відповідає рівню захисту вашого комп'ютера чи смартфона.
                </p>
              </section>
            </>
          ) : (
            <>
              {/* TERMS OF SERVICE CONTENT */}
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  isDarkTheme ? 'bg-blue-500/10 border-blue-400/30 text-sky-200' : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <Scale className="w-5 h-5 shrink-0 text-blue-400" />
                <div>
                  <strong>Правила користування:</strong> Використовуючи Universal Converter Pro, ви погоджуєтеся з цими умовами та підтверджуєте, що володієте авторськими правами на завантажені файли.
                </div>
              </div>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  1. Прийняття умов
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Використовуючи веб-додаток Universal Converter Pro, ви погоджуєтеся дотримуватися цих Умов використання. Якщо ви не погоджуєтеся з будь-яким із пунктів, ви зобов'язані припинити використання сервісу.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  2. Права інтелектуальної власності на контент
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Усі права на файли, зображення, відео та документи, завантажені у веб-додаток, належать виключно користувачеві. Розробник сервісу не претендує на жодні майнові чи немайнові права щодо ваших матеріалів.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  3. Обмеження відповідальності (Disclaimer of Warranties)
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Сервіс надається за принципом <strong>«ЯК Є» («AS IS»)</strong> без будь-яких прямих чи непрямих гарантій. Розробник не несе відповідальності за:
                </p>
                <ul className={`list-disc pl-5 space-y-1 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>Можливе пошкодження або втрату оригінальних файлів при неналежній обробці браузером користувача;</li>
                  <li>Точність фінансових та валютних розрахунків (курси надаються виключно з ознайомчою метою);</li>
                  <li>Збої в роботі, зумовлені обмеженнями оперативної пам’яті пристрою чи браузера користувача.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  4. Права інтелектуальної власності на код
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Дизайн, графічні елементи, програмний код та алгоритми Universal Converter Pro є інтелектуальною власністю розробника (Салдан Тарас) та захищені законом про авторське право.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  5. Зміни до Умов використання
                </h4>
                <p className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>
                  Розробник залишає за собою право вносити зміни до цих Умов у будь-який час. Подальше використання веб-додатка після внесення змін означає вашу згоду з новими умовами.
                </p>
              </section>
            </>
          )}

          <div className={`mt-6 pt-4 border-t text-[11px] flex justify-between items-center ${isDarkTheme ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
            <span>Редакція від: 10 серпня 2026 р.</span>
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
            <span className={isDarkTheme ? 'text-slate-300/80' : 'text-slate-600'}>З питань та пропозицій:</span>
            <span className="font-bold text-blue-400">Салдан Тарас</span>
            <span className={isDarkTheme ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <ProtectedContact
              type="phone"
              className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
              title="Зателефонувати розробнику"
            />
            <span className={isDarkTheme ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <ProtectedContact
              type="email"
              className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 hover:underline transition-colors"
              title="Написати листа розробнику"
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
