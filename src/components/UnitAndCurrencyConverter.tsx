import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Coins,
  ArrowLeftRight,
  Copy,
  Check,
  RefreshCw,
  Ruler,
  Weight,
  Maximize2,
  Box,
  Thermometer,
  Gauge,
  Clock,
  HardDrive,
  Zap,
  TrendingUp,
  Sun,
  Moon,
  X,
} from 'lucide-react';

// --- TYPES ---
export type UnitCategoryKey =
  | 'length'
  | 'mass'
  | 'area'
  | 'volume'
  | 'temperature'
  | 'speed'
  | 'time'
  | 'data'
  | 'pressure';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  // Factor to convert from base unit
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

interface UnitCategoryDef {
  key: UnitCategoryKey;
  label: string;
  icon: React.ElementType;
  baseSymbol: string;
  units: UnitDef[];
}

// Base Units:
// Length: Meter (m)
// Mass: Gram (g)
// Area: Square Meter (m²)
// Volume: Liter (L)
// Temperature: Celsius (°C)
// Speed: m/s
// Time: Second (s)
// Data: Byte (B)
// Pressure: Pascal (Pa)

const UNIT_CATEGORIES: UnitCategoryDef[] = [
  {
    key: 'length',
    label: 'Довжина',
    icon: Ruler,
    baseSymbol: 'm',
    units: [
      { id: 'm', name: 'Метри', symbol: 'м', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', name: 'Кілометри', symbol: 'км', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cm', name: 'Сантиметри', symbol: 'см', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: 'mm', name: 'Міліметри', symbol: 'мм', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'in', name: 'Дюйми (Inch)', symbol: 'in (″)', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: 'ft', name: 'Фути (Feet)', symbol: 'ft (′)', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'yd', name: 'Ярди (Yard)', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: 'mi', name: 'Милі (Mile)', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: 'nmi', name: 'Морські милі', symbol: 'nmi', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
    ],
  },
  {
    key: 'mass',
    label: 'Маса / Вага',
    icon: Weight,
    baseSymbol: 'g',
    units: [
      { id: 'kg', name: 'Кілограми', symbol: 'кг', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'g', name: 'Грами', symbol: 'г', toBase: (v) => v, fromBase: (v) => v },
      { id: 'mg', name: 'Міліграми', symbol: 'мг', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 't', name: 'Тонни', symbol: 'т', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
      { id: 'lb', name: 'Фунти (Pound)', symbol: 'lb', toBase: (v) => v * 453.59237, fromBase: (v) => v / 453.59237 },
      { id: 'oz', name: 'Унції (Ounce)', symbol: 'oz', toBase: (v) => v * 28.349523125, fromBase: (v) => v / 28.349523125 },
      { id: 'ct', name: 'Карати', symbol: 'ct', toBase: (v) => v * 0.2, fromBase: (v) => v / 0.2 },
    ],
  },
  {
    key: 'temperature',
    label: 'Температура',
    icon: Thermometer,
    baseSymbol: '°C',
    units: [
      { id: 'c', name: 'Градуси Цельсія', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', name: 'Градуси Фаренгейта', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: 'k', name: 'Кельвіни', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    key: 'area',
    label: 'Площа',
    icon: Maximize2,
    baseSymbol: 'm²',
    units: [
      { id: 'm2', name: 'Квадратні метри', symbol: 'м²', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km2', name: 'Квадратні кілометри', symbol: 'км²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
      { id: 'ha', name: 'Гектари', symbol: 'га', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
      { id: 'ar', name: 'Сотки / Ари', symbol: 'сот', toBase: (v) => v * 100, fromBase: (v) => v / 100 },
      { id: 'ft2', name: 'Квадратні фути', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: 'ac', name: 'Акри', symbol: 'акр', toBase: (v) => v * 4046.856, fromBase: (v) => v / 4046.856 },
    ],
  },
  {
    key: 'volume',
    label: 'Об\'єм',
    icon: Box,
    baseSymbol: 'L',
    units: [
      { id: 'l', name: 'Літри', symbol: 'л', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ml', name: 'Мілілітри', symbol: 'мл', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'm3', name: 'Кубічні метри', symbol: 'м³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'gal', name: 'Галони (US Gal)', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { id: 'floz', name: 'Рідкі унції (fl oz)', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
      { id: 'cup', name: 'Чашки (Cups)', symbol: 'чаш', toBase: (v) => v * 0.24, fromBase: (v) => v / 0.24 },
    ],
  },
  {
    key: 'speed',
    label: 'Швидкість',
    icon: Gauge,
    baseSymbol: 'm/s',
    units: [
      { id: 'kmh', name: 'Кілометри за годину', symbol: 'км/год', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'ms', name: 'Метри за секунду', symbol: 'м/с', toBase: (v) => v, fromBase: (v) => v },
      { id: 'mph', name: 'Милі за годину', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'knot', name: 'Вузли (Knots)', symbol: 'вуз', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    ],
  },
  {
    key: 'time',
    label: 'Час',
    icon: Clock,
    baseSymbol: 's',
    units: [
      { id: 's', name: 'Секунди', symbol: 'с', toBase: (v) => v, fromBase: (v) => v },
      { id: 'min', name: 'Хвилини', symbol: 'хв', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: 'h', name: 'Години', symbol: 'год', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'd', name: 'Дні', symbol: 'днів', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { id: 'wk', name: 'Тижні', symbol: 'тиж', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      { id: 'yr', name: 'Роки', symbol: 'р', toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
    ],
  },
  {
    key: 'data',
    label: 'Цифрові дані',
    icon: HardDrive,
    baseSymbol: 'B',
    units: [
      { id: 'b', name: 'Байти (Byte)', symbol: 'Б', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kb', name: 'Кілобайти (KB)', symbol: 'КБ', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'mb', name: 'Мегабайти (MB)', symbol: 'МБ', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      { id: 'gb', name: 'Гігабайти (GB)', symbol: 'ГБ', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      { id: 'tb', name: 'Терабайти (TB)', symbol: 'ТБ', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    ],
  },
  {
    key: 'pressure',
    label: 'Тиск та Енергія',
    icon: Zap,
    baseSymbol: 'Pa',
    units: [
      { id: 'bar', name: 'Бар (Bar)', symbol: 'бар', toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      { id: 'atm', name: 'Атмосфери (Atm)', symbol: 'атм', toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      { id: 'pa', name: 'Паскалі (Pa)', symbol: 'Па', toBase: (v) => v, fromBase: (v) => v },
      { id: 'psi', name: 'PSI (Pounds/in²)', symbol: 'psi', toBase: (v) => v * 6894.76, fromBase: (v) => v / 6894.76 },
      { id: 'kwh', name: 'Кіловат-години', symbol: 'кВт·год', toBase: (v) => v * 3600000, fromBase: (v) => v / 3600000 },
      { id: 'kcal', name: 'Кілокалорії', symbol: 'ккал', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
    ],
  },
];

// --- CURRENCY DEFINITIONS & FALLBACK RATES ---
interface CurrencyDef {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const SUPPORTED_CURRENCIES: CurrencyDef[] = [
  { code: 'UAH', name: 'Українська гривня', symbol: '₴', flag: '🇺🇦' },
  { code: 'USD', name: 'Долар США', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Євро', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'Британський фунт', symbol: '£', flag: '🇬🇧' },
  { code: 'PLN', name: 'Польський злотий', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CHF', name: 'Швейцарський франк', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CAD', name: 'Канадський долар', symbol: 'C$', flag: '🇨🇦' },
  { code: 'JPY', name: 'Японська єна', symbol: '¥', flag: '🇯🇵' },
  { code: 'CZK', name: 'Чеська крона', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'BTC', name: 'Біткоїн', symbol: '₿', flag: '🪙' },
  { code: 'ETH', name: 'Ефіріум', symbol: 'Ξ', flag: '🔷' },
];

// Default relative rates based on USD = 1.0 (Fallback if offline)
const DEFAULT_RATES_USD: Record<string, number> = {
  USD: 1.0,
  UAH: 41.5,
  EUR: 0.92,
  GBP: 0.78,
  PLN: 3.98,
  CHF: 0.88,
  CAD: 1.36,
  JPY: 154.2,
  CZK: 23.2,
  BTC: 0.000015,
  ETH: 0.00038,
};

interface UnitAndCurrencyConverterProps {
  isDarkTheme?: boolean;
  onToggleTheme?: () => void;
}

export const UnitAndCurrencyConverter: React.FC<UnitAndCurrencyConverterProps> = ({
  isDarkTheme: externalDarkTheme,
  onToggleTheme: externalToggleTheme,
}) => {
  const [mainMode, setMainMode] = useState<'units' | 'currencies'>('units');
  const [internalDarkTheme, setInternalDarkTheme] = useState<boolean>(true);

  const isDarkTheme = externalDarkTheme !== undefined ? externalDarkTheme : internalDarkTheme;

  const toggleTheme = () => {
    if (externalToggleTheme) {
      externalToggleTheme();
    } else {
      setInternalDarkTheme((prev) => !prev);
    }
  };

  // --- UNIT CONVERTER STATE ---
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<UnitCategoryKey>('length');
  const [unitInputValue, setUnitInputValue] = useState<number>(1);
  const [fromUnitId, setFromUnitId] = useState<string>('km');
  const [toUnitId, setToUnitId] = useState<string>('mi');
  const [copiedUnit, setCopiedUnit] = useState(false);

  // --- CURRENCY CONVERTER STATE ---
  const [currencyAmount, setCurrencyAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('UAH');
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES_USD);
  const [lastRateUpdate, setLastRateUpdate] = useState<string>('Автономні курси');
  const [isFetchingRates, setIsFetchingRates] = useState<boolean>(false);
  const [copiedCurrency, setCopiedCurrency] = useState(false);

  // Fetch live exchange rates on mount or refresh
  const fetchLiveRates = async () => {
    setIsFetchingRates(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          setRates({
            ...DEFAULT_RATES_USD,
            ...data.rates,
          });
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastRateUpdate(`Оновлено сьогодні о ${timeStr}`);
        }
      }
    } catch (e) {
      console.warn('Could not fetch live currency rates, using fallback rates', e);
      setLastRateUpdate('Автономний режим');
    } finally {
      setIsFetchingRates(false);
    }
  };

  useEffect(() => {
    fetchLiveRates();
  }, []);

  // Update default units when unit category changes
  const currentCategory = UNIT_CATEGORIES.find((c) => c.key === selectedCategoryKey) || UNIT_CATEGORIES[0];

  useEffect(() => {
    if (currentCategory.units.length >= 2) {
      setFromUnitId(currentCategory.units[0].id);
      setToUnitId(currentCategory.units[1].id);
    }
  }, [selectedCategoryKey]);

  // --- CALCULATE UNIT RESULT ---
  const fromUnitObj = currentCategory.units.find((u) => u.id === fromUnitId) || currentCategory.units[0];
  const toUnitObj = currentCategory.units.find((u) => u.id === toUnitId) || currentCategory.units[1] || currentCategory.units[0];

  const baseVal = fromUnitObj.toBase(unitInputValue || 0);
  const convertedUnitVal = toUnitObj.fromBase(baseVal);

  const formattedUnitResult = Number.isInteger(convertedUnitVal)
    ? convertedUnitVal.toString()
    : Math.abs(convertedUnitVal) < 0.0001
    ? convertedUnitVal.toExponential(4)
    : Number(convertedUnitVal.toFixed(6)).toString();

  const handleSwapUnits = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const copyUnitToClipboard = () => {
    const text = `${unitInputValue} ${fromUnitObj.symbol} = ${formattedUnitResult} ${toUnitObj.symbol}`;
    navigator.clipboard.writeText(text);
    setCopiedUnit(true);
    setTimeout(() => setCopiedUnit(false), 2000);
  };

  // --- CALCULATE CURRENCY RESULT ---
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  // Convert from currency -> USD -> to currency
  const convertedCurrencyVal = (currencyAmount / fromRate) * toRate;

  const formattedCurrencyResult =
    convertedCurrencyVal < 0.01
      ? convertedCurrencyVal.toFixed(6)
      : convertedCurrencyVal.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const copyCurrencyToClipboard = () => {
    const fromSymbol = SUPPORTED_CURRENCIES.find((c) => c.code === fromCurrency)?.symbol || '';
    const toSymbol = SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency)?.symbol || '';
    const text = `${currencyAmount} ${fromCurrency} (${fromSymbol}) = ${formattedCurrencyResult} ${toCurrency} (${toSymbol})`;
    navigator.clipboard.writeText(text);
    setCopiedCurrency(true);
    setTimeout(() => setCopiedCurrency(false), 2000);
  };

  return (
    <div
      className={`unit-and-currency-converter backdrop-blur-3xl rounded-[32px] border p-6 md:p-8 transition-colors duration-300 ${
        isDarkTheme
          ? 'bg-white/[0.07] text-white border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]'
          : 'bg-white/85 text-slate-900 border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,1)]'
      }`}
    >
      
      {/* Top Header & Switcher */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b transition-colors ${
          isDarkTheme ? 'border-white/15' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl border shadow-sm transition-colors ${
              isDarkTheme
                ? 'bg-gradient-to-br from-blue-500/30 to-sky-400/20 border-blue-400/40 text-sky-300'
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}
          >
            {mainMode === 'units' ? (
              <Calculator className="w-6 h-6" />
            ) : (
              <Coins className={`w-6 h-6 ${isDarkTheme ? 'text-amber-300' : 'text-amber-600'}`} />
            )}
          </div>
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
              {mainMode === 'units' ? 'Інтерактивний Конвертер Величин' : 'Онлайн Конвертер Валют'}
            </h2>
            <p className={`text-xs ${isDarkTheme ? 'text-slate-300/80' : 'text-slate-500'}`}>
              {mainMode === 'units'
                ? 'Миттєве обчислення фізичних одиниць (довжина, маса, площа, температура, дані)'
                : 'Актуальні курси валют з миттєвим перерахунком (UAH, USD, EUR, PLN, BTC)'}
            </p>
          </div>
        </div>

        {/* Controls: Mode Switcher + Dark/Light Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Main Mode Toggle Buttons */}
          <div
            className={`flex items-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur-2xl transition-colors ${
              isDarkTheme ? 'bg-black/40 border-white/15' : 'bg-slate-100 border-slate-200/80'
            }`}
          >
            <button
              type="button"
              onClick={() => setMainMode('units')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                mainMode === 'units'
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border border-blue-300/40 shadow-[0_8px_20px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  : isDarkTheme
                  ? 'text-slate-300 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Calculator className={`w-4 h-4 ${mainMode === 'units' ? 'text-sky-200' : 'text-slate-400'}`} />
              <span>Величини</span>
            </button>

            <button
              type="button"
              onClick={() => setMainMode('currencies')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                mainMode === 'currencies'
                  ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white border border-amber-300/40 shadow-[0_8px_20px_rgba(217,119,6,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  : isDarkTheme
                  ? 'text-slate-300 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Coins className={`w-4 h-4 ${mainMode === 'currencies' ? 'text-amber-200' : 'text-slate-400'}`} />
              <span>Валюти</span>
            </button>
          </div>

          {/* Theme Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 sm:p-2.5 rounded-2xl border transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs font-bold ${
              isDarkTheme
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 shadow-sm'
            }`}
            title={isDarkTheme ? 'Переключити на світлу тему' : 'Переключити на темну тему'}
          >
            {isDarkTheme ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Світла</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Темна</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODE 1: UNITS CONVERTER */}
      {mainMode === 'units' && (
        <div>
          {/* Category Selector Grid */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {UNIT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategoryKey === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategoryKey(cat.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                    isSelected
                      ? isDarkTheme
                        ? 'bg-blue-500/30 text-white border-blue-400/50 shadow-[0_6px_15px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]'
                        : 'bg-blue-600 text-white border-blue-700 shadow-md'
                      : isDarkTheme
                      ? 'bg-black/20 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? (isDarkTheme ? 'text-sky-300' : 'text-white') : isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Calculator Inputs Card */}
          <div
            className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-5 rounded-2xl border backdrop-blur-2xl transition-colors ${
              isDarkTheme
                ? 'bg-black/20 border-white/15'
                : 'bg-slate-50/80 border-slate-200/90 shadow-sm'
            }`}
          >
            {/* Input Value & Source Unit */}
            <div className="md:col-span-5 space-y-2">
              <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                Початкове значення
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <input
                    type="number"
                    value={unitInputValue}
                    onChange={(e) => setUnitInputValue(parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        copyUnitToClipboard();
                        (e.target as HTMLElement).blur();
                      }
                    }}
                    className={`w-full font-mono font-bold text-lg px-4 py-3 ${unitInputValue !== 0 ? 'pr-9' : ''} rounded-2xl border outline-none transition-colors ${
                      isDarkTheme
                        ? 'bg-slate-900/90 text-white border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'
                        : 'bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-inner'
                    }`}
                    placeholder="0"
                  />
                  {unitInputValue !== 0 && (
                    <button
                      type="button"
                      onClick={() => setUnitInputValue(0)}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all active:scale-95 ${
                        isDarkTheme
                          ? 'text-slate-400 hover:text-white hover:bg-white/20'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Очистити поле"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <select
                  value={fromUnitId}
                  onChange={(e) => setFromUnitId(e.target.value)}
                  className={`text-xs font-bold px-3 py-3 rounded-2xl border cursor-pointer outline-none min-w-[130px] transition-colors ${
                    isDarkTheme
                      ? 'bg-slate-900/90 text-white border-white/20 hover:border-white/40'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {currentCategory.units.map((u) => (
                    <option key={u.id} value={u.id} className={isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex justify-center py-2 md:py-0">
              <button
                type="button"
                onClick={handleSwapUnits}
                className={`p-3.5 rounded-2xl border active:scale-95 transition-all ${
                  isDarkTheme
                    ? 'bg-white/10 hover:bg-blue-500/30 border-white/20 text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                    : 'bg-white hover:bg-blue-50 border-slate-300 text-blue-600 shadow-sm'
                }`}
                title="Поміняти місцями одиниці"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* Output Result & Target Unit */}
            <div className="md:col-span-5 space-y-2">
              <label className={`block text-xs font-semibold uppercase tracking-wider flex items-center justify-between ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                <span>Результат</span>
                <span className={`text-[10px] font-mono ${isDarkTheme ? 'text-sky-300' : 'text-blue-600 font-bold'}`}>
                  1 {fromUnitObj.symbol} = {toUnitObj.fromBase(fromUnitObj.toBase(1)).toFixed(4)} {toUnitObj.symbol}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <div
                  className={`w-full font-mono font-bold text-lg px-4 py-3 rounded-2xl border flex items-center justify-between overflow-x-auto ${
                    isDarkTheme
                      ? 'bg-slate-950/90 text-emerald-300 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-inner'
                  }`}
                >
                  <span className="truncate">{formattedUnitResult}</span>
                  <span className={`text-xs font-normal ml-2 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{toUnitObj.symbol}</span>
                </div>
                <select
                  value={toUnitId}
                  onChange={(e) => setToUnitId(e.target.value)}
                  className={`text-xs font-bold px-3 py-3 rounded-2xl border cursor-pointer outline-none min-w-[130px] transition-colors ${
                    isDarkTheme
                      ? 'bg-slate-900/90 text-white border-white/20 hover:border-white/40'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {currentCategory.units.map((u) => (
                    <option key={u.id} value={u.id} className={isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Presets & Copy Bar */}
          <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-xs mr-1 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Швидкі значення:</span>
              {[1, 10, 100, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setUnitInputValue(preset)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                    isDarkTheme
                      ? 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={copyUnitToClipboard}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                isDarkTheme
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-sky-200 border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-sm'
              }`}
            >
              {copiedUnit ? <Check className={`w-4 h-4 ${isDarkTheme ? 'text-emerald-400' : 'text-white'}`} /> : <Copy className="w-4 h-4" />}
              <span>{copiedUnit ? 'Скопійовано!' : 'Скопіювати результат'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: CURRENCY CONVERTER */}
      {mainMode === 'currencies' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 text-xs ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
              <TrendingUp className={`w-4 h-4 ${isDarkTheme ? 'text-amber-300' : 'text-amber-600'}`} />
              <span>Курс за даними міжбанківського ринку</span>
            </div>

            <button
              type="button"
              onClick={fetchLiveRates}
              disabled={isFetchingRates}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all disabled:opacity-50 ${
                isDarkTheme
                  ? 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isFetchingRates ? 'animate-spin text-amber-500' : ''}`} />
              <span>{lastRateUpdate}</span>
            </button>
          </div>

          {/* Calculator Inputs */}
          <div
            className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-5 rounded-2xl border backdrop-blur-2xl transition-colors ${
              isDarkTheme
                ? 'bg-black/20 border-white/15'
                : 'bg-slate-50/80 border-slate-200/90 shadow-sm'
            }`}
          >
            {/* Amount & From Currency */}
            <div className="md:col-span-5 space-y-2">
              <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                Сума
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <input
                    type="number"
                    value={currencyAmount}
                    onChange={(e) => setCurrencyAmount(parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        copyCurrencyToClipboard();
                        (e.target as HTMLElement).blur();
                      }
                    }}
                    className={`w-full font-mono font-bold text-lg px-4 py-3 ${currencyAmount !== 0 ? 'pr-9' : ''} rounded-2xl border outline-none transition-colors ${
                      isDarkTheme
                        ? 'bg-slate-900/90 text-white border-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30'
                        : 'bg-white text-slate-900 border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 shadow-inner'
                    }`}
                    placeholder="100"
                  />
                  {currencyAmount !== 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrencyAmount(0)}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all active:scale-95 ${
                        isDarkTheme
                          ? 'text-slate-400 hover:text-white hover:bg-white/20'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Очистити поле"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className={`text-xs font-bold px-3 py-3 rounded-2xl border cursor-pointer outline-none min-w-[140px] transition-colors ${
                    isDarkTheme
                      ? 'bg-slate-900/90 text-white border-white/20 hover:border-white/40'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className={isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
                      {c.flag} {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex justify-center py-2 md:py-0">
              <button
                type="button"
                onClick={handleSwapCurrencies}
                className={`p-3.5 rounded-2xl border active:scale-95 transition-all ${
                  isDarkTheme
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/40 text-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-700 shadow-sm'
                }`}
                title="Поміняти місцями валюти"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* Converted Amount & To Currency */}
            <div className="md:col-span-5 space-y-2">
              <label className={`block text-xs font-semibold uppercase tracking-wider flex items-center justify-between ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                <span>Результат</span>
                <span className={`text-[10px] font-mono ${isDarkTheme ? 'text-amber-300' : 'text-amber-700 font-bold'}`}>
                  1 {fromCurrency} = {((1 / fromRate) * toRate).toFixed(4)} {toCurrency}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <div
                  className={`w-full font-mono font-bold text-lg px-4 py-3 rounded-2xl border flex items-center justify-between overflow-x-auto ${
                    isDarkTheme
                      ? 'bg-slate-950/90 text-amber-300 border-amber-500/30'
                      : 'bg-amber-50 text-amber-900 border-amber-300 shadow-inner'
                  }`}
                >
                  <span className="truncate">{formattedCurrencyResult}</span>
                  <span className={`text-xs font-normal ml-2 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                    {SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency)?.symbol}
                  </span>
                </div>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className={`text-xs font-bold px-3 py-3 rounded-2xl border cursor-pointer outline-none min-w-[140px] transition-colors ${
                    isDarkTheme
                      ? 'bg-slate-900/90 text-white border-white/20 hover:border-white/40'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className={isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
                      {c.flag} {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Presets & Quick Conversion Rates Grid */}
          <div className={`mt-5 pt-4 border-t space-y-4 ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-xs mr-1 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Швидка сума:</span>
                {[10, 50, 100, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCurrencyAmount(preset)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                      isDarkTheme
                        ? 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={copyCurrencyToClipboard}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                  isDarkTheme
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                    : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 shadow-sm'
                }`}
              >
                {copiedCurrency ? <Check className={`w-4 h-4 ${isDarkTheme ? 'text-emerald-400' : 'text-white'}`} /> : <Copy className="w-4 h-4" />}
                <span>{copiedCurrency ? 'Скопійовано!' : 'Скопіювати обмін'}</span>
              </button>
            </div>

            {/* Popular Pairs Grid */}
            <div>
              <span className={`block text-[11px] font-bold uppercase mb-2 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                Популярні пари валют (до UAH):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { from: 'USD', to: 'UAH', flag: '🇺🇸' },
                  { from: 'EUR', to: 'UAH', flag: '🇪🇺' },
                  { from: 'PLN', to: 'UAH', flag: '🇵🇱' },
                  { from: 'GBP', to: 'UAH', flag: '🇬🇧' },
                ].map((pair) => {
                  const rateVal = ((1 / (rates[pair.from] || 1)) * (rates[pair.to] || 1)).toFixed(2);
                  return (
                    <button
                      key={pair.from}
                      type="button"
                      onClick={() => {
                        setFromCurrency(pair.from);
                        setToCurrency(pair.to);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                        isDarkTheme
                          ? 'bg-black/20 hover:bg-white/10 border-white/10'
                          : 'bg-white hover:bg-amber-50/50 border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{pair.flag}</span>
                        <span className={`text-xs font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>1 {pair.from}</span>
                      </div>
                      <span className={`text-xs font-mono font-bold ${isDarkTheme ? 'text-amber-300' : 'text-amber-700'}`}>
                        {rateVal} {pair.to}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
