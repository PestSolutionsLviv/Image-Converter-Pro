import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Bookmark,
  BookmarkPlus,
  Trash2,
  Download,
  Upload,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { getUserLocalData, saveUserLocalData } from '../lib/userStorage';

// --- TYPES ---
export type UnitCategoryKey =
  | 'currencies'
  | 'length'
  | 'mass'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'speed'
  | 'time'
  | 'data'
  | 'pressure';

export interface ConversionPreset {
  id: string;
  label: string;
  categoryKey: UnitCategoryKey;
  amount: number;
  fromId: string;
  toId: string;
}

export interface RecentConversion {
  id: string;
  timestamp: number;
  categoryKey: UnitCategoryKey;
  amount: number;
  fromId: string;
  toId: string;
  result: string;
  label: string;
}

const DEFAULT_PRESETS: ConversionPreset[] = [
  { id: 'p1', label: '1 in → мм', categoryKey: 'length', amount: 1, fromId: 'in', toId: 'mm' },
  { id: 'p2', label: '1 lb → кг', categoryKey: 'mass', amount: 1, fromId: 'lb', toId: 'kg' },
  { id: 'p3', label: '100 USD → UAH', categoryKey: 'currencies', amount: 100, fromId: 'USD', toId: 'UAH' },
  { id: 'p4', label: '100 EUR → UAH', categoryKey: 'currencies', amount: 100, fromId: 'EUR', toId: 'UAH' },
  { id: 'p5', label: '1 gal → л', categoryKey: 'volume', amount: 1, fromId: 'gal', toId: 'l' },
  { id: 'p6', label: '100 км/год → mi/h', categoryKey: 'speed', amount: 100, fromId: 'kmh', toId: 'mph' },
];

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
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

