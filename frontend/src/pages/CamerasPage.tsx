import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cctv, Plus, Radio, Eye, MapPin, Activity, Shield } from 'lucide-react';
import { api } from '../services/api';
import { Camera } from '@visionguard/shared';
import { Card } from '../components/common/Card';
import { CameraStatusBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const CamerasPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { latestTelemetry } = useSocket();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCameras() {
      try {
        const res = await api.cameras.list();
        setCameras(res.cameras);
      } catch (err) {
        console.error('Failed to load cameras', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCameras();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cctv className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-wide">Live Camera Matrix</h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time multi-stream neural surveillance grid • 8 Active Sensor Nodes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Aggregate FPS: 228</span>
          </div>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cameras.map((camera) => {
          const telemetry = latestTelemetry[camera.id];
          const objectCount = telemetry ? telemetry.objectsCount : camera.activeObjectsCount;
          const fps = telemetry ? telemetry.fps : camera.fps;

          return (
            <Card
              key={camera.id}
              onClick={() => navigate(`/cameras/${camera.id}`)}
              glow={camera.id === 'CAM-04' ? 'cyan' : 'none'}
              className="overflow-hidden flex flex-col group"
            >
              {/* Thumbnail / Stream Preview */}
              <div className="relative aspect-video w-full bg-black overflow-hidden border-b border-white/[0.06]">
                <img
                  src={camera.thumbnailUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'}
                  alt={camera.name}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-300"
                />

                {/* Top overlay */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                  <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-cyan-400 font-mono font-bold text-xs border border-white/10">
                    {camera.id}
                  </span>
                  <CameraStatusBadge status={camera.status} />
                </div>

                {/* Bottom stats overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 text-[10px] font-mono text-slate-300">
                  <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md">
                    FPS: <span className="text-emerald-400 font-bold">{fps}</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md">
                    Objects: <span className="text-cyan-400 font-bold">{objectCount}</span>
                  </span>
                </div>

                {/* Live hover overlay button */}
                <div className="absolute inset-0 flex items-center justify-center bg-cyan-950/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                    <Eye className="w-3.5 h-3.5" />
                    Open Live Feed
                  </span>
                </div>
              </div>

              {/* Details Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {camera.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{camera.location}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    <span>{camera.zones?.length || 0} Zones</span>
                  </div>
                  <span>{camera.resolution}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
