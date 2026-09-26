import React, { useState } from 'react';
import { Music, Volume2, Sparkles, Search, Play, Disc } from 'lucide-react';

export const AudioPanel: React.FC = () => {
  const [category, setCategory] = useState<'music' | 'sfx' | 'voice'>('music');
  const [searchQuery, setSearchQuery] = useState('');

  const tracks = [
    { title: 'Neon Highway Horizon', artist: 'Retrowave Soundlab', duration: '02:45', bpm: '128 BPM', genre: 'Synth' },
    { title: 'Cinematic Ambient Drone', artist: 'Soundscape Studio', duration: '03:12', bpm: '90 BPM', genre: 'Atmospheric' },
    { title: 'Cyber Pulse Kick', artist: 'Future Beats', duration: '01:50', bpm: '140 BPM', genre: 'Electronic' },
    { title: 'Acoustic Morning Glow', artist: 'Folk Trio', duration: '02:18', bpm: '105 BPM', genre: 'Acoustic' },
  ];

  const sfx = [
    { title: 'Deep Sub Whoosh', category: 'Transitions', duration: '00:01' },
    { title: 'Camera Shutter Click', category: 'Foley', duration: '00:00' },
    { title: 'Sci-Fi Hologram Beep', category: 'Interface', duration: '00:02' },
    { title: 'Cinematic Impact Hit', category: 'Trailer', duration: '00:03' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#11141a] text-slate-200 select-none">
      <div className="p-3.5 border-b border-[#212734]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Audio Library</h2>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Phase 2</span>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search music & SFX..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161a22] border border-[#262c3b] rounded text-xs pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCategory('music')}
            className={`px-3 py-1 text-[11px] font-medium rounded transition-colors ${
              category === 'music'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a202c]'
            }`}
          >
            Music
          </button>
          <button
            onClick={() => setCategory('sfx')}
            className={`px-3 py-1 text-[11px] font-medium rounded transition-colors ${
              category === 'sfx'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a202c]'
            }`}
          >
            Sound Effects
          </button>
          <button
            onClick={() => setCategory('voice')}
            className={`px-3 py-1 text-[11px] font-medium rounded transition-colors ${
              category === 'voice'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a202c]'
            }`}
          >
            Voiceover
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {category === 'music' && (
          <>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">Royalty Free Music</div>
            {tracks.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded border border-[#212734] bg-[#161a22] hover:bg-[#1c222e] hover:border-purple-500/40 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-slate-200 truncate">{t.title}</div>
                    <div className="text-[10px] text-slate-500">{t.artist}</div>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <div className="text-[10px] font-mono text-slate-400">{t.duration}</div>
                  <div className="text-[9px] text-slate-500">{t.bpm}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {category === 'sfx' && (
          <>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">Curated SFX Library</div>
            {sfx.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded border border-[#212734] bg-[#161a22] hover:bg-[#1c222e] hover:border-purple-500/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">{s.title}</div>
                    <div className="text-[10px] text-slate-500">{s.category}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{s.duration}</span>
              </div>
            ))}
          </>
        )}

        {category === 'voice' && (
          <div className="p-4 text-center border border-dashed border-[#262c3b] rounded-lg bg-[#141821] my-4">
            <Disc className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-pulse" />
            <h4 className="text-xs font-semibold text-slate-200">AI Voiceover & Recording</h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Record microphone directly to audio track or generate multi-voice synthetic voiceovers in Phase 4.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
