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
} from 'lucide-react';

interface MediaListRowProps {
  asset: MediaAsset;
  onPreview: (asset: MediaAsset) => void;
  onRename: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
}

export const MediaListRow: React.FC<MediaListRowProps> = ({
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
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => {
        setSelectedAssetId(asset.id);
        onPreview(asset);
      }}
      className={`group flex items-center justify-between p-2 rounded border transition-all cursor-grab active:cursor-grabbing select-none text-xs ${
        isSelected
          ? 'bg-[#182030] border-sky-400 ring-1 ring-sky-500/50'
          : 'bg-[#141822] hover:bg-[#181d2a] border-[#222938] hover:border-sky-500/40'
      }`}
    >
      {/* Left: Thumbnail & Name */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-10 h-8 rounded bg-[#0b0e14] border border-[#222938] shrink-0 overflow-hidden flex items-center justify-center relative">
          {asset.thumbnailUrl ? (
            <img
              src={asset.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : asset.type === 'video' ? (
            <Film className="w-4 h-4 text-sky-400" />
          ) : asset.type === 'image' ? (
            <ImageIcon className="w-4 h-4 text-emerald-400" />
          ) : (
            <Music className="w-4 h-4 text-purple-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-medium text-slate-200 truncate group-hover:text-sky-300 transition-colors">
            {asset.name}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
            <span className="uppercase text-[9px] px-1 rounded bg-[#1c2230] text-slate-300">
              {asset.type}
            </span>
            {asset.duration && <span>• {formatSecondsToTime(asset.duration)}</span>}
            {asset.width && asset.height && <span>• {asset.width}×{asset.height}</span>}
          </div>
        </div>
      </div>

      {/* Right: Size, Date & Action Menu */}
      <div className="flex items-center gap-2 shrink-0 pl-2">
        <span className="text-[10px] font-mono text-slate-400">
          {formatBytes(asset.size)}
        </span>
        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
          {formatDate(asset.createdAt)}
        </span>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#202737] transition-colors"
            title="Options"
            aria-label="Options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

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
