import React from 'react';
import { LayoutTemplate, Sparkles, Smartphone, Monitor, Instagram, Youtube } from 'lucide-react';

export const TemplatePanel: React.FC = () => {
  const templates = [
    {
      title: 'TikTok & Reels Viral Hook',
      ratio: '9:16',
      icon: Smartphone,
      duration: '15s',
      desc: 'Fast cut cadence with animated punch captions and sound triggers',
    },
    {
      title: 'YouTube Cinematic Intro',
      ratio: '16:9',
      icon: Youtube,
      duration: '30s',
      desc: 'Letterboxed title reveal with bass riser audio sync',
    },
    {
      title: 'Instagram Carousel Teaser',
      ratio: '1:1',
      icon: Instagram,
      duration: '20s',
      desc: 'Clean square frame with modern minimalist lower thirds',
    },
    {
      title: 'Product Pitch Showreel',
      ratio: '16:9',
      icon: Monitor,
      duration: '45s',
      desc: 'Bento-style multi-screen layout with smooth slide transitions',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#11141a] text-slate-200 select-none">
      <div className="p-3.5 border-b border-[#212734]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Story Templates</h2>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Phase 4</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">Pre-built motion graphics, audio sync, and layout structures.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {templates.map((tpl, idx) => {
          const Icon = tpl.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded border border-[#212734] bg-[#161a22] hover:bg-[#1c222e] hover:border-emerald-500/40 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#212734] flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {tpl.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-[#0e1117] border border-[#262c3b]">{tpl.ratio}</span>
                  <span>{tpl.duration}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-8">{tpl.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
