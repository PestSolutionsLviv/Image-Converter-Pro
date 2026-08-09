export type TargetFormat = 'jpeg' | 'png' | 'webp' | 'pdf' | 'bmp' | 'gif';

export type ResizeMode = 'original' | '75' | '50' | 'custom';

export interface ConversionSettings {
  targetFormat: TargetFormat;
  quality: number; // 0.1 to 1.0
  resizeMode: ResizeMode;
  customMaxWidth?: number;
  customMaxHeight?: number;
  backgroundColor: string; // '#ffffff' for JPG conversion when source is transparent
  preserveAspectRatio: boolean;
  preserveExif: boolean; // Preserve EXIF metadata (orientation, date, camera info)
}

export type FileStatus = 'idle' | 'heic_decoding' | 'converting' | 'completed' | 'error';

export interface FileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalFormat: string;
  dimensions?: { width: number; height: number };
  previewUrl?: string; // Preview URL of source or decoded HEIC
  status: FileStatus;
  progress: number; // 0 to 100
  errorMessage?: string;
  
  // Output result
  outputBlob?: Blob;
  outputUrl?: string;
  outputSize?: number;
  outputDimensions?: { width: number; height: number };
  outputFormat?: TargetFormat;
  
  // Custom settings override per file
  customSettings?: Partial<ConversionSettings>;
}

export interface FormatOption {
  id: TargetFormat;
  label: string;
  mimeType: string;
  ext: string;
  description: string;
  supportsQuality: boolean;
}
