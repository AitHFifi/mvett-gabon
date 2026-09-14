import imageCompression from 'browser-image-compression';

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  ratioPercent: number;
  skipped: boolean;
  previewUrl: string;
}

export interface CompressorOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  initialQuality?: number;
  fileType?: string;
  useWebWorker?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Formate une taille en octets en chaîne lisible (Ko, Mo)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes <= 0) return '0 o';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['o', 'Ko', 'Mo', 'Go'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Compresse une photographie de manière transparente et haute fidélité :
 * - Web Worker en arrière-plan (ne fige pas les animations WebGL)
 * - Sortie WebP haute définition (jusqu'à 2560px, qualité 88-90%)
 * - Maintient les détails fins et les métadonnées de cadrage
 * - Fournit les métriques de gain de poids (avant / après)
 */
export async function compressImage(
  file: File,
  options?: CompressorOptions
): Promise<CompressionResult> {
  const originalSize = file.size;

  // Seuil intelligent : si l'image est déjà ultra-légère (< 1.2 Mo) et déjà en format WebP
  if (file.type === 'image/webp' && originalSize < 1.2 * 1024 * 1024) {
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      ratioPercent: 0,
      skipped: true,
      previewUrl,
    };
  }

  const compressionOptions = {
    maxSizeMB: options?.maxSizeMB ?? 1.5,
    maxWidthOrHeight: options?.maxWidthOrHeight ?? 2560,
    useWebWorker: options?.useWebWorker ?? true,
    fileType: options?.fileType ?? 'image/webp',
    initialQuality: options?.initialQuality ?? 0.88,
    onProgress: options?.onProgress,
  };

  try {
    const compressedBlob = await imageCompression(file, compressionOptions);

    // Nom de fichier propre avec extension .webp
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}.webp`;
    const compressedFile = new File([compressedBlob], newFileName, {
      type: compressionOptions.fileType,
      lastModified: Date.now(),
    });

    const compressedSize = compressedFile.size;
    const savedBytes = Math.max(0, originalSize - compressedSize);
    const ratioPercent = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;
    const previewUrl = URL.createObjectURL(compressedFile);

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      savedBytes,
      ratioPercent,
      skipped: false,
      previewUrl,
    };
  } catch (err) {
    console.warn('Repli gracieux : compression non réalisable sur ce média, utilisation de l\'original.', err);
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      ratioPercent: 0,
      skipped: true,
      previewUrl,
    };
  }
}
