import React, { useState } from 'react';
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
    setSelectedClipId,
    addClipFromAsset,
  } = useEditorStore();

  const [isDragOver, setIsDragOver] = useState(false);
  const [isInvalidTarget, setIsInvalidTarget] = useState(false);

  const Icon = getTrackIcon(track.type);
  const trackClips = clips.filter((c) => c.trackId === track.id);
  const trackWidth = totalDuration * pixelsPerSecond;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (!isDragOver) {
      setIsDragOver(true);
      // Validate track compatibility on drag over
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) {
          const asset: MediaAsset = JSON.parse(raw);
          const isComp =
            (track.type === 'video' || track.type === 'overlay')
              ? asset.type === 'video' || asset.type === 'image'
              : track.type === 'audio'
              ? asset.type === 'audio'
              : false;

          setIsInvalidTarget(!isComp);
        }
      } catch {
        // Data transfer json might be protected during dragover in some browsers
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

    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const asset: MediaAsset = JSON.parse(raw);

      // Compute drop position based on mouse X relative to track lane
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
    <div className="flex border-b border-[#1b212d] h-14 group/track select-none">
      {/* Left Track Control Header */}
      <div className="w-48 bg-[#0f1218] border-r border-[#1f2633] px-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-[#171c26] flex items-center justify-center text-slate-400 shrink-0">
            <Icon className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-slate-300 truncate uppercase tracking-wider">
            {track.name}
          </span>
        </div>

        {/* Track Action Controls */}
        <div className="flex items-center gap-1">
          {/* Lock / Unlock */}
          <button
            onClick={() => toggleTrackLock(track.id)}
            className={`p-1 rounded transition-colors ${
              track.locked
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a202c]'
            }`}
            title={track.locked ? 'Unlock Track' : 'Lock Track'}
            aria-label={track.locked ? 'Unlock track' : 'Lock track'}
          >
            {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>

          {/* Visibility or Mute Toggle */}
          {track.type === 'audio' ? (
            <button
              onClick={() => toggleTrackMute(track.id)}
              className={`p-1 rounded transition-colors ${
                track.muted
                  ? 'text-red-400 bg-red-500/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a202c]'
              }`}
              title={track.muted ? 'Unmute Track' : 'Mute Track'}
              aria-label={track.muted ? 'Unmute track' : 'Mute track'}
            >
              {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          ) : (
            <button
              onClick={() => toggleTrackVisibility(track.id)}
              className={`p-1 rounded transition-colors ${
                !track.visible
                  ? 'text-slate-600 bg-slate-800/40'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a202c]'
              }`}
              title={track.visible ? 'Hide Track' : 'Show Track'}
              aria-label={track.visible ? 'Hide track' : 'Show track'}
            >
              {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
          )}
        </div>
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
        } ${track.locked ? 'opacity-50 pointer-events-none' : ''}`}
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
    </div>
  );
};
