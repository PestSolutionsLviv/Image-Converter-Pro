import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  QrCode,
  X,
  Download,
  Copy,
  Check,
  Globe,
  Wifi,
  User,
  Mail,
  FileText,
  Palette,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Image as ImageIcon,
  Shield,
  Layers,
} from 'lucide-react';
import QRCode from 'qrcode';

interface QrBarcodeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme?: boolean;
}

type QrType = 'url' | 'wifi' | 'vcard' | 'email' | 'text';
type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';
type ModuleStyle = 'square' | 'rounded' | 'dots';
type CenterIconType = 'none' | 'globe' | 'wifi' | 'star' | 'custom';

// Contrast calculator according to WCAG luminance guidelines
function getContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    if (c.length !== 6) return 0;
    const num = parseInt(c, 16);
    const r = (num >> 16) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;
    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 21;
  }
}

export const QrBarcodeStudioModal: React.FC<QrBarcodeStudioModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme = true,
}) => {
  // 1. Content Type & Input values
  const [type, setType] = useState<QrType>('url');
  const [urlValue, setUrlValue] = useState<string>('https://pestsolutions.com.ua');

  // Wi-Fi
  const [wifiSsid, setWifiSsid] = useState<string>('MyHomeWiFi');
  const [wifiPass, setWifiPass] = useState<string>('SuperSecret123');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  // vCard
  const [vcardName, setVcardName] = useState<string>('Тарас Салдан');
  const [vcardPhone, setVcardPhone] = useState<string>('+380676706402');
  const [vcardOrg, setVcardOrg] = useState<string>('Pest Solutions');
  const [vcardEmail, setVcardEmail] = useState<string>('saldan1978@gmail.com');

  // Email
  const [emailTo, setEmailTo] = useState<string>('saldan1978@gmail.com');
  const [emailSubject, setEmailSubject] = useState<string>('Співпраця / Запитання');
  const [emailBody, setEmailBody] = useState<string>('Доброго дня, Тарасе!');

  // Text
  const [textValue, setTextValue] = useState<string>('Universal Converter Pro — швидкі офлайн інструменти');

  // 2. Styling options
  const [fgColor, setFgColor] = useState<string>('#0284c7');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [isTransparent, setIsTransparent] = useState<boolean>(false);
  const [eccLevel, setEccLevel] = useState<ErrorCorrection>('H');
  const [moduleStyle, setModuleStyle] = useState<ModuleStyle>('rounded');
  const [centerIcon, setCenterIcon] = useState<CenterIconType>('none');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  // 3. Export settings
  const [pngResolution, setPngResolution] = useState<number>(2048);
  const [svgOutput, setSvgOutput] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const fileLogoRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Build payload
  const getPayload = () => {
    switch (type) {
      case 'url': {
        const trimmed = urlValue.trim();
        return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
      }
      case 'wifi': {
        const hiddenStr = wifiHidden ? 'H:true;' : '';
        return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiAuth === 'nopass' ? '' : wifiPass};${hiddenStr};`;
      }
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardOrg}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'text':
      default:
        return textValue;
    }
  };

  // Contrast check
  const contrastRatio = useMemo(() => {
    if (isTransparent) return 21;
    return getContrastRatio(fgColor, bgColor);
  }, [fgColor, bgColor, isTransparent]);

  const isLowContrast = contrastRatio < 3.2;

  // Generate SVG on state change
  useEffect(() => {
    const payload = getPayload();
    if (!payload) return;

    QRCode.toString(
      payload,
      {
        type: 'svg',
        color: {
          dark: fgColor,
          light: isTransparent ? '#00000000' : bgColor,
        },
        errorCorrectionLevel: eccLevel,
        margin: 2,
      },
      (err, rawSvg) => {
        if (!err && rawSvg) {
          let enhancedSvg = rawSvg;
          if (moduleStyle === 'rounded') {
            enhancedSvg = enhancedSvg.replace(/<rect /g, '<rect rx="2.5" ry="2.5" ');
          } else if (moduleStyle === 'dots') {
            enhancedSvg = enhancedSvg.replace(/<rect /g, '<rect rx="5" ry="5" ');
          }
          setSvgOutput(enhancedSvg);
        }
      }
    );
  }, [
    type,
    urlValue,
    wifiSsid,
    wifiPass,
    wifiAuth,
    wifiHidden,
    vcardName,
    vcardPhone,
    vcardOrg,
    vcardEmail,
    emailTo,
    emailSubject,
    emailBody,
    textValue,
    fgColor,
    bgColor,
    isTransparent,
    eccLevel,
    moduleStyle,
  ]);

  // Reset to defaults
  const handleResetDefaults = () => {
    setType('url');
    setUrlValue('https://pestsolutions.com.ua');
    setFgColor('#0284c7');
    setBgColor('#ffffff');
    setIsTransparent(false);
    setEccLevel('H');
    setModuleStyle('rounded');
    setCenterIcon('none');
    setCustomLogoUrl(null);
  };

  // Upload custom logo
  const handleLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCustomLogoUrl(URL.createObjectURL(file));
      setCenterIcon('custom');
      setEccLevel('H'); // Auto switch to high error correction
    }
  };

  // Copy SVG to clipboard
  const handleCopySvg = () => {
    if (!svgOutput) return;
    navigator.clipboard.writeText(svgOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download Vector SVG
  const handleDownloadSvg = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode_${type}_vector.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download High-Res PNG via Canvas
  const handleDownloadPng = async () => {
    const payload = getPayload();
    if (!payload) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = pngResolution;
      canvas.height = pngResolution;

      await QRCode.toCanvas(canvas, payload, {
        width: pngResolution,
        color: {
          dark: fgColor,
          light: isTransparent ? '#00000000' : bgColor,
        },
        errorCorrectionLevel: eccLevel,
        margin: 2,
      });

      // Overlay center icon/logo if selected
      const iconToDraw = centerIcon === 'custom' ? customLogoUrl : null;
      if (iconToDraw) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = iconToDraw;
          await new Promise((res) => {
            img.onload = res;
          });

          const logoSize = pngResolution * 0.22;
          const logoX = (pngResolution - logoSize) / 2;
          const logoY = (pngResolution - logoSize) / 2;
          const radius = logoSize * 0.2;

          // Draw white backdrop badge for logo
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(logoX - 12, logoY - 12, logoSize + 24, logoSize + 24, radius + 8);
          ctx.fillStyle = isTransparent ? '#ffffff' : bgColor;
          ctx.fill();
          ctx.lineWidth = 6;
          ctx.strokeStyle = fgColor;
          ctx.stroke();

          // Draw logo clipped
          ctx.beginPath();
          ctx.roundRect(logoX, logoY, logoSize, logoSize, radius);
          ctx.clip();
          ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
          ctx.restore();
        }
      }

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `qrcode_${type}_${pngResolution}px.png`;
      a.click();
    } catch (err) {
      console.error('Error generating PNG:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`rounded-[32px] max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden border shadow-2xl transition-colors ${
          isDarkTheme
            ? 'bg-slate-900/95 text-slate-100 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.7)]'
            : 'bg-white text-slate-800 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/25 to-blue-500/25 border border-sky-400/40 text-sky-400 flex items-center justify-center shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Генератор QR-Кодів
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Vector Studio Pro
                </span>
              </h3>
              <p className="text-xs text-slate-400">Векторні SVG та надчіткі PNG коди з логотипом для друку та вебу</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Tabs with Clear Text Labels */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 rounded-2xl bg-black/30 border border-white/10 text-xs font-bold">
            {[
              { id: 'url', label: 'Посилання', icon: Globe },
              { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
              { id: 'vcard', label: 'vCard Візитка', icon: User },
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'text', label: 'Текст', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = type === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setType(tab.id as QrType)}
                  className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body 2-Column Grid */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Left Column: Form Fields, Colors & Customization */}
            <div className="md:col-span-7 space-y-3.5">
              {/* Dynamic Inputs according to tab */}
              {type === 'url' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Адреса сайту / посилання (URL):</label>
                  <input
                    type="url"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full text-xs font-mono p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-blue-400"
                  />
                </div>
              )}

              {type === 'wifi' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Назва мережі (SSID):</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="Назва вашого Wi-Fi"
                      className="w-full text-xs font-mono p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300">Пароль мережі:</label>
                      <input
                        type="text"
                        value={wifiPass}
                        disabled={wifiAuth === 'nopass'}
                        onChange={(e) => setWifiPass(e.target.value)}
                        placeholder={wifiAuth === 'nopass' ? 'Без пароля' : 'Пароль'}
                        className="w-full text-xs font-mono p-2 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-blue-400 disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300">Тип шифрування:</label>
                      <select
                        value={wifiAuth}
                        onChange={(e) => setWifiAuth(e.target.value as any)}
                        className="w-full text-xs font-bold p-2 rounded-xl bg-black/60 border border-white/20 text-sky-300 outline-none cursor-pointer"
                      >
                        <option value="WPA">WPA / WPA2 (Стандарт)</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Відкрита (Без пароля)</option>
                      </select>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded border-white/20 bg-black/40 text-blue-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Прихована мережа (Hidden SSID)</span>
                  </label>
                </div>
              )}

              {type === 'vcard' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-300">Повне ім'я:</label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      className="w-full text-xs font-mono p-2 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-300">Телефон:</label>
                    <input
                      type="text"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      className="w-full text-xs font-mono p-2 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-300">Компанія / Посада:</label>
                    <input
                      type="text"
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                      className="w-full text-xs font-mono p-2 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-300">Email:</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      className="w-full text-xs font-mono p-2 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              )}

              {type === 'email' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Отримувач (Email):</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full text-xs font-mono p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Тема повідомлення:</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full text-xs font-mono p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              )}

              {type === 'text' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Текст повідомлення:</label>
                  <textarea
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    rows={3}
                    className="w-full text-xs font-mono p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-blue-400 leading-relaxed"
                  />
                </div>
              )}

              {/* Color Customization with Interactive Pickers & HEX Inputs */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-sky-400" />
                    Кольорова гама:
                  </span>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={isTransparent}
                      onChange={(e) => setIsTransparent(e.target.checked)}
                      className="rounded border-white/20 bg-black/40 text-blue-500 cursor-pointer"
                    />
                    <span>Прозорий фон (SVG)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Foreground Color */}
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/30 border border-white/10">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] text-slate-400 font-bold">Колір коду</span>
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-full font-mono text-xs text-white bg-transparent outline-none uppercase font-bold"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div
                    className={`flex items-center gap-2 p-1.5 rounded-xl bg-black/30 border border-white/10 transition-opacity ${
                      isTransparent ? 'opacity-30 pointer-events-none' : ''
                    }`}
                  >
                    <input
                      type="color"
                      value={bgColor}
                      disabled={isTransparent}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] text-slate-400 font-bold">Фон</span>
                      <input
                        type="text"
                        value={bgColor}
                        disabled={isTransparent}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full font-mono text-xs text-white bg-transparent outline-none uppercase font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Contrast Warning Banner */}
                {isLowContrast && (
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Низький контраст: код може погано зчитуватися камерою смартфона.</span>
                  </div>
                )}
              </div>

              {/* Error Correction & Module Style */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
                {/* ECC Level */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300 text-[11px]">Корекція помилок (ECC):</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['L', 'M', 'Q', 'H'] as ErrorCorrection[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEccLevel(lvl)}
                        className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                          eccLevel === lvl
                            ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                        title={`Рівень ${lvl}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Module Style */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300 text-[11px]">Форма модулів:</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'square', label: 'Квадрат' },
                      { id: 'rounded', label: 'Скруглені' },
                      { id: 'dots', label: 'Точки' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setModuleStyle(st.id as ModuleStyle)}
                        className={`py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          moduleStyle === st.id
                            ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Central Logo / Branding Option */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    Логотип / Іконка в центрі:
                  </span>
                  {customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomLogoUrl(null);
                        setCenterIcon('none');
                      }}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Видалити лого
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileLogoRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>{customLogoUrl ? 'Змінити логотип' : 'Завантажити логотип (PNG/SVG)'}</span>
                  </button>
                  <input ref={fileLogoRef} type="file" accept="image/*" onChange={handleLogoSelected} className="hidden" />

                  {customLogoUrl && (
                    <img src={customLogoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20" />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Preview & Export Hub */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
              {/* QR Preview Box with Center Icon Rendering */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 p-3 rounded-2xl flex items-center justify-center shadow-xl bg-white overflow-hidden">
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: svgOutput }}
                />

                {/* Centered Logo Preview Overlay */}
                {customLogoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-white p-1 border-2 border-sky-500 shadow-lg flex items-center justify-center overflow-hidden">
                      <img src={customLogoUrl} alt="Center Logo" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Picker for PNG */}
              <div className="w-full flex items-center justify-between text-xs p-2 rounded-xl bg-black/30 border border-white/10">
                <span className="text-[11px] font-bold text-slate-400">Роздільна здатність:</span>
                <div className="flex items-center gap-1">
                  {[
                    { res: 1024, label: '1024 px' },
                    { res: 2048, label: '2048 HD' },
                    { res: 4096, label: '4096 Друк' },
                  ].map((item) => (
                    <button
                      key={item.res}
                      type="button"
                      onClick={() => setPngResolution(item.res)}
                      className={`px-2 py-0.5 rounded-lg font-mono text-[10.5px] font-bold transition-all ${
                        pngResolution === item.res
                          ? 'bg-sky-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons (Primary PNG + Clean Secondary SVG & Copy) */}
              <div className="w-full space-y-2">
                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Завантажити PNG ({pngResolution}×{pngResolution}px)</span>
                </button>

                {/* Secondary Neutral Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Векторний SVG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySvg}
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{isCopied ? 'Скопійовано!' : 'Копіювати'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Useful Action (Reset Defaults) instead of duplicate Close button */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
            title="Скинути кольори та налаштування"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Скинути параметри</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono">100% Векторний стандарт ISO/IEC 18004</span>
        </div>
      </motion.div>
    </div>
  );
};
