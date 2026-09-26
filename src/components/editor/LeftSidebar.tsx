import React from 'react';
import {
  FolderOpen,
  Music,
  Type,
  Subtitles,
  ArrowLeftRight,
  Wand2,
  Palette,
  LayoutTemplate,
} from 'lucide-react';
import { SidebarTab } from '../../types/editor';
import { useEditorStore } from '../../store/editorStore';

interface SidebarItem {
  id: SidebarTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'media', label: 'Media', icon: FolderOpen },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'subtitle', label: 'Subtitle', icon: Subtitles },
  { id: 'transitions', label: 'Transitions', icon: ArrowLeftRight },
  { id: 'effects', label: 'Effects', icon: Wand2 },
  { id: 'filters', label: 'Filters', icon: Palette },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
];

export const LeftSidebar: React.FC = () => {
  const { activePanel, setActivePanel } = useEditorStore();

  return (
    <nav
      className="w-16 bg-[#0a0d12] border-r border-[#1c222e] flex flex-col items-center py-2.5 space-y-1 shrink-0 select-none z-20"
      aria-label="Editor Panels"
    >
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activePanel === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`w-13.5 h-13 rounded-lg flex flex-col items-center justify-center transition-all group relative ${
              isActive
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151922]'
            }`}
            title={item.label}
            aria-label={item.label}
            aria-pressed={isActive}
          >
            {/* Active Left Indicator Bar */}
            {isActive && (
              <span className="absolute -left-1 top-2.5 bottom-2.5 w-1 bg-sky-500 rounded-r" />
            )}

            <Icon
              className={`w-4 h-4 mb-1 transition-transform group-hover:scale-110 ${
                isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            />
            <span
              className={`text-[9.5px] font-medium tracking-tight uppercase ${
                isActive ? 'text-sky-300 font-semibold' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
