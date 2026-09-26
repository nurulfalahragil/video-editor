import React, { useState } from 'react';
import {
  Sliders,
  Move,
  Maximize2,
  RotateCw,
  Eye,
  Volume2,
  Wand2,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight,
  FileVideo,
  Film,
} from 'lucide-react';
import { useEditorStore, formatTimecode } from '../../store/editorStore';
import { formatBytes } from '../../utils/mediaMetadata';

export const InspectorPanel: React.FC = () => {
  const {
    selectedClip,
    updateClipTransform,
    updateClipAudio,
    tracks,
    getAssetById,
  } = useEditorStore();

  const [expandedSections, setExpandedSections] = useState({
    transform: true,
    audio: true,
    effects: false,
    animation: false,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clipTrack = selectedClip
    ? tracks.find((t) => t.id === selectedClip.trackId)
    : undefined;

  const clipAsset = selectedClip?.assetId
    ? getAssetById(selectedClip.assetId)
    : undefined;

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
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
          <div className="w-10 h-10 rounded-full bg-[#161a24] border border-[#232b3b] flex items-center justify-center text-slate-400 mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-300">No object selected</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
            Select an object to edit its properties.
          </p>
        </div>
      ) : (
        /* Populated Inspector */
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
          {/* Section 23: Clip Summary Card */}
          <div className="p-3 bg-[#131720] rounded border border-[#222938] space-y-2">
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
                {clipTrack?.name || 'Track 1'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Start</span>
              <span className="font-mono text-slate-200 text-[11px]">
                {formatTimecode(selectedClip.startTime)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Duration</span>
              <span className="font-mono text-slate-200 text-[11px]">
                {formatTimecode(selectedClip.duration)}
              </span>
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
                      {selectedClip.transform.position.x}, {selectedClip.transform.position.y}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center bg-[#171c27] rounded border border-[#252e3f] px-2 py-1">
                      <span className="text-[10px] text-slate-500 font-mono mr-1.5">X:</span>
                      <input
                        type="number"
                        value={selectedClip.transform.position.x}
                        onChange={(e) =>
                          updateClipTransform(selectedClip.id, {
                            position: {
                              ...selectedClip.transform.position,
                              x: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center bg-[#171c27] rounded border border-[#252e3f] px-2 py-1">
                      <span className="text-[10px] text-slate-500 font-mono mr-1.5">Y:</span>
                      <input
                        type="number"
                        value={selectedClip.transform.position.y}
                        onChange={(e) =>
                          updateClipTransform(selectedClip.id, {
                            position: {
                              ...selectedClip.transform.position,
                              y: Number(e.target.value),
                            },
                          })
                        }
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
                      updateClipTransform(selectedClip.id, {
                        scale: Number(e.target.value),
                      })
                    }
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
                      updateClipTransform(selectedClip.id, {
                        rotation: Number(e.target.value),
                      })
                    }
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
                      updateClipTransform(selectedClip.id, {
                        opacity: Number(e.target.value),
                      })
                    }
                    className="w-full h-1 bg-[#232b3b] rounded appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Audio */}
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
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Clip Volume</span>
                    <span className="font-mono text-slate-300 text-[10px]">
                      {selectedClip.audio?.volume ?? 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedClip.audio?.volume ?? 100}
                    onChange={(e) =>
                      updateClipAudio(selectedClip.id, { volume: Number(e.target.value) })
                    }
                    className="w-full h-1 bg-[#232b3b] rounded appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                  <div className="bg-[#171c27] p-2 rounded border border-[#252e3f]">
                    Fade In: {selectedClip.audio?.fadeIn ?? 0}s
                  </div>
                  <div className="bg-[#171c27] p-2 rounded border border-[#252e3f]">
                    Fade Out: {selectedClip.audio?.fadeOut ?? 0}s
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Effects (Placeholder for future phases) */}
          <div className="rounded border border-[#202737] bg-[#11141c] overflow-hidden">
            <button
              onClick={() => toggleSection('effects')}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-[#161b26] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Effects</span>
              </div>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Phase 3
              </span>
            </button>

            {expandedSections.effects && (
              <div className="p-3 pt-1 border-t border-[#1d2331] text-xs text-slate-400">
                No active shader effects attached to this clip. Add effects from the Effects library in Phase 3.
              </div>
            )}
          </div>

          {/* Section: Animation (Placeholder for future phases) */}
          <div className="rounded border border-[#202737] bg-[#11141c] overflow-hidden">
            <button
              onClick={() => toggleSection('animation')}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-[#161b26] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Animation & Keyframes</span>
              </div>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Phase 3
              </span>
            </button>

            {expandedSections.animation && (
              <div className="p-3 pt-1 border-t border-[#1d2331] text-xs text-slate-400">
                Keyframe curve editor (Bezier interpolation, ease in/out) will be enabled in Phase 3.
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
