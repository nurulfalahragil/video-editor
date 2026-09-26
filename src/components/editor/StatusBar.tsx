import React from 'react';
import { useEditorStore, formatTimecode, formatSecondsToTime } from '../../store/editorStore';
import { Clock, ZoomIn, Eye, Film, Keyboard } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const {
    project,
    currentTime,
    zoom,
    previewQuality,
    selectedClip,
  } = useEditorStore();

  return (
    <footer className="h-6 bg-[#0a0d12] border-t border-[#1a202c] px-3 flex items-center justify-between text-[11px] text-slate-400 shrink-0 select-none z-30 font-mono">
      {/* Left Metrics: Duration & Current Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400">Duration:</span>
          <span className="text-slate-200 font-medium">
            {formatSecondsToTime(project.duration)}
          </span>
        </div>

        <div className="h-3 w-px bg-[#1f2633]" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Current:</span>
          <span className="text-white font-medium tabular-nums">
            {formatTimecode(currentTime)}
          </span>
        </div>

        {selectedClip && (
          <>
            <div className="h-3 w-px bg-[#1f2633]" />
            <div className="flex items-center gap-1 text-sky-400 font-sans">
              <Film className="w-3 h-3" />
              <span>Selected: {selectedClip.name}</span>
            </div>
          </>
        )}
      </div>

      {/* Right Metrics: Zoom & Preview Quality */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-slate-400 font-sans text-[10px]">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.2 bg-[#171d28] rounded border border-[#273244] text-[9px] font-mono text-slate-300">Space</kbd> Play
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.2 bg-[#171d28] rounded border border-[#273244] text-[9px] font-mono text-slate-300">Esc</kbd> Deselect
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.2 bg-[#171d28] rounded border border-[#273244] text-[9px] font-mono text-slate-300">Ctrl+Z</kbd> Undo
          </span>
        </div>

        <div className="h-3 w-px bg-[#1f2633] hidden md:block" />

        <div className="flex items-center gap-1.5">
          <ZoomIn className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400">Zoom:</span>
          <span className="text-slate-200 font-medium">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="h-3 w-px bg-[#1f2633]" />

        <div className="flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400">Preview:</span>
          <span className="text-slate-200 font-medium">{previewQuality}</span>
        </div>
      </div>
    </footer>
  );
};
