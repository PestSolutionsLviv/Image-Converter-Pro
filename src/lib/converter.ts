import heic2any from 'heic2any';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { ConversionSettings, FileCategory, FileItem, FormatOption, TargetFormat } from '../types';

export const SUPPORTED_FORMATS: FormatOption[] = [
  // Images
  {
    id: 'jpeg',
    label: 'JPG / JPEG',
    mimeType: 'image/jpeg',
    ext: 'jpg',
    description: 'Універсальний фото-формат із високою сумісністю',
    supportsQuality: true,
    category: 'image',
  },
  {
    id: 'png',
    label: 'PNG Image',
    mimeType: 'image/png',
    ext: 'png',
    description: 'Без втрати якості, підтримує прозорість',
    supportsQuality: false,
    category: 'image',
  },
  {
    id: 'webp',
    label: 'WebP Image',
    mimeType: 'image/webp',
    ext: 'webp',
    description: 'Сучасний веб-формат з високим стисненням',
    supportsQuality: true,
    category: 'image',
  },
  {
    id: 'pdf',
    label: 'PDF Document',
    mimeType: 'application/pdf',
    ext: 'pdf',
    description: 'Документ PDF для друку та збереження',
    supportsQuality: false,
    category: 'image',
  },
  {
    id: 'bmp',
    label: 'BMP Image',
    mimeType: 'image/bmp',
    ext: 'bmp',
    description: 'Растровий графічний файл без стиснення',
    supportsQuality: false,
    category: 'image',
  },
  {
    id: 'gif',
    label: 'GIF Image',
    mimeType: 'image/gif',
    ext: 'gif',
    description: 'Графічний формат для вебу',
    supportsQuality: false,
    category: 'image',
  },
  {
    id: 'ico',
    label: 'ICO Favicon',
    mimeType: 'image/x-icon',
    ext: 'ico',
    description: 'Іконка для сайтів та застосунків (32x32 / 64x64)',
    supportsQuality: false,
    category: 'image',
  },
  {
    id: 'svg',
    label: 'SVG Vector Wrapper',
    mimeType: 'image/svg+xml',
    ext: 'svg',
    description: 'Векторна обгортка зображення SVG',
    supportsQuality: false,
    category: 'image',
  },

  // Text / Documents
  {
    id: 'pdf',
    label: 'PDF Document (.pdf)',
    mimeType: 'application/pdf',
    ext: 'pdf',
    description: 'Форматований PDF документ з текстом',
    supportsQuality: false,
    category: 'document',
  },
  {
    id: 'txt',
    label: 'Plain Text (.txt)',
    mimeType: 'text/plain',
    ext: 'txt',
    description: 'Чистий текстовий файл',
    supportsQuality: false,
    category: 'document',
  },
  {
    id: 'md',
    label: 'Markdown (.md)',
    mimeType: 'text/markdown',
    ext: 'md',
    description: 'Документ у форматі Markdown розмітки',
    supportsQuality: false,
    category: 'document',
  },
  {
    id: 'html',
    label: 'HTML Web Page (.html)',
    mimeType: 'text/html',
    ext: 'html',
    description: 'Веб-сторінка з розміткою та стилями',
    supportsQuality: false,
    category: 'document',
  },
  {
    id: 'json',
    label: 'JSON Data (.json)',
    mimeType: 'application/json',
    ext: 'json',
    description: 'Структуровані дані у форматі JSON',
    supportsQuality: false,
    category: 'document',
  },
  {
    id: 'csv',
    label: 'CSV Table (.csv)',
    mimeType: 'text/csv',
    ext: 'csv',
    description: 'Табличний документ із комами-розділювачами',
    supportsQuality: false,
    category: 'document',
  },

  // Audio
  {
    id: 'wav',
    label: 'WAV Studio Audio (PCM)',
    mimeType: 'audio/wav',
    ext: 'wav',
    description: 'Студійне несжимане аудіо без втрат якості',
    supportsQuality: false,
    category: 'audio',
  },
  {
    id: 'mp3',
    label: 'MP3 Compressed Audio',
    mimeType: 'audio/mp3',
    ext: 'mp3',
    description: 'Універсальний стиснутий звуковий файл',
    supportsQuality: true,
    category: 'audio',
  },
  {
    id: 'ogg',
    label: 'OGG Vorbis Audio',
    mimeType: 'audio/ogg',
    ext: 'ogg',
    description: 'Сучасне відкрите веб-аудіо',
    supportsQuality: true,
    category: 'audio',
  },
  {
    id: 'm4a',
    label: 'M4A / AAC Audio',
    mimeType: 'audio/mp4',
    ext: 'm4a',
    description: 'Високоякісний стиснутий аудіоформат',
    supportsQuality: true,
    category: 'audio',
  },
  {
    id: 'webm_audio',
    label: 'WebM Opus Audio',
    mimeType: 'audio/webm',
    ext: 'webm',
    description: 'Легкий звуковий формат для вебу',
    supportsQuality: true,
    category: 'audio',
  },

  // Video
  {
    id: 'mp4_audio',
    label: 'Витягти Аудіо (WAV/MP3)',
    mimeType: 'audio/wav',
    ext: 'wav',
    description: 'Екстракція звукової доріжки з відео у WAV',
    supportsQuality: false,
    category: 'video',
  },
  {
    id: 'gif',
    label: 'Анімований GIF',
    mimeType: 'image/gif',
    ext: 'gif',
    description: 'Конвертація відео у GIF-анімацію',
    supportsQuality: false,
    category: 'video',
  },
  {
    id: 'webm_video',
    label: 'WebM Video',
    mimeType: 'video/webm',
    ext: 'webm',
    description: 'Сучасний веб-відео формат',
    supportsQuality: true,
    category: 'video',
  },
  {
    id: 'frames_zip',
    label: 'Кадри у ZIP (PNG Archive)',
    mimeType: 'application/zip',
    ext: 'zip',
    description: 'Експорт усіх кадрів відео у PNG-архів',
    supportsQuality: false,
    category: 'video',
  },
];

