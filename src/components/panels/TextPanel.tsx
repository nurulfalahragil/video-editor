import React, { useState } from 'react';
import { Type, Sparkles, Plus, Heading, AlignLeft, Subtitles } from 'lucide-react';

export const TextPanel: React.FC = () => {
  const [tab, setTab] = useState<'presets' | 'titles' | 'captions'>('presets');

  const textPresets = [
    { title: 'Default Title', sample: 'AI VIDEO STUDIO', style: 'font-bold text-lg tracking-wider text-white' },
    { title: 'Cinematic Minimal', sample: 'THE HORIZON', style: 'font-light tracking-[0.25em] text-slate-300 uppercase text-sm' },
    { title: 'Cyberpunk Neon', sample: 'SYSTEM ONLINE', style: 'font-mono text-cyan-400 font-bold tracking-tight text-sm drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' },
    { title: 'Bold Impact', sample: 'BREAKING NEWS', style: 'font-black italic text-amber-400 uppercase text-base' },
    { title: 'Lower Third Modern', sample: 'Alex Vance · Lead Engineer', style: 'font-medium text-xs text-slate-300 border-l-2 border-sky-500 pl-2' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#11141a] text-slate-200 select-none">
      <div className="p-3.5 border-b border-[#212734]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Typography</h2>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Phase 2</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-[#161a22] rounded border border-[#262c3b]">
          <button
            onClick={() => setTab('presets')}
            className={`py-1 text-[11px] font-medium rounded transition-colors ${
              tab === 'presets' ? 'bg-[#222938] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setTab('titles')}
            className={`py-1 text-[11px] font-medium rounded transition-colors ${
              tab === 'titles' ? 'bg-[#222938] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Titles
          </button>
          <button
            onClick={() => setTab('captions')}
            className={`py-1 text-[11px] font-medium rounded transition-colors ${
              tab === 'captions' ? 'bg-[#222938] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Captions
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-[#212734] space-y-2">
        <button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Text Track</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">Typography Styles</div>
        {textPresets.map((preset, idx) => (
          <div
            key={idx}
            className="p-3 rounded border border-[#212734] bg-[#161a22] hover:bg-[#1c222e] hover:border-emerald-500/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400">{preset.title}</span>
              <span className="text-[9px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                + Add to Timeline
              </span>
            </div>
            <div className="p-2.5 bg-[#0e1117] rounded border border-[#262c3b] flex items-center justify-center min-h-[44px]">
              <span className={preset.style}>{preset.sample}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
