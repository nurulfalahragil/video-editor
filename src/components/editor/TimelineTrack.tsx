import React, { useState, useRef } from 'react';
import { Track, Clip } from '../../types/editor';
import { MediaAsset } from '../../types/media';
import { useEditorStore } from '../../store/editorStore';
import { TimelineClip } from './TimelineClip';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Video,
  Layers,
  Type,
  Subtitles,
  Music,
} from 'lucide-react';
import { canDropOnTrack } from '../../utils/timelineMath';

interface TimelineTrackProps {
  track: Track;
  clips: Clip[];
  pixelsPerSecond: number;
  totalDuration: number;
  onTrackDropError?: (msg: string) => void;
}

const getTrackIcon = (type: Track['type']) => {
  switch (type) {
    case 'video':
      return Video;
    case 'overlay':
      return Layers;
    case 'text':
      return Type;
    case 'subtitle':
      return Subtitles;
    case 'audio':
      return Music;
  }
};

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  track,
  clips,
  pixelsPerSecond,
  totalDuration,
  onTrackDropError,
}) => {
  const {
    toggleTrackLock,
    toggleTrackVisibility,
    toggleTrackMute,
    setTrackVolume,
    setTrackHeight,
    setSelectedClipId,
    addClipFromAsset,
    pushSnapshot,
  } = useEditorStore();

  const [isDragOver, setIsDragOver] = useState(false);
  const [isInvalidTarget, setIsInvalidTarget] = useState(false);

  const Icon = getTrackIcon(track.type);
  const trackClips = clips.filter((c) => c.trackId === track.id);
  const trackWidth = Math.max(1, totalDuration * pixelsPerSecond);

  // Vertical track resizing handle (Section 35)
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    const initialHeight = track.height || 70;

    const handlePointerMove = (moveEvt: PointerEvent) => {
      const deltaY = moveEvt.clientY - startY;
      const newHeight = Math.min(200, Math.max(40, initialHeight + deltaY));
      setTrackHeight(track.id, newHeight);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      pushSnapshot('Resize Track Height');
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (!isDragOver) {
      setIsDragOver(true);
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) {
          const asset: MediaAsset = JSON.parse(raw);
          const isComp = canDropOnTrack(asset.type, track.type);
          setIsInvalidTarget(!isComp || track.locked);
        }
      } catch {
        // Data transfer json might be protected during dragover
      }
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setIsInvalidTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsInvalidTarget(false);

    if (track.locked) {
      onTrackDropError?.('Track is locked.');
      return;
    }

    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const asset: MediaAsset = JSON.parse(raw);

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const calculatedDropTime = Math.max(0, clickX / pixelsPerSecond);

      const res = addClipFromAsset(asset, track.id, calculatedDropTime);
      if (!res.success && res.error) {
        onTrackDropError?.(res.error);
      }
    } catch (err) {
      console.error('Failed to parse dropped media:', err);
    }
  };

  return (
    <div
      style={{ height: `${track.height || 70}px` }}
      className="flex border-b border-[#1b212d] group/track select-none relative"
    >
      {/* Left Track Control Header */}
      <div className="w-48 bg-[#0f1218] border-r border-[#1f2633] px-2.5 py-1.5 flex flex-col justify-between shrink-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded bg-[#171c26] flex items-center justify-center text-slate-400 shrink-0">
              <Icon className="w-3 h-3" />
            </div>
            <span
              className={`text-xs font-semibold truncate tracking-wider ${
                track.locked ? 'text-amber-300' : 'text-slate-200'
              }`}
            >
              {track.name}
            </span>
          </div>

          {/* Quick Lock / Visibility / Mute controls */}
          <div className="flex items-center gap-1">
            {/* Lock / Unlock (Section 12) */}
            <button
              onClick={() => toggleTrackLock(track.id)}
              className={`p-1 rounded transition-colors ${
                track.locked
                  ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a202c]'
              }`}
              title={track.locked ? 'Unlock Track' : 'Lock Track'}
              aria-label={track.locked ? 'Unlock track' : 'Lock track'}
            >
              {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>

            {/* Visibility (Section 13) */}
            {track.type !== 'audio' && (
              <button
                onClick={() => toggleTrackVisibility(track.id)}
                className={`p-1 rounded transition-colors ${
                  !track.visible
                    ? 'text-slate-600 bg-slate-800/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a202c]'
                }`}
                title={track.visible ? 'Hide Track in Preview' : 'Show Track in Preview'}
                aria-label={track.visible ? 'Hide track' : 'Show track'}
              >
                {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
            )}

            {/* Mute (Section 14) */}
            {track.type === 'audio' && (
              <button
                onClick={() => toggleTrackMute(track.id)}
                className={`p-1 rounded transition-colors ${
                  track.muted
                    ? 'text-red-400 bg-red-500/15 border border-red-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a202c]'
                }`}
                title={track.muted ? 'Unmute Track' : 'Mute Track'}
                aria-label={track.muted ? 'Unmute track' : 'Mute track'}
              >
                {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Track Volume Slider for Audio Tracks (Section 15: 0-200%, default 100%) */}
        {track.type === 'audio' && (
          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400">
            <span className="font-mono">Vol:</span>
            <input
              type="range"
              min="0"
              max="200"
              value={track.volume ?? 100}
              onChange={(e) => setTrackVolume(track.id, Number(e.target.value))}
              onMouseUp={() => pushSnapshot('Change Track Volume')}
              className="w-16 h-1 bg-[#232b3b] rounded appearance-none cursor-pointer accent-purple-500"
              title={`Track Volume: ${track.volume ?? 100}%`}
            />
            <span className="font-mono text-[9px] text-slate-300 w-7 text-right">
              {track.volume ?? 100}%
            </span>
          </div>
        )}
      </div>

      {/* Right Track Timeline Lane */}
      <div
        onClick={() => setSelectedClipId(null)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ width: `${trackWidth}px` }}
        className={`relative h-full transition-colors ${
          isDragOver
            ? isInvalidTarget
              ? 'bg-red-500/15 border-2 border-dashed border-red-500'
              : 'bg-sky-500/20 border-2 border-dashed border-sky-400'
            : 'bg-[#0a0d12] hover:bg-[#0c1017]'
        } ${track.locked ? 'opacity-70 pointer-events-none' : ''}`}
      >
        {/* Subtle grid ticks along the lane */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #1f293d 1px, transparent 1px)`,
            backgroundSize: `${pixelsPerSecond * 5}px 100%`,
          }}
        />

        {/* Drag over compatibility tooltip */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded shadow-md border ${
                isInvalidTarget
                  ? 'bg-red-950/90 text-red-200 border-red-500'
                  : 'bg-sky-950/90 text-sky-200 border-sky-400'
              }`}
            >
              {isInvalidTarget
                ? 'Drop this media on a compatible track.'
                : `+ Drop to ${track.name}`}
            </span>
          </div>
        )}

        {/* Clips in this track */}
        {trackClips.map((clip) => (
          <TimelineClip
            key={clip.id}
            clip={clip}
            pixelsPerSecond={pixelsPerSecond}
          />
        ))}
      </div>

      {/* Resizable bottom separator handle (Section 35: 40px to 200px) */}
      <div
        onPointerDown={handleResizePointerDown}
        className="absolute bottom-0 left-0 right-0 h-1.5 cursor-row-resize z-30 hover:bg-sky-500/40 transition-colors"
        title="Drag to resize track height"
      />
    </div>
  );
};
