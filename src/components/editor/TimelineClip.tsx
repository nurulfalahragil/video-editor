import React from 'react';
import { Clip } from '../../types/editor';
import { useEditorStore, formatSecondsToTime } from '../../store/editorStore';
import { Film, Image as ImageIcon, Music, Type } from 'lucide-react';

interface TimelineClipProps {
  clip: Clip;
  pixelsPerSecond: number;
}

export const TimelineClip: React.FC<TimelineClipProps> = ({
  clip,
  pixelsPerSecond,
}) => {
  const { selectedClipId, setSelectedClipId, getAssetById } = useEditorStore();
  const isSelected = selectedClipId === clip.id;

  const asset = clip.assetId ? getAssetById(clip.assetId) : undefined;
  const thumbnailUrl = clip.thumbnailPlaceholder || asset?.thumbnailUrl || asset?.url;

  const left = clip.startTime * pixelsPerSecond;
  const width = clip.duration * pixelsPerSecond;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClipId(clip.id);
  };

  const getClipTheme = () => {
    if (clip.type === 'video' || clip.type === 'overlay') {
      return {
        bg: isSelected
          ? 'bg-sky-600/90 border-2 border-white ring-2 ring-sky-500/50 shadow-lg'
          : 'bg-[#1e3a8a]/80 hover:bg-[#1e40af]/90 border border-sky-500/50',
        badgeColor: 'text-sky-300',
        icon: Film,
      };
    }
    if (clip.type === 'image') {
      return {
        bg: isSelected
          ? 'bg-emerald-600/90 border-2 border-white ring-2 ring-emerald-500/50 shadow-lg'
          : 'bg-[#065f46]/80 hover:bg-[#047857]/90 border border-emerald-500/50',
        badgeColor: 'text-emerald-300',
        icon: ImageIcon,
      };
    }
    if (clip.type === 'audio') {
      return {
        bg: isSelected
          ? 'bg-purple-600/90 border-2 border-white ring-2 ring-purple-500/50 shadow-lg'
          : 'bg-[#581c87]/80 hover:bg-[#6b21a8]/90 border border-purple-500/50',
        badgeColor: 'text-purple-300',
        icon: Music,
      };
    }
    return {
      bg: isSelected
        ? 'bg-amber-600/90 border-2 border-white'
        : 'bg-[#78350f]/80 border border-amber-500/50',
      badgeColor: 'text-amber-300',
      icon: Type,
    };
  };

  const theme = getClipTheme();
  const Icon = theme.icon;

  return (
    <div
      onClick={handleClick}
      style={{
        left: `${left}px`,
        width: `${width}px`,
      }}
      className={`absolute top-1 bottom-1 rounded overflow-hidden cursor-pointer select-none transition-all flex flex-col justify-between group z-10 ${theme.bg}`}
    >
      {/* Top Header of Clip */}
      <div className="px-2 py-0.5 bg-black/35 flex items-center justify-between text-[11px] font-medium text-white truncate border-b border-white/10">
        <div className="flex items-center gap-1.5 truncate">
          <Icon className={`w-3 h-3 ${theme.badgeColor} shrink-0`} />
          <span className="truncate">{clip.name}</span>
        </div>
        <span className="text-[10px] font-mono text-white/90 shrink-0 pl-1">
          {formatSecondsToTime(clip.duration)}
        </span>
      </div>

      {/* Clip Thumbnail or Audio Waveform Content */}
      <div className="flex-1 px-1.5 py-0.5 flex items-center gap-1.5 overflow-hidden relative">
        {clip.type === 'audio' ? (
          /* Simulated audio waveform */
          <div className="flex items-center gap-0.5 w-full h-full opacity-60">
            {Array.from({ length: Math.max(10, Math.floor(width / 4)) }).map((_, i) => (
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
          /* Filmstrip / Thumbnail preview */
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

      {/* Left Trim Handle Decorator (Visual for Phase 2) */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/20 hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
        <div className="w-0.5 h-3 bg-white rounded-full" />
      </div>

      {/* Right Trim Handle Decorator (Visual for Phase 2) */}
      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/20 hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
        <div className="w-0.5 h-3 bg-white rounded-full" />
      </div>
    </div>
  );
};
