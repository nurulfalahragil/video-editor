import React from 'react';
import { Wand2, Sparkles, Sliders, Zap, Sun, ShieldAlert, Cpu } from 'lucide-react';

export const EffectsPanel: React.FC = () => {
  const effects = [
    { name: 'Gaussian Blur', category: 'Blur & Sharpen', intensity: 'Adjustable' },
    { name: 'Chromatic Aberration', category: 'Stylize', intensity: 'Glitch / RGB' },
    { name: 'Vignette Halo', category: 'Lighting', intensity: 'Radial' },
    { name: 'Film Grain 35mm', category: 'Texture', intensity: 'Organic' },
    { name: 'Lens Flare Anamorphic', category: 'Lighting', intensity: 'Cinematic' },
    { name: 'Edge Glow', category: 'Stylize', intensity: 'Neon' },
    { name: 'VHS Tape Degradation', category: 'Retro', intensity: 'Static & Scanlines' },
    { name: 'Camera Shake Stasis', category: 'Motion', intensity: 'Handheld 24fps' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#11141a] text-slate-200 select-none">
      <div className="p-3.5 border-b border-[#212734]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Video Effects</h2>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Phase 3</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">Apply visual modifiers and post-processing shaders to clips.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">Shader FX Library</div>
        {effects.map((fx, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded border border-[#212734] bg-[#161a22] hover:bg-[#1c222e] hover:border-cyan-500/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {fx.name}
                </div>
                <div className="text-[10px] text-slate-500">{fx.category}</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{fx.intensity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
