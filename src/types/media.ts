export type MediaType = 'video' | 'image' | 'audio';

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  mimeType: string;
  size: number; // in bytes
  duration?: number; // in seconds (for video & audio)
  width?: number; // pixels (for video & image)
  height?: number; // pixels (for video & image)
  url: string; // Object URL or data URL
  thumbnailUrl?: string; // Extracted frame or image thumbnail
  createdAt: number; // timestamp
}

export type MediaSortOption =
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'type'
  | 'duration';

export type MediaViewMode = 'grid' | 'list';
