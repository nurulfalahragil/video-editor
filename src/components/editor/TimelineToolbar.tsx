import React, { useState } from 'react';
import {
  MousePointer,
  Scissors,
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

export const TimelineToolbar: React.FC = () => {
  const {
    zoom,
    zoomIn,
    zoomOut,
    zoomFit,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore();

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="h-9 bg-[#11141c] border-b border-[#1f2633] px-3 flex items-center justify-between shrink-0 select-none text-slate-300">
      {/* Left: Editing Tools */}
      <div className="flex items-center gap-1">
        {/* Select Tool (Active) */}
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/20 border border-sky-500/40 text-sky-400 text-xs font-medium"
          title="Selection Tool (V)"
          aria-label="Selection tool"
        >
          <MousePointer className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Select</span>
        </button>

        {/* Split Tool (Available in Phase 3) */}
        <button
          onClick={() => showNotification('Split tool will be available in Phase 3')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1a202c] text-xs font-medium transition-colors"
          title="Split Clip at Playhead (S) - Available in Phase 3"
          aria-label="Split tool"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Split</span>
        </button>

        {/* Delete Tool (Available in Phase 3) */}
        <button
          onClick={() => showNotification('Delete tool will be available in Phase 3')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1a202c] text-xs font-medium transition-colors"
          title="Delete Selection (Del) - Available in Phase 3"
          aria-label="Delete tool"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>

        <div className="h-3.5 w-px bg-[#232b3b] mx-1" />

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
      </div>

      {/* Center Tooltip Notification Banner if clicked split/delete */}
      {notification && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded animate-fade-in">
          <Sparkles className="w-3 h-3" />
          <span>{notification}</span>
        </div>
      )}

      {/* Right: Zoom Controls */}
      <div className="flex items-center gap-1 bg-[#0d1016] border border-[#212938] rounded p-0.5">
        <button
          onClick={zoomOut}
          disabled={zoom <= 0.5}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1b2230] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Zoom Out (Ctrl -)"
          aria-label="Zoom out timeline"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] font-mono text-slate-300 px-2 select-none min-w-[42px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={zoomIn}
          disabled={zoom >= 2.0}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1b2230] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Zoom In (Ctrl +)"
          aria-label="Zoom in timeline"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-3 w-px bg-[#212938] mx-0.5" />

        <button
          onClick={zoomFit}
          className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-[#1b2230] transition-colors"
          title="Fit Timeline to Window"
          aria-label="Fit timeline to view"
        >
          Fit
        </button>
      </div>
    </div>
  );
};
