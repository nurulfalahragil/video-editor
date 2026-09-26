import React, { useState } from 'react';
import { MediaAsset } from '../../../types/media';
import { useEditorStore, formatSecondsToTime } from '../../../store/editorStore';
import { formatBytes } from '../../../utils/mediaMetadata';
import {
  Film,
  Image as ImageIcon,
  Music,
  MoreVertical,
  Play,
  Trash2,
  Edit2,
  Clock,
  Layers,
  GripHorizontal,
} from 'lucide-react';

interface MediaCardProps {
  asset: MediaAsset;
  onPreview: (asset: MediaAsset) => void;
  onRename: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  asset,
  onPreview,
  onRename,
  onDelete,
}) => {
  const { selectedAssetId, setSelectedAssetId } = useEditorStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const isSelected = selectedAssetId === asset.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.setData('text/plain', asset.id);
    e.dataTransfer.effectAllowed = 'copyMove';

    // Create a subtle drag preview
    const ghost = document.createElement('div');
    ghost.className = 'bg-sky-600 text-white text-xs px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5 font-mono';
    ghost.innerHTML = `<span>+</span><span>${asset.name}</span>`;
    document.body.appendChild(ghost);
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    e.dataTransfer.setDragImage(ghost, 10, 10);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => {
        setSelectedAssetId(asset.id);
        onPreview(asset);
      }}
      className={`group relative rounded-md border transition-all cursor-grab active:cursor-grabbing select-none overflow-hidden flex flex-col bg-[#141822] hover:bg-[#181d2a] ${
        isSelected
          ? 'border-sky-400 ring-2 ring-sky-500/40 shadow-md'
          : 'border-[#222938] hover:border-sky-500/40'
      }`}
    >
      {/* Media Thumbnail Container */}
      <div className="relative aspect-video w-full bg-[#0b0e14] flex items-center justify-center overflow-hidden">
        {asset.type === 'video' ? (
          asset.thumbnailUrl ? (
            <img
              src={asset.thumbnailUrl}
              alt={asset.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
              <Film className="w-6 h-6 text-sky-400/80" />
              <span className="text-[9px] uppercase tracking-wider font-mono">Video</span>
            </div>
          )
        ) : asset.type === 'image' ? (
          <img
            src={asset.url}
            alt={asset.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-purple-400 gap-1.5 p-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shadow-xs">
              <Music className="w-4 h-4 text-purple-300" />
            </div>
            <span className="text-[9px] uppercase font-mono tracking-wider text-purple-300/80">Audio</span>
          </div>
        )}

        {/* Hover quick play icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-sky-500/90 text-white flex items-center justify-center shadow-sm transform group-hover:scale-105 transition-transform">
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration badge for video & audio */}
        {typeof asset.duration === 'number' && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/75 backdrop-blur-xs text-[9.5px] font-mono font-medium text-white border border-white/10">
            {formatSecondsToTime(asset.duration)}
          </div>
        )}

        {/* Resolution badge for video & image */}
        {asset.width && asset.height && (
          <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/75 backdrop-blur-xs text-[9px] font-mono text-slate-300 border border-white/10">
            {asset.width}×{asset.height}
          </div>
        )}

        {/* Drag handle indicator */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-black/60 text-slate-300">
          <GripHorizontal className="w-3 h-3" />
        </div>
      </div>

      {/* Asset Info Card Footer */}
      <div className="p-2 flex items-center justify-between gap-1 border-t border-[#1d2331]">
        <div className="min-w-0 flex-1">
          <div
            className="text-xs font-medium text-slate-200 truncate group-hover:text-sky-300 transition-colors"
            title={asset.name}
          >
            {asset.name}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono mt-0.5">
            <span className="uppercase text-[9px] px-1 rounded bg-[#1c2230] text-slate-300">
              {asset.type}
            </span>
            <span>•</span>
            <span>{formatBytes(asset.size)}</span>
          </div>
        </div>

        {/* 3-Dot Context Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#202737] transition-colors"
            title="Asset options"
            aria-label="Media options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {/* Context Dropdown Menu */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-1 w-36 bg-[#161b26] border border-[#273244] rounded-md shadow-xl py-1 z-50 text-xs text-slate-200"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onPreview(asset);
                  }}
                  className="w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-[#202737] text-left transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-sky-400" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onRename(asset);
                  }}
                  className="w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-[#202737] text-left transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rename</span>
                </button>
                <div className="h-px bg-[#222a3a] my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(asset);
                  }}
                  className="w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-red-500/20 text-red-400 text-left transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
