import React, { useRef, useState } from 'react';
import { Clip } from '../../types/editor';
import { useEditorStore } from '../../store/editorStore';
import {
  Film,
  Image as ImageIcon,
  Music,
  Type,
  VolumeX,
  Lock,
} from 'lucide-react';
import {
  formatTime,
  snapTime,
  MIN_CLIP_DURATION,
  DEFAULT_SNAP_THRESHOLD,
} from '../../utils/timelineMath';

interface TimelineClipProps {
  clip: Clip;
  pixelsPerSecond: number;
}

export const TimelineClip: React.FC<TimelineClipProps> = ({
  clip,
  pixelsPerSecond,
}) => {
  const {
    selectedClipId,
    setSelectedClipId,
    getAssetById,
    moveClip,
    trimClipLeft,
    trimClipRight,
    pushSnapshot,
    snapEnabled,
    snapTargets,
    setActiveSnapGuide,
    tracks,
  } = useEditorStore();

  const track = tracks.find((t) => t.id === clip.trackId);
  const isTrackLocked = track?.locked || clip.locked;
  const isSelected = selectedClipId === clip.id;

  // Local drag state for high-performance zero-lag pointer interaction
  const [localStart, setLocalStart] = useState<number | null>(null);
  const [localDuration, setLocalDuration] = useState<number | null>(null);

  const displayStart = localStart !== null ? localStart : clip.startTime;
  const displayDuration = localDuration !== null ? localDuration : clip.duration;

  const left = displayStart * pixelsPerSecond;
  const width = Math.max(8, displayDuration * pixelsPerSecond);

  const asset = clip.assetId ? getAssetById(clip.assetId) : undefined;
  const thumbnailUrl = clip.thumbnailPlaceholder || asset?.thumbnailUrl || asset?.url;

  // Select clip
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClipId(clip.id);
  };

  // --- 1. MOVE CLIP VIA POINTER EVENTS ---
  const handleBodyPointerDown = (e: React.PointerEvent) => {
    if (isTrackLocked) return;
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();
    setSelectedClipId(clip.id);

    const startX = e.clientX;
    const initialStart = clip.startTime;
    let currentNewStart = initialStart;

    // Build snap targets excluding this clip's own start/end
    const filteredSnapTargets = snapTargets.filter(
      (t) => Math.abs(t - initialStart) > 0.01 && Math.abs(t - (initialStart + clip.duration)) > 0.01,
    );

    const handlePointerMove = (moveEvt: PointerEvent) => {
      const deltaPx = moveEvt.clientX - startX;
      const deltaSec = deltaPx / pixelsPerSecond;
      let rawStart = Math.max(0, initialStart + deltaSec);

      // Snap logic: test snapping both clip start and clip end
      let finalStart = rawStart;
      let guideTarget: number | null = null;

      if (snapEnabled) {
        // Snap start edge
        const snapStartRes = snapTime(rawStart, filteredSnapTargets, DEFAULT_SNAP_THRESHOLD, true);
        if (snapStartRes.target !== null) {
          finalStart = snapStartRes.snappedTime;
          guideTarget = snapStartRes.target;
        } else {
          // Snap end edge: rawStart + duration -> target
          const rawEnd = rawStart + clip.duration;
          const snapEndRes = snapTime(rawEnd, filteredSnapTargets, DEFAULT_SNAP_THRESHOLD, true);
          if (snapEndRes.target !== null) {
            finalStart = Math.max(0, snapEndRes.snappedTime - clip.duration);
            guideTarget = snapEndRes.target;
          }
        }
      }

      currentNewStart = Number(finalStart.toFixed(3));
      setLocalStart(currentNewStart);
      setActiveSnapGuide(guideTarget);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setActiveSnapGuide(null);

      if (currentNewStart !== initialStart) {
        moveClip(clip.id, currentNewStart);
        pushSnapshot('Move Clip');
      }
      setLocalStart(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // --- 2. LEFT TRIM VIA POINTER EVENTS ---
  const handleLeftTrimPointerDown = (e: React.PointerEvent) => {
    if (isTrackLocked) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedClipId(clip.id);

    const startX = e.clientX;
    const initialStart = clip.startTime;
    const initialTrimStart = clip.trimStart;
    const initialDuration = clip.duration;

    let finalStart = initialStart;
    let finalTrimStart = initialTrimStart;
    let finalDuration = initialDuration;

    const filteredSnapTargets = snapTargets.filter((t) => Math.abs(t - initialStart) > 0.01);

    const handlePointerMove = (moveEvt: PointerEvent) => {
      const deltaPx = moveEvt.clientX - startX;
      let deltaSec = deltaPx / pixelsPerSecond;

      // Calculate candidate new start time
      let rawStart = initialStart + deltaSec;

      // Snapping candidate
      if (snapEnabled) {
        const snapRes = snapTime(rawStart, filteredSnapTargets, DEFAULT_SNAP_THRESHOLD, true);
        if (snapRes.target !== null) {
          rawStart = snapRes.snappedTime;
          setActiveSnapGuide(snapRes.target);
        } else {
          setActiveSnapGuide(null);
        }
      }

      deltaSec = rawStart - initialStart;

      // Enforce limits:
      // 1. trimStart + deltaSec >= 0
      // 2. duration - deltaSec >= MIN_CLIP_DURATION
      // 3. rawStart >= 0
      const minDelta = -initialTrimStart;
      const maxDelta = initialDuration - MIN_CLIP_DURATION;
      const clampedDelta = Math.max(minDelta, Math.min(maxDelta, deltaSec));

      finalStart = Math.max(0, initialStart + clampedDelta);
      finalTrimStart = Math.max(0, initialTrimStart + clampedDelta);
      finalDuration = Math.max(MIN_CLIP_DURATION, initialDuration - clampedDelta);

      setLocalStart(finalStart);
      setLocalDuration(finalDuration);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setActiveSnapGuide(null);

      if (finalStart !== initialStart || finalDuration !== initialDuration) {
        trimClipLeft(clip.id, finalStart, finalTrimStart, finalDuration);
        pushSnapshot('Trim Left');
      }
      setLocalStart(null);
      setLocalDuration(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // --- 3. RIGHT TRIM VIA POINTER EVENTS ---
  const handleRightTrimPointerDown = (e: React.PointerEvent) => {
    if (isTrackLocked) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedClipId(clip.id);

    const startX = e.clientX;
    const initialDuration = clip.duration;
    const initialTrimEnd = clip.trimEnd;
    const sourceDuration = clip.sourceDuration;

    let finalDuration = initialDuration;
    let finalTrimEnd = initialTrimEnd;

    const currentEnd = clip.startTime + clip.duration;
    const filteredSnapTargets = snapTargets.filter((t) => Math.abs(t - currentEnd) > 0.01);

    const handlePointerMove = (moveEvt: PointerEvent) => {
      const deltaPx = moveEvt.clientX - startX;
      let deltaSec = deltaPx / pixelsPerSecond;

      let rawEnd = clip.startTime + initialDuration + deltaSec;

      if (snapEnabled) {
        const snapRes = snapTime(rawEnd, filteredSnapTargets, DEFAULT_SNAP_THRESHOLD, true);
        if (snapRes.target !== null) {
          rawEnd = snapRes.snappedTime;
          setActiveSnapGuide(snapRes.target);
        } else {
          setActiveSnapGuide(null);
        }
      }

      deltaSec = rawEnd - (clip.startTime + initialDuration);

      // Limits:
      // duration + deltaSec >= MIN_CLIP_DURATION
      // trimEnd + deltaSec <= sourceDuration
      let maxDuration = Infinity;
      if (sourceDuration !== Infinity) {
        const maxDeltaFromSource = sourceDuration - initialTrimEnd;
        maxDuration = initialDuration + maxDeltaFromSource;
      }

      const candidateDuration = Math.max(MIN_CLIP_DURATION, Math.min(maxDuration, initialDuration + deltaSec));
      const actualDelta = candidateDuration - initialDuration;

      finalDuration = Number(candidateDuration.toFixed(3));
      finalTrimEnd = Number((initialTrimEnd + actualDelta).toFixed(3));

      setLocalDuration(finalDuration);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setActiveSnapGuide(null);

      if (finalDuration !== initialDuration) {
        trimClipRight(clip.id, finalDuration, finalTrimEnd);
        pushSnapshot('Trim Right');
      }
      setLocalDuration(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const getClipTheme = () => {
    if (clip.type === 'video' || clip.type === 'overlay') {
      return {
        bg: isSelected
          ? 'bg-sky-600/95 border-2 border-white ring-2 ring-sky-500/60 shadow-xl'
          : 'bg-[#1e3a8a]/85 hover:bg-[#1e40af]/95 border border-sky-500/50 shadow-sm',
        badgeColor: 'text-sky-300',
        icon: Film,
      };
    }
    if (clip.type === 'image') {
      return {
        bg: isSelected
          ? 'bg-emerald-600/95 border-2 border-white ring-2 ring-emerald-500/60 shadow-xl'
          : 'bg-[#065f46]/85 hover:bg-[#047857]/95 border border-emerald-500/50 shadow-sm',
        badgeColor: 'text-emerald-300',
        icon: ImageIcon,
      };
    }
    if (clip.type === 'audio') {
      return {
        bg: isSelected
          ? 'bg-purple-600/95 border-2 border-white ring-2 ring-purple-500/60 shadow-xl'
          : 'bg-[#581c87]/85 hover:bg-[#6b21a8]/95 border border-purple-500/50 shadow-sm',
        badgeColor: 'text-purple-300',
        icon: Music,
      };
    }
    return {
      bg: isSelected
        ? 'bg-amber-600/95 border-2 border-white shadow-xl'
        : 'bg-[#78350f]/85 border border-amber-500/50 shadow-sm',
      badgeColor: 'text-amber-300',
      icon: Type,
    };
  };

  const theme = getClipTheme();
  const Icon = theme.icon;

  return (
    <div
      onClick={handleClick}
      onPointerDown={handleBodyPointerDown}
      style={{
        left: `${left}px`,
        width: `${width}px`,
      }}
      className={`absolute top-1 bottom-1 rounded overflow-hidden select-none transition-shadow flex flex-col justify-between group z-10 ${
        theme.bg
      } ${isTrackLocked ? 'cursor-not-allowed opacity-75' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Clip Header */}
      <div className="px-2 py-0.5 bg-black/40 flex items-center justify-between text-[11px] font-medium text-white truncate border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <Icon className={`w-3 h-3 ${theme.badgeColor} shrink-0`} />
          <span className="truncate">{clip.name}</span>
          {clip.muted && <VolumeX className="w-3 h-3 text-red-400 shrink-0 ml-1" />}
          {isTrackLocked && <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0 ml-1" />}
        </div>
        <span className="text-[10px] font-mono text-white/90 shrink-0 pl-1">
          {formatTime(displayDuration)}
        </span>
      </div>

      {/* Visual Content: Filmstrip frames or Audio Waveform */}
      <div className="flex-1 px-1.5 py-0.5 flex items-center gap-1.5 overflow-hidden relative pointer-events-none">
        {clip.type === 'audio' ? (
          <div className="flex items-center gap-0.5 w-full h-full opacity-60">
            {Array.from({ length: Math.max(8, Math.floor(width / 4)) }).map((_, i) => (
              <span
                key={i}
                style={{
                  height: `${Math.max(4, Math.sin(i * 0.4) * 14 + 10)}px`,
                }}
                className="w-0.5 bg-purple-200 rounded-full"
              />
            ))}
          </div>
        ) : thumbnailUrl ? (
          <div className="flex items-center gap-1 w-full h-full opacity-85">
            {Array.from({ length: Math.max(1, Math.floor(width / 60)) }).map((_, i) => (
              <div
                key={i}
                className="h-full w-14 rounded-xs overflow-hidden border border-white/10 shrink-0 bg-black/30"
              >
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[10px] text-white/50 font-mono italic">
            Media Clip
          </div>
        )}
      </div>

      {/* LEFT TRIM HANDLE (Section 17 & 18) */}
      {!isTrackLocked && (
        <div
          onPointerDown={handleLeftTrimPointerDown}
          className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize z-20 flex items-center justify-center group-hover:bg-black/30 transition-colors"
          title="Drag to trim start"
        >
          <div className="w-1 h-5 rounded-full bg-white/60 hover:bg-white shadow-xs transition-colors" />
        </div>
      )}

      {/* RIGHT TRIM HANDLE (Section 17 & 19) */}
      {!isTrackLocked && (
        <div
          onPointerDown={handleRightTrimPointerDown}
          className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize z-20 flex items-center justify-center group-hover:bg-black/30 transition-colors"
          title="Drag to trim end"
        >
          <div className="w-1 h-5 rounded-full bg-white/60 hover:bg-white shadow-xs transition-colors" />
        </div>
      )}
    </div>
  );
};
