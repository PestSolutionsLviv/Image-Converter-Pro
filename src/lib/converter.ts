import heic2any from 'heic2any';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { ConversionSettings, FileItem, FormatOption, TargetFormat } from '../types';

export const SUPPORTED_FORMATS: FormatOption[] = [
  {
    id: 'jpeg',
    label: 'JPG / JPEG',
    mimeType: 'image/jpeg',
    ext: 'jpg',
    description: 'Універсальний фото-формат, висока сумісність',
    supportsQuality: true,
  },
  {
    id: 'png',
    label: 'PNG',
    mimeType: 'image/png',
    ext: 'png',
    description: 'Без втрати якості, підтримує прозорість',
    supportsQuality: false,
  },
  {
    id: 'webp',
    label: 'WebP',
    mimeType: 'image/webp',
    ext: 'webp',
    description: 'Сучасний веб-формат з високим стисненням',
    supportsQuality: true,
  },
  {
    id: 'pdf',
    label: 'PDF Document',
    mimeType: 'application/pdf',
    ext: 'pdf',
    description: 'Документ PDF для друку та збереження',
    supportsQuality: false,
  },
  {
    id: 'bmp',
    label: 'BMP',
    mimeType: 'image/bmp',
    ext: 'bmp',
    description: 'Растровий формат без стиснення',
    supportsQuality: false,
  },
  {
    id: 'gif',
    label: 'GIF',
    mimeType: 'image/gif',
    ext: 'gif',
    description: 'Стандартний графічний формат',
    supportsQuality: false,
  },
];

/**
  Checks if file is HEIC or HEIF format
 */
export function isHeicFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const mime = file.type.toLowerCase();

  // If the browser already identified the file as a standard image, it's not a raw HEIC blob needing heic2any
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
  // If the browser already identifies this as standard image format, return file directly
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

    // If heic2any indicates image is already browser readable or ERR_USER error
    if (
      errStr.toLowerCase().includes('already browser readable') ||
      errStr.includes('ERR_USER')
    ) {
      return file;
    }

    // Try loading native image via browser
    try {
      const tempUrl = URL.createObjectURL(file);
      await loadImage(tempUrl);
      URL.revokeObjectURL(tempUrl);
      return file;
    } catch {
      // Native load failed as well
    }

    throw new Error(
      error?.message || 'Не вдалося декодувати HEIC файл. Перевірте цілісність файлу.'
    );
  }
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
  let isHeic = isHeicFile(item.file);

  // If HEIC, decode to standard blob first
  if (isHeic) {
    onProgress?.(25);
    sourceBlob = await decodeHeicToBlob(item.file);
    onProgress?.(50);
  } else {
    onProgress?.(40);
  }

  const targetFormatInfo = SUPPORTED_FORMATS.find(
    (f) => f.id === settings.targetFormat
  ) || SUPPORTED_FORMATS[0];

  // If output format is PDF
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

  // Convert via HTML Canvas
  const imgUrl = URL.createObjectURL(sourceBlob);
  try {
    const img = await loadImage(imgUrl);
    onProgress?.(75);

    // Calculate dimensions
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

    // Handle background for formats without alpha channel (JPG, BMP)
    if (settings.targetFormat === 'jpeg' || settings.targetFormat === 'bmp') {
      ctx.fillStyle = settings.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Apply image adjustments (filters) if configured
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

    const quality = targetFormatInfo.supportsQuality ? settings.quality : undefined;
    let outputBlob = await canvasToBlob(canvas, targetFormatInfo.mimeType, quality);

    // Preserve EXIF metadata if enabled and output is JPEG
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

    // Create a temporary canvas to get a clean JPEG or PNG data URL for PDF insertion
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
    img.onerror = (e) => reject(new Error('Не вдалося завантажити зображення'));
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

/**
 * Extract EXIF APP1 segment from JPEG ArrayBuffer if present
 */
function extractExifChunk(buffer: ArrayBuffer): Uint8Array | null {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return null;
  }

  let offset = 2;
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset);
    if (marker === 0xffe1) {
      // APP1 Marker
      const length = view.getUint16(offset + 2);
      if (
        offset + 9 < view.byteLength &&
        view.getUint8(offset + 4) === 0x45 && // 'E'
        view.getUint8(offset + 5) === 0x78 && // 'x'
        view.getUint8(offset + 6) === 0x69 && // 'i'
        view.getUint8(offset + 7) === 0x66    // 'f'
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

/**
 * Inject EXIF APP1 segment into canvas-generated JPEG blob
 */
async function injectExifToJpeg(jpegBlob: Blob, exifChunk: Uint8Array): Promise<Blob> {
  const jpegBuffer = await jpegBlob.arrayBuffer();
  const view = new DataView(jpegBuffer);

  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return jpegBlob;
  }

  const prefix = new Uint8Array(jpegBuffer, 0, 2); // SOI 0xFFD8
  const suffix = new Uint8Array(jpegBuffer, 2);

  const combined = new Uint8Array(prefix.length + exifChunk.length + suffix.length);
  combined.set(prefix, 0);
  combined.set(exifChunk, prefix.length);
  combined.set(suffix, prefix.length + exifChunk.length);

  return new Blob([combined], { type: 'image/jpeg' });
}

/**
  Download all converted images as a single ZIP archive
 */
export async function downloadAllAsZip(
  items: FileItem[],
  zipFilename = 'converted_photos.zip'
): Promise<void> {
  const completedItems = items.filter(
    (item) => item.status === 'completed' && item.outputBlob
  );

  if (completedItems.length === 0) return;

  const zip = new JSZip();

  completedItems.forEach((item, idx) => {
    const formatInfo = SUPPORTED_FORMATS.find(
      (f) => f.id === (item.outputFormat || 'jpeg')
    );
    const ext = formatInfo ? formatInfo.ext : 'jpg';

    // Strip original extension and add target extension
    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const fileName = `${nameWithoutExt}.${ext}`;

    // Handle duplicates in zip
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
  Format human readable file size (e.g. 2.4 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
