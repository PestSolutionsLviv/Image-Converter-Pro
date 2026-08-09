export type FileCategory = 'image' | 'document' | 'audio' | 'video';

export type TargetFormat = 
  // Image formats
  | 'jpeg' | 'png' | 'webp' | 'avif' | 'pdf' | 'bmp' | 'gif' | 'ico' | 'svg'
  // Text & Document formats
  | 'txt' | 'md' | 'html' | 'json' | 'csv'
  // Audio formats
  | 'wav' | 'mp3' | 'ogg' | 'm4a' | 'webm_audio'
  // Video formats
  | 'mp4_audio' | 'webm_video' | 'frames_zip';

export type ResizeMode = 'original' | '75' | '50' | 'custom';

export interface ConversionSettings {
  targetFormat: TargetFormat;
  documentTargetFormat?: TargetFormat;
  audioTargetFormat?: TargetFormat;
  videoTargetFormat?: TargetFormat;
  quality: number; // 0.1 to 1.0
  resizeMode: ResizeMode;
  customMaxWidth?: number;
  customMaxHeight?: number;
  backgroundColor: string; // '#ffffff' for JPG conversion when source is transparent
  preserveAspectRatio: boolean;
  preserveExif: boolean; // Preserve EXIF metadata (orientation, date, camera info)
  autoDownloadZip?: boolean; // Automatically trigger ZIP download when all files complete conversion
}

export type FileStatus = 'idle' | 'heic_decoding' | 'converting' | 'completed' | 'error';

export interface ImageAdjustments {
  brightness: number; // default 100
  contrast: number;   // default 100
  grayscale: number;  // default 0
  saturation: number; // default 100
  sepia: number;      // default 0
  blur: number;       // default 0
}

export interface FileItem {
  id: string;
  file: File;
  name: string;
  category: FileCategory;
  originalSize: number;
  originalFormat: string;
  dimensions?: { width: number; height: number };
  duration?: number; // Audio/Video duration in seconds
  previewUrl?: string; // Preview URL of source, decoded HEIC, or media
  textPreview?: string; // Short snippet for text documents
  status: FileStatus;
  progress: number; // 0 to 100
  errorMessage?: string;
  
  // Custom filter adjustments per file (for images)
  adjustments?: ImageAdjustments;

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
  category: FileCategory;
}

