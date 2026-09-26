import { MediaAsset } from './media';

export type TrackType = 'video' | 'overlay' | 'text' | 'subtitle' | 'audio';
export type ClipType = 'video' | 'image' | 'audio' | 'text' | 'subtitle' | 'overlay';

export type SidebarTab =
  | 'media'
  | 'audio'
  | 'text'
  | 'subtitle'
  | 'transitions'
  | 'effects'
  | 'filters'
  | 'templates';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '4:3';
export type PreviewQuality = 'Full' | '1/2' | '1/4';

export interface ClipTransform {
  position?: { x: number; y: number };
  x: number;
  y: number;
  scale: number; // percentage, e.g. 100
  rotation: number; // degrees, e.g. 0
  opacity: number; // percentage, e.g. 100
}

export interface ClipAudio {
  volume: number; // percentage, e.g. 100
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  muted: boolean;
}

export interface Clip {
  id: string;
  assetId: string;
  trackId: string;
  type: ClipType;
  name: string;
  startTime: number; // in floating-point seconds
  duration: number; // in floating-point seconds
  trimStart: number; // in floating-point seconds
  trimEnd: number; // in floating-point seconds
  sourceDuration: number; // in floating-point seconds (Infinity for images)
  volume: number; // 0-100 or 0-200%
  muted: boolean;
  locked: boolean;
  transform: ClipTransform;
  audio?: ClipAudio;
  color?: string;
  thumbnailPlaceholder?: string;
}

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  locked: boolean;
  muted: boolean;
  visible: boolean;
  volume: number; // 0-200%, default 100
  height: number; // 40px to 200px, default 70px
}

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number; // calculated from content (minimum default 30s)
  aspectRatio: AspectRatio;
}

export interface HistorySnapshot {
  description?: string;
  projectName: string;
  clips: Clip[];
  tracks: Track[];
  selectedClipId: string | null;
}

export interface EditorState {
  project: Project;
  tracks: Track[];
  clips: Clip[];
  currentTime: number; // in floating-point seconds
  isPlaying: boolean;
  selectedClipId: string | null;
  activePanel: SidebarTab;
  zoom: number; // 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0
  snapEnabled: boolean;
  saveStatus: 'Saved' | 'Saving...';
  previewQuality: PreviewQuality;
  volume: number; // 0-100
  isMuted: boolean;
  canUndo: boolean;
  canRedo: boolean;
  assets: MediaAsset[];
  selectedAssetId: string | null;
  clipboardClip: Clip | null;
  activeSnapGuide: number | null; // pixel position for visual snap line
}
