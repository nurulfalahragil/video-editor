import React, { useRef, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { TimelineToolbar } from './TimelineToolbar';
import { TimelineRuler } from './TimelineRuler';
import { TimelineTrack } from './TimelineTrack';
import { Playhead } from './Playhead';
import { FolderUp, Sparkles, AlertCircle } from 'lucide-react';

const BASE_PIXELS_PER_SECOND = 40;

export const Timeline: React.FC = () => {
  const {
    tracks,
    clips,
    zoom,
    project,
    setSelectedClipId,
    setActivePanel,
  } = useEditorStore();

  const pixelsPerSecond = BASE_PIXELS_PER_SECOND * zoom;
  const totalDuration = project.duration;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedClipId(null);
    }
  };

  return (
    <div className="h-64 bg-[#0a0d12] border-t border-[#1f2633] flex flex-col shrink-0 select-none overflow-hidden z-10 relative">
      {/* Top Timeline Toolbar */}
      <TimelineToolbar />

      {/* Track Compatibility Toast Warning */}
      {toastMessage && (
        <div className="absolute top-11 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-950/90 border border-red-700/80 text-red-200 text-xs px-3.5 py-1.5 rounded-md shadow-xl animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Timeline Scroll Area */}
      <div
        ref={scrollContainerRef}
        onClick={handleBackgroundClick}
        className="flex-1 overflow-x-auto overflow-y-auto relative flex flex-col"
      >
        {/* Ruler Row */}
        <div className="flex sticky top-0 z-30 shadow-xs">
          {/* Top-left Corner Cell above track headers */}
          <div className="w-48 h-7 bg-[#0e1117] border-r border-b border-[#1f2633] px-3 flex items-center justify-between shrink-0">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Tracks
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {tracks.length} Layers
            </span>
          </div>

          {/* Time Ruler */}
          <TimelineRuler
            pixelsPerSecond={pixelsPerSecond}
            totalDuration={totalDuration}
            timelineScrollRef={scrollContainerRef}
          />
        </div>

        {/* Tracks Container with Playhead Overlay */}
        <div className="relative flex-1">
          {/* Vertical Playhead - absolute positioned across all tracks */}
          <div
            style={{
              left: '12rem', // Matches w-48 (48 * 4px = 192px = 12rem)
            }}
            className="absolute top-0 bottom-0 pointer-events-none z-40"
          >
            <Playhead
              pixelsPerSecond={pixelsPerSecond}
              totalDuration={totalDuration}
              timelineContainerRef={scrollContainerRef}
            />
          </div>

          {/* Render All Track Rows */}
          {tracks.map((track) => (
            <TimelineTrack
              key={track.id}
              track={track}
              clips={clips}
              pixelsPerSecond={pixelsPerSecond}
              totalDuration={totalDuration}
              onTrackDropError={showToast}
            />
          ))}

          {/* Section 30: Empty Timeline State Message */}
          {clips.length === 0 && (
            <div className="absolute inset-0 left-48 flex items-center justify-center pointer-events-none z-20">
              <div className="bg-[#121622]/90 border border-[#232b3b] rounded-lg p-3.5 flex flex-col items-center justify-center text-center shadow-lg pointer-events-auto">
                <span className="text-xs font-semibold text-slate-300">
                  Drag media here to start editing
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Drop video/image onto Video or Overlay track, audio onto Audio track
                </span>
                <button
                  onClick={() => setActivePanel('media')}
                  className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-400 text-xs font-medium transition-colors"
                >
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>or click Upload Media</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
