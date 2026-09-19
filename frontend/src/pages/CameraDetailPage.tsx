import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Cctv,
  ArrowLeft,
  Shield,
  Users,
  Activity,
  Settings,
  AlertTriangle,
  Flame,
  Radio,
} from 'lucide-react';
import { api } from '../services/api';
import { Camera, DetectedObject } from '@visionguard/shared';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { ZoneEditorModal } from '../components/player/ZoneEditorModal';
import { Card } from '../components/common/Card';
import { SeverityBadge, CameraStatusBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useDemo } from '../context/DemoContext';

export const CameraDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { latestTelemetry } = useSocket();
  const { triggerScenario, isTriggering } = useDemo();

  const [camera, setCamera] = useState<Camera | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    async function loadCamera() {
      if (!id) return;
      try {
        const res = await api.cameras.getById(id);
        setCamera(res.camera);
      } catch (e) {
        console.error('Failed to load camera', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadCamera();
  }, [id]);

  if (isLoading || !camera) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm">
          <Cctv className="w-5 h-5 animate-spin" />
          <span>Synchronizing Camera Node Stream...</span>
        </div>
      </div>
    );
  }

  const telemetry = latestTelemetry[camera.id];
  const activeDetections: DetectedObject[] = telemetry?.detections || [
    {
      id: 'det-27',
      trackId: 27,
      class: 'person',
      confidence: 0.94,
      bbox: [0.35, 0.42, 0.52, 0.88],
      firstSeen: new Date(Date.now() - 47000).toISOString(),
      lastSeen: new Date().toISOString(),
      duration: 47,
      currentZoneId: 'zone-cam4-restricted',
    },
    {
      id: 'det-31',
      trackId: 31,
      class: 'person',
      confidence: 0.89,
      bbox: [0.65, 0.48, 0.78, 0.86],
      firstSeen: new Date(Date.now() - 25000).toISOString(),
      lastSeen: new Date().toISOString(),
      duration: 25,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cameras')}
            className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono font-bold text-sm">{camera.id}</span>
              <span className="text-slate-500">•</span>
              <h1 className="text-lg font-bold text-white">{camera.name}</h1>
              <CameraStatusBadge status={camera.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{camera.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {camera.id === 'CAM-04' && (
            <button
              onClick={async () => {
                const inc = await triggerScenario();
                if (inc) navigate(`/incidents/${inc.id}`);
              }}
              disabled={isTriggering}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-rose-900/30"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Simulate Zone Breach</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowZoneModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure Zones</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Stream & Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream Canvas (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer
            camera={camera}
            onEditZones={() => setShowZoneModal(true)}
            isAdmin={isAdmin}
          />

          {/* Telemetry Stream Log */}
          <Card className="p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-2 text-slate-400">
              <span className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Raw ByteTrack Inference Feed
              </span>
              <span className="text-[10px] text-slate-500">LATENCY: 14ms</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300 max-h-24 overflow-y-auto">
              <p className="text-emerald-400">
                [{new Date().toLocaleTimeString()}] Track state synchronized: {activeDetections.length} entities tracked
              </p>
              {activeDetections.map((d) => (
                <p key={d.id} className="text-slate-400">
                  [{new Date().toLocaleTimeString()}] ID #{d.trackId} ({d.class.toUpperCase()}) conf={d.confidence} dwell={Math.floor(d.duration)}s bbox=[{d.bbox.join(', ')}]
                </p>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar: Tracked Objects & Active Zones (1 Col) */}
        <div className="space-y-6">
          {/* Tracked Objects */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Tracked Entities ({activeDetections.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">LIVE</span>
            </div>

            <div className="space-y-3">
              {activeDetections.map((det) => {
                const isBreach = det.trackId === 27;
                return (
                  <div
                    key={det.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isBreach
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-white/[0.02] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-white">
                        {det.class.toUpperCase()} #{det.trackId}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300">
                        {(det.confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                      <p>Dwell: <span className="text-slate-200">{Math.floor(det.duration)} seconds</span></p>
                      {isBreach ? (
                        <p className="text-rose-400 font-bold flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          INSIDE RESTRICTED PERIMETER
                        </p>
                      ) : (
                        <p className="text-emerald-400">Status: Nominal Transit</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Configured Zones on this Camera */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Configured Zones ({camera.zones?.length || 0})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {camera.zones?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No zones configured.</p>
              ) : (
                camera.zones.map((zone) => (
                  <div key={zone.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">{zone.name}</span>
                      <SeverityBadge severity={zone.severity} />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1 flex justify-between">
                      <span>Type: {zone.type.toUpperCase()}</span>
                      <span>{zone.activeHours.enabled ? `${zone.activeHours.start}-${zone.activeHours.end}` : '24/7'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {showZoneModal && (
        <ZoneEditorModal
          camera={camera}
          onClose={() => setShowZoneModal(false)}
          onZonesUpdated={(updated) => setCamera(updated)}
        />
      )}
    </div>
  );
};
