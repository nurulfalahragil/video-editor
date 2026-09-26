import React, { useRef, useState, useEffect } from 'react';
import { AspectRatio } from '../../types/editor';
import { useEditorStore } from '../../store/editorStore';
import { PreviewControls } from './PreviewControls';
import { Monitor, Music, Film, Image as ImageIcon } from 'lucide-react';

export const PreviewPanel: React.FC = () => {
  const {
    project,
    setAspectRatio,
    previewQuality,
    setPreviewQuality,
    selectedClip,
    currentTime,
    setCurrentTime,
    clips,
    isPlaying,
    setIsPlaying,
    volume,
    isMuted,
    selectedAsset,
    getAssetById,
  } = useEditorStore();

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isSeekingRef = useRef(false);

  const toggleFullscreen = () => {
    if (!previewContainerRef.current) return;
    if (!document.fullscreenElement) {
      previewContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Find active timeline clips at currentTime
  const activeTimelineClips = clips.filter(
    (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration,
  );

  // Dominant active visual clip (video, overlay, or image)
  const activeVisualClip =
    activeTimelineClips.find(
      (c) => c.type === 'video' || c.type === 'overlay' || c.type === 'image',
    ) || activeTimelineClips[0];

  // Active audio clip
  const activeAudioClip = activeTimelineClips.find((c) => c.type === 'audio');

  // Resolved asset for the active clip
  const clipAsset = activeVisualClip?.assetId
    ? getAssetById(activeVisualClip.assetId)
    : undefined;

  const audioClipAsset = activeAudioClip?.assetId
    ? getAssetById(activeAudioClip.assetId)
    : undefined;

  // Determine what is currently being previewed:
  // Priority 1: Active clip on timeline at current playhead
  // Priority 2: Selected media asset from library (if no active timeline clip)
  const isPreviewingTimelineClip = Boolean(activeVisualClip);
  const activeAsset = isPreviewingTimelineClip ? clipAsset : selectedAsset;

  // Sync Video Element with Timeline Playhead & State
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume / 100;
    video.muted = isMuted;

    // Calculate target time inside the video
    let targetTime = 0;
    if (isPreviewingTimelineClip && activeVisualClip) {
      targetTime = Math.max(0, currentTime - activeVisualClip.startTime);
      if (typeof activeVisualClip.trimStart === 'number') {
        targetTime += activeVisualClip.trimStart;
      }
    } else {
      targetTime = currentTime;
    }

    // Only seek if difference is noticeable (> 0.15s) to avoid micro-jitter during smooth playback
    if (!isSeekingRef.current && Math.abs(video.currentTime - targetTime) > 0.18) {
      isSeekingRef.current = true;
      video.currentTime = targetTime;
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 50);
    }

    if (isPlaying) {
      video.play().catch(() => {
        // Autoplay policy or error catch
      });
    } else {
      video.pause();
    }
  }, [
    currentTime,
    isPlaying,
    volume,
    isMuted,
    isPreviewingTimelineClip,
    activeVisualClip,
  ]);

  // Sync Audio Element (when audio clip is active or audio asset previewed)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume / 100;
    audio.muted = isMuted;

    let targetTime = 0;
    if (activeAudioClip) {
      targetTime = Math.max(0, currentTime - activeAudioClip.startTime);
    } else {
      targetTime = currentTime;
    }

    if (Math.abs(audio.currentTime - targetTime) > 0.2) {
      audio.currentTime = targetTime;
    }

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentTime, isPlaying, volume, isMuted, activeAudioClip]);

  return (
    <div
      ref={previewContainerRef}
      className="flex-1 flex flex-col h-full bg-[#0a0c10] border-r border-[#1c222e] select-none min-w-[320px] relative overflow-hidden"
    >
      {/* Top Preview Monitor Bar */}
      <div className="h-8 bg-[#0e1117] border-b border-[#1f2633] px-3 flex items-center justify-between shrink-0 text-slate-300 text-xs">
        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-400">
            {isPreviewingTimelineClip
              ? `Timeline Monitor: ${activeVisualClip?.name}`
              : selectedAsset
              ? `Source Preview: ${selectedAsset.name}`
              : 'Program Viewport'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">
              Ratio:
            </span>
            <select
              value={project.aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="bg-[#171d28] border border-[#273144] rounded px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="16:9">16:9 (Landscape FHD)</option>
              <option value="9:16">9:16 (Vertical Reels/TikTok)</option>
              <option value="1:1">1:1 (Square Post)</option>
              <option value="4:5">4:5 (Social Feed)</option>
              <option value="4:3">4:3 (Classic Academy)</option>
            </select>
          </div>

          <div className="h-3 w-px bg-[#232b3b]" />

          {/* Preview Quality Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">
              Quality:
            </span>
            <select
              value={previewQuality}
              onChange={(e) => setPreviewQuality(e.target.value as any)}
              className="bg-[#171d28] border border-[#273144] rounded px-1.5 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="Full">Full (1080p)</option>
              <option value="1/2">1/2 (540p)</option>
              <option value="1/4">1/4 (270p)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-[#08090d] relative overflow-hidden">
        {/* Subtle Canvas Dot Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Dynamic Aspect Ratio Canvas */}
        <div
          className={`relative bg-[#000000] rounded-sm shadow-2xl border border-[#222938] flex items-center justify-center transition-all duration-300 max-h-full max-w-full overflow-hidden ${
            project.aspectRatio === '16:9'
              ? 'aspect-video w-[92%]'
              : project.aspectRatio === '9:16'
              ? 'aspect-[9/16] h-[92%]'
              : project.aspectRatio === '1:1'
              ? 'aspect-square h-[90%]'
              : project.aspectRatio === '4:5'
              ? 'aspect-[4/5] h-[90%]'
              : 'aspect-[4/3] w-[80%]'
          }`}
        >
          {/* Safe Area Guides */}
          <div className="absolute inset-[5%] border border-dashed border-white/5 pointer-events-none z-20" />
          <div className="absolute inset-[10%] border border-dashed border-white/5 pointer-events-none z-20" />

          {/* Center Crosshair */}
          <div className="absolute w-3 h-px bg-white/20 pointer-events-none z-20" />
          <div className="absolute h-3 w-px bg-white/20 pointer-events-none z-20" />

          {/* RENDER ACTIVE VIDEO, IMAGE, OR AUDIO */}
          {activeAsset ? (
            <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
              {activeAsset.type === 'video' ? (
                /* REAL HTML5 VIDEO PLAYER */
                <div
                  style={
                    activeVisualClip
                      ? {
                          transform: `translate(${activeVisualClip.transform.position.x}px, ${activeVisualClip.transform.position.y}px) scale(${
                            activeVisualClip.transform.scale / 100
                          }) rotate(${activeVisualClip.transform.rotation}deg)`,
                          opacity: activeVisualClip.transform.opacity / 100,
                        }
                      : {}
                  }
                  className="w-full h-full flex items-center justify-center relative transition-transform duration-75"
                >
                  <video
                    ref={videoRef}
                    src={activeAsset.url}
                    playsInline
                    preload="auto"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : activeAsset.type === 'image' ? (
                /* REAL IMAGE VIEWER */
                <div
                  style={
                    activeVisualClip
                      ? {
                          transform: `translate(${activeVisualClip.transform.position.x}px, ${activeVisualClip.transform.position.y}px) scale(${
                            activeVisualClip.transform.scale / 100
                          }) rotate(${activeVisualClip.transform.rotation}deg)`,
                          opacity: activeVisualClip.transform.opacity / 100,
                        }
                      : {}
                  }
                  className="w-full h-full flex items-center justify-center relative"
                >
                  <img
                    src={activeAsset.url}
                    alt={activeAsset.name}
                    className="max-w-full max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                /* AUDIO PLAYER VISUALIZER */
                <div className="flex flex-col items-center justify-center text-center p-6 text-purple-400">
                  <audio ref={audioRef} src={activeAsset.url} preload="auto" />
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3 shadow-lg">
                    <Music className="w-8 h-8 text-purple-300" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 max-w-xs truncate">
                    {activeAsset.name}
                  </h4>
                  <p className="text-[11px] font-mono text-purple-300/80 mt-1">
                    Audio Track · {activeAsset.duration ? `${activeAsset.duration.toFixed(1)}s` : ''}
                  </p>
                  {/* Subtle simulated audio bar visualizer */}
                  <div className="flex items-center gap-1 mt-4 h-6">
                    {[16, 28, 20, 36, 44, 24, 32, 48, 20, 14, 30, 42, 26, 18].map((h, i) => (
                      <span
                        key={i}
                        style={{
                          height: isPlaying ? `${Math.min(24, (h * (i % 2 === 0 ? 0.7 : 0.9)))}px` : '4px',
                        }}
                        className="w-1 bg-purple-400/80 rounded-full transition-all duration-150"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Selection bounding box overlay if a clip is active */}
              {selectedClip && selectedClip.id === activeVisualClip?.id && (
                <div className="absolute inset-0 pointer-events-none border-2 border-sky-400/60 z-30">
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-sky-400 border border-white" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-sky-400 border border-white" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-sky-400 border border-white" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-sky-400 border border-white" />
                </div>
              )}
            </div>
          ) : (
            /* Centered default placeholder as required in Section 6 */
            <div className="flex flex-col items-center justify-center text-center p-6 select-none">
              <span className="text-base font-semibold tracking-wide text-slate-500 uppercase">
                Preview
              </span>
              <span className="text-xs text-slate-600 mt-1">
                {clips.length === 0
                  ? 'Upload and drag media into timeline'
                  : 'No active clip at playhead'}
              </span>
            </div>
          )}

          {/* Aspect ratio and FPS indicator */}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10 text-[9px] font-mono text-slate-400 z-30">
            {project.aspectRatio} · {project.fps}fps
          </div>
        </div>
      </div>

      {/* Underneath Preview Player Controls */}
      <PreviewControls
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
    </div>
  );
};
