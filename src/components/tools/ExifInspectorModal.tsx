import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  X,
  UploadCloud,
  MapPin,
  ShieldCheck,
  Download,
  ExternalLink,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import ExifReader from 'exifreader';

interface ExifInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme?: boolean;
  initialFile?: File | null;
}

export const ExifInspectorModal: React.FC<ExifInspectorModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme = true,
  initialFile,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exifTags, setExifTags] = useState<Record<string, string>>({});
  const [gpsData, setGpsData] = useState<{ lat: number; lon: number } | null>(null);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (!isOpen) return null;

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCleanedUrl(null);

      try {
        const tags = await ExifReader.load(file, { expanded: true });
        const parsed: Record<string, string> = {};

        // Extract basic tags
        if (tags.exif?.Make) parsed['Виробник камери'] = String(tags.exif.Make.description);
        if (tags.exif?.Model) parsed['Модель камери'] = String(tags.exif.Model.description);
        if (tags.exif?.LensModel) parsed['Об’єктив'] = String(tags.exif.LensModel.description);
        if (tags.exif?.DateTimeOriginal) parsed['Дата зйомки'] = String(tags.exif.DateTimeOriginal.description);
        if (tags.exif?.ExposureTime) parsed['Витримка'] = String(tags.exif.ExposureTime.description);
        if (tags.exif?.FNumber) parsed['Діафрагма'] = String(tags.exif.FNumber.description);
        if (tags.exif?.ISOSpeedRatings) parsed['ISO'] = String(tags.exif.ISOSpeedRatings.description);
        if (tags.exif?.FocalLength) parsed['Фокусна відстань'] = String(tags.exif.FocalLength.description);
        if (tags.exif?.Software) parsed['Програмне забезпечення'] = String(tags.exif.Software.description);

        if (tags.file?.['Image Width'] && tags.file?.['Image Height']) {
          parsed['Роздільна здатність'] = `${tags.file['Image Width'].description} × ${tags.file['Image Height'].description} px`;
        }

        // GPS
        if (tags.gps && typeof tags.gps.Latitude === 'number' && typeof tags.gps.Longitude === 'number') {
          setGpsData({ lat: tags.gps.Latitude, lon: tags.gps.Longitude });
          parsed['GPS Координати'] = `${tags.gps.Latitude.toFixed(6)}, ${tags.gps.Longitude.toFixed(6)}`;
        } else {
          setGpsData(null);
        }

        setExifTags(parsed);
      } catch (err) {
        console.warn('Could not read EXIF data:', err);
        setExifTags({});
        setGpsData(null);
      }
    }
  };

  // Strip all metadata by re-rendering image on a clean HTML5 canvas
  const handleStripMetadata = async () => {
    if (!imageFile || !previewUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const isPng = imageFile.type === 'image/png';
    const mime = isPng ? 'image/png' : 'image/jpeg';
    const cleanBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mime, 0.95);
    });

    if (cleanBlob) {
      setCleanedUrl(URL.createObjectURL(cleanBlob));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-2xl animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`rounded-[32px] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border shadow-2xl transition-colors ${
          isDarkTheme
            ? 'bg-slate-900/95 text-slate-100 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.7)]'
            : 'bg-white text-slate-800 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/25 to-orange-500/25 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                EXIF Інспектор & Анонімізатор
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Metadata Tool
                </span>
              </h3>
              <p className="text-xs text-slate-400">Аналіз прихованих тегів зйомки та очищення геолокації</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto no-scrollbar">
          {/* File Picker */}
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-white/20 hover:border-amber-400/60 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/heic,image/tiff"
                onChange={handleImageSelected}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-200">
                Завантажте оригінальне фото (JPEG, PNG, HEIC, TIFF)
              </p>
              <span className="text-[10px] text-slate-400">Файл аналізується 100% у вашому браузері</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo Preview & Quick Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={previewUrl}
                    alt="EXIF preview"
                    className="w-14 h-14 object-cover rounded-xl border border-white/10"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{imageFile?.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {((imageFile?.size || 0) / 1024 / 1024).toFixed(2)} МБ • {Object.keys(exifTags).length} знайдених тегів
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl(null);
                      setExifTags({});
                      setGpsData(null);
                      setCleanedUrl(null);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                  >
                    Інше фото
                  </button>

                  <button
                    type="button"
                    onClick={handleStripMetadata}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-xs font-bold transition-all active:scale-95 shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Очистити EXIF</span>
                  </button>
                </div>
              </div>

              {/* Cleaned Download Banner */}
              {cleanedUrl && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-emerald-200 truncate">
                      Анонімне фото створено (без GPS та слідів камери)
                    </span>
                  </div>

                  <a
                    href={cleanedUrl}
                    download={`clean_${imageFile?.name || 'photo.jpg'}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Завантажити</span>
                  </a>
                </div>
              )}

              {/* GPS Alert if present */}
              {gpsData && (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-amber-200">Виявлено геолокацію GPS!</div>
                      <div className="text-[10px] text-amber-300/80">
                        {gpsData.lat.toFixed(5)}, {gpsData.lon.toFixed(5)}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://www.openstreetmap.org/?mlat=${gpsData.lat}&mlon=${gpsData.lon}#map=16/${gpsData.lat}/${gpsData.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-bold shrink-0 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Відкрити на карті</span>
                  </a>
                </div>
              )}

              {/* Tags Grid */}
              {Object.keys(exifTags).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar">
                  {Object.entries(exifTags).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between"
                    >
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{key}</span>
                      <span className="text-xs font-mono font-semibold text-sky-200 truncate mt-0.5">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 border border-white/10 rounded-2xl bg-white/[0.02]">
                  У цьому файлі немає метаданих EXIF або їх уже було очищено раніше.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400">100% захист приватності</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/15"
          >
            Закрити
          </button>
        </div>
      </motion.div>
    </div>
  );
};
