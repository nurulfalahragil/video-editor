import { Clip, Track, TrackType } from '../types/editor';

export const BASE_PIXELS_PER_SECOND = 50;
export const MIN_CLIP_DURATION = 0.05; // seconds
export const DEFAULT_SNAP_THRESHOLD = 0.15; // seconds

export function timeToPixels(time: number, pixelsPerSecond: number): number {
  return time * pixelsPerSecond;
}

export function pixelsToTime(pixels: number, pixelsPerSecond: number): number {
  if (pixelsPerSecond <= 0) return 0;
  return Math.max(0, pixels / pixelsPerSecond);
}

export function getClipEnd(clip: { startTime: number; duration: number }): number {
  return clip.startTime + clip.duration;
}

export function getActiveClips(clips: Clip[], currentTime: number): Clip[] {
  return clips.filter(
    (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration,
  );
}

export function getProjectDuration(clips: Clip[], minDuration = 30): number {
  if (!clips || clips.length === 0) return minDuration;
  let maxEnd = 0;
  for (const c of clips) {
    const end = c.startTime + c.duration;
    if (end > maxEnd) maxEnd = end;
  }
  // Add a small 5-second breathing room after last clip or minimum duration
  return Math.max(minDuration, Math.ceil(maxEnd + 2));
}

export function getSourceTimeForClip(clip: Clip, currentTime: number): number {
  const elapsedInClip = currentTime - clip.startTime;
  const sourceTime = clip.trimStart + elapsedInClip;
  return Math.max(0, sourceTime);
}

export function snapTime(
  time: number,
  snapTargets: number[],
  thresholdSeconds = DEFAULT_SNAP_THRESHOLD,
  enabled = true,
): { snappedTime: number; target: number | null } {
  if (!enabled || snapTargets.length === 0) {
    return { snappedTime: time, target: null };
  }

  let closestTarget: number | null = null;
  let minDiff = Infinity;

  for (const target of snapTargets) {
    const diff = Math.abs(time - target);
    if (diff <= thresholdSeconds && diff < minDiff) {
      minDiff = diff;
      closestTarget = target;
    }
  }

  if (closestTarget !== null) {
    return { snappedTime: closestTarget, target: closestTarget };
  }

  return { snappedTime: time, target: null };
}

export function canDropOnTrack(mediaType: string, trackType: TrackType): boolean {
  if (trackType === 'video' || trackType === 'overlay') {
    return mediaType === 'video' || mediaType === 'image';
  }
  if (trackType === 'audio') {
    return mediaType === 'audio';
  }
  return false;
}

export function canPlaceClip(clip: Clip, targetTrackId: string, tracks: Track[]): boolean {
  const targetTrack = tracks.find((t) => t.id === targetTrackId);
  if (!targetTrack || targetTrack.locked) return false;
  return canDropOnTrack(clip.type, targetTrack.type);
}

export function formatTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const hours = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = Math.floor(clamped % 60);
  const hundredths = Math.floor((clamped % 1) * 100);

  const ss = secs.toString().padStart(2, '0');
  const cs = hundredths.toString().padStart(2, '0');

  if (hours > 0) {
    const hh = hours.toString().padStart(2, '0');
    const mm = mins.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}.${cs}`;
  }

  const mm = mins.toString().padStart(2, '0');
  return `${mm}:${ss}.${cs}`;
}

export function parseTimeString(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const clean = timeStr.trim();

  // Format mm:ss.cs or hh:mm:ss.cs
  const parts = clean.split(':');
  if (parts.length === 1) {
    const parsed = parseFloat(parts[0]);
    return isNaN(parsed) ? null : Math.max(0, parsed);
  }
  if (parts.length === 2) {
    const mins = parseFloat(parts[0]);
    const secs = parseFloat(parts[1]);
    if (isNaN(mins) || isNaN(secs)) return null;
    return Math.max(0, mins * 60 + secs);
  }
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const mins = parseFloat(parts[1]);
    const secs = parseFloat(parts[2]);
    if (isNaN(hours) || isNaN(mins) || isNaN(secs)) return null;
    return Math.max(0, hours * 3600 + mins * 60 + secs);
  }
  return null;
}
