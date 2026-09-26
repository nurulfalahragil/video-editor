import React, { useState } from 'react';
import {
  Video,
  Undo2,
  Redo2,
  Save,
  Play,
  Share2,
  Download,
  Settings,
  User,
  CheckCircle2,
  Edit2,
  Check,
  Film,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

export const TopBar: React.FC = () => {
  const {
    project,
    setProjectName,
    saveStatus,
    undo,
    redo,
    canUndo,
    canRedo,
    isPlaying,
    togglePlayPause,
    triggerSave,
  } = useEditorStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(project.name);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setProjectName(tempName.trim());
    } else {
      setTempName(project.name);
    }
    setIsEditingName(false);
  };

  return (
    <>
      <header className="h-12 bg-[#0e1117] border-b border-[#1f2633] px-3.5 flex items-center justify-between shrink-0 select-none z-30">
        {/* Left: Brand & Editable Project Name */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center shadow-sm shadow-sky-950 text-white">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold tracking-tight text-white uppercase whitespace-nowrap">
              AI Video Studio
            </span>
          </div>

          <div className="h-4 w-px bg-[#232a39]" />

          {/* Project Name & Save Status */}
          <div className="flex items-center gap-2 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSubmit();
                    if (e.key === 'Escape') {
                      setTempName(project.name);
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="bg-[#171d28] border border-sky-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none w-44"
                />
                <button
                  onClick={handleNameSubmit}
                  className="p-1 text-sky-400 hover:text-white"
                  title="Confirm"
                  aria-label="Confirm project name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempName(project.name);
                  setIsEditingName(true);
                }}
                className="group flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#1a202c] text-xs font-medium text-slate-200 transition-colors max-w-[200px]"
                title="Click to rename project"
                aria-label="Rename project"
              >
                <span className="truncate">{project.name}</span>
                <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {/* Save Status Indicator */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap">
              <CheckCircle2 className="w-3 h-3" />
              <span>{saveStatus}</span>
            </div>
          </div>
        </div>

        {/* Center / Left-Center: Undo & Redo */}
        <div className="flex items-center gap-1 bg-[#131720] border border-[#232a39] rounded-md p-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? 'text-slate-200 hover:text-white hover:bg-[#202634]'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
            aria-label="Undo action"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo
                ? 'text-slate-200 hover:text-white hover:bg-[#202634]'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo action"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Save */}
          <button
            onClick={triggerSave}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#171c26] hover:bg-[#1e2432] border border-[#273042] text-xs font-medium text-slate-200 hover:text-white transition-colors"
            title="Save Project"
            aria-label="Save project"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Quick Preview Toggle */}
          <button
            onClick={togglePlayPause}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-medium transition-colors ${
              isPlaying
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-[#171c26] hover:bg-[#1e2432] border-[#273042] text-slate-200 hover:text-white'
            }`}
            title="Toggle Preview (Space)"
            aria-label="Toggle preview playback"
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Preview'}</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-sm transition-colors"
            title="Export Video"
            aria-label="Export video"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1a202c] transition-colors"
            title="Project Settings"
            aria-label="Open project settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile */}
          <div
            className="w-7 h-7 rounded-full bg-[#1b2230] border border-[#2b3548] flex items-center justify-center text-slate-300 hover:border-sky-400 transition-colors cursor-pointer"
            title="User Profile"
            aria-label="User profile"
          >
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </header>

      {/* Export Modal Placeholder */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-[#273144] rounded-lg max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#212a3b]">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">Export Video</h3>
              </div>
              <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded">
                Phase 5 Engine
              </span>
            </div>
            <div className="py-4 space-y-3 text-xs text-slate-300">
              <div className="bg-[#171d2a] p-3 rounded border border-[#242e40] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolution</span>
                  <span className="font-mono text-white">1920 × 1080 (FHD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frame Rate</span>
                  <span className="font-mono text-white">30 fps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Codec</span>
                  <span className="font-mono text-white">H.264 / AAC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Duration</span>
                  <span className="font-mono text-white">00:30.00</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Client-side WebAssembly FFmpeg and hardware-accelerated video rendering pipeline will be enabled in Phase 5.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-3 py-1.5 rounded bg-[#202737] hover:bg-[#2b354a] text-xs font-medium text-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-[#273144] rounded-lg max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#212a3b]">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-300" />
                <h3 className="text-sm font-semibold text-white">Project Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-slate-300">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Project Title</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#171d2a] border border-[#273144] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Canvas Width</label>
                  <input
                    type="number"
                    disabled
                    value={project.width}
                    className="w-full bg-[#171d2a] border border-[#273144] rounded px-3 py-1.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Canvas Height</label>
                  <input
                    type="number"
                    disabled
                    value={project.height}
                    className="w-full bg-[#171d2a] border border-[#273144] rounded px-3 py-1.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Frame Rate</label>
                <span className="text-slate-300 font-mono text-xs">{project.fps} fps (Default broadcast standard)</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-xs font-medium text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
