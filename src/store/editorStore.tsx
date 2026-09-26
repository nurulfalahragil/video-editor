import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import {
  formatTime,
  getProjectDuration,
  MIN_CLIP_DURATION,
  canDropOnTrack,
} from '../utils/timelineMath';

export const formatTimecode = formatTime;
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
  duration: 30.0,
  aspectRatio: '16:9',
};

const INITIAL_TRACKS: Track[] = [
  { id: 'track_video_1', type: 'video', name: 'Video 1', locked: false, muted: false, visible: true, volume: 100, height: 70 },
  { id: 'track_overlay_1', type: 'overlay', name: 'Overlay 1', locked: false, muted: false, visible: true, volume: 100, height: 70 },
  { id: 'track_text_1', type: 'text', name: 'Text 1', locked: false, muted: false, visible: true, volume: 100, height: 50 },
  { id: 'track_subtitle_1', type: 'subtitle', name: 'Subtitle 1', locked: false, muted: false, visible: true, volume: 100, height: 50 },
  { id: 'track_audio_1', type: 'audio', name: 'Audio 1', locked: false, muted: false, visible: true, volume: 100, height: 70 },
];

const INITIAL_CLIPS: Clip[] = [];

export const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0];

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
  // Phase 3 Track controls
  toggleTrackLock: (trackId: string) => void;
  toggleTrackVisibility: (trackId: string) => void;
  toggleTrackMute: (trackId: string) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackHeight: (trackId: string, height: number) => void;
  // Phase 3 Editing Operations
  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void;
  trimClipLeft: (clipId: string, newStartTime: number, newTrimStart: number, newDuration: number) => void;
  trimClipRight: (clipId: string, newDuration: number, newTrimEnd: number) => void;
  splitClip: (clipId?: string) => boolean;
  deleteClip: (clipId?: string) => void;
  duplicateClip: (clipId?: string) => void;
  copyClip: (clipId?: string) => void;
  pasteClip: (targetTrackId?: string) => boolean;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  toggleClipMute: (clipId: string) => void;
  stepFrame: (direction: 'forward' | 'backward', stepSeconds?: number) => void;
  // Snapping
  toggleSnap: () => void;
  setActiveSnapGuide: (guideTime: number | null) => void;
  snapTargets: number[];
  // History
  undo: () => void;
  redo: () => void;
  pushSnapshot: (description?: string) => void;
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
  const [zoom, setZoomState] = useState<number>(1.0);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [activeSnapGuide, setActiveSnapGuide] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...'>('Saved');
  const [previewQuality, setPreviewQuality] = useState<PreviewQuality>('Full');
  const [volume, setVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [clipboardClip, setClipboardClip] = useState<Clip | null>(null);

  // Phase 2: Media Assets state
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Undo / Redo history
  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  // Calculate dynamic project duration based on clips
  useEffect(() => {
    const computedDuration = getProjectDuration(clips, 30);
    setProject((prev) => (prev.duration !== computedDuration ? { ...prev, duration: computedDuration } : prev));
  }, [clips]);

  const pushSnapshot = useCallback(
    (description?: string) => {
      setUndoStack((prev) => [
        ...prev.slice(-30),
        {
          description,
          projectName: project.name,
          clips: JSON.parse(JSON.stringify(clips)),
          tracks: JSON.parse(JSON.stringify(tracks)),
          selectedClipId,
        },
      ]);
      setRedoStack([]);
    },
    [project.name, clips, tracks, selectedClipId],
  );

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);

    setRedoStack((prev) => [
      ...prev,
      {
        description: 'Before Undo',
        projectName: project.name,
        clips: JSON.parse(JSON.stringify(clips)),
        tracks: JSON.parse(JSON.stringify(tracks)),
        selectedClipId,
      },
    ]);
    setUndoStack(newUndo);

    setProject((p) => ({ ...p, name: previous.projectName }));
    setClips(previous.clips);
    setTracks(previous.tracks);
    setSelectedClipIdState(previous.selectedClipId);
  }, [undoStack, project.name, clips, tracks, selectedClipId]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);

    setUndoStack((prev) => [
      ...prev,
      {
        description: 'Before Redo',
        projectName: project.name,
        clips: JSON.parse(JSON.stringify(clips)),
        tracks: JSON.parse(JSON.stringify(tracks)),
        selectedClipId,
      },
    ]);
    setRedoStack(newRedo);

    setProject((p) => ({ ...p, name: next.projectName }));
    setClips(next.clips);
    setTracks(next.tracks);
    setSelectedClipIdState(next.selectedClipId);
  }, [redoStack, project.name, clips, tracks, selectedClipId]);

  const setProjectName = useCallback(
    (name: string) => {
      pushSnapshot('Rename Project');
      setProject((p) => ({ ...p, name }));
      setSaveStatus('Saving...');
      setTimeout(() => setSaveStatus('Saved'), 600);
    },
    [pushSnapshot],
  );

  const setCurrentTime = useCallback((time: number) => {
    const clamped = Math.max(0, time);
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
      setSelectedAssetId(null);
    }
  }, []);

  const setZoom = useCallback((newZoom: number) => {
    const clamped = Math.min(5.0, Math.max(0.25, newZoom));
    setZoomState(clamped);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomState((current) => {
      const idx = ZOOM_LEVELS.findIndex((z) => z >= current);
      if (idx !== -1 && idx < ZOOM_LEVELS.length - 1) {
        return ZOOM_LEVELS[idx + 1];
      }
      return Math.min(5.0, Number((current * 1.3).toFixed(2)));
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState((current) => {
      const rev = [...ZOOM_LEVELS].reverse();
      const idx = rev.findIndex((z) => z <= current);
      if (idx !== -1 && idx < rev.length - 1) {
        return rev[idx + 1];
      }
      return Math.max(0.25, Number((current * 0.7).toFixed(2)));
    });
  }, []);

  const zoomFit = useCallback(() => {
    setZoomState(1.0);
  }, []);

  const toggleSnap = useCallback(() => {
    setSnapEnabled((prev) => !prev);
  }, []);

  const setAspectRatio = useCallback((ratio: AspectRatio) => {
    setProject((p) => ({ ...p, aspectRatio: ratio }));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Track operations
  const toggleTrackLock = useCallback((trackId: string) => {
    pushSnapshot('Toggle Track Lock');
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t)),
    );
  }, [pushSnapshot]);

  const toggleTrackVisibility = useCallback((trackId: string) => {
    pushSnapshot('Toggle Track Visibility');
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, visible: !t.visible } : t)),
    );
  }, [pushSnapshot]);

  const toggleTrackMute = useCallback((trackId: string) => {
    pushSnapshot('Toggle Track Mute');
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
    );
  }, [pushSnapshot]);

  const setTrackVolume = useCallback((trackId: string, vol: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, volume: Math.min(200, Math.max(0, vol)) } : t)),
    );
  }, []);

  const setTrackHeight = useCallback((trackId: string, height: number) => {
    const clamped = Math.min(200, Math.max(40, height));
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, height: clamped } : t)),
    );
  }, []);

  // Frame Stepping
  const stepFrame = useCallback((direction: 'forward' | 'backward', stepSeconds?: number) => {
    const delta = stepSeconds !== undefined ? stepSeconds : 1 / project.fps;
    setCurrentTimeState((prev) => {
      const next = direction === 'forward' ? prev + delta : prev - delta;
      return Math.max(0, Math.min(project.duration, next));
    });
  }, [project.fps, project.duration]);

  // Phase 3 Editing Operations
  const moveClip = useCallback(
    (clipId: string, newStartTime: number, newTrackId?: string) => {
      setClips((prev) => {
        const targetClip = prev.find((c) => c.id === clipId);
        if (!targetClip) return prev;

        const effectiveTrackId = newTrackId || targetClip.trackId;
        const targetTrack = tracks.find((t) => t.id === effectiveTrackId);
        if (targetTrack?.locked) return prev;

        if (newTrackId && targetTrack && !canDropOnTrack(targetClip.type, targetTrack.type)) {
          return prev;
        }

        const clampedStart = Math.max(0, newStartTime);

        return prev.map((c) =>
          c.id === clipId
            ? { ...c, startTime: clampedStart, trackId: effectiveTrackId }
            : c,
        );
      });
    },
    [tracks],
  );

  const trimClipLeft = useCallback(
    (clipId: string, newStartTime: number, newTrimStart: number, newDuration: number) => {
      setClips((prev) => {
        const targetClip = prev.find((c) => c.id === clipId);
        if (!targetClip) return prev;
        const track = tracks.find((t) => t.id === targetClip.trackId);
        if (track?.locked) return prev;

        if (newDuration < MIN_CLIP_DURATION) return prev;
        if (newTrimStart < 0) return prev;
        if (newStartTime < 0) return prev;

        return prev.map((c) =>
          c.id === clipId
            ? {
                ...c,
                startTime: newStartTime,
                trimStart: newTrimStart,
                duration: newDuration,
              }
            : c,
        );
      });
    },
    [tracks],
  );

  const trimClipRight = useCallback(
    (clipId: string, newDuration: number, newTrimEnd: number) => {
      setClips((prev) => {
        const targetClip = prev.find((c) => c.id === clipId);
        if (!targetClip) return prev;
        const track = tracks.find((t) => t.id === targetClip.trackId);
        if (track?.locked) return prev;

        if (newDuration < MIN_CLIP_DURATION) return prev;
        if (newTrimEnd > targetClip.sourceDuration) return prev;

        return prev.map((c) =>
          c.id === clipId
            ? {
                ...c,
                duration: newDuration,
                trimEnd: newTrimEnd,
              }
            : c,
        );
      });
    },
    [tracks],
  );

  const splitClip = useCallback(
    (clipId?: string): boolean => {
      const targetId = clipId || selectedClipId;
      if (!targetId) return false;

      const targetClip = clips.find((c) => c.id === targetId);
      if (!targetClip) return false;

      const track = tracks.find((t) => t.id === targetClip.trackId);
      if (track?.locked) return false;

      const splitOffset = currentTime - targetClip.startTime;

      // Must be strictly inside the clip boundaries
      if (splitOffset <= MIN_CLIP_DURATION || splitOffset >= targetClip.duration - MIN_CLIP_DURATION) {
        return false;
      }

      pushSnapshot('Split Clip');

      const clipA: Clip = {
        ...JSON.parse(JSON.stringify(targetClip)),
        id: `clip_${Date.now()}_a`,
        duration: splitOffset,
        trimEnd: targetClip.trimStart + splitOffset,
      };

      const clipB: Clip = {
        ...JSON.parse(JSON.stringify(targetClip)),
        id: `clip_${Date.now()}_b`,
        startTime: targetClip.startTime + splitOffset,
        duration: targetClip.duration - splitOffset,
        trimStart: targetClip.trimStart + splitOffset,
      };

      setClips((prev) => prev.map((c) => (c.id === targetId ? clipA : c)).concat(clipB));
      setSelectedClipIdState(clipB.id);

      return true;
    },
    [selectedClipId, clips, tracks, currentTime, pushSnapshot],
  );

  const deleteClip = useCallback(
    (clipId?: string) => {
      const targetId = clipId || selectedClipId;
      if (!targetId) return;

      const targetClip = clips.find((c) => c.id === targetId);
      if (!targetClip) return;

      const track = tracks.find((t) => t.id === targetClip.trackId);
      if (track?.locked) return;

      pushSnapshot('Delete Clip');
      setClips((prev) => prev.filter((c) => c.id !== targetId));
      if (selectedClipId === targetId) {
        setSelectedClipIdState(null);
      }
    },
    [selectedClipId, clips, tracks, pushSnapshot],
  );

  const duplicateClip = useCallback(
    (clipId?: string) => {
      const targetId = clipId || selectedClipId;
      if (!targetId) return;

      const targetClip = clips.find((c) => c.id === targetId);
      if (!targetClip) return;

      const track = tracks.find((t) => t.id === targetClip.trackId);
      if (track?.locked) return;

      pushSnapshot('Duplicate Clip');

      // Place duplicate right after original, or find next slot
      const newStart = targetClip.startTime + targetClip.duration;
      const dupClip: Clip = {
        ...JSON.parse(JSON.stringify(targetClip)),
        id: `clip_${Date.now()}_dup`,
        startTime: newStart,
      };

      setClips((prev) => [...prev, dupClip]);
      setSelectedClipIdState(dupClip.id);
    },
    [selectedClipId, clips, tracks, pushSnapshot],
  );

  const copyClip = useCallback(
    (clipId?: string) => {
      const targetId = clipId || selectedClipId;
      if (!targetId) return;
      const target = clips.find((c) => c.id === targetId);
      if (target) {
        setClipboardClip(JSON.parse(JSON.stringify(target)));
      }
    },
    [selectedClipId, clips],
  );

  const pasteClip = useCallback(
    (targetTrackId?: string): boolean => {
      if (!clipboardClip) return false;

      const trackId = targetTrackId || clipboardClip.trackId;
      const targetTrack = tracks.find((t) => t.id === trackId);
      if (!targetTrack || targetTrack.locked) return false;

      if (!canDropOnTrack(clipboardClip.type, targetTrack.type)) {
        return false;
      }

      pushSnapshot('Paste Clip');

      const pastedClip: Clip = {
        ...JSON.parse(JSON.stringify(clipboardClip)),
        id: `clip_${Date.now()}_paste`,
        trackId: trackId,
        startTime: currentTime,
      };

      setClips((prev) => [...prev, pastedClip]);
      setSelectedClipIdState(pastedClip.id);
      return true;
    },
    [clipboardClip, tracks, currentTime, pushSnapshot],
  );

  const updateClip = useCallback(
    (clipId: string, updates: Partial<Clip>) => {
      setClips((prev) =>
        prev.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
      );
    },
    [],
  );

  const toggleClipMute = useCallback((clipId: string) => {
    pushSnapshot('Toggle Clip Mute');
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, muted: !c.muted } : c)),
    );
  }, [pushSnapshot]);

  const triggerSave = useCallback(() => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus('Saved');
    }, 450);
  }, []);

  // Phase 2: Media Management Actions
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

  // Add Clip from MediaAsset into Timeline Track
  const addClipFromAsset = useCallback(
    (asset: MediaAsset, trackId: string, dropTime?: number) => {
      const targetTrack = tracks.find((t) => t.id === trackId);
      if (!targetTrack) {
        return { success: false, error: 'Target track does not exist' };
      }
      if (targetTrack.locked) {
        return { success: false, error: 'Track is locked.' };
      }

      if (!canDropOnTrack(asset.type, targetTrack.type)) {
        return {
          success: false,
          error: 'Drop this media on a compatible track.',
        };
      }

      // Determine duration & sourceDuration
      let duration = 8;
      let sourceDuration = 8;
      if (asset.type === 'video') {
        duration = asset.duration && asset.duration > 0 ? Number(asset.duration.toFixed(2)) : 8;
        sourceDuration = duration;
      } else if (asset.type === 'audio') {
        duration = asset.duration && asset.duration > 0 ? Number(asset.duration.toFixed(2)) : 10;
        sourceDuration = duration;
      } else if (asset.type === 'image') {
        duration = 5.0;
        sourceDuration = Infinity;
      }

      let startTime = typeof dropTime === 'number' ? Math.max(0, dropTime) : currentTime;

      pushSnapshot('Add Clip to Timeline');

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
        sourceDuration: sourceDuration,
        volume: 100,
        muted: false,
        locked: false,
        color:
          asset.type === 'video'
            ? '#2563eb'
            : asset.type === 'image'
            ? '#10b981'
            : '#8b5cf6',
        transform: {
          x: 0,
          y: 0,
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
    [tracks, currentTime, pushSnapshot],
  );

  // Compute snap target timestamps
  const snapTargets = useMemo(() => {
    const targets = new Set<number>();
    targets.add(0);
    targets.add(currentTime);
    targets.add(project.duration);

    for (const c of clips) {
      targets.add(c.startTime);
      targets.add(c.startTime + c.duration);
    }
    return Array.from(targets);
  }, [clips, currentTime, project.duration]);

  // Playback loop
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

  // Global Keyboard Shortcuts (Section 39)
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

      // Space: Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
      // S: Split clip
      else if (e.key === 's' || e.key === 'S') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          splitClip();
        }
      }
      // Delete / Backspace: Delete clip
      else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        deleteClip();
      }
      // Escape: Deselect
      else if (e.code === 'Escape') {
        e.preventDefault();
        setSelectedClipIdState(null);
        setSelectedAssetId(null);
      }
      // Arrow keys: Frame stepping
      else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepFrame('backward', e.shiftKey ? 1.0 : undefined);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepFrame('forward', e.shiftKey ? 1.0 : undefined);
      }
      // Ctrl/Cmd shortcuts
      else if (e.ctrlKey || e.metaKey) {
        const k = e.key.toLowerCase();
        if (k === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (k === 'c') {
          e.preventDefault();
          copyClip();
        } else if (k === 'v') {
          e.preventDefault();
          pasteClip();
        } else if (k === 'd') {
          e.preventDefault();
          duplicateClip();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, splitClip, deleteClip, stepFrame, undo, redo, copyClip, pasteClip, duplicateClip]);

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
    snapEnabled,
    activeSnapGuide,
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
    clipboardClip,
    snapTargets,
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
    toggleSnap,
    setActiveSnapGuide,
    setAspectRatio,
    setPreviewQuality,
    setVolume,
    toggleMute,
    toggleTrackLock,
    toggleTrackVisibility,
    toggleTrackMute,
    setTrackVolume,
    setTrackHeight,
    moveClip,
    trimClipLeft,
    trimClipRight,
    splitClip,
    deleteClip,
    duplicateClip,
    copyClip,
    pasteClip,
    updateClip,
    toggleClipMute,
    stepFrame,
    undo,
    redo,
    pushSnapshot,
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
