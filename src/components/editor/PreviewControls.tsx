import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import { useEditorStore, formatTimecode } from '../../store/editorStore';

interface PreviewControlsProps {
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  onToggleFullscreen,
  isFullscreen,
}) => {
  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    togglePlayPause,
    project,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = useEditorStore();

  const handleSkipBack = () => {
    setCurrentTime(0);
  };

  const handleSkipForward = () => {
    setCurrentTime(project.duration);
  };

  const handleStepBackFrame = () => {
    setCurrentTime(Math.max(0, currentTime - 1 / project.fps));
  };

  const handleStepForwardFrame = () => {
    setCurrentTime(Math.min(project.duration, currentTime + 1 / project.fps));
  };

  return (
    <div className="h-10 bg-[#0e1117] border-t border-[#1f2633] px-3 flex items-center justify-between shrink-0 select-none text-slate-300">
      {/* Left: Timecode Display */}
      <div className="flex items-center gap-1.5 text-xs font-mono font-medium tracking-tight">
        <span className="text-white tabular-nums bg-[#151a24] px-1.5 py-0.5 rounded border border-[#232b3b]">
          {formatTimecode(currentTime)}
        </span>
        <span className="text-slate-500">/</span>
        <span className="text-slate-400 tabular-nums">
          {formatTimecode(project.duration)}
        </span>
      </div>

      {/* Center: Playback Transport Buttons */}
      <div className="flex items-center gap-1">
        {/* Rewind to beginning */}
        <button
          onClick={handleSkipBack}
          className="p-1.5 rounded hover:bg-[#1a202c] text-slate-400 hover:text-slate-200 transition-colors"
          title="Jump to Start (Home)"
          aria-label="Jump to start"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Step back 1 frame */}
        <button
          onClick={handleStepBackFrame}
          className="p-1 rounded hover:bg-[#1a202c] text-slate-400 hover:text-slate-200 text-[10px] font-mono"
          title="Previous Frame"
          aria-label="Previous frame"
        >
          -1f
        </button>

        {/* Play / Pause Main Button */}
        <button
          onClick={togglePlayPause}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all mx-1 shadow-sm ${
            isPlaying
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              : 'bg-sky-500 text-white hover:bg-sky-400 hover:scale-105'
          }`}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Step forward 1 frame */}
        <button
          onClick={handleStepForwardFrame}
          className="p-1 rounded hover:bg-[#1a202c] text-slate-400 hover:text-slate-200 text-[10px] font-mono"
          title="Next Frame"
          aria-label="Next frame"
        >
          +1f
        </button>

        {/* Fast forward to end */}
        <button
          onClick={handleSkipForward}
          className="p-1.5 rounded hover:bg-[#1a202c] text-slate-400 hover:text-slate-200 transition-colors"
          title="Jump to End (End)"
          aria-label="Jump to end"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Audio Volume & Fullscreen */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 group">
          <button
            onClick={toggleMute}
            className="p-1 rounded hover:bg-[#1a202c] text-slate-400 hover:text-slate-200 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (isMuted) toggleMute();
            }}
            className="w-16 h-1 bg-[#232b3b] rounded-lg appearance-none cursor-pointer accent-sky-500"
            aria-label="Volume slider"
          />
        </div>

        <div className="h-3 w-px bg-[#232b3b]" />

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded hover:bg-[#1a202c] text-slate-400 hover:text-slate-200 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
