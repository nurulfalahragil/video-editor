import React from 'react';
import { Palette, Sparkles } from 'lucide-react';

export const FilterPanel: React.FC = () => {
  const luts = [
    { name: 'Kodak Portra 400', look: 'Warm skin tones, muted greens', previewBg: 'from-amber-700/40 via-orange-900/30 to-amber-950/50' },
    { name: 'Fuji Velvia Vivid', look: 'High saturation, rich sky blues', previewBg: 'from-blue-600/40 via-emerald-800/30 to-slate-900/60' },
    { name: 'Teal & Orange Blockbuster', look: 'Hollywood blockbuster contrast', previewBg: 'from-teal-700/40 via-cyan-900/30 to-orange-950/60' },
    { name: 'Monochrome Noir 3200', look: 'Deep blacks, fine silver grain', previewBg: 'from-neutral-600/40 via-neutral-800/40 to-black' },
    { name: 'Cyberpunk Neo Tokyo', look: 'Violet shadows, neon pink highlights', previewBg: 'from-fuchsia-700/40 via-purple-900/40 to-cyan-950/60' },
    { name: 'Bleach Bypass War', look: 'Desaturated midtones, gritty', previewBg: 'from-stone-600/40 via-stone-800/40 to-stone-950/60' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#11141a] text-slate-200 select-none">
      <div className="p-3.5 border-b border-[#212734]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Color LUTs & Filters</h2>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Phase 3</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">Color grading presets and 3D LUT look-up tables.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
        {luts.map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded border border-[#212734] bg-[#161a22] hover:bg-[#1c222e] hover:border-violet-500/40 transition-colors group cursor-pointer flex flex-col"
          >
            <div className={`h-16 w-full rounded bg-gradient-to-tr ${item.previewBg} border border-white/5 flex items-center justify-center relative overflow-hidden mb-2 group-hover:scale-[1.02] transition-transform`}>
              <span className="text-[9px] uppercase tracking-wider text-white/70 font-mono px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                LUT
              </span>
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-violet-300 transition-colors truncate">
              {item.name}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{item.look}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
