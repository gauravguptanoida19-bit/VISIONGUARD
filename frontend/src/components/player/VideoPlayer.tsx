import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraZone, DetectedObject } from '@visionguard/shared';
import { Maximize2, Shield, Eye, Settings, Video } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

interface VideoPlayerProps {
  camera: Camera;
  onEditZones?: () => void;
  isAdmin?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ camera, onEditZones, isAdmin = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { latestTelemetry } = useSocket();
  const [showZones, setShowZones] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get live detections from Socket telemetry or default camera objects
  const telemetry = latestTelemetry[camera.id];
  const detections: DetectedObject[] = telemetry?.detections || [
    {
      id: 'det-default-1',
      trackId: 27,
      class: 'person',
      confidence: 0.94,
      bbox: [0.35, 0.42, 0.52, 0.88],
      firstSeen: new Date(Date.now() - 47000).toISOString(),
      lastSeen: new Date().toISOString(),
      duration: 47,
    },
    {
      id: 'det-default-2',
      trackId: 31,
      class: 'person',
      confidence: 0.89,
      bbox: [0.65, 0.48, 0.78, 0.86],
      firstSeen: new Date(Date.now() - 25000).toISOString(),
      lastSeen: new Date().toISOString(),
      duration: 25,
    },
  ];

  // Draw bounding boxes, zone polygons, and CCTV overlays on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Zones
      if (showZones && camera.zones) {
        camera.zones.forEach((zone) => {
          if (!zone.polygon || zone.polygon.length < 3) return;

          ctx.beginPath();
          const first = zone.polygon[0];
          ctx.moveTo(first.x * width, first.y * height);

          for (let i = 1; i < zone.polygon.length; i++) {
            const pt = zone.polygon[i];
            ctx.lineTo(pt.x * width, pt.y * height);
          }
          ctx.closePath();

          const isRestricted = zone.type === 'restricted';
          ctx.strokeStyle = isRestricted ? 'rgba(239, 68, 68, 0.85)' : 'rgba(245, 158, 11, 0.85)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.stroke();

          ctx.fillStyle = isRestricted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
          ctx.fill();
          ctx.setLineDash([]); // Reset dash

          // Zone label badge
          const labelX = first.x * width;
          const labelY = first.y * height - 8;
          ctx.fillStyle = isRestricted ? '#EF4444' : '#F59E0B';
          ctx.font = 'bold 11px JetBrains Mono, monospace';
          ctx.fillText(`ZONE: ${zone.name.toUpperCase()} [${zone.severity}]`, labelX, Math.max(20, labelY));
        });
      }

      // 2. Draw Detections & Bounding Boxes
      if (showBoxes && detections) {
        detections.forEach((det) => {
          const [x1, y1, x2, y2] = det.bbox;
          const bx = x1 * width;
          const by = y1 * height;
          const bw = (x2 - x1) * width;
          const bh = (y2 - y1) * height;

          const isPerson27 = det.trackId === 27;
          const boxColor = isPerson27 ? '#EF4444' : '#00F0FF';

          // Box border
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);

          // Corner highlights
          const cornerLen = Math.min(14, bw / 4);
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = '#FFFFFF';

          // Top-left
          ctx.beginPath();
          ctx.moveTo(bx, by + cornerLen);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + cornerLen, by);
          ctx.stroke();

          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(bx + bw, by + bh - cornerLen);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw - cornerLen, by + bh);
          ctx.stroke();

          // Header Tag background
          const tagText = `${det.class.toUpperCase()} #${det.trackId}  ${(det.confidence * 100).toFixed(0)}%`;
          ctx.font = 'bold 10px JetBrains Mono, monospace';
          const textWidth = ctx.measureText(tagText).width;

          ctx.fillStyle = boxColor;
          ctx.fillRect(bx, Math.max(0, by - 18), textWidth + 12, 18);

          // Tag Text
          ctx.fillStyle = '#06090F';
          ctx.fillText(tagText, bx + 6, Math.max(12, by - 5));

          // Motion vector / duration sub-badge
          if (det.duration) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.fillRect(bx, by + bh, 70, 14);
            ctx.fillStyle = '#94A3B8';
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillText(`DWELL: ${Math.floor(det.duration)}s`, bx + 4, by + bh + 10);
          }
        });
      }

      // 3. CCTV Watermark & Rec Indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '11px JetBrains Mono, monospace';
      const timeString = new Date().toISOString().replace('T', ' ').slice(0, 19);
      ctx.fillText(`${camera.id}  •  ${timeString} UTC`, 16, 26);

      // REC pulse
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(width - 40, 20, 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#F87171';
      ctx.fillText('REC', width - 30, 24);

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [camera, detections, showZones, showBoxes]);

  // Resize canvas to parent container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl group select-none"
    >
      {/* Background Simulated Video Feed */}
      <video
        ref={videoRef}
        src={camera.streamUrl}
        poster={camera.thumbnailUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Real-time Bounding Box & Zone Overlay Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Top Stream Status Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-cyan-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">{camera.id}</span>
          <span className="text-slate-400">|</span>
          <span>{camera.name}</span>
        </div>

        <div className="px-2 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
          FPS: <span className="text-emerald-400 font-bold">{telemetry?.fps || camera.fps}</span>
        </div>
      </div>

      {/* Bottom Stream Controls Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-all ${
              showBoxes ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Boxes ({detections.length})</span>
          </button>

          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-all ${
              showZones ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Zones ({camera.zones?.length || 0})</span>
          </button>

          {isAdmin && onEditZones && (
            <button
              onClick={onEditZones}
              className="px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure Zones</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
