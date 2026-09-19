import React, { useState } from 'react';
import { Camera, CameraZone, ZoneType, Severity } from '@visionguard/shared';
import { X, Plus, Trash2, Shield, Save } from 'lucide-react';
import { api } from '../../services/api';

interface ZoneEditorModalProps {
  camera: Camera;
  onClose: () => void;
  onZonesUpdated: (updatedCamera: Camera) => void;
}

export const ZoneEditorModal: React.FC<ZoneEditorModalProps> = ({ camera, onClose, onZonesUpdated }) => {
  const [zones, setZones] = useState<CameraZone[]>(JSON.parse(JSON.stringify(camera.zones || [])));
  const [isSaving, setIsSaving] = useState(false);

  const addDefaultZone = (type: ZoneType) => {
    const newZone: CameraZone = {
      id: `zone-${Date.now()}`,
      cameraId: camera.id,
      name: type === 'restricted' ? 'High Security Perimeter' : 'Dwell Monitoring Zone',
      type,
      polygon: [
        { x: 0.2, y: 0.2 },
        { x: 0.8, y: 0.2 },
        { x: 0.8, y: 0.8 },
        { x: 0.2, y: 0.8 },
      ],
      activeHours: {
        enabled: type === 'restricted',
        start: '00:00',
        end: '23:59',
      },
      severity: type === 'restricted' ? 'HIGH' : 'MEDIUM',
      color: type === 'restricted' ? '#EF4444' : '#F59E0B',
      dwellTimeThresholdSeconds: 30,
    };
    setZones([...zones, newZone]);
  };

  const removeZone = (index: number) => {
    setZones(zones.filter((_, i) => i !== index));
  };

  const updateZoneField = (index: number, field: string, value: any) => {
    const copy = [...zones];
    (copy[index] as any)[field] = value;
    setZones(copy);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.cameras.updateZones(camera.id, zones);
      if (res.camera) {
        onZonesUpdated(res.camera);
      }
      onClose();
    } catch (err: any) {
      alert(`Failed to save zones: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0C1220] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">Zone Configuration • {camera.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => addDefaultZone('restricted')}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Restricted Zone</span>
            </button>
            <button
              onClick={() => addDefaultZone('loitering')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Loitering Zone</span>
            </button>
          </div>

          {zones.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
              No zones configured for this camera. Click above to define a security boundary.
            </div>
          ) : (
            zones.map((zone, idx) => (
              <div key={zone.id || idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: zone.type === 'restricted' ? '#EF4444' : '#F59E0B' }}
                    />
                    <input
                      type="text"
                      value={zone.name}
                      onChange={(e) => updateZoneField(idx, 'name', e.target.value)}
                      className="bg-transparent border-b border-white/20 focus:border-cyan-400 text-xs font-semibold text-slate-100 outline-none pb-0.5"
                    />
                  </div>

                  <button
                    onClick={() => removeZone(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Zone Type</label>
                    <select
                      value={zone.type}
                      onChange={(e) => updateZoneField(idx, 'type', e.target.value)}
                      className="w-full bg-[#070B14] border border-white/10 rounded px-2 py-1 text-slate-200 outline-none"
                    >
                      <option value="restricted">Restricted Area</option>
                      <option value="loitering">Loitering Monitored</option>
                      <option value="monitored">General Monitored</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Alert Severity</label>
                    <select
                      value={zone.severity}
                      onChange={(e) => updateZoneField(idx, 'severity', e.target.value)}
                      className="w-full bg-[#070B14] border border-white/10 rounded px-2 py-1 text-slate-200 outline-none"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      {zone.type === 'loitering' ? 'Dwell Timeout (sec)' : 'Active Schedule'}
                    </label>
                    {zone.type === 'loitering' ? (
                      <input
                        type="number"
                        value={zone.dwellTimeThresholdSeconds || 30}
                        onChange={(e) => updateZoneField(idx, 'dwellTimeThresholdSeconds', parseInt(e.target.value, 10))}
                        className="w-full bg-[#070B14] border border-white/10 rounded px-2 py-1 text-slate-200 outline-none"
                      />
                    ) : (
                      <span className="inline-block px-2 py-1 rounded bg-white/[0.04] text-[11px] text-slate-300 font-mono">
                        24/7 Monitored
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] font-mono text-slate-500">
                  Vertices: {zone.polygon.map((p) => `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`).join(' → ')}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/30"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Zone Policies'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
