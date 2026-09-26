import { MediaAsset } from '../types/media';

/**
 * Creates realistic, working in-browser media blobs for immediate testing
 * without requiring the user to locate external test files.
 */
export async function createDemoAssets(): Promise<Omit<MediaAsset, 'id' | 'createdAt'>[]> {
  const assets: Omit<MediaAsset, 'id' | 'createdAt'>[] = [];

  // 1. Generate Test Image
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw cinematic backdrop
      const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1920, 1080);

      // Add modern graphics
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 1920; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 1080);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText('AI VIDEO STUDIO', 120, 480);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '32px sans-serif';
      ctx.fillText('Sample HD Plate (1920 × 1080)', 120, 550);

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
      if (blob) {
        const url = URL.createObjectURL(blob);
        assets.push({
          name: 'Cyber_City_Plate.jpg',
          type: 'image',
          mimeType: 'image/jpeg',
          size: blob.size,
          url,
          thumbnailUrl: url,
          width: 1920,
          height: 1080,
        });
      }
    }
  } catch (err) {
    console.warn('Image generator warning:', err);
  }

  // 2. Generate Real Playable Video via Canvas + MediaRecorder
  try {
    const vCanvas = document.createElement('canvas');
    vCanvas.width = 1280;
    vCanvas.height = 720;
    const vCtx = vCanvas.getContext('2d');

    if (vCtx && typeof vCanvas.captureStream === 'function' && typeof MediaRecorder !== 'undefined') {
      const stream = vCanvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const videoPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: 'video/webm' }));
        };
      });

      recorder.start();

      // Render 5 seconds of animated frames
      let frame = 0;
      const totalFrames = 30 * 5; // 5 seconds
      const renderNext = () => {
        if (frame < totalFrames) {
          const t = frame / 30;
          // Background
          const grad = vCtx.createRadialGradient(640, 360, 50, 640, 360, 800);
          grad.addColorStop(0, '#1e1b4b');
          grad.addColorStop(1, '#09090b');
          vCtx.fillStyle = grad;
          vCtx.fillRect(0, 0, 1280, 720);

          // Moving sphere
          const x = 640 + Math.sin(t * 2) * 350;
          const y = 360 + Math.cos(t * 3) * 160;
          vCtx.beginPath();
          vCtx.arc(x, y, 40, 0, Math.PI * 2);
          vCtx.fillStyle = '#06b6d4';
          vCtx.shadowColor = '#06b6d4';
          vCtx.shadowBlur = 25;
          vCtx.fill();
          vCtx.shadowBlur = 0;

          // Timecode watermark
          vCtx.fillStyle = '#ffffff';
          vCtx.font = 'bold 36px monospace';
          vCtx.fillText(`00:0${Math.floor(t)}.${String(Math.floor((t % 1) * 100)).padStart(2, '0')}`, 60, 100);

          vCtx.font = '22px sans-serif';
          vCtx.fillStyle = '#94a3b8';
          vCtx.fillText('Camera Sequence 01 · 60fps Motion Plate', 60, 140);

          frame++;
          setTimeout(renderNext, 16);
        } else {
          recorder.stop();
        }
      };

      renderNext();

      const videoBlob = await videoPromise;
      const videoUrl = URL.createObjectURL(videoBlob);

      // Create a thumbnail from canvas
      const thumb = vCanvas.toDataURL('image/jpeg', 0.8);

      assets.push({
        name: 'Cinematic_Motion_Sequence.webm',
        type: 'video',
        mimeType: 'video/webm',
        size: videoBlob.size,
        duration: 5.0,
        width: 1280,
        height: 720,
        url: videoUrl,
        thumbnailUrl: thumb,
      });
    }
  } catch (err) {
    console.warn('Video generator warning:', err);
  }

  // 3. Generate Real Playable Audio Synth Tone via Web Audio API WAV
  try {
    const sampleRate = 44100;
    const durationSec = 6;
    const numSamples = sampleRate * durationSec;
    const buffer = new Float32Array(numSamples);

    // Synthesize a pleasant warm ambient drone with rising harmonic chord
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const env = Math.min(1, t / 0.5) * Math.max(0, 1 - (t - 4.5) / 1.5);
      const f1 = 220; // A3
      const f2 = 277.18; // C#4
      const f3 = 329.63; // E4
      buffer[i] =
        (Math.sin(2 * Math.PI * f1 * t) * 0.3 +
          Math.sin(2 * Math.PI * f2 * t) * 0.25 +
          Math.sin(2 * Math.PI * f3 * t) * 0.2) *
        env;
    }

    // Encode to WAV blob
    const wavBytes = encodeWAV(buffer, sampleRate);
    const audioBlob = new Blob([wavBytes], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);

    assets.push({
      name: 'Ambient_Synth_Horizon.wav',
      type: 'audio',
      mimeType: 'audio/wav',
      size: audioBlob.size,
      duration: durationSec,
      url: audioUrl,
    });
  } catch (err) {
    console.warn('Audio generator warning:', err);
  }

  return assets;
}

function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}
