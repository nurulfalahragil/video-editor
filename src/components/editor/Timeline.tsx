import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { TimelineToolbar } from './TimelineToolbar';
import { TimelineRuler } from './TimelineRuler';
import { TimelineTrack } from './TimelineTrack';
import { Playhead } from './Playhead';
import { BASE_PIXELS_PER_SECOND, formatTime } from '../../utils/timelineMath';
import { FolderUp, AlertCircle, Magnet } from 'lucide-react';

export const Timeline: React.FC = () => {
  const {
    tracks,
    clips,
    zoom,
    project,
    setSelectedClipId,
    setActivePanel,
    currentTime,
    isPlaying,
    activeSnapGuide,
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

  // Section 37: Auto Scroll During Playback
  useEffect(() => {
    if (!isPlaying || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const playheadPx = currentTime * pixelsPerSecond;
    const scrollLeft = container.scrollLeft;
    const clientWidth = container.clientWidth;

    // Fixed track header is 192px (w-48)
    const visibleStart = scrollLeft;
    const visibleEnd = scrollLeft + clientWidth - 220;

    if (playheadPx > visibleEnd) {
      container.scrollLeft = playheadPx - clientWidth * 0.25;
    } else if (playheadPx < visibleStart) {
      container.scrollLeft = Math.max(0, playheadPx - 50);
    }
  }, [currentTime, isPlaying, pixelsPerSecond]);

  return (
    <div className="h-72 bg-[#0a0d12] border-t border-[#1f2633] flex flex-col shrink-0 select-none overflow-hidden z-10 relative">
      {/* Top Timeline Toolbar */}
      <TimelineToolbar />

      {/* Toast Warning */}
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
        className="flex-1 overflow-x-auto overflow-y-auto relative flex flex-col scroll-smooth"
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

        {/* Tracks Container with Playhead & Snap Guides Overlay */}
        <div className="relative flex-1">
          {/* Section 32: Visual Snap Guide Line */}
          {activeSnapGuide !== null && (
            <div
              style={{
                left: `calc(12rem + ${activeSnapGuide * pixelsPerSecond}px)`,
              }}
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400/90 pointer-events-none z-35 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap flex items-center gap-1">
                <Magnet className="w-2.5 h-2.5" />
                <span>Snap: {formatTime(activeSnapGuide)}</span>
              </div>
            </div>
          )}

          {/* Vertical Playhead */}
          <div
            style={{
              left: '12rem', // Matches w-48
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

          {/* Empty Timeline State Message */}
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