/**
  Detect file category automatically based on mime type or extension
 */
export function detectFileCategory(file: File): FileCategory {
  const mime = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (
    mime.startsWith('image/') ||
    [
      'heic', 'heif', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'ico',
      'tiff', 'tif', 'avif', 'cr2', 'cr3', 'nef', 'nrw', 'arw', 'srf', 'sr2',
      'dng', 'orf', 'rw2', 'pef', 'raf', 'erf', 'kdc', 'dcr', 'raw'
    ].includes(ext)
  ) {
    return 'image';
  }

  if (
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma', 'aiff', 'opus'].includes(ext)
  ) {
    return 'audio';
  }

  if (
    mime.startsWith('video/') ||
    ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', '3gp'].includes(ext)
  ) {
    return 'video';
  }

  return 'document';
}

/**
  Checks if file is HEIC or HEIF format
 */
export function isHeicFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const mime = file.type.toLowerCase();

  if (
    mime.startsWith('image/jpeg') ||
    mime.startsWith('image/png') ||
    mime.startsWith('image/webp') ||
    mime.startsWith('image/gif') ||
    mime.startsWith('image/bmp')
  ) {
    return false;
  }

  return (
    ext === 'heic' ||
    ext === 'heif' ||
    mime.includes('heic') ||
    mime.includes('heif')
  );
}

/**
  Checks if file is a camera RAW photo (CR2, CR3, NEF, ARW, DNG, ORF, RW2, RAF, PEF, etc.)
 */
