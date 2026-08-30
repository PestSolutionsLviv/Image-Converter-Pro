import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Film,
  X,
  UploadCloud,
  Download,
  Sparkles,
  Play,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { GifWriter } from 'omggif';

interface GifMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme?: boolean;
}

export const GifMakerModal: React.FC<GifMakerModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme = true,
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(10);
  const [targetWidth, setTargetWidth] = useState<number>(400);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifBytes, setGifBytes] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const handleVideoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setGifUrl(null);
      setProgressPct(0);
    }
  };

  // Extract frames from video and encode to animated GIF
  const generateGif = async () => {
    if (!videoUrl || !videoRef.current) return;
    setIsGenerating(true);
    setProgressPct(5);

    const video = videoRef.current;
    video.currentTime = 0;

    await new Promise((resolve) => {
      if (video.readyState >= 2) resolve(true);
      else video.onloadeddata = () => resolve(true);
    });

    const duration = Math.min(video.duration || 3, 5); // max 5 seconds
    const interval = 1 / fps;
    const totalFrames = Math.floor(duration / interval);

    const aspect = (video.videoHeight || 300) / (video.videoWidth || 400);
    const width = targetWidth;
    const height = Math.round(targetWidth * aspect);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    const buffer = new Uint8Array(width * height * totalFrames * 2 + 1024);
    const gifWriter = new GifWriter(buffer, width, height, { loop: 0 });

    for (let i = 0; i < totalFrames; i++) {
      const time = i * interval;
      video.currentTime = time;

      await new Promise((res) => {
        const onSeek = () => {
          video.removeEventListener('seeked', onSeek);
          res(true);
        };
        video.addEventListener('seeked', onSeek);
      });

      ctx.drawImage(video, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Simple color quantization for 256-color GIF palette
      const palette: number[] = [];
      const indexedPixels = new Uint8Array(width * height);
      const colorMap = new Map<number, number>();

      for (let p = 0; p < data.length; p += 4) {
        // Quantize RGB (reduce to 6 bits per channel for palette compression)
        const r = data[p] & 0xf8;
        const g = data[p + 1] & 0xfc;
        const b = data[p + 2] & 0xf8;
        const rgb24 = (r << 16) | (g << 8) | b;

        let index = colorMap.get(rgb24);
        if (index === undefined) {
          if (palette.length < 256) {
            index = palette.length;
            palette.push(rgb24);
            colorMap.set(rgb24, index);
          } else {
            index = 0; // fallback to first color if palette overflows
          }
        }
        indexedPixels[p / 4] = index;
      }

      // Ensure palette has at least 2 colors (power of 2 up to 256)
      while (palette.length < 2 || (palette.length & (palette.length - 1)) !== 0) {
        palette.push(0);
      }

      const delayCentisecs = Math.round(100 / fps);
      gifWriter.addFrame(0, 0, width, height, Array.from(indexedPixels), {
        palette: palette,
        delay: delayCentisecs,
      });

      setProgressPct(Math.round(((i + 1) / totalFrames) * 90));
    }

    const finalBytes = gifWriter.end();
    const cleanGifBuffer = buffer.subarray(0, finalBytes);
    const blob = new Blob([cleanGifBuffer], { type: 'image/gif' });
    const url = URL.createObjectURL(blob);

    setGifUrl(url);
    setGifBytes(cleanGifBuffer.length);
    setProgressPct(100);
    setIsGenerating(false);
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500/25 to-rose-500/25 border border-pink-400/40 text-pink-400 flex items-center justify-center shadow-inner">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                GIF Аніматор
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30">
                  Video to GIF
                </span>
              </h3>
              <p className="text-xs text-slate-400">Створення анімованих GIF з відеокліпів без водяних знаків</p>
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
          {!videoUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-white/20 hover:border-pink-400/60 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoSelected}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-200">
                Завантажте коротке відео (MP4, WebM, MOV)
              </p>
              <span className="text-[10px] text-slate-400">Оптимально: кліп до 5 секунд для компактного розміру</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Hidden Player for frame rendering */}
              <video
                ref={videoRef}
                src={videoUrl}
                muted
                playsInline
                className="w-full max-h-48 rounded-2xl object-contain bg-black/60 border border-white/10"
                controls
              />

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">Частота кадрів (FPS):</label>
                  <div className="flex items-center gap-2">
                    {[8, 12, 15].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFps(val)}
                        className={`flex-1 py-1.5 rounded-xl font-bold border transition-all ${
                          fps === val
                            ? 'bg-pink-600 text-white border-pink-400'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {val} fps
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">Ширина анімації:</label>
                  <div className="flex items-center gap-2">
                    {[320, 400, 480].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTargetWidth(val)}
                        className={`flex-1 py-1.5 rounded-xl font-bold border transition-all ${
                          targetWidth === val
                            ? 'bg-pink-600 text-white border-pink-400'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {val}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isGenerating && (
                <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-400/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-pink-300">
                    <span>Генерація кадрів та палітри GIF...</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-200"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Result Preview & Download */}
              {gifUrl && (
                <div className="p-4 rounded-2xl bg-pink-500/15 border border-pink-400/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-pink-200">
                        GIF готовий ({(gifBytes / 1024 / 1024).toFixed(2)} МБ)
                      </span>
                    </div>

                    <a
                      href={gifUrl}
                      download={`animation_${Date.now()}.gif`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Завантажити .GIF</span>
                    </a>
                  </div>

                  <div className="flex justify-center p-3 rounded-xl bg-black/40 border border-white/10">
                    <img src={gifUrl} alt="Generated GIF" className="max-h-48 rounded-lg object-contain" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Закрити
          </button>

          <button
            type="button"
            disabled={isGenerating || !videoUrl}
            onClick={generateGif}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 rounded-full transition-all active:scale-95 disabled:opacity-40 shadow-lg shadow-pink-500/25"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Рендеринг...' : 'Створити GIF'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
