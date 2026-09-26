import React from 'react';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { PreviewPanel } from './PreviewPanel';
import { InspectorPanel } from './InspectorPanel';
import { Timeline } from './Timeline';
import { StatusBar } from './StatusBar';
import { DesktopNotice } from './DesktopNotice';
import { useEditorStore } from '../../store/editorStore';

import { MediaPanel } from '../panels/MediaPanel';
import { AudioPanel } from '../panels/AudioPanel';
import { TextPanel } from '../panels/TextPanel';
import { SubtitlePanel } from '../panels/SubtitlePanel';
import { TransitionPanel } from '../panels/TransitionPanel';
import { EffectsPanel } from '../panels/EffectsPanel';
import { FilterPanel } from '../panels/FilterPanel';
import { TemplatePanel } from '../panels/TemplatePanel';

export const EditorLayout: React.FC = () => {
  const { activePanel } = useEditorStore();

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'media':
        return <MediaPanel />;
      case 'audio':
        return <AudioPanel />;
      case 'text':
        return <TextPanel />;
      case 'subtitle':
        return <SubtitlePanel />;
      case 'transitions':
        return <TransitionPanel />;
      case 'effects':
        return <EffectsPanel />;
      case 'filters':
        return <FilterPanel />;
      case 'templates':
        return <TemplatePanel />;
      default:
        return <MediaPanel />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0d12] text-slate-100 select-none">
      {/* Small Screen Warning Notice */}
      <DesktopNotice />

      {/* Top Navigation Bar */}
      <TopBar />

      {/* Middle Workspace: Left Sidebar + Active Panel + Preview Monitor + Inspector */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Vertical Left Icon Toolbar */}
        <LeftSidebar />

        {/* Active Panel Drawer (Width 280px) */}
        <div className="w-72 bg-[#11141a] border-r border-[#1c222e] flex flex-col shrink-0 overflow-hidden">
          {renderActivePanel()}
        </div>

        {/* Center Preview Viewport */}
        <PreviewPanel />

        {/* Right Inspector Panel */}
        <InspectorPanel />
      </div>

      {/* Bottom Area: Multi-track Timeline */}
      <Timeline />

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};