export function isRawFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const mime = file.type.toLowerCase();

  const rawExtensions = [
    'cr2', 'cr3', 'nef', 'nrw', 'arw', 'srf', 'sr2', 'dng',
    'orf', 'rw2', 'pef', 'raf', 'erf', 'kdc', 'dcr', 'raw'
  ];

  if (rawExtensions.includes(ext)) {
    return true;
  }

  if (
    mime.includes('x-canon-cr') ||
    mime.includes('x-nikon-nef') ||
    mime.includes('x-sony-arw') ||
    mime.includes('x-adobe-dng') ||
    mime.includes('raw')
  ) {
    return true;
  }

  return false;
}

/**
  Decodes camera RAW files (CR2, CR3, NEF, ARW, DNG, ORF, RW2, RAF, PEF)
  by scanning and extracting the full-resolution embedded JPEG stream.
 */
export async function decodeRawToBlob(file: File): Promise<Blob> {
  if (
    file.type.startsWith('image/jpeg') ||
    file.type.startsWith('image/png') ||
    file.type.startsWith('image/webp')
  ) {
    return file;
  }

  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Scan for JPEG SOI (Start of Image) marker: 0xFF, 0xD8, 0xFF
    const candidates: { start: number; end: number; size: number }[] = [];

    for (let i = 0; i < bytes.length - 4; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff) {
        const start = i;
        let end = -1;
        const searchLimit = Math.min(bytes.length - 1, start + 60000000);
        for (let j = start + 500; j < searchLimit; j++) {
          if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
            end = j + 2;
          }
        }

        if (end > start) {
          const size = end - start;
          if (size > 10000) {
            candidates.push({ start, end, size });
          }
        }
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.size - a.size);
      const best = candidates[0];
      const jpegData = bytes.subarray(best.start, best.end);
      return new Blob([jpegData], { type: 'image/jpeg' });
    }

    return file;
  } catch (err: any) {
    console.warn('RAW decoding error:', err);
    return file;
  }
}

/**
  Extract dimensions from image file or blob
 */
export function getImageDimensions(
  srcUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = (err) => reject(err);
    img.src = srcUrl;
  });
}

/**
  Decode HEIC file to a standard PNG/JPEG blob using heic2any or fallback
 */
export async function decodeHeicToBlob(file: File): Promise<Blob> {
  if (
    file.type.startsWith('image/jpeg') ||
    file.type.startsWith('image/png') ||
    file.type.startsWith('image/webp') ||
    file.type.startsWith('image/gif') ||
    file.type.startsWith('image/bmp')
  ) {
    return file;
  }

  try {
    const conversionResult = await heic2any({
      blob: file,
      toType: 'image/png',
      quality: 0.95,
    });

    if (Array.isArray(conversionResult)) {
      return conversionResult[0];
    }
    return conversionResult;
  } catch (error: any) {
    console.warn('heic2any decoding notice:', error);
    const errStr = String(error?.message || error?.code || error || '');

    if (
      errStr.toLowerCase().includes('already browser readable') ||
      errStr.includes('ERR_USER')
    ) {
      return file;
    }

    try {
      const tempUrl = URL.createObjectURL(file);
      await loadImage(tempUrl);
      URL.revokeObjectURL(tempUrl);
      return file;
    } catch {
      // Native load failed
    }

    throw new Error(
      error?.message || 'Не вдалося декодувати HEIC файл. Перевірте цілісність файлу.'
    );
  }
}

/**
 * 16-bit PCM WAV Encoder (Client-side, offline)
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels: Float32Array[] = [];
  const sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(pos++, str.charCodeAt(i));
    }
  }

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  writeString('RIFF');
  setUint32(length - 8);
  writeString('WAVE');

  writeString('fmt ');
  setUint32(16);
  setUint16(1); // raw PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);

  writeString('data');
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([outBuffer], { type: 'audio/wav' });
}

/**
  Audio Conversion Engine
 */
