import { MediaType, MediaAsset } from '../types/media';

export const SUPPORTED_VIDEO_EXTS = ['.mp4', '.webm', '.mov'];
export const SUPPORTED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
export const SUPPORTED_AUDIO_EXTS = ['.mp3', '.wav', '.m4a', '.aac'];

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function validateMediaFile(file: File): {
  valid: boolean;
  type?: MediaType;
  error?: string;
} {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();

  // Check Video
  if (
    mime.startsWith('video/') ||
    SUPPORTED_VIDEO_EXTS.some((ext) => name.endsWith(ext))
  ) {
    if (
      SUPPORTED_VIDEO_EXTS.some((ext) => name.endsWith(ext)) ||
      ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'].includes(mime)
    ) {
      return { valid: true, type: 'video' };
    }
  }

  // Check Image
  if (
    mime.startsWith('image/') ||
    SUPPORTED_IMAGE_EXTS.some((ext) => name.endsWith(ext))
  ) {
    if (
      SUPPORTED_IMAGE_EXTS.some((ext) => name.endsWith(ext)) ||
      ['image/jpeg', 'image/png', 'image/webp'].includes(mime)
    ) {
      return { valid: true, type: 'image' };
    }
  }

  // Check Audio
  if (
    mime.startsWith('audio/') ||
    SUPPORTED_AUDIO_EXTS.some((ext) => name.endsWith(ext))
  ) {
    if (
      SUPPORTED_AUDIO_EXTS.some((ext) => name.endsWith(ext)) ||
      [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-wav',
        'audio/m4a',
        'audio/x-m4a',
        'audio/aac',
        'audio/mp4',
      ].includes(mime)
    ) {
      return { valid: true, type: 'audio' };
    }
  }

  return {
    valid: false,
    error:
      'Unsupported file type. Please upload MP4, WebM, MOV, JPG, PNG, WEBP, MP3, WAV, or M4A.',
  };
}

/**
 * Extracts metadata (duration, width, height) and generates a thumbnail if video/image
 */
export async function processMediaFile(file: File): Promise<Omit<MediaAsset, 'id' | 'createdAt'>> {
  const validation = validateMediaFile(file);
  if (!validation.valid || !validation.type) {
    throw new Error(validation.error || 'Unsupported file');
  }

  const type = validation.type;
  const objectUrl = URL.createObjectURL(file);

  try {
    if (type === 'video') {
      return await processVideoFile(file, objectUrl);
    } else if (type === 'image') {
      return await processImageFile(file, objectUrl);
    } else {
      return await processAudioFile(file, objectUrl);
    }
  } catch (err) {
    console.error('Failed to process media file:', err);
    // If extraction fails, provide graceful fallback without crashing
    return {
      name: file.name,
      type,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      url: objectUrl,
      duration: type === 'audio' ? 10 : 8,
      width: type !== 'audio' ? 1920 : undefined,
      height: type !== 'audio' ? 1080 : undefined,
    };
  }
}

function processVideoFile(
  file: File,
  url: string,
): Promise<Omit<MediaAsset, 'id' | 'createdAt'>> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    // Timeout safety
    const timer = setTimeout(() => {
      resolve({
        name: file.name,
        type: 'video',
        mimeType: file.type || 'video/mp4',
        size: file.size,
        url,
        duration: 8,
        width: 1920,
        height: 1080,
      });
    }, 4000);

    video.onloadedmetadata = () => {
      const duration = video.duration || 8;
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;

      // Seek to suitable frame for thumbnail (at 0.5s or 10% of duration)
      video.currentTime = Math.min(1.0, duration * 0.1 || 0.1);
    };

    video.onseeked = () => {
      clearTimeout(timer);
      let thumbnailUrl: string | undefined;

      try {
        const canvas = document.createElement('canvas');
        const aspect = (video.videoHeight || 9) / (video.videoWidth || 16);
        const targetWidth = 320;
        const targetHeight = Math.round(targetWidth * aspect);

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        }
      } catch (canvasErr) {
        console.warn('Canvas thumbnail generation skipped:', canvasErr);
      }

      resolve({
        name: file.name,
        type: 'video',
        mimeType: file.type || 'video/mp4',
        size: file.size,
        duration: video.duration || 8,
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080,
        url,
        thumbnailUrl,
      });
    };

    video.onerror = () => {
      clearTimeout(timer);
      resolve({
        name: file.name,
        type: 'video',
        mimeType: file.type || 'video/mp4',
        size: file.size,
        url,
        duration: 8,
        width: 1920,
        height: 1080,
      });
    };
  });
}

function processImageFile(
  file: File,
  url: string,
): Promise<Omit<MediaAsset, 'id' | 'createdAt'>> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;

    const timer = setTimeout(() => {
      resolve({
        name: file.name,
        type: 'image',
        mimeType: file.type || 'image/jpeg',
        size: file.size,
        url,
        thumbnailUrl: url,
        width: 1920,
        height: 1080,
      });
    }, 3000);

    img.onload = () => {
      clearTimeout(timer);
      resolve({
        name: file.name,
        type: 'image',
        mimeType: file.type || 'image/jpeg',
        size: file.size,
        url,
        thumbnailUrl: url,
        width: img.naturalWidth || 1920,
        height: img.naturalHeight || 1080,
      });
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve({
        name: file.name,
        type: 'image',
        mimeType: file.type || 'image/jpeg',
        size: file.size,
        url,
        thumbnailUrl: url,
        width: 1920,
        height: 1080,
      });
    };
  });
}

function processAudioFile(
  file: File,
  url: string,
): Promise<Omit<MediaAsset, 'id' | 'createdAt'>> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = url;

    const timer = setTimeout(() => {
      resolve({
        name: file.name,
        type: 'audio',
        mimeType: file.type || 'audio/mpeg',
        size: file.size,
        url,
        duration: 30,
      });
    }, 3000);

    audio.onloadedmetadata = () => {
      clearTimeout(timer);
      resolve({
        name: file.name,
        type: 'audio',
        mimeType: file.type || 'audio/mpeg',
        size: file.size,
        url,
        duration: audio.duration || 30,
      });
    };

    audio.onerror = () => {
      clearTimeout(timer);
      resolve({
        name: file.name,
        type: 'audio',
        mimeType: file.type || 'audio/mpeg',
        size: file.size,
        url,
        duration: 30,
      });
    };
  });
}