const UNIT_CATEGORIES: UnitCategoryDef[] = [
  {
    key: 'length',
    label: 'Довжина',
    icon: Ruler,
    baseSymbol: 'm',
    units: [
      { id: 'km', name: 'Кілометри', symbol: 'км', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'm', name: 'Метри', symbol: 'м', toBase: (v) => v, fromBase: (v) => v },
      { id: 'cm', name: 'Сантиметри', symbol: 'см', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: 'mm', name: 'Міліметри', symbol: 'мм', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'mi', name: 'Милі', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: 'yd', name: 'Ярди', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: 'ft', name: 'Фути', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'in', name: 'Дюйми', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
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
      { id: 'lb', name: 'Фунти', symbol: 'lb', toBase: (v) => v * 453.59237, fromBase: (v) => v / 453.59237 },
      { id: 'oz', name: 'Унції', symbol: 'oz', toBase: (v) => v * 28.349523125, fromBase: (v) => v / 28.349523125 },
      { id: 'ct', name: 'Карати', symbol: 'ct', toBase: (v) => v * 0.2, fromBase: (v) => v / 0.2 },
    ],
  },
  {
    key: 'temperature',
    label: 'Температура',
    icon: Thermometer,
    baseSymbol: '°C',
    units: [
      { id: 'c', name: 'Цельсій', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', name: 'Фаренгейт', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: 'k', name: 'Кельвін', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
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
      { id: 'ar', name: 'Сотки (Ари)', symbol: 'сот', toBase: (v) => v * 100, fromBase: (v) => v / 100 },
      { id: 'ft2', name: 'Квадратні фути', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: 'ac', name: 'Акри', symbol: 'акр', toBase: (v) => v * 4046.856, fromBase: (v) => v / 4046.856 },
    ],
  },
  {
    key: 'volume',
    label: 'Об’єм',
    icon: Box,
    baseSymbol: 'l',
    units: [
      { id: 'l', name: 'Літри', symbol: 'л', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ml', name: 'Мілілітри', symbol: 'мл', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'm3', name: 'Кубічні метри', symbol: 'м³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'gal', name: 'Галони (US)', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { id: 'pt', name: 'Пінти (US)', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
      { id: 'floz', name: 'Рідкі унції', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
    ],
  },
  {
    key: 'speed',
    label: 'Швидкість',
    icon: Gauge,
    baseSymbol: 'm/s',
    units: [
      { id: 'kmh', name: 'Км/год', symbol: 'км/год', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'ms', name: 'Метри/сек', symbol: 'м/с', toBase: (v) => v, fromBase: (v) => v },
      { id: 'mph', name: 'Милі/год', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'kn', name: 'Вузли', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
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
    label: 'Дані',
    icon: HardDrive,
    baseSymbol: 'B',
    units: [
      { id: 'b', name: 'Байти', symbol: 'Б', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kb', name: 'Кілобайти', symbol: 'КБ', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'mb', name: 'Мегабайти', symbol: 'МБ', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      { id: 'gb', name: 'Гігабайти', symbol: 'ГБ', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      { id: 'tb', name: 'Терабайти', symbol: 'ТБ', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    ],
  },
  {
    key: 'pressure',
    label: 'Тиск & Енергія',
    icon: Zap,
    baseSymbol: 'Pa',
    units: [
      { id: 'bar', name: 'Бар', symbol: 'бар', toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      { id: 'atm', name: 'Атмосфери', symbol: 'атм', toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      { id: 'pa', name: 'Паскалі', symbol: 'Па', toBase: (v) => v, fromBase: (v) => v },
      { id: 'psi', name: 'PSI', symbol: 'psi', toBase: (v) => v * 6894.76, fromBase: (v) => v / 6894.76 },
      { id: 'kwh', name: 'Кіловат-години', symbol: 'кВт·год', toBase: (v) => v * 3600000, fromBase: (v) => v / 3600000 },
      { id: 'kcal', name: 'Кілокалорії', symbol: 'ккал', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
    ],
  },
];

interface CurrencyDef {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// Ukrainian currency symbol set to universal UAH (грн)
const SUPPORTED_CURRENCIES: CurrencyDef[] = [
  { code: 'UAH', name: 'Гривня', symbol: 'грн', flag: '🇺🇦' },
  { code: 'USD', name: 'Долар США', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Євро', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'Фунт стерлінгів', symbol: '£', flag: '🇬🇧' },
  { code: 'PLN', name: 'Польський злотий', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CHF', name: 'Швейцарський франк', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CAD', name: 'Канадський долар', symbol: 'C$', flag: '🇨🇦' },
  { code: 'JPY', name: 'Японська єна', symbol: '¥', flag: '🇯🇵' },
  { code: 'CZK', name: 'Чеська крона', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'BTC', name: 'Біткоїн', symbol: '₿', flag: '🪙' },
  { code: 'ETH', name: 'Ефіріум', symbol: 'Ξ', flag: '🔷' },
];

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
  isDarkTheme = true,
}) => {
  // --- 1. UNIFIED CATEGORY SELECTION ---
  const [selectedCategory, setSelectedCategory] = useState<UnitCategoryKey>('currencies');

  // --- UNIT STATE ---
  const [unitLeft, setUnitLeft] = useState<string>('1');
  const [unitRight, setUnitRight] = useState<string>('1000');
  const [fromUnitId, setFromUnitId] = useState<string>('km');
  const [toUnitId, setToUnitId] = useState<string>('m');
  const [precision, setPrecision] = useState<number>(4);

  // --- CURRENCY STATE ---
  const [currLeft, setCurrLeft] = useState<string>('100');
  const [currRight, setCurrRight] = useState<string>('4150');
  const [fromCurr, setFromCurr] = useState<string>('USD');
  const [toCurr, setToCurr] = useState<string>('UAH');
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES_USD);
  const [lastRateUpdate, setLastRateUpdate] = useState<string>('Курси онлайн');
  const [isFetchingRates, setIsFetchingRates] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // --- REVERSED ROTATION ANIMATION ---
  const [swapRotation, setSwapRotation] = useState<number>(0);

  // --- PRESETS ACCORDION ---
  const [expandedDrawer, setExpandedDrawer] = useState<'none' | 'presets'>('none');
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [presetToast, setPresetToast] = useState<string | null>(null);

  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Load presets from LocalStorage
  const [presets, setPresets] = useState<ConversionPreset[]>(() => {
    return getUserLocalData<ConversionPreset[]>('converter_presets', DEFAULT_PRESETS);
  });

  useEffect(() => {
    saveUserLocalData('converter_presets', presets);
  }, [presets]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Click outside to close settings menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live currency rates
  const fetchLiveRates = useCallback(async () => {
    const cachedRates = getUserLocalData<Record<string, number> | null>('currency_rates_cache', null);
    const cachedTime = getUserLocalData<number>('currency_rates_time', 0);
    if (cachedRates && cachedTime && Date.now() - cachedTime < 12 * 60 * 60 * 1000) {
      setRates(cachedRates);
      const timeStr = new Date(cachedTime).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
      setLastRateUpdate(`Кеш (${timeStr})`);
      return;
    }

    setIsFetchingRates(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          const updatedRates = { ...DEFAULT_RATES_USD, ...data.rates };
          setRates(updatedRates);
          saveUserLocalData('currency_rates_cache', updatedRates);
          saveUserLocalData('currency_rates_time', Date.now());
          const timeStr = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
          setLastRateUpdate(`Оновлено о ${timeStr}`);
        }
      }
    } catch {
      clearTimeout(timeoutId);
      setLastRateUpdate('Офлайн-курс');
    } finally {
      setIsFetchingRates(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveRates();
  }, [fetchLiveRates]);

  // Active Category Definition
  const isCurrencyMode = selectedCategory === 'currencies';
  const currentCategoryDef = useMemo(() => {
    return UNIT_CATEGORIES.find((c) => c.key === selectedCategory) || UNIT_CATEGORIES[0];
  }, [selectedCategory]);

  const fromUnitObj = useMemo(() => {
    return currentCategoryDef.units.find((u) => u.id === fromUnitId) || currentCategoryDef.units[0];
  }, [currentCategoryDef, fromUnitId]);

  const toUnitObj = useMemo(() => {
    return currentCategoryDef.units.find((u) => u.id === toUnitId) || currentCategoryDef.units[1] || currentCategoryDef.units[0];
  }, [currentCategoryDef, toUnitId]);

  // Standard Decimal Formatting with DOT (.)
  const formatNumber = useCallback((val: number, prec: number): string => {
    if (isNaN(val)) return '0';
    if (val === 0) return '0';
    if (Number.isInteger(val)) return val.toString();
    const str = val.toFixed(prec);
    return str.replace(/\.?0+$/, '');
  }, []);

  // --- TWO-WAY BINDING FOR UNITS ---
  const recalculateUnitRight = useCallback((leftStr: string, fUnit: UnitDef, tUnit: UnitDef, prec: number) => {
    const val = parseFloat(leftStr);
    if (isNaN(val)) {
      setUnitRight('');
      return;
    }
    const base = fUnit.toBase(val);
    const converted = tUnit.fromBase(base);
    setUnitRight(formatNumber(converted, prec));
  }, [formatNumber]);

  const recalculateUnitLeft = useCallback((rightStr: string, fUnit: UnitDef, tUnit: UnitDef, prec: number) => {
    const val = parseFloat(rightStr);
    if (isNaN(val)) {
      setUnitLeft('');
      return;
    }
    const base = tUnit.toBase(val);
    const converted = fUnit.fromBase(base);
    setUnitLeft(formatNumber(converted, prec));
  }, [formatNumber]);

  // --- TWO-WAY BINDING FOR CURRENCIES ---
  const recalculateCurrRight = useCallback((leftStr: string, fromC: string, toC: string, currentRates: Record<string, number>, prec: number) => {
    const val = parseFloat(leftStr);
    if (isNaN(val)) {
      setCurrRight('');
      return;
    }
    const fRate = currentRates[fromC] || 1;
    const tRate = currentRates[toC] || 1;
    const usd = val / fRate;
    const converted = usd * tRate;
    setCurrRight(formatNumber(converted, prec));
  }, [formatNumber]);

  const recalculateCurrLeft = useCallback((rightStr: string, fromC: string, toC: string, currentRates: Record<string, number>, prec: number) => {
    const val = parseFloat(rightStr);
    if (isNaN(val)) {
      setCurrLeft('');
      return;
    }
    const fRate = currentRates[fromC] || 1;
    const tRate = currentRates[toC] || 1;
    const usd = val / tRate;
    const converted = usd * fRate;
    setCurrLeft(formatNumber(converted, prec));
  }, [formatNumber]);

  // Initial calculation on unit/currency change
  useEffect(() => {
    if (!isCurrencyMode) {
      recalculateUnitRight(unitLeft, fromUnitObj, toUnitObj, precision);
    } else {
      recalculateCurrRight(currLeft, fromCurr, toCurr, rates, precision);
    }
  }, [selectedCategory, fromUnitId, toUnitId, fromCurr, toCurr, precision, rates]);

  // Switch category
  const handleSelectCategory = (catKey: UnitCategoryKey) => {
    setSelectedCategory(catKey);
    if (catKey !== 'currencies') {
      const cat = UNIT_CATEGORIES.find((c) => c.key === catKey);
      if (cat && cat.units.length >= 2) {
        setFromUnitId(cat.units[0].id);
        setToUnitId(cat.units[1].id);
        setUnitLeft('1');
        recalculateUnitRight('1', cat.units[0], cat.units[1], precision);
      }
    }
  };

  // Swap Units or Currencies
  const handleSwap = () => {
    setSwapRotation((prev) => prev + 180);
    if (!isCurrencyMode) {
      const prevFrom = fromUnitId;
      const prevTo = toUnitId;
      setFromUnitId(prevTo);
      setToUnitId(prevFrom);
      setUnitLeft(unitRight);
      const newFrom = currentCategoryDef.units.find((u) => u.id === prevTo) || toUnitObj;
      const newTo = currentCategoryDef.units.find((u) => u.id === prevFrom) || fromUnitObj;
      recalculateUnitRight(unitRight, newFrom, newTo, precision);
    } else {
      const prevFrom = fromCurr;
      const prevTo = toCurr;
      setFromCurr(prevTo);
      setToCurr(prevFrom);
      setCurrLeft(currRight);
      recalculateCurrRight(currRight, prevTo, prevFrom, rates, precision);
    }
  };

  // Keyboard shortcut 'X' to swap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = (document.activeElement?.tagName || '').toLowerCase();
      if (active === 'input' || active === 'textarea' || active === 'select') return;
      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleSwap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Quick values chips handler
  const handleQuickValue = (val: number | 'clear' | 'max') => {
    let newVal = '0';
    if (val === 'clear') newVal = '0';
    else if (val === 'max') newVal = '1000000';
    else newVal = val.toString();

    if (!isCurrencyMode) {
      setUnitLeft(newVal);
      recalculateUnitRight(newVal, fromUnitObj, toUnitObj, precision);
    } else {
      setCurrLeft(newVal);
      recalculateCurrRight(newVal, fromCurr, toCurr, rates, precision);
    }
  };

  // Copy result to clipboard
  const handleCopy = () => {
    let text = '';
    if (!isCurrencyMode) {
      text = `${unitLeft} ${fromUnitObj.symbol} = ${unitRight} ${toUnitObj.symbol}`;
    } else {
      text = `${currLeft} ${fromCurr} = ${currRight} ${toCurr}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  // Save current as Preset
  const handleSavePreset = () => {
    let newP: ConversionPreset;
    if (!isCurrencyMode) {
      newP = {
        id: `p-${Date.now()}`,
        label: `${unitLeft} ${fromUnitObj.symbol} → ${toUnitObj.symbol}`,
        categoryKey: selectedCategory,
        amount: parseFloat(unitLeft) || 1,
        fromId: fromUnitId,
        toId: toUnitId,
      };
    } else {
      newP = {
        id: `p-${Date.now()}`,
        label: `${currLeft} ${fromCurr} → ${toCurr}`,
        categoryKey: 'currencies',
        amount: parseFloat(currLeft) || 100,
        fromId: fromCurr,
        toId: toCurr,
      };
    }

    setPresets((prev) => {
      const exists = prev.some((p) => p.label === newP.label);
      if (exists) return prev;
      return [newP, ...prev];
    });

    setPresetToast('Збережено в пресети!');
    setTimeout(() => setPresetToast(null), 2000);
  };

  // Apply Preset
  const applyPreset = (p: ConversionPreset) => {
    setSelectedCategory(p.categoryKey);
    if (p.categoryKey === 'currencies') {
      setFromCurr(p.fromId);
      setToCurr(p.toId);
      setCurrLeft(p.amount.toString());
      recalculateCurrRight(p.amount.toString(), p.fromId, p.toId, rates, precision);
    } else {
      setFromUnitId(p.fromId);
      setToUnitId(p.toId);
      setUnitLeft(p.amount.toString());
      const cat = UNIT_CATEGORIES.find((c) => c.key === p.categoryKey);
      const fU = cat?.units.find((u) => u.id === p.fromId) || fromUnitObj;
      const tU = cat?.units.find((u) => u.id === p.toId) || toUnitObj;
      recalculateUnitRight(p.amount.toString(), fU, tU, precision);
    }
  };

  // Delete preset
  const deletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  // Export Presets JSON
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(presets, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `converter_presets_${Date.now()}.json`;
    a.click();
    setShowSettingsMenu(false);
  };

  // Import Presets JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed)) {
          setPresets((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const fresh = parsed.filter((p: any) => p && p.label && !ids.has(p.id));
            return [...fresh, ...prev];
          });
          setPresetToast(`Імпортовано ${parsed.length} пресетів!`);
          setTimeout(() => setPresetToast(null), 2500);
        }
      } catch {
        setPresetToast('Помилка читання JSON');
        setTimeout(() => setPresetToast(null), 2500);
      }
    };
    reader.readAsText(file);
    setShowSettingsMenu(false);
  };

  // Clear All Presets
  const handleClearPresets = () => {
    if (confirm('Ви дійсно бажаєте видалити всі збережені пресети?')) {
      setPresets([]);
      setShowSettingsMenu(false);
    }
  };

  // Formula Hint Text with Clean Standard
  const formulaHint = useMemo(() => {
    if (!isCurrencyMode) {
      const base = fromUnitObj.toBase(1);
      const rate = toUnitObj.fromBase(base);
      return `1 ${fromUnitObj.symbol} = ${formatNumber(rate, precision)} ${toUnitObj.symbol}`;
    } else {
      const fR = rates[fromCurr] || 1;
      const tR = rates[toCurr] || 1;
      const rate = (1 / fR) * tR;
      return `1 ${fromCurr} = ${formatNumber(rate, precision)} ${toCurr} • ${lastRateUpdate}`;
    }
  }, [isCurrencyMode, fromUnitObj, toUnitObj, fromCurr, toCurr, rates, lastRateUpdate, precision, formatNumber]);

  return (
    <div
      className={`unit-and-currency-converter backdrop-blur-3xl rounded-[32px] border p-5 sm:p-7 transition-all ${
        isDarkTheme
          ? 'bg-white/[0.05] text-white border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.5)]'
          : 'bg-white text-slate-900 border-slate-200 shadow-xl'
      }`}
    >
      {/* 1. TOP HEADER & DRAWER TOGGLE BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner ${
              isCurrencyMode
                ? 'bg-gradient-to-tr from-amber-500/25 to-yellow-500/25 border-amber-400/40 text-amber-300'
                : 'bg-gradient-to-tr from-blue-500/25 to-sky-400/25 border-blue-400/40 text-sky-300'
            }`}
          >
            {isCurrencyMode ? <Coins className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {isCurrencyMode ? 'Конвертер Валют' : `Конвертер: ${currentCategoryDef.label}`}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-slate-300">
                Two-Way Sync
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isCurrencyMode
                ? 'Миттєвий розрахунок за курсами НБУ та світових бірж'
                : 'Точний розрахунок фізичних та цифрових величин'}
            </p>
          </div>
        </div>

        {/* Action Controls: Presets Drawer + Settings ⋮ */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Presets Accordion Button */}
          <button
            type="button"
            onClick={() => setExpandedDrawer((prev) => (prev === 'presets' ? 'none' : 'presets'))}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              expandedDrawer === 'presets'
                ? 'bg-amber-500/25 text-amber-200 border-amber-400/40 shadow-xs'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>★ Пресети ({presets.length})</span>
            {expandedDrawer === 'presets' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 opacity-60" />}
          </button>

          {/* Settings Menu (Export / Import / Clear) */}
          <div className="relative" ref={settingsMenuRef}>
            <button
              type="button"
              onClick={() => setShowSettingsMenu((prev) => !prev)}
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
              title="Налаштування пресетів"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl p-1.5 z-30 text-xs text-slate-200 space-y-1 backdrop-blur-xl animate-in fade-in">
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Експортувати JSON</span>
                </button>

                <label className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Імпортувати JSON</span>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleClearPresets}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Очистити всі пресети</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. COLLAPSIBLE PRESETS DRAWER (Only when expanded) */}
      <AnimatePresence>
        {expandedDrawer === 'presets' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                <span>Швидкі пресети для розрахунку:</span>
                <span className="text-[10px] text-slate-500">Клікніть для застосування</span>
              </div>

              {presets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-amber-400/40 cursor-pointer transition-all active:scale-95 text-xs font-semibold text-slate-200"
                    >
                      <span>{p.label}</span>
                      <button
                        type="button"
                        onClick={(e) => deletePreset(p.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 transition-opacity"
                        title="Видалити"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">
                  Немає збережених пресетів. Додайте свій за допомогою кнопки «Зберегти в пресети».
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SINGLE UNIFIED CATEGORY ROW (No extra floor!) */}
      <div className="mb-5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {/* Currencies Button */}
          <button
            type="button"
            onClick={() => handleSelectCategory('currencies')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all active:scale-95 shrink-0 ${
              isCurrencyMode
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-md'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Валюти</span>
          </button>

          {/* All Physical Unit Categories */}
          {UNIT_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleSelectCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white border-blue-400 shadow-md'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MONOLITHIC INTERACTIVE CALCULATOR (Two-way binding on both sides) */}
      <div className="p-4 sm:p-6 rounded-3xl bg-black/40 border border-white/15 shadow-inner space-y-4">
        {/* Formula Hint Header with Online/Offline Status */}
        <div className="flex items-center justify-between text-xs px-1 pr-2">
          <div className="font-mono text-slate-300 font-semibold flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isCurrencyMode && !isOnline ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span>
              {formulaHint}
              {isCurrencyMode && !isOnline && ' • Офлайн-режим'}
            </span>
          </div>

          {isCurrencyMode && (
            <button
              type="button"
              onClick={fetchLiveRates}
              disabled={isFetchingRates}
              className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors pr-1 active:scale-95"
              title="Оновити курс валют"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRates ? 'animate-spin' : ''}`} />
              <span>Оновити курс</span>
            </button>
          )}
        </div>

        {/* Dual Interactive Input Fields with Perfectly Centered Reverse Button */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* Left Block (Input / Output) */}
          <div className="md:col-span-5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Початкове значення:
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={isCurrencyMode ? currLeft : unitLeft}
                onChange={(e) => {
                  const val = e.target.value;
                  if (isCurrencyMode) {
                    setCurrLeft(val);
                    recalculateCurrRight(val, fromCurr, toCurr, rates, precision);
                  } else {
                    setUnitLeft(val);
                    recalculateUnitRight(val, fromUnitObj, toUnitObj, precision);
                  }
                }}
                className="w-full text-xl sm:text-2xl font-bold font-mono bg-transparent outline-none text-white placeholder:text-slate-600"
                placeholder="0"
              />

              {/* Selector */}
              {isCurrencyMode ? (
                <select
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-amber-200 outline-none cursor-pointer"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                      {c.flag} {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={fromUnitId}
                  onChange={(e) => setFromUnitId(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-sky-200 outline-none cursor-pointer"
                >
                  {currentCategoryDef.units.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Center Reverse / Swap Button — Vertically Centered on Inputs via md:pt-5 */}
          <div className="md:col-span-1 flex items-center justify-center md:pt-5">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg transition-all active:scale-90"
              title="Поміняти місцями (Гаряча клавіша: X)"
            >
              <motion.div animate={{ rotate: swapRotation }} transition={{ duration: 0.3 }}>
                <ArrowLeftRight className="w-4 h-4" />
              </motion.div>
            </button>
          </div>

          {/* Right Block (Input / Output with Two-Way Binding!) */}
          <div className="md:col-span-5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all space-y-1.5">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Результат:
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={isCurrencyMode ? currRight : unitRight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (isCurrencyMode) {
                    setCurrRight(val);
                    recalculateCurrLeft(val, fromCurr, toCurr, rates, precision);
                  } else {
                    setUnitRight(val);
                    recalculateUnitLeft(val, fromUnitObj, toUnitObj, precision);
                  }
                }}
                className="w-full text-xl sm:text-2xl font-bold font-mono bg-transparent outline-none text-emerald-300 placeholder:text-slate-600"
                placeholder="0"
              />

              {/* Selector */}
              {isCurrencyMode ? (
                <select
                  value={toCurr}
                  onChange={(e) => setToCurr(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-emerald-200 outline-none cursor-pointer"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                      {c.flag} {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={toUnitId}
                  onChange={(e) => setToUnitId(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-emerald-200 outline-none cursor-pointer"
                >
                  {currentCategoryDef.units.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* 5. MINIMALIST QUICK CHIPS & ACTIONS BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
          {/* Quick Value Chips & Precision with Vertical Divider */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-0.5">
              Швидко:
            </span>

            {/* Clear Button */}
            <button
              type="button"
              onClick={() => handleQuickValue('clear')}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30 transition-all active:scale-95 shadow-2xs"
              title="Скинути в 0"
            >
              C
            </button>

            {[0.5, 1, 10, 100, 1000].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleQuickValue(num)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleQuickValue('max')}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
            >
              Max
            </button>

            {/* Vertical Divider */}
            <div className="h-4 w-[1px] bg-white/15 mx-1 hidden xs:block" />

            {/* Precision Selector */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <span className="text-[10px] uppercase font-bold text-slate-500">Точність:</span>
              {[2, 4, 6].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrecision(p)}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    precision === p ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10'
                  }`}
                >
                  .{p}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Save Preset & Copy Result */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {presetToast && (
              <span className="text-xs font-bold text-amber-300 animate-in fade-in mr-1">
                {presetToast}
              </span>
            )}

            <button
              type="button"
              onClick={handleSavePreset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 hover:text-amber-200 transition-all active:scale-95"
              title="Зберегти поточну комбінацію в пресети"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Зберегти в пресети</span>
            </button>

            {/* Neutral by default, green celebration on copy */}
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                copiedToast
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
              }`}
            >
              {copiedToast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedToast ? 'Скопійовано!' : 'Копіювати'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