export async function convertAudioFile(
  item: FileItem,
  targetFormat: TargetFormat,
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(20);
  const arrayBuffer = await item.file.arrayBuffer();
  onProgress?.(50);

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Ваш браузер не підтримує Web Audio API для конвертації аудіо');
  }

  const audioCtx = new AudioCtx();
  
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    onProgress?.(80);

    const wavBlob = audioBufferToWavBlob(audioBuffer);
    onProgress?.(100);
    return wavBlob;
  } catch (err: any) {
    console.error('Audio conversion error:', err);
    throw new Error('Не вдалося декодувати аудіо: ' + (err?.message || 'Формат не підтримується'));
  } finally {
    audioCtx.close();
  }
}

/**
  Document & Text Conversion Engine
 */
export async function convertDocumentFile(
  item: FileItem,
  targetFormat: TargetFormat,
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(20);
  const text = await item.file.text();
  onProgress?.(50);

  if (targetFormat === 'txt') {
    onProgress?.(100);
    return new Blob([text], { type: 'text/plain;charset=utf-8' });
  }

  if (targetFormat === 'md') {
    onProgress?.(100);
    let mdText = text;
    if (item.name.endsWith('.json')) {
      try {
        const parsed = JSON.parse(text);
        mdText = '```json\n' + JSON.stringify(parsed, null, 2) + '\n```';
      } catch {}
    } else if (item.name.endsWith('.html')) {
      mdText = text
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '');
    }
    return new Blob([mdText], { type: 'text/markdown;charset=utf-8' });
  }

  if (targetFormat === 'html') {
    onProgress?.(100);
    const htmlContent = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 2.5rem; max-width: 840px; margin: 0 auto; color: #0f172a; background: #f8fafc; }
    h1, h2, h3 { color: #0284c7; }
    pre { background: #0f172a; color: #e2e8f0; padding: 1.25rem; border-radius: 1rem; overflow-x: auto; font-family: monospace; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #cbd5e1; padding: 0.6rem 0.8rem; text-align: left; }
    th { background: #e2e8f0; font-weight: bold; }
  </style>
</head>
<body>
  <h2>${item.name}</h2>
  ${item.name.endsWith('.html') ? text : `<pre><code>${escapeHtml(text)}</code></pre>`}
</body>
</html>`;
    return new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  }

  if (targetFormat === 'json') {
    onProgress?.(100);
    try {
      if (item.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        return new Blob([JSON.stringify(parsed, null, 2)], { type: 'application/json' });
      }
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length > 0 && lines[0].includes(',')) {
        const headers = lines[0].split(',').map((h) => h.trim());
        const data = lines.slice(1).map((line) => {
          const values = line.split(',');
          const obj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            obj[h] = values[idx]?.trim() || '';
          });
          return obj;
        });
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      }
      const dataObj = { filename: item.name, content: text, lines: lines };
      return new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    } catch {
      return new Blob([JSON.stringify({ text }, null, 2)], { type: 'application/json' });
    }
  }

  if (targetFormat === 'csv') {
    onProgress?.(100);
    try {
      if (item.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
          const keys = Object.keys(parsed[0]);
          const csvLines = [
            keys.join(','),
            ...parsed.map((row) => keys.map((k) => JSON.stringify(row[k] ?? '')).join(',')),
          ];
          return new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
        }
      }
    } catch {}
    const csvContent = text.split(/\r?\n/).map((line) => `"${line.replace(/"/g, '""')}"`).join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  }

  if (targetFormat === 'pdf') {
    onProgress?.(70);
    const pdf = new jsPDF();
    pdf.setFontSize(14);
    pdf.text(item.name, 10, 15);
    pdf.setFontSize(10);

    const splitLines = pdf.splitTextToSize(text, 180);
    let y = 25;
    for (let i = 0; i < splitLines.length; i++) {
      if (y > 280) {
        pdf.addPage();
        y = 15;
      }
      pdf.text(splitLines[i], 10, y);
      y += 5;
    }

    onProgress?.(100);
    const pdfBuffer = pdf.output('arraybuffer');
    return new Blob([pdfBuffer], { type: 'application/pdf' });
  }

  return new Blob([text], { type: 'text/plain;charset=utf-8' });
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
  Video Conversion Engine
 */
export async function convertVideoFile(
  item: FileItem,
  targetFormat: TargetFormat,
  onProgress?: (p: number) => void
): Promise<Blob> {
  if (targetFormat === 'mp4_audio' || targetFormat === 'wav' || targetFormat === 'mp3') {
    return convertAudioFile(item, 'wav', onProgress);
  }

  if (targetFormat === 'frames_zip') {
    onProgress?.(20);
    const videoUrl = URL.createObjectURL(item.file);
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;

    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve(true);
      video.onerror = () => reject(new Error('Помилка завантаження відеофайлу'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');

    const zip = new JSZip();
    const duration = video.duration || 5;
    const interval = Math.max(0.5, duration / 10);

    let currentTime = 0;
    let frameIdx = 1;

    while (currentTime < duration && frameIdx <= 15) {
      video.currentTime = currentTime;
      await new Promise((r) => { video.onseeked = r; });
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frameBlob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
      if (frameBlob) {
        zip.file(`frame_${String(frameIdx).padStart(3, '0')}.png`, frameBlob);
      }

      currentTime += interval;
      frameIdx++;
      onProgress?.(20 + Math.round((currentTime / duration) * 70));
    }

    URL.revokeObjectURL(videoUrl);
    onProgress?.(95);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.(100);
    return zipBlob;
  }

  // WebM fallback
  onProgress?.(100);
  return item.file;
}

/**
  Main image conversion logic
 */
export async function convertSingleImage(
  item: FileItem,
  globalSettings: ConversionSettings,
  onProgress?: (progress: number) => void
): Promise<{
  outputBlob: Blob;
  outputSize: number;
  outputDimensions: { width: number; height: number };
  outputFormat: TargetFormat;
}> {
  const settings: ConversionSettings = {
    ...globalSettings,
    ...(item.customSettings || {}),
  };

  onProgress?.(10);

  let sourceBlob: Blob = item.file;
  const isHeic = isHeicFile(item.file);
  const isRaw = isRawFile(item.file);

  if (isHeic) {
    onProgress?.(25);
    sourceBlob = await decodeHeicToBlob(item.file);
    onProgress?.(50);
  } else if (isRaw) {
    onProgress?.(25);
    sourceBlob = await decodeRawToBlob(item.file);
    onProgress?.(50);
  } else {
    onProgress?.(40);
  }

  const targetFormatInfo = SUPPORTED_FORMATS.find(
    (f) => f.id === settings.targetFormat
  ) || SUPPORTED_FORMATS[0];

  if (settings.targetFormat === 'pdf') {
    onProgress?.(70);
    const pdfBlob = await convertToPdf(sourceBlob, item.name, settings);
    const pdfDimensions = item.dimensions || { width: 800, height: 600 };
    onProgress?.(100);
    return {
      outputBlob: pdfBlob,
      outputSize: pdfBlob.size,
      outputDimensions: pdfDimensions,
      outputFormat: 'pdf',
    };
  }

  const imgUrl = URL.createObjectURL(sourceBlob);
  try {
    const img = await loadImage(imgUrl);
    onProgress?.(75);

    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;
    const { width: targetWidth, height: targetHeight } = calculateDimensions(
      originalWidth,
      originalHeight,
      settings
    );

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context could not be created');
    }

    if (settings.targetFormat === 'jpeg' || settings.targetFormat === 'bmp') {
      ctx.fillStyle = settings.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (item.adjustments) {
      const {
        brightness = 100,
        contrast = 100,
        grayscale = 0,
        saturation = 100,
        sepia = 0,
        blur = 0,
      } = item.adjustments;

      const filters: string[] = [];
      if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
      if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
      if (grayscale > 0) filters.push(`grayscale(${grayscale}%)`);
      if (saturation !== 100) filters.push(`saturate(${saturation}%)`);
      if (sepia > 0) filters.push(`sepia(${sepia}%)`);
      if (blur > 0) filters.push(`blur(${blur}px)`);

      if (filters.length > 0) {
        ctx.filter = filters.join(' ');
      }
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    onProgress?.(90);

    if (settings.targetFormat === 'ico') {
      // Scale canvas to 64x64 for ICO favicon
      const icoCanvas = document.createElement('canvas');
      icoCanvas.width = 64;
      icoCanvas.height = 64;
      const icoCtx = icoCanvas.getContext('2d');
      icoCtx?.drawImage(canvas, 0, 0, 64, 64);
      const icoBlob = await canvasToBlob(icoCanvas, 'image/png');
      onProgress?.(100);
      return {
        outputBlob: icoBlob,
        outputSize: icoBlob.size,
        outputDimensions: { width: 64, height: 64 },
        outputFormat: 'ico',
      };
    }

    if (settings.targetFormat === 'svg') {
      const dataUrl = canvas.toDataURL('image/png');
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}"><image href="${dataUrl}" width="${targetWidth}" height="${targetHeight}"/></svg>`;
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
      onProgress?.(100);
      return {
        outputBlob: svgBlob,
        outputSize: svgBlob.size,
        outputDimensions: { width: targetWidth, height: targetHeight },
        outputFormat: 'svg',
      };
    }

    const quality = targetFormatInfo.supportsQuality ? settings.quality : undefined;
    let outputBlob = await canvasToBlob(canvas, targetFormatInfo.mimeType, quality);

    if (settings.preserveExif && settings.targetFormat === 'jpeg') {
      try {
        const sourceBuffer = await (item.file || sourceBlob).arrayBuffer();
        const exifChunk = extractExifChunk(sourceBuffer);
        if (exifChunk) {
          outputBlob = await injectExifToJpeg(outputBlob, exifChunk);
        }
      } catch (exifErr) {
        console.warn('Notice: EXIF metadata copying skipped:', exifErr);
      }
    }

    onProgress?.(100);

    return {
      outputBlob,
      outputSize: outputBlob.size,
      outputDimensions: { width: targetWidth, height: targetHeight },
      outputFormat: settings.targetFormat,
    };
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

/**
  Master item conversion router
 */
export async function convertFileItem(
  item: FileItem,
  globalSettings: ConversionSettings,
  onProgress?: (progress: number) => void
): Promise<{
  outputBlob: Blob;
  outputSize: number;
  outputDimensions?: { width: number; height: number };
  outputFormat: TargetFormat;
}> {
  const category = item.category || detectFileCategory(item.file);

  if (category === 'document') {
    const targetFormat = item.customSettings?.targetFormat || globalSettings.documentTargetFormat || 'pdf';
    const outputBlob = await convertDocumentFile(item, targetFormat, onProgress);
    return {
      outputBlob,
      outputSize: outputBlob.size,
      outputFormat: targetFormat,
    };
  }

  if (category === 'audio') {
    const targetFormat = item.customSettings?.targetFormat || globalSettings.audioTargetFormat || 'wav';
    const outputBlob = await convertAudioFile(item, targetFormat, onProgress);
    return {
      outputBlob,
      outputSize: outputBlob.size,
      outputFormat: targetFormat,
    };
  }

  if (category === 'video') {
    const targetFormat = item.customSettings?.targetFormat || globalSettings.videoTargetFormat || 'mp4_audio';
    const outputBlob = await convertVideoFile(item, targetFormat, onProgress);
    return {
      outputBlob,
      outputSize: outputBlob.size,
      outputFormat: targetFormat,
    };
  }

  return convertSingleImage(item, globalSettings, onProgress);
}

/**
  Convert Image Blob to PDF Document using jsPDF
 */
async function convertToPdf(
  imgBlob: Blob,
  filename: string,
  settings: ConversionSettings
): Promise<Blob> {
  const imgUrl = URL.createObjectURL(imgBlob);
  try {
    const img = await loadImage(imgUrl);
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    const orientation = width > height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: [width, height],
    });

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    }

    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height);

    const pdfArrayBuffer = pdf.output('arraybuffer');
    return new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

/**
  Calculate new width and height based on resize settings
 */
function calculateDimensions(
  origW: number,
  origH: number,
  settings: ConversionSettings
): { width: number; height: number } {
  let scale = 1.0;

  if (settings.resizeMode === '75') {
    scale = 0.75;
  } else if (settings.resizeMode === '50') {
    scale = 0.5;
  } else if (settings.resizeMode === 'custom') {
    const maxW = settings.customMaxWidth || origW;
    const maxH = settings.customMaxHeight || origH;
    const scaleW = maxW / origW;
    const scaleH = maxH / origH;
    scale = Math.min(1.0, scaleW, scaleH);
  }

  const width = Math.max(1, Math.round(origW * scale));
  const height = Math.max(1, Math.round(origH * scale));

  return { width, height };
}

/**
  Helper: Load HTMLImageElement from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Не вдалося завантажити зображення'));
    img.src = url;
  });
}

/**
  Helper: Canvas to Blob Promise wrapper
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Помилка генерації файлу з Canvas'));
        }
      },
      mimeType,
      quality
    );
  });
}

function extractExifChunk(buffer: ArrayBuffer): Uint8Array | null {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return null;
  }

  let offset = 2;
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset);
    if (marker === 0xffe1) {
      const length = view.getUint16(offset + 2);
      if (
        offset + 9 < view.byteLength &&
        view.getUint8(offset + 4) === 0x45 &&
        view.getUint8(offset + 5) === 0x78 &&
        view.getUint8(offset + 6) === 0x69 &&
        view.getUint8(offset + 7) === 0x66
      ) {
        return new Uint8Array(buffer, offset, length + 2);
      }
    }
    if ((marker & 0xff00) !== 0xff00) break;
    const length = view.getUint16(offset + 2);
    offset += 2 + length;
  }
  return null;
}

async function injectExifToJpeg(jpegBlob: Blob, exifChunk: Uint8Array): Promise<Blob> {
  const jpegBuffer = await jpegBlob.arrayBuffer();
  const view = new DataView(jpegBuffer);

  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return jpegBlob;
  }

  const prefix = new Uint8Array(jpegBuffer, 0, 2);
  const suffix = new Uint8Array(jpegBuffer, 2);

  const combined = new Uint8Array(prefix.length + exifChunk.length + suffix.length);
  combined.set(prefix, 0);
  combined.set(exifChunk, prefix.length);
  combined.set(suffix, prefix.length + exifChunk.length);

  return new Blob([combined], { type: 'image/jpeg' });
}

/**
  Download all converted items as a ZIP archive
 */
export async function downloadAllAsZip(
  items: FileItem[],
  zipFilename = 'converted_files.zip'
): Promise<void> {
  const completedItems = items.filter(
    (item) => item.status === 'completed' && item.outputBlob
  );

  if (completedItems.length === 0) return;

  const zip = new JSZip();

  completedItems.forEach((item) => {
    const formatInfo = SUPPORTED_FORMATS.find(
      (f) => f.id === (item.outputFormat || 'jpeg')
    );
    const ext = formatInfo ? formatInfo.ext : 'jpg';

    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const fileName = `${nameWithoutExt}.${ext}`;

    let finalFileName = fileName;
    let counter = 1;
    while (zip.file(finalFileName)) {
      finalFileName = `${nameWithoutExt}_(${counter}).${ext}`;
      counter++;
    }

    if (item.outputBlob) {
      zip.file(finalFileName, item.outputBlob);
    }
  });

  const zipContent = await zip.generateAsync({ type: 'blob' });
  saveBlobAsFile(zipContent, zipFilename);
}

/**
  Trigger browser download for a Blob
 */
export function saveBlobAsFile(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
  Format human readable file size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

