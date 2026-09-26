import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Move,
  Maximize2,
  RotateCw,
  Eye,
  Volume2,
  VolumeX,
  Wand2,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight,
  Clock,
  Scissors,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { formatBytes } from '../../utils/mediaMetadata';
import { formatTime, parseTimeString, MIN_CLIP_DURATION } from '../../utils/timelineMath';

export const InspectorPanel: React.FC = () => {
  const {
    selectedClip,
    updateClip,
    tracks,
    getAssetById,
    pushSnapshot,
  } = useEditorStore();

  const [expandedSections, setExpandedSections] = useState({
    transform: true,
    audio: true,
    effects: false,
    animation: false,
  });

  // Local state for direct time inputs (Section 45 & 46)
  const [startTimeInput, setStartTimeInput] = useState('');
  const [durationInput, setDurationInput] = useState('');

  useEffect(() => {
    if (selectedClip) {
      setStartTimeInput(formatTime(selectedClip.startTime));
      setDurationInput(formatTime(selectedClip.duration));
    }
  }, [selectedClip?.id, selectedClip?.startTime, selectedClip?.duration]);

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clipTrack = selectedClip
    ? tracks.find((t) => t.id === selectedClip.trackId)
    : undefined;

  const clipAsset = selectedClip?.assetId
    ? getAssetById(selectedClip.assetId)
    : undefined;

  // Commit Start Time edit (Section 45)
  const handleStartTimeCommit = () => {
    if (!selectedClip) return;
    const parsed = parseTimeString(startTimeInput);
    if (parsed !== null && parsed >= 0) {
      pushSnapshot('Change Clip Start Time');
      updateClip(selectedClip.id, { startTime: Number(parsed.toFixed(2)) });
    } else {
      setStartTimeInput(formatTime(selectedClip.startTime));
    }
  };

  // Commit Duration edit (Section 46)
  const handleDurationCommit = () => {
    if (!selectedClip) return;
    const parsed = parseTimeString(durationInput);
    if (parsed !== null && parsed >= MIN_CLIP_DURATION) {
      let maxDuration = Infinity;
      if (selectedClip.sourceDuration !== Infinity) {
        maxDuration = selectedClip.sourceDuration - selectedClip.trimStart;
      }
      const clamped = Math.min(maxDuration, parsed);
      pushSnapshot('Change Clip Duration');
      updateClip(selectedClip.id, {
        duration: Number(clamped.toFixed(2)),
        trimEnd: selectedClip.trimStart + clamped,
      });
    } else {
      setDurationInput(formatTime(selectedClip.duration));
    }
  };

  return (
    <aside
      className="w-72 bg-[#0e1117] border-l border-[#1c222e] flex flex-col h-full shrink-0 select-none overflow-hidden"
      aria-label="Inspector Properties Panel"
    >
      {/* Header */}
      <div className="h-10 border-b border-[#1f2633] px-3.5 flex items-center justify-between shrink-0 bg-[#0e1117]">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Properties
          </h2>
        </div>
        {selectedClip && (
          <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded truncate max-w-[120px]">
            {selectedClip.name}
          </span>
        )}
      </div>

      {/* Content */}
      {!selectedClip ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
          <div className="w-10 h-10 rounded-full bg-[#161a24] border border-[#232b3b] flex items-center justify-center text-slate-400 mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-300">No object selected</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
            Select a timeline clip to edit its position, duration, trim, and properties.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
          {/* Clip Summary & Timing Card (Sections 44, 45, 46) */}
          <div className="p-3 bg-[#131720] rounded border border-[#222938] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Name</span>
              <span className="font-medium text-slate-200 truncate max-w-[140px]" title={selectedClip.name}>
                {selectedClip.name}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Type</span>
              <span className="font-medium capitalize text-sky-400 font-mono text-[11px]">
                {selectedClip.type}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Track</span>
              <span className="font-mono text-slate-300 text-[11px]">
                {clipTrack?.name || 'Track'}
              </span>
            </div>

            {/* Direct Start Time Input (Section 45) */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1e2535]">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Start</span>
              </span>
              <input
                type="text"
                value={startTimeInput}
                onChange={(e) => setStartTimeInput(e.target.value)}
                onBlur={handleStartTimeCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStartTimeCommit();
                  if (e.key === 'Escape') setStartTimeInput(formatTime(selectedClip.startTime));
                }}
                className="w-24 bg-[#181f2c] border border-[#273244] focus:border-sky-500 rounded px-1.5 py-0.5 text-right font-mono text-xs text-white focus:outline-none"
              />
            </div>

            {/* Direct Duration Input (Section 46) */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Duration</span>
              </span>
              <input
                type="text"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                onBlur={handleDurationCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDurationCommit();
                  if (e.key === 'Escape') setDurationInput(formatTime(selectedClip.duration));
                }}
                className="w-24 bg-[#181f2c] border border-[#273244] focus:border-sky-500 rounded px-1.5 py-0.5 text-right font-mono text-xs text-white focus:outline-none"
              />
            </div>

            {/* Trim Start & Trim End Display (Section 44) */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono pt-1">
              <div className="bg-[#171c27] p-1.5 rounded border border-[#252e3f] flex items-center justify-between">
                <span className="text-slate-500">Trim In:</span>
                <span className="text-slate-300">{formatTime(selectedClip.trimStart)}</span>
              </div>
              <div className="bg-[#171c27] p-1.5 rounded border border-[#252e3f] flex items-center justify-between">
                <span className="text-slate-500">Trim Out:</span>
                <span className="text-slate-300">{formatTime(selectedClip.trimEnd)}</span>
              </div>
            </div>

            {clipAsset && (
              <div className="pt-1.5 border-t border-[#1d2433] flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Source Asset</span>
                <span className="font-mono text-slate-400 text-[10px]">
                  {formatBytes(clipAsset.size)}
                  {clipAsset.width && clipAsset.height ? ` · ${clipAsset.width}×${clipAsset.height}` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Section: Audio & Volume */}
          <div className="rounded border border-[#202737] bg-[#11141c] overflow-hidden">
            <button
              onClick={() => toggleSection('audio')}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-[#161b26] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Audio</span>
              </div>
              {expandedSections.audio ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {expandedSections.audio && (
              <div className="p-3 pt-1 border-t border-[#1d2331] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Mute Clip</span>
                  <button
                    onClick={() => {
                      pushSnapshot('Toggle Clip Mute');
                      updateClip(selectedClip.id, { muted: !selectedClip.muted });
                    }}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      selectedClip.muted
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-[#181f2c] text-slate-300 border border-[#273244]'
                    }`}
                  >
                    {selectedClip.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    <span>{selectedClip.muted ? 'Muted' : 'Unmuted'}</span>
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Clip Volume</span>
                    <span className="font-mono text-slate-300 text-[10px]">
                      {selectedClip.volume ?? 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={selectedClip.volume ?? 100}
                    onChange={(e) =>
                      updateClip(selectedClip.id, { volume: Number(e.target.value) })
                    }
                    onMouseUp={() => pushSnapshot('Change Clip Volume')}
                    className="w-full h-1 bg-[#232b3b] rounded appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Transform */}
          <div className="rounded border border-[#202737] bg-[#11141c] overflow-hidden">
            <button
              onClick={() => toggleSection('transform')}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-[#161b26] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Move className="w-3.5 h-3.5 text-sky-400" />
                <span>Transform</span>
              </div>
              {expandedSections.transform ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {expandedSections.transform && (
              <div className="p-3 pt-1 border-t border-[#1d2331] space-y-3">
                {/* Position (X, Y) */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Position</span>
                    <span className="font-mono text-slate-300 text-[10px]">
                      {selectedClip.transform.x}, {selectedClip.transform.y}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center bg-[#171c27] rounded border border-[#252e3f] px-2 py-1">
                      <span className="text-[10px] text-slate-500 font-mono mr-1.5">X:</span>
                      <input
                        type="number"
                        value={selectedClip.transform.x}
                        onChange={(e) =>
                          updateClip(selectedClip.id, {
                            transform: { ...selectedClip.transform, x: Number(e.target.value) },
                          })
                        }
                        onBlur={() => pushSnapshot('Change Position X')}
                        className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center bg-[#171c27] rounded border border-[#252e3f] px-2 py-1">
                      <span className="text-[10px] text-slate-500 font-mono mr-1.5">Y:</span>
                      <input
                        type="number"
                        value={selectedClip.transform.y}
                        onChange={(e) =>
                          updateClip(selectedClip.id, {
                            transform: { ...selectedClip.transform, y: Number(e.target.value) },
                          })
                        }
                        onBlur={() => pushSnapshot('Change Position Y')}
                        className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-slate-500" />
                      <span>Scale</span>
                    </span>
                    <span className="font-mono text-slate-300 text-[10px]">
                      {selectedClip.transform.scale}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={selectedClip.transform.scale}
                    onChange={(e) =>
                      updateClip(selectedClip.id, {
                        transform: { ...selectedClip.transform, scale: Number(e.target.value) },
                      })
                    }
                    onMouseUp={() => pushSnapshot('Change Scale')}
                    className="w-full h-1 bg-[#232b3b] rounded appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-slate-500" />
                      <span>Rotation</span>
                    </span>
                    <span className="font-mono text-slate-300 text-[10px]">
                      {selectedClip.transform.rotation}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={selectedClip.transform.rotation}
                    onChange={(e) =>
                      updateClip(selectedClip.id, {
                        transform: { ...selectedClip.transform, rotation: Number(e.target.value) },
                      })
                    }
                    onMouseUp={() => pushSnapshot('Change Rotation')}
                    className="w-full h-1 bg-[#232b3b] rounded appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-500" />
                      <span>Opacity</span>
                    </span>
                    <span className="font-mono text-slate-300 text-[10px]">
                      {selectedClip.transform.opacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedClip.transform.opacity}
                    onChange={(e) =>
                      updateClip(selectedClip.id, {
                        transform: { ...selectedClip.transform, opacity: Number(e.target.value) },
                      })
                    }
                    onMouseUp={() => pushSnapshot('Change Opacity')}
                    className="w-full h-1 bg-[#232b3b] rounded appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
