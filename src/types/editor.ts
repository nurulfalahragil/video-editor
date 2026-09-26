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
  position: { x: number; y: number };
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
  assetId?: string; // Reference to MediaAsset
  trackId: string;
  type: ClipType;
  name: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  trimStart?: number;
  trimEnd?: number;
  color: string;
  transform: ClipTransform;
  audio?: ClipAudio;
  thumbnailPlaceholder?: string;
}

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  locked: boolean;
  muted: boolean;
  visible: boolean;
  height?: number;
}

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number; // in seconds
  aspectRatio: AspectRatio;
}

export interface HistorySnapshot {
  projectName: string;
  clips: Clip[];
  selectedClipId: string | null;
}

export interface EditorState {
  project: Project;
  tracks: Track[];
  clips: Clip[];
  currentTime: number; // in seconds
  isPlaying: boolean;
  selectedClipId: string | null;
  activePanel: SidebarTab;
  zoom: number; // 0.5, 0.75, 1.0, 1.5, 2.0
  saveStatus: 'Saved' | 'Saving...';
  previewQuality: PreviewQuality;
  volume: number; // 0-100
  isMuted: boolean;
  canUndo: boolean;
  canRedo: boolean;
  // Phase 2 Media State
  assets: MediaAsset[];
  selectedAssetId: string | null;
}
