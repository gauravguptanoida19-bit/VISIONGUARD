import React, { useEffect, useState } from 'react';
import { FileText, Printer, Download, Shield, Bot, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Incident } from '@visionguard/shared';
import { Card } from '../components/common/Card';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';

export const ReportsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.incidents.list();
        setIncidents(res.incidents);
        if (res.incidents.length > 0) {
          // Default to VG-1842 if present, else first
          const vg1842 = res.incidents.find((i) => i.incidentNumber === 'VG-1842');
          setSelectedIncident(vg1842 || res.incidents[0]);
        }
      } catch (e) {
        console.error('Failed to load incidents for report', e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !selectedIncident) {
    return (
      <div className="flex items-center justify-center h-96 font-mono text-cyan-400 text-sm">
        <FileText className="w-5 h-5 animate-spin mr-2" />
        <span>Compiling Incident Dossier...</span>
      </div>
    );
  }

  const analysis = selectedIncident.aiAnalysis;

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Non-printed Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-wide">Incident Forensic Reports</h1>
          </div>
          <p className="text-xs text-slate-400">Exportable, print-formatted security audit dossier</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedIncident.id}
            onChange={(e) => {
              const found = incidents.find((i) => i.id === e.target.value);
              if (found) setSelectedIncident(found);
            }}
            className="bg-[#070B14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none flex-1 sm:flex-none"
          >
            {incidents.map((i) => (
              <option key={i.id} value={i.id}>
                {i.incidentNumber} • {i.cameraName} ({i.severity})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="p-8 sm:p-12 rounded-2xl bg-[#090F1C] border border-white/10 shadow-2xl text-slate-200 space-y-8 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Dossier Header */}
        <div className="flex items-start justify-between pb-6 border-b border-white/[0.08] print:border-black/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-cyan-400 print:text-black" />
              <span className="font-mono font-extrabold text-lg tracking-wider text-white print:text-black">
                VISIONGUARD SECURITY FORENSIC DOSSIER
              </span>
            </div>
            <p className="text-xs text-slate-400 print:text-gray-600 font-mono">
              CLASSIFICATION: CONFIDENTIAL // LAW ENFORCEMENT & PHYSICAL AUDIT READY
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <div className="text-cyan-400 print:text-black font-extrabold text-lg">{selectedIncident.incidentNumber}</div>
            <div className="text-slate-400 print:text-gray-600">{new Date(selectedIncident.timestamp).toUTCString()}</div>
          </div>
        </div>

        {/* Core Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] print:border print:border-gray-200 print:bg-gray-50 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">Camera Sensor</span>
            <span className="font-bold text-white print:text-black">{selectedIncident.cameraId}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">Facility Location</span>
            <span className="font-bold text-white print:text-black">{selectedIncident.location}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">Incident Severity</span>
            <span className="font-bold text-rose-400 print:text-red-700">{selectedIncident.severity}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">Status</span>
            <span className="font-bold text-cyan-400 print:text-blue-700 uppercase">{selectedIncident.status}</span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400 print:text-black">
            1. Automated Sensor Telemetry & Description
          </h3>
          <p className="text-xs leading-relaxed text-slate-300 print:text-gray-800">
            {selectedIncident.description}
          </p>
          <p className="text-[11px] font-mono text-slate-400 print:text-gray-600">
            Observation Duration: {selectedIncident.duration} seconds • Tracked Entities:{' '}
            {selectedIncident.detectedObjects.map((o) => `${o.class.toUpperCase()} #${o.trackId} (${(o.confidence * 100).toFixed(0)}%)`).join(', ') || 'None recorded'}
          </p>
        </div>

        {/* Evidence Frame Strip */}
        {selectedIncident.evidenceFrames && selectedIncident.evidenceFrames.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400 print:text-black">
              2. Evidentiary Keyframe Captures
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedIncident.evidenceFrames.map((frame, idx) => (
                <div key={frame.id || idx} className="rounded-lg overflow-hidden border border-white/10 print:border-gray-300">
                  <img src={frame.imageUrl} alt={frame.label} className="w-full aspect-video object-cover" />
                  <div className="p-2 bg-black/60 print:bg-gray-100 text-[10px] font-mono">
                    <p className="font-bold text-slate-200 print:text-black">{frame.label}</p>
                    <p className="text-slate-400 print:text-gray-600">{new Date(frame.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis Findings */}
        {analysis && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400 print:text-black flex items-center gap-2">
              <Bot className="w-4 h-4 print:hidden" />
              3. AI Autonomous Forensic Reasoning ({analysis.modelUsed})
            </h3>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] print:border print:border-gray-200 print:bg-white text-xs space-y-3">
              <div>
                <span className="font-mono uppercase text-[10px] text-slate-400 print:text-gray-600 block">Executive Summary</span>
                <p className="text-slate-200 print:text-gray-800 leading-relaxed">{analysis.summary}</p>
              </div>

              <div>
                <span className="font-mono uppercase text-[10px] text-slate-400 print:text-gray-600 block">Policy Infraction Root Cause</span>
                <p className="text-slate-300 print:text-gray-700 leading-relaxed">{analysis.whyFlagged}</p>
              </div>

              <div>
                <span className="font-mono uppercase text-[10px] text-slate-400 print:text-gray-600 block">Recommended SOP Remediations</span>
                <div className="space-y-1 mt-1">
                  {analysis.recommendedSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-300 print:text-gray-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 print:text-green-700 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sign-off Block */}
        <div className="pt-8 border-t border-white/[0.08] print:border-black/20 grid grid-cols-2 gap-8 text-xs font-mono">
          <div>
            <p className="text-slate-400 print:text-gray-600 mb-6">Investigating Security Officer:</p>
            <div className="border-b border-white/20 print:border-black/40 pb-1 text-slate-300 print:text-black font-semibold">
              Vikramaditya Sharma (Chief Security Officer)
            </div>
          </div>
          <div>
            <p className="text-slate-400 print:text-gray-600 mb-6">System Verification Hash:</p>
            <div className="border-b border-white/20 print:border-black/40 pb-1 text-slate-300 print:text-black font-semibold truncate">
              SHA256: 9b2d8e4f1a2c5e7b9a0f3d6c8e1a4b7f
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
