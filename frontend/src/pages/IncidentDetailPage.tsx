import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Sparkles,
  CheckCircle2,
  Clock,
  Cctv,
  Layers,
  FileText,
  Send,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Incident, IncidentStatus } from '@visionguard/shared';
import { Card } from '../components/common/Card';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  const loadIncident = async () => {
    if (!id) return;
    try {
      const res = await api.incidents.getById(id);
      setIncident(res.incident);
    } catch (e) {
      console.error('Failed to load incident', e);
    }
  };

  useEffect(() => {
    loadIncident();
  }, [id]);

  const handleAIAnalyze = async () => {
    if (!incident) return;
    setIsAnalyzing(true);
    try {
      const res = await api.incidents.analyze(incident.id);
      setIncident(res.incident);
    } catch (err: any) {
      alert(`AI Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!incident) return;
    try {
      const res = await api.incidents.updateStatus(incident.id, newStatus);
      setIncident(res.incident);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await api.incidents.addNote(incident.id, newNote);
      setIncident(res.incident);
      setNewNote('');
    } catch (err: any) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setIsAddingNote(false);
    }
  };

  if (!incident) {
    return (
      <div className="flex items-center justify-center h-96 font-mono text-cyan-400 text-sm">
        <AlertTriangle className="w-5 h-5 animate-pulse mr-2" />
        <span>Loading incident forensic data...</span>
      </div>
    );
  }

  const analysis = incident.aiAnalysis;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/incidents')}
            className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-extrabold font-mono text-cyan-400">{incident.incidentNumber}</span>
              <span className="text-slate-500">•</span>
              <h1 className="text-lg font-bold text-white capitalize">{incident.type.replace(/_/g, ' ')}</h1>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Camera: <span className="text-slate-200">{incident.cameraName}</span> ({incident.location}) • {new Date(incident.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {incident.status === 'new' && (
            <button
              onClick={() => handleStatusChange('investigating')}
              className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all"
            >
              Mark Investigating
            </button>
          )}

          {incident.status !== 'resolved' && (
            <button
              onClick={() => handleStatusChange('resolved')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
            >
              Resolve Incident
            </button>
          )}

          {incident.status !== 'false_positive' && (
            <button
              onClick={() => handleStatusChange('false_positive')}
              className="px-3 py-1.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 text-slate-300 text-xs font-semibold transition-all"
            >
              False Positive
            </button>
          )}

          <button
            onClick={() => navigate('/reports')}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Evidence Frames (Left) + AI Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence Frames Carousel / Gallery */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Evidence Frames ({incident.evidenceFrames?.length || 0})
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Duration: {incident.duration} seconds
              </span>
            </div>

            {incident.evidenceFrames && incident.evidenceFrames.length > 0 ? (
              <div className="space-y-3">
                {/* Main Large Frame */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-xl">
                  <img
                    src={incident.evidenceFrames[selectedFrameIndex]?.imageUrl}
                    alt={incident.evidenceFrames[selectedFrameIndex]?.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-cyan-300">
                    {incident.evidenceFrames[selectedFrameIndex]?.label}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-slate-400">
                    {new Date(incident.evidenceFrames[selectedFrameIndex]?.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-3 gap-2">
                  {incident.evidenceFrames.map((frame, idx) => (
                    <div
                      key={frame.id || idx}
                      onClick={() => setSelectedFrameIndex(idx)}
                      className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all ${
                        selectedFrameIndex === idx
                          ? 'border-cyan-400 shadow-glow-cyan'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={frame.imageUrl} alt={frame.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 text-[9px] font-mono px-1 rounded bg-black/80 text-white">
                        Frame {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
                No visual frames logged for this incident.
              </div>
            )}
          </Card>

          {/* Incident Telemetry & Analyst Log */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono mb-3 pb-2 border-b border-white/[0.06]">
              Analyst Investigation Notes
            </h3>

            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
              {incident.analystNotes && incident.analystNotes.length > 0 ? (
                incident.analystNotes.map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300">
                    <p>{note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No notes logged yet.</p>
              )}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add incident observation..."
                className="flex-1 bg-[#070B14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                disabled={!newNote.trim() || isAddingNote}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Save</span>
              </button>
            </form>
          </Card>
        </div>

        {/* AI Incident Analysis Report (Key Demo Requirement!) */}
        <Card className="p-6 flex flex-col justify-between" glow={analysis ? 'cyan' : 'none'}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    AI Incident Explanation
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                      {analysis?.modelUsed || 'GEMINI 3.8'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Automated multi-modal forensic reasoning</p>
                </div>
              </div>

              <button
                onClick={handleAIAnalyze}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-900/30"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analyzing...' : 'AI Analyze'}</span>
              </button>
            </div>

            {analysis ? (
              <div className="space-y-4 text-xs">
                {/* Summary */}
                <div className="p-3 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/20">
                  <p className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1">Executive Summary</p>
                  <p className="text-slate-200 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* What Happened & Why Flagged */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">What Happened</p>
                    <p className="text-slate-300 leading-relaxed">{analysis.whatHappened}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-[10px] font-mono uppercase text-rose-400 font-bold mb-1">Why Flagged</p>
                    <p className="text-slate-300 leading-relaxed">{analysis.whyFlagged}</p>
                  </div>
                </div>

                {/* Relevant Objects & Timeline */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Timeline of Events</p>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {analysis.timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold shrink-0">[{item.time}]</span>
                        <span className="text-slate-300">{item.event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Possible Explanation (probabilistic wording) */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Probable Hypothesis
                  </p>
                  <p className="text-slate-300 leading-relaxed">{analysis.possibleExplanation}</p>
                </div>

                {/* Recommended Steps */}
                <div className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-1.5">
                  <p className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">
                    Recommended SOP Response Actions
                  </p>
                  {analysis.recommendedSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-xl space-y-3">
                <Bot className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click <strong className="text-cyan-400">"AI Analyze"</strong> above to trigger autonomous Gemini 3.8
                  multimodal reasoning on this incident telemetry.
                </p>
              </div>
            )}
          </div>

          {analysis && (
            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Confidence: {(analysis.confidence * 100).toFixed(0)}%</span>
              <span>Generated: {new Date(analysis.generatedAt).toLocaleTimeString()}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
