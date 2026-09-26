import React, { useState, useRef, useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { MediaAsset, MediaSortOption, MediaViewMode } from '../../types/media';
import { processMediaFile, validateMediaFile } from '../../utils/mediaMetadata';
import { MediaCard } from '../editor/media/MediaCard';
import { MediaListRow } from '../editor/media/MediaListRow';
import {
  Upload,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  FolderOpen,
  AlertCircle,
  X,
  Loader2,
  Trash2,
  Edit3,
  Plus,
  Sparkles,
} from 'lucide-react';
import { createDemoAssets } from '../../utils/sampleMediaGenerator';

export const MediaPanel: React.FC = () => {
  const {
    assets,
    clips,
    addMultipleAssets,
    removeAsset,
    renameAsset,
    setSelectedAssetId,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<MediaSortOption>('newest');
  const [viewMode, setViewMode] = useState<MediaViewMode>('grid');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);
  const [assetToRename, setAssetToRename] = useState<MediaAsset | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const handleLoadDemo = async () => {
    setIsProcessing(true);
    try {
      const demo = await createDemoAssets();
      if (demo.length > 0) {
        addMultipleAssets(demo);
      }
    } catch (err: any) {
      setErrorMessage('Could not create demo assets: ' + err?.message);
    }
    setIsProcessing(false);
  };

  // Handle file uploads
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const val = validateMediaFile(file);
      if (val.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${val.error}`);
      }
    });

    if (errors.length > 0) {
      setErrorMessage(
        errors[0] ||
          'Unsupported file type. Please upload MP4, WebM, MOV, JPG, PNG, WEBP, MP3, WAV, or M4A.',
      );
    }

    if (validFiles.length > 0) {
      try {
        const processed = await Promise.all(
          validFiles.map((file) => processMediaFile(file)),
        );
        addMultipleAssets(processed);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Error processing media files.');
      }
    }

    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  // Delete handling
  const handleDeleteClick = (asset: MediaAsset) => {
    setAssetToDelete(asset);
  };

  const confirmDelete = () => {
    if (assetToDelete) {
      removeAsset(assetToDelete.id);
      setAssetToDelete(null);
    }
  };

  // Check if asset is referenced by clips in timeline
  const isAssetInTimeline = useMemo(() => {
    if (!assetToDelete) return false;
    return clips.some((c) => c.assetId === assetToDelete.id);
  }, [assetToDelete, clips]);

  // Rename handling
  const handleRenameClick = (asset: MediaAsset) => {
    setAssetToRename(asset);
    setRenameInput(asset.name);
  };

  const confirmRename = () => {
    if (assetToRename && renameInput.trim()) {
      renameAsset(assetToRename.id, renameInput.trim());
      setAssetToRename(null);
    }
  };

  // Filter & Sort
  const filteredAndSortedAssets = useMemo(() => {
    let result = [...assets];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q),
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return result;
  }, [assets, searchQuery, sortOption]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`flex flex-col h-full bg-[#11141a] text-slate-200 select-none relative ${
        isDraggingFile ? 'ring-2 ring-sky-500 bg-[#141b2b]' : ''
      }`}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp,audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/m4a,audio/aac,.mp4,.webm,.mov,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a,.aac"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Panel Header */}
      <div className="p-3 border-b border-[#1f2633] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-100">
              Media
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              ({assets.length})
            </span>
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLoadDemo}
              disabled={isProcessing}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#1c2230] hover:bg-[#252e42] border border-[#2e394d] text-slate-300 text-[11px] font-medium transition-colors"
              title="Load sample video, image & audio"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Samples</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Upload</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161a22] border border-[#252c3b] rounded text-xs pl-8 pr-7 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls Bar: Sort & View Toggle */}
        <div className="flex items-center justify-between text-xs">
          {/* Sort Menu */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as MediaSortOption)}
              className="bg-[#161a22] border border-[#252c3b] rounded px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="type">Type</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-[#161a22] border border-[#252c3b] rounded p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="List View"
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="m-3 p-2.5 rounded bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start justify-between gap-2 animate-fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white p-0.5"
            aria-label="Close error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Drag & Drop Zone */}
      <div className="p-3 border-b border-[#1f2633]">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group border border-dashed border-[#293244] hover:border-sky-500/70 rounded-md p-3.5 flex flex-col items-center justify-center text-center bg-[#131722]/50 hover:bg-[#161c2b] transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 mb-2 group-hover:scale-110 transition-transform">
            <Upload className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-200">
            + Upload Media
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Drag & drop files here
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-1">
            Video • Image • Audio
          </span>
        </div>
      </div>

      {/* Assets Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredAndSortedAssets.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <FolderOpen className="w-8 h-8 text-slate-600 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-400">
              {searchQuery ? 'No media matches your search' : 'No media uploaded'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
              {searchQuery
                ? 'Try a different filename or type'
                : 'Upload MP4, JPG, PNG, or MP3 files to start editing'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleLoadDemo}
                disabled={isProcessing}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Sample Media</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredAndSortedAssets.map((asset) => (
              <MediaCard
                key={asset.id}
                asset={asset}
                onPreview={() => setSelectedAssetId(asset.id)}
                onRename={handleRenameClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredAndSortedAssets.map((asset) => (
              <MediaListRow
                key={asset.id}
                asset={asset}
                onPreview={() => setSelectedAssetId(asset.id)}
                onRename={handleRenameClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-[#273244] rounded-lg max-w-sm w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Delete Media
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAssetInTimeline
                ? 'This media is currently used in the project. Remove the asset from the library without removing the timeline clips?'
                : `Delete "${assetToDelete.name}" from the media library?`}
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setAssetToDelete(null)}
                className="px-3 py-1.5 rounded bg-[#1e2535] hover:bg-[#283247] text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-xs font-medium text-white transition-colors"
              >
                {isAssetInTimeline ? 'Confirm Remove' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {assetToRename && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-[#273244] rounded-lg max-w-sm w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Edit3 className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Rename Asset
              </h3>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Asset Name
              </label>
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmRename();
                  if (e.key === 'Escape') setAssetToRename(null);
                }}
                autoFocus
                className="w-full bg-[#181f2e] border border-[#293549] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setAssetToRename(null)}
                className="px-3 py-1.5 rounded bg-[#1e2535] hover:bg-[#283247] text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-xs font-medium text-slate-950 font-semibold transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
