import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cctv,
  Users,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Play,
  Eye,
  Radio,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { AnalyticsData, Incident } from '@visionguard/shared';
import { Card } from '../components/common/Card';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import { useDemo } from '../context/DemoContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDemoRunning, triggerScenario, isTriggering } = useDemo();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.analytics.getSummary();
        setAnalytics(res.analytics);
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const SEVERITY_COLORS = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#F97316',
    CRITICAL: '#EF4444',
  };

  const liveActivityFeed = [
    { time: '02:14:31', cam: 'CAM-04', text: 'Restricted zone entry detected: Person #27', severity: 'HIGH' },
    { time: '02:15:04', cam: 'CAM-02', text: 'Unusual crowd density detected near parking turnstiles', severity: 'MEDIUM' },
    { time: '02:16:22', cam: 'CAM-07', text: 'Object left unattended on campus bench (>5m)', severity: 'HIGH' },
    { time: '02:18:05', cam: 'CAM-01', text: 'Heavy vehicle license plate logged at barrier', severity: 'LOW' },
    { time: '02:20:11', cam: 'CAM-03', text: 'Turnstile reverse egress detected', severity: 'LOW' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Quick Demo Flow Trigger for Hackathon */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/20 border border-cyan-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              VisionGuard Autonomous Operations Center
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time multi-camera neural telemetry, ByteTrack trajectory continuity, and Gemini 3.8 incident reasoning.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/cameras/CAM-04')}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/30"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Monitor CAM-04 (Demo Stream)</span>
          </button>

          <button
            onClick={async () => {
              const inc = await triggerScenario();
              if (inc) navigate(`/incidents/${inc.id}`);
            }}
            disabled={isTriggering}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-rose-900/30"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isTriggering ? 'Triggering...' : 'Simulate Breach'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5" glow="cyan">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>ACTIVE CAMERAS</span>
            <Cctv className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {analytics?.activeCameras || 7} <span className="text-slate-500 text-base font-normal">/ {analytics?.totalCameras || 8}</span>
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 font-mono mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            87.5% operational coverage
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>PEOPLE DETECTED</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {analytics?.peopleDetectedNow || 54}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-2 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            Active across 8 monitored zones
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>ACTIVE INCIDENTS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {analytics?.activeIncidentsCount || 3}
            </span>
            <span className="text-xs text-amber-400 font-mono">Under Investigation</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-2">
            Avg Triage Time: {analytics?.averageResponseTimeMinutes || 4.2}m
          </p>
        </Card>

        <Card className="p-5" glow="crimson">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>HIGH RISK ALERTS</span>
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">
              {analytics?.highRiskAlertsCount || 2}
            </span>
            <span className="text-xs text-rose-300 font-mono">Requires Action</span>
          </div>
          <p className="text-[11px] text-rose-400/80 font-mono mt-2">
            Zero Tolerance perimeters breached
          </p>
        </Card>
      </div>

      {/* Main Visualizations Row: Incidents Over Time & Threat Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents Over Time Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Detection & Incident Velocity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Rolling 7-day incident anomaly volume</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
              REAL-TIME SYNC
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.incidentsOverTime || []}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#totalGrad)" name="Total Incidents" />
                <Area type="monotone" dataKey="highRisk" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#highGrad)" name="High Risk Alerts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Threat Distribution Pie Chart */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Threat Severity Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Historical incident risk classification</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.threatDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(analytics?.threatDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(SEVERITY_COLORS as any)[entry.severity] || '#06B6D4'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/[0.06] text-xs font-mono">
            {(analytics?.threatDistribution || []).map((item) => (
              <div key={item.severity} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: (SEVERITY_COLORS as any)[item.severity] }}
                />
                <span className="text-slate-400">{item.severity}:</span>
                <span className="font-bold text-slate-200">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Two Column Section: Recent Incidents Table & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents Table (2 cols) */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyan-400" />
                Recent Security Incidents
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated detection records requiring verification</p>
            </div>
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Incident ID</th>
                  <th className="py-2.5 px-3">Camera</th>
                  <th className="py-2.5 px-3">Anomaly Type</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(analytics?.recentIncidents || []).map((inc) => (
                  <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                      {inc.incidentNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{inc.cameraId}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{inc.cameraName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 capitalize">
                      {inc.type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-all text-[11px] font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Live Activity Feed (1 col) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                Live Activity Feed
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Direct telemetry from inference nodes</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">STREAMING</span>
          </div>

          <div className="space-y-3">
            {liveActivityFeed.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-400 font-bold">{item.cam}</span>
                  <span className="text-slate-500">[{item.time}]</span>
                </div>
                <p className="text-slate-300 font-medium leading-relaxed">{item.text}</p>
                <div className="pt-1 flex justify-end">
                  <SeverityBadge severity={item.severity as any} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
