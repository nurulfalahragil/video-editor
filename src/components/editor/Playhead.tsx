import React, { useRef, useCallback } from 'react';
import { useEditorStore, formatTimecode } from '../../store/editorStore';

interface PlayheadProps {
  pixelsPerSecond: number;
  totalDuration: number;
  timelineContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const Playhead: React.FC<PlayheadProps> = ({
  pixelsPerSecond,
  totalDuration,
  timelineContainerRef,
}) => {
  const { currentTime, setCurrentTime } = useEditorStore();
  const playheadPos = currentTime * pixelsPerSecond;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const initialTime = currentTime;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / pixelsPerSecond;
      const newTime = Math.max(0, Math.min(totalDuration, initialTime + deltaTime));
      setCurrentTime(newTime);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        transform: `translateX(${playheadPos}px)`,
        pointerEvents: 'none',
      }}
      className="absolute top-0 bottom-0 left-0 z-40 will-change-transform"
    >
      {/* Playhead Top Handle (Pentagon / Marker with time tooltip) */}
      <div
        onMouseDown={handleMouseDown}
        style={{ pointerEvents: 'auto' }}
        className="relative -left-2.5 top-0 cursor-ew-resize group"
      >
        {/* Pointer Head shape */}
        <div className="w-5 h-6 bg-red-500 hover:bg-red-400 rounded-t-sm shadow-md flex items-center justify-center transition-colors relative">
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
          {/* Triangular bottom tip */}
          <div className="absolute -bottom-1.5 left-0 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[7px] border-t-red-500 group-hover:border-t-red-400 transition-colors" />
        </div>

        {/* Hover / Active Floating Timecode Tooltip */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/90 text-white font-mono text-[10px] px-1.5 py-0.5 rounded shadow-lg border border-white/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {formatTimecode(currentTime)}
        </div>
      </div>

      {/* Vertical Red Line extending down the entire tracks canvas */}
      <div className="w-0.5 bg-red-500 absolute top-6 bottom-0 -left-[1px] shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
    </div>
  );
};
