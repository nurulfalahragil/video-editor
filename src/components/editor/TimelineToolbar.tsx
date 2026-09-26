import React from 'react';
import {
  MousePointer,
  Scissors,
  Trash2,
  Copy,
  ClipboardPaste,
  CopyPlus,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Magnet,
} from 'lucide-react';
import { useEditorStore, ZOOM_LEVELS } from '../../store/editorStore';

export const TimelineToolbar: React.FC = () => {
  const {
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    zoomFit,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedClipId,
    splitClip,
    deleteClip,
    duplicateClip,
    copyClip,
    pasteClip,
    clipboardClip,
    snapEnabled,
    toggleSnap,
  } = useEditorStore();

  const handleSplit = () => {
    splitClip();
  };

  const handleDelete = () => {
    deleteClip();
  };

  const handleDuplicate = () => {
    duplicateClip();
  };

  const handleCopy = () => {
    copyClip();
  };

  const handlePaste = () => {
    pasteClip();
  };

  return (
    <div className="h-9 bg-[#11141c] border-b border-[#1f2633] px-3 flex items-center justify-between shrink-0 select-none text-slate-300">
      {/* Left: Editing Tools */}
      <div className="flex items-center gap-1">
        {/* Select Tool */}
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/20 border border-sky-500/40 text-sky-400 text-xs font-medium shadow-xs"
          title="Selection Tool (V)"
          aria-label="Selection tool"
        >
          <MousePointer className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Select</span>
        </button>

        {/* Split Tool */}
        <button
          onClick={handleSplit}
          disabled={!selectedClipId}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
            selectedClipId
              ? 'text-slate-200 hover:text-white hover:bg-[#1f2638] border border-[#273248]'
              : 'text-slate-600 border border-transparent cursor-not-allowed'
          }`}
          title="Split Clip at Playhead (S)"
          aria-label="Split clip at playhead"
        >
          <Scissors className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Split</span>
        </button>

        {/* Delete Tool */}
        <button
          onClick={handleDelete}
          disabled={!selectedClipId}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
            selectedClipId
              ? 'text-red-300 hover:text-red-200 hover:bg-red-950/40 border border-red-900/40'
              : 'text-slate-600 border border-transparent cursor-not-allowed'
          }`}
          title="Delete Selection (Delete / Backspace)"
          aria-label="Delete selected clip"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">Delete</span>
        </button>

        <div className="h-3.5 w-px bg-[#232b3b] mx-0.5" />

        {/* Duplicate Tool */}
        <button
          onClick={handleDuplicate}
          disabled={!selectedClipId}
          className={`p-1.5 rounded transition-colors ${
            selectedClipId
              ? 'text-slate-300 hover:text-white hover:bg-[#1a202c]'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Duplicate Clip (Ctrl+D)"
          aria-label="Duplicate selected clip"
        >
          <CopyPlus className="w-3.5 h-3.5" />
        </button>

        {/* Copy */}
        <button
          onClick={handleCopy}
          disabled={!selectedClipId}
          className={`p-1.5 rounded transition-colors ${
            selectedClipId
              ? 'text-slate-300 hover:text-white hover:bg-[#1a202c]'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Copy Clip (Ctrl+C)"
          aria-label="Copy clip"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Paste */}
        <button
          onClick={handlePaste}
          disabled={!clipboardClip}
          className={`p-1.5 rounded transition-colors ${
            clipboardClip
              ? 'text-sky-300 hover:text-white hover:bg-[#1a202c]'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Paste Clip at Playhead (Ctrl+V)"
          aria-label="Paste clip"
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-px bg-[#232b3b] mx-0.5" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-1 rounded transition-colors ${
            canUndo
              ? 'text-slate-300 hover:text-white hover:bg-[#1a202c]'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
          aria-label="Undo timeline edit"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-1 rounded transition-colors ${
            canRedo
              ? 'text-slate-300 hover:text-white hover:bg-[#1a202c]'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo timeline edit"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-px bg-[#232b3b] mx-0.5" />

        {/* Snapping Toggle (Section 31 & 33) */}
        <button
          onClick={toggleSnap}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            snapEnabled
              ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
              : 'text-slate-500 hover:text-slate-300 hover:bg-[#181d28] border border-transparent'
          }`}
          title={`Magnet Snapping: ${snapEnabled ? 'ON' : 'OFF'}`}
          aria-label="Toggle magnetic snapping"
        >
          <Magnet className={`w-3.5 h-3.5 ${snapEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
          <span className="text-[11px] font-mono">{snapEnabled ? 'Snap ON' : 'Snap OFF'}</span>
        </button>
      </div>

      {/* Right: Zoom Controls (Section 36) */}
      <div className="flex items-center gap-1 bg-[#0d1016] border border-[#212938] rounded p-0.5">
        <button
          onClick={zoomOut}
          disabled={zoom <= 0.25}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1b2230] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Zoom Out"
          aria-label="Zoom out timeline"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Selectable Zoom Level */}
        <select
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="bg-transparent text-[11px] font-mono text-slate-300 px-1 py-0.5 focus:outline-none cursor-pointer"
        >
          {ZOOM_LEVELS.map((z) => (
            <option key={z} value={z} className="bg-[#121620] text-slate-200">
              {Math.round(z * 100)}%
            </option>
          ))}
        </select>

        <button
          onClick={zoomIn}
          disabled={zoom >= 5.0}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1b2230] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Zoom In"
          aria-label="Zoom in timeline"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-3 w-px bg-[#212938] mx-0.5" />

        <button
          onClick={zoomFit}
          className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-[#1b2230] transition-colors"
          title="Fit Timeline (100%)"
          aria-label="Fit timeline to view"
        >
          Fit
        </button>
      </div>
    </div>
  );
};
