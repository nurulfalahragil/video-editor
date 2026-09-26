import React, { useRef, useCallback } from 'react';
import { useEditorStore, formatSecondsToTime } from '../../store/editorStore';

interface TimelineRulerProps {
  pixelsPerSecond: number;
  totalDuration: number;
  timelineScrollRef?: React.RefObject<HTMLDivElement | null>;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  pixelsPerSecond,
  totalDuration,
}) => {
  const { setCurrentTime } = useEditorStore();
  const rulerRef = useRef<HTMLDivElement>(null);

  const calculateTimeFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!rulerRef.current) return 0;
      const rect = rulerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const calculatedTime = clickX / pixelsPerSecond;
      return Math.max(0, Math.min(totalDuration, calculatedTime));
    },
    [pixelsPerSecond, totalDuration],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const time = calculateTimeFromEvent(e);
    setCurrentTime(time);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const moveTime = calculateTimeFromEvent(moveEvent);
      setCurrentTime(moveTime);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Generate ruler markers
  // Every 5 seconds is a major step (00:00, 00:05, 00:10, etc.)
  const majorInterval = 5;
  const majorTicksCount = Math.floor(totalDuration / majorInterval) + 1;
  const majorTicks = Array.from({ length: majorTicksCount }, (_, i) => i * majorInterval);

  // Minor ticks every 1 second
  const minorTicks = Array.from({ length: Math.floor(totalDuration) + 1 }, (_, i) => i);

  return (
    <div
      ref={rulerRef}
      onMouseDown={handleMouseDown}
      style={{ width: `${totalDuration * pixelsPerSecond}px` }}
      className="h-7 bg-[#11141c] border-b border-[#1f2633] relative cursor-pointer select-none overflow-hidden"
    >
      {/* 1-second minor ticks */}
      {minorTicks.map((second) => {
        if (second % majorInterval === 0) return null; // handled by major tick
        return (
          <div
            key={`minor-${second}`}
            style={{ left: `${second * pixelsPerSecond}px` }}
            className="absolute bottom-0 w-px h-2 bg-[#2d3748]"
          />
        );
      })}

      {/* 5-second major ticks with text labels */}
      {majorTicks.map((second) => (
        <div
          key={`major-${second}`}
          style={{ left: `${second * pixelsPerSecond}px` }}
          className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
        >
          <span className="text-[10px] font-mono font-medium text-slate-400 pl-1">
            {formatSecondsToTime(second)}
          </span>
          <div className="w-px h-3.5 bg-slate-400" />
        </div>
      ))}
    </div>
  );
};
