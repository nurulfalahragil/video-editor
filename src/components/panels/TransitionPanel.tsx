import React, { useState } from 'react';
import { ArrowLeftRight, Sparkles, Search } from 'lucide-react';

export const TransitionPanel: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const transitions = [
    { name: 'Cross Dissolve', duration: '1.0s', type: 'Basic' },
    { name: 'Fade to Black', duration: '0.8s', type: 'Basic' },
    { name: 'Dip to White', duration: '0.5s', type: 'Basic' },
    { name: 'Whip Pan Right', duration: '0.4s', type: 'Motion' },
    { name: 'Zoom In Punch', duration: '0.5s', type: 'Motion' },
    { name: 'Glitch Displacement', duration: '0.3s', type: 'Dynamic' },
    { name: 'Directional Blur Push', duration: '0.6s', type: 'Motion' },
    { name: 'Clock Wipe', duration: '1.2s', type: 'Wipe' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#11141a] text-slate-200 select-none">
      <div className="p-3.5 border-b border-[#212734]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-pink-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Transitions</h2>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Phase 3</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">Drag transitions between adjacent timeline clips.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
        {transitions.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded border border-[#212734] bg-[#161a22] hover:bg-[#1c222e] hover:border-pink-500/40 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded bg-[#0f1218] border border-[#262c3b] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform text-pink-400">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-pink-300 transition-colors">
              {item.name}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">{item.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
