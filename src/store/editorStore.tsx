import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  EditorState,
  Project,
  Track,
  Clip,
  SidebarTab,
  AspectRatio,
  PreviewQuality,
  ClipTransform,
  ClipAudio,
  HistorySnapshot,
} from '../types/editor';
import { MediaAsset } from '../types/media';

export function formatTimecode(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = Math.floor(clamped % 60);
  const hundredths = Math.floor((clamped % 1) * 100);

  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');
  const cs = hundredths.toString().padStart(2, '0');

  return `${mm}:${ss}.${cs}`;
}

export function formatSecondsToTime(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const INITIAL_PROJECT: Project = {
  id: 'proj_1',
  name: 'My First Video',
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 30.0, // 30 seconds fixed sample duration as per requirements
  aspectRatio: '16:9',
};

const INITIAL_TRACKS: Track[] = [
  { id: 'track_video', type: 'video', name: 'Video', locked: false, muted: false, visible: true },
  { id: 'track_overlay', type: 'overlay', name: 'Overlay', locked: false, muted: false, visible: true },
  { id: 'track_text', type: 'text', name: 'Text', locked: false, muted: false, visible: true },
  { id: 'track_subtitle', type: 'subtitle', name: 'Subtitle', locked: false, muted: false, visible: true },
  { id: 'track_audio', type: 'audio', name: 'Audio', locked: false, muted: false, visible: true },
];

// Phase 2: Per Section 31, start empty for a real new project
const INITIAL_CLIPS: Clip[] = [];

interface EditorContextType extends EditorState {
  setProjectName: (name: string) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => void;
  setSelectedClipId: (id: string | null) => void;
  setActivePanel: (panel: SidebarTab) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setPreviewQuality: (quality: PreviewQuality) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleTrackLock: (trackId: string) => void;
  toggleTrackVisibility: (trackId: string) => void;
  toggleTrackMute: (trackId: string) => void;
  updateClipTransform: (clipId: string, partial: Partial<ClipTransform>) => void;
  updateClipAudio: (clipId: string, partial: Partial<ClipAudio>) => void;
  undo: () => void;
  redo: () => void;
  triggerSave: () => void;
  selectedClip: Clip | null;
  // Phase 2 Media Library actions
  selectedAsset: MediaAsset | null;
  setSelectedAssetId: (id: string | null) => void;
  addAsset: (assetData: Omit<MediaAsset, 'id' | 'createdAt'>) => MediaAsset;
  addMultipleAssets: (assetsData: Omit<MediaAsset, 'id' | 'createdAt'>[]) => MediaAsset[];
  removeAsset: (assetId: string) => void;
  renameAsset: (assetId: string, newName: string) => void;
  clearAssets: () => void;
  addClipFromAsset: (asset: MediaAsset, trackId: string, dropTime?: number) => { success: boolean; error?: string; clip?: Clip };
  getAssetById: (assetId: string) => MediaAsset | undefined;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project>(INITIAL_PROJECT);
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [clips, setClips] = useState<Clip[]>(INITIAL_CLIPS);
  const [currentTime, setCurrentTimeState] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipIdState] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<SidebarTab>('media');
  const [zoom, setZoomState] = useState<number>(1.0); // 1.0 = 100%
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...'>('Saved');
  const [previewQuality, setPreviewQuality] = useState<PreviewQuality>('Full');
  const [volume, setVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Phase 2: Media Assets state
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Undo / Redo history
  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  const pushSnapshot = useCallback(() => {
    setUndoStack((prev) => [
      ...prev.slice(-25),
      {
        projectName: project.name,
        clips: JSON.parse(JSON.stringify(clips)),
        selectedClipId,
      },
    ]);
    setRedoStack([]);
  }, [project.name, clips, selectedClipId]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);

    setRedoStack((prev) => [
      ...prev,
      {
        projectName: project.name,
        clips: JSON.parse(JSON.stringify(clips)),
        selectedClipId,
      },
    ]);
    setUndoStack(newUndo);

    setProject((p) => ({ ...p, name: previous.projectName }));
    setClips(previous.clips);
    setSelectedClipIdState(previous.selectedClipId);
  }, [undoStack, project.name, clips, selectedClipId]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);

    setUndoStack((prev) => [
      ...prev,
      {
        projectName: project.name,
        clips: JSON.parse(JSON.stringify(clips)),
        selectedClipId,
      },
    ]);
    setRedoStack(newRedo);

    setProject((p) => ({ ...p, name: next.projectName }));
    setClips(next.clips);
    setSelectedClipIdState(next.selectedClipId);
  }, [redoStack, project.name, clips, selectedClipId]);

  const setProjectName = useCallback(
    (name: string) => {
      pushSnapshot();
      setProject((p) => ({ ...p, name }));
      setSaveStatus('Saving...');
      setTimeout(() => setSaveStatus('Saved'), 600);
    },
    [pushSnapshot],
  );

  const setCurrentTime = useCallback((time: number) => {
    const clamped = Math.max(0, Math.min(INITIAL_PROJECT.duration, time));
    setCurrentTimeState(clamped);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && currentTime >= project.duration) {
        setCurrentTimeState(0);
      }
      return !prev;
    });
  }, [currentTime, project.duration]);

  const setSelectedClipId = useCallback((id: string | null) => {
    setSelectedClipIdState(id);
    if (id) {
      // Clear library asset selection when timeline clip is selected
      setSelectedAssetId(null);
    }
  }, []);

  const setZoom = useCallback((newZoom: number) => {
    const clamped = Math.min(2.0, Math.max(0.5, newZoom));
    setZoomState(clamped);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomState((z) => Math.min(2.0, Number((z + 0.25).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
  }, []);

  const zoomFit = useCallback(() => {
    setZoomState(1.0);
  }, []);

  const setAspectRatio = useCallback((ratio: AspectRatio) => {
    setProject((p) => ({ ...p, aspectRatio: ratio }));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleTrackLock = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t)),
    );
  }, []);

  const toggleTrackVisibility = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, visible: !t.visible } : t)),
    );
  }, []);

  const toggleTrackMute = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
    );
  }, []);

  const updateClipTransform = useCallback(
    (clipId: string, partial: Partial<ClipTransform>) => {
      pushSnapshot();
      setClips((prev) =>
        prev.map((c) =>
          c.id === clipId
            ? { ...c, transform: { ...c.transform, ...partial } }
            : c,
        ),
      );
    },
    [pushSnapshot],
  );

  const updateClipAudio = useCallback(
    (clipId: string, partial: Partial<ClipAudio>) => {
      pushSnapshot();
      setClips((prev) =>
        prev.map((c) =>
          c.id === clipId && c.audio
            ? { ...c, audio: { ...c.audio, ...partial } }
            : c,
        ),
      );
    },
    [pushSnapshot],
  );

  const triggerSave = useCallback(() => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus('Saved');
    }, 450);
  }, []);

  // --- Phase 2: Media Management Actions ---

  const addAsset = useCallback((assetData: Omit<MediaAsset, 'id' | 'createdAt'>): MediaAsset => {
    const newAsset: MediaAsset = {
      ...assetData,
      id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setAssets((prev) => [newAsset, ...prev]);
    setSelectedAssetId(newAsset.id);
    return newAsset;
  }, []);

  const addMultipleAssets = useCallback(
    (assetsData: Omit<MediaAsset, 'id' | 'createdAt'>[]): MediaAsset[] => {
      const newAssets: MediaAsset[] = assetsData.map((data, index) => ({
        ...data,
        id: `asset_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now() + index,
      }));
      setAssets((prev) => [...newAssets, ...prev]);
      if (newAssets.length > 0) {
        setSelectedAssetId(newAssets[0].id);
      }
      return newAssets;
    },
    [],
  );

  const removeAsset = useCallback((assetId: string) => {
    setAssets((prev) => {
      const asset = prev.find((a) => a.id === assetId);
      if (asset?.url && asset.url.startsWith('blob:')) {
        URL.revokeObjectURL(asset.url);
      }
      return prev.filter((a) => a.id !== assetId);
    });

    setSelectedAssetId((current) => (current === assetId ? null : current));
  }, []);

  const renameAsset = useCallback((assetId: string, newName: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, name: newName } : a)),
    );
  }, []);

  const clearAssets = useCallback(() => {
    assets.forEach((asset) => {
      if (asset.url && asset.url.startsWith('blob:')) {
        URL.revokeObjectURL(asset.url);
      }
    });
    setAssets([]);
    setSelectedAssetId(null);
  }, [assets]);

  const getAssetById = useCallback(
    (assetId: string) => {
      return assets.find((a) => a.id === assetId);
    },
    [assets],
  );

  // Add Clip from MediaAsset into Timeline Track (with collision avoidance & track validation)
  const addClipFromAsset = useCallback(
    (asset: MediaAsset, trackId: string, dropTime?: number) => {
      const targetTrack = tracks.find((t) => t.id === trackId);
      if (!targetTrack) {
        return { success: false, error: 'Target track does not exist' };
      }

      // Track compatibility validation
      if (targetTrack.type === 'video' || targetTrack.type === 'overlay') {
        if (asset.type !== 'video' && asset.type !== 'image') {
          return {
            success: false,
            error: 'Drop this media on a compatible track.',
          };
        }
      } else if (targetTrack.type === 'audio') {
        if (asset.type !== 'audio') {
          return {
            success: false,
            error: 'Drop this media on a compatible track.',
          };
        }
      } else {
        // Text / Subtitle track
        return {
          success: false,
          error: 'Drop this media on a compatible track.',
        };
      }

      // Determine duration
      let duration = 8;
      if (asset.type === 'video') {
        duration = asset.duration && asset.duration > 0 ? Number(asset.duration.toFixed(2)) : 8;
      } else if (asset.type === 'audio') {
        duration = asset.duration && asset.duration > 0 ? Number(asset.duration.toFixed(2)) : 10;
      } else if (asset.type === 'image') {
        duration = 5.0; // Section 19: default 5 seconds
      }

      // Determine starting position
      let startTime = typeof dropTime === 'number' ? Math.max(0, dropTime) : currentTime;

      // Ensure clip fits inside duration
      if (startTime + duration > project.duration) {
        duration = Math.max(1, project.duration - startTime);
      }

      // Collision avoidance with existing clips on that track
      const existingClips = clips
        .filter((c) => c.trackId === trackId)
        .sort((a, b) => a.startTime - b.startTime);

      for (const existing of existingClips) {
        const existingEnd = existing.startTime + existing.duration;
        // If overlaps with existing clip, move start time after existing clip
        if (
          (startTime >= existing.startTime && startTime < existingEnd) ||
          (startTime + duration > existing.startTime && startTime < existing.startTime)
        ) {
          startTime = existingEnd;
        }
      }

      if (startTime >= project.duration) {
        startTime = Math.max(0, project.duration - duration);
      }

      pushSnapshot();

      const newClip: Clip = {
        id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        assetId: asset.id,
        trackId: trackId,
        type: asset.type === 'video' ? 'video' : asset.type === 'image' ? 'image' : 'audio',
        name: asset.name,
        startTime: Number(startTime.toFixed(2)),
        duration: Number(duration.toFixed(2)),
        trimStart: 0,
        trimEnd: duration,
        color:
          asset.type === 'video'
            ? '#2563eb'
            : asset.type === 'image'
            ? '#10b981'
            : '#8b5cf6',
        transform: {
          position: { x: 0, y: 0 },
          scale: 100,
          rotation: 0,
          opacity: 100,
        },
        audio: {
          volume: 100,
          fadeIn: 0,
          fadeOut: 0,
          muted: false,
        },
        thumbnailPlaceholder: asset.thumbnailUrl || undefined,
      };

      setClips((prev) => [...prev, newClip]);
      setSelectedClipIdState(newClip.id);
      setSelectedAssetId(null);

      return { success: true, clip: newClip };
    },
    [tracks, clips, currentTime, project.duration, pushSnapshot],
  );

  // Animation frame loop for playback
  const lastTimeRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (isPlayingRef.current) {
        if (lastTimeRef.current !== null) {
          const deltaSec = (now - lastTimeRef.current) / 1000;
          const nextTime = currentTimeRef.current + deltaSec;

          if (nextTime >= project.duration) {
            setCurrentTimeState(project.duration);
            setIsPlaying(false);
            lastTimeRef.current = null;
            return;
          } else {
            setCurrentTimeState(nextTime);
          }
        }
        lastTimeRef.current = now;
        animId = requestAnimationFrame(tick);
      } else {
        lastTimeRef.current = null;
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(tick);
    } else {
      lastTimeRef.current = null;
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, project.duration]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        setSelectedClipIdState(null);
        setSelectedAssetId(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, undo, redo]);

  const selectedClip = clips.find((c) => c.id === selectedClipId) || null;
  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || null;

  const value: EditorContextType = {
    project,
    tracks,
    clips,
    currentTime,
    isPlaying,
    selectedClipId,
    activePanel,
    zoom,
    saveStatus,
    previewQuality,
    volume,
    isMuted,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    selectedClip,
    assets,
    selectedAssetId,
    selectedAsset,
    setProjectName,
    setCurrentTime,
    setIsPlaying,
    togglePlayPause,
    setSelectedClipId,
    setActivePanel,
    setZoom,
    zoomIn,
    zoomOut,
    zoomFit,
    setAspectRatio,
    setPreviewQuality,
    setVolume,
    toggleMute,
    toggleTrackLock,
    toggleTrackVisibility,
    toggleTrackMute,
    updateClipTransform,
    updateClipAudio,
    undo,
    redo,
    triggerSave,
    setSelectedAssetId,
    addAsset,
    addMultipleAssets,
    removeAsset,
    renameAsset,
    clearAssets,
    addClipFromAsset,
    getAssetById,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export function useEditorStore(): EditorContextType {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditorStore must be used within an EditorProvider');
  }
  return ctx;
}
