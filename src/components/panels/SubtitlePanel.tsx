import React from 'react';
import { Subtitles, Sparkles, FileText, Globe, Wand2, Mic } from 'lucide-react';

export const SubtitlePanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#11141a] text-slate-200 select-none">
      <div className="p-3.5 border-b border-[#212734]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Subtitles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Subtitles & Captions</h2>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Phase 4</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Auto subtitles promo box */}
        <div className="p-3.5 rounded-lg border border-[#2d3748] bg-gradient-to-b from-[#181d28] to-[#121620] relative overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2.5">
            <Wand2 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-100">AI Speech-to-Text Transcription</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Auto-generate synchronized caption tracks from speech audio with word-level timing and 98+ language support.
          </p>
          <button
            disabled
            className="mt-3 w-full py-1.5 px-3 rounded bg-[#222938] text-slate-400 text-xs font-medium border border-[#2f394d] cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Coming in Phase 4</span>
          </button>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">Subtitle Workflows</div>

          <div className="p-3 rounded border border-[#212734] bg-[#161a22] hover:bg-[#1c222e] transition-colors cursor-pointer group flex items-start gap-3">
            <FileText className="w-4 h-4 text-slate-400 group-hover:text-amber-400 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-slate-200">Manual Captions</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Type captions manually and time them on the Subtitle track.</div>
            </div>
          </div>

          <div className="p-3 rounded border border-[#212734] bg-[#161a22] hover:bg-[#1c222e] transition-colors cursor-pointer group flex items-start gap-3">
            <Globe className="w-4 h-4 text-slate-400 group-hover:text-amber-400 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-slate-200">Import SRT / VTT</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Import existing subtitle files into your project timeline.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
