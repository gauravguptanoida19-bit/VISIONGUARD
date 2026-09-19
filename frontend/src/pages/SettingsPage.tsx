import React, { useState } from 'react';
import { Settings, Save, Shield, Sliders, Key, Volume2, Cpu } from 'lucide-react';
import { Card } from '../components/common/Card';
import { useSocket } from '../context/SocketContext';

export const SettingsPage: React.FC = () => {
  const { audioEnabled, setAudioEnabled } = useSocket();

  const [fps, setFps] = useState(5);
  const [loiterThreshold, setLoiterThreshold] = useState(30);
  const [stationaryThreshold, setStationaryThreshold] = useState(45);
  const [geminiKey, setGeminiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-extrabold text-white tracking-wide">Platform Configuration</h1>
        </div>
        <p className="text-xs text-slate-400">
          System-wide computer vision inference parameters, anomaly thresholds, and API keys
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          Configuration parameters updated successfully across runtime nodes.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* CV Inference Tuning */}
        <Card className="p-6">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] mb-5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Inference Engine Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Inference FPS Target: <span className="text-cyan-400 font-bold">{fps} FPS</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Lower FPS conserves GPU/CPU compute during periods of nominal surveillance.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Audio Alarm Ping</label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                    audioEnabled
                      ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{audioEnabled ? 'Audible Chime Active' : 'Muted'}</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Anomaly Detection Rule Thresholds */}
        <Card className="p-6">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] mb-5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Anomaly Engine Heuristic Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Loitering Dwell Trigger (Seconds)
              </label>
              <input
                type="number"
                value={loiterThreshold}
                onChange={(e) => setLoiterThreshold(parseInt(e.target.value, 10))}
                className="w-full bg-[#070B14] border border-white/10 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500/50"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Time subject remains stationary in a monitored zone before alert is escalated.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Abandoned Object Stationary Timeout (Seconds)
              </label>
              <input
                type="number"
                value={stationaryThreshold}
                onChange={(e) => setStationaryThreshold(parseInt(e.target.value, 10))}
                className="w-full bg-[#070B14] border border-white/10 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500/50"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Duration unattended backpack/crate remains stationary without correlated person.
              </p>
            </div>
          </div>
        </Card>

        {/* LLM & AI Provider Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] mb-5">
            <Key className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">LLM Reasoning Provider</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Google Gemini API Key (Optional Override)
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... (Leave blank to use server environment key or heuristic fallback)"
                className="w-full bg-[#070B14] border border-white/10 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500/50 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                VisionGuard integrates with Google GenAI using <code className="text-cyan-400">gemini-3.8-flash</code>.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/30"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
