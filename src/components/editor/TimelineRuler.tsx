import React, { useRef, useCallback, useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { formatTime, snapTime } from '../../utils/timelineMath';

interface TimelineRulerProps {
  pixelsPerSecond: number;
  totalDuration: number;
  timelineScrollRef?: React.RefObject<HTMLDivElement | null>;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  pixelsPerSecond,
  totalDuration,
}) => {
  const { setCurrentTime, snapEnabled, snapTargets, setActiveSnapGuide } = useEditorStore();
  const rulerRef = useRef<HTMLDivElement>(null);

  // Compute dynamic intervals based on zoom / pixelsPerSecond (Section 52)
  const { majorInterval, minorInterval } = useMemo(() => {
    if (pixelsPerSecond >= 200) {
      return { majorInterval: 1, minorInterval: 0.2 };
    }
    if (pixelsPerSecond >= 100) {
      return { majorInterval: 2, minorInterval: 0.5 };
    }
    if (pixelsPerSecond >= 40) {
      return { majorInterval: 5, minorInterval: 1 };
    }
    if (pixelsPerSecond >= 20) {
      return { majorInterval: 10, minorInterval: 2 };
    }
    return { majorInterval: 30, minorInterval: 5 };
  }, [pixelsPerSecond]);

  const calculateTimeFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!rulerRef.current) return 0;
      const rect = rulerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const rawTime = Math.max(0, Math.min(totalDuration, clickX / pixelsPerSecond));

      const { snappedTime, target } = snapTime(rawTime, snapTargets, 0.15, snapEnabled);
      setActiveSnapGuide(target);
      return snappedTime;
    },
    [pixelsPerSecond, totalDuration, snapTargets, snapEnabled, setActiveSnapGuide],
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
      setActiveSnapGuide(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const majorTicks = useMemo(() => {
    const count = Math.floor(totalDuration / majorInterval) + 1;
    return Array.from({ length: count }, (_, i) => i * majorInterval);
  }, [totalDuration, majorInterval]);

  const minorTicks = useMemo(() => {
    const count = Math.floor(totalDuration / minorInterval) + 1;
    return Array.from({ length: count }, (_, i) => Number((i * minorInterval).toFixed(2)));
  }, [totalDuration, minorInterval]);

  return (
    <div
      ref={rulerRef}
      onMouseDown={handleMouseDown}
      style={{ width: `${Math.max(1, totalDuration * pixelsPerSecond)}px` }}
      className="h-7 bg-[#11141c] border-b border-[#1f2633] relative cursor-pointer select-none overflow-hidden"
    >
      {/* Minor tick marks */}
      {minorTicks.map((second) => {
        if (Math.abs(second % majorInterval) < 0.001) return null;
        return (
          <div
            key={`minor-${second}`}
            style={{ left: `${second * pixelsPerSecond}px` }}
            className="absolute bottom-0 w-px h-2 bg-[#2d3748]"
          />
        );
      })}

      {/* Major tick marks with time labels */}
      {majorTicks.map((second) => (
        <div
          key={`major-${second}`}
          style={{ left: `${second * pixelsPerSecond}px` }}
          className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
        >
          <span className="text-[10px] font-mono font-medium text-slate-400 pl-1 whitespace-nowrap">
            {formatTime(second)}
          </span>
          <div className="w-px h-3.5 bg-slate-400" />
        </div>
      ))}
    </div>
  );
};
