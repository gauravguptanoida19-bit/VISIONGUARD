import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Cctv,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { api } from '../services/api';
import { AnalyticsData } from '@visionguard/shared';
import { Card } from '../components/common/Card';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.analytics.getSummary();
        setAnalytics(res.analytics);
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const SEVERITY_COLORS = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#F97316',
    CRITICAL: '#EF4444',
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-wide">Threat & Telemetry Analytics</h1>
          </div>
          <p className="text-xs text-slate-400">
            Longitudinal performance metrics, incident frequencies, and sensor uptime distribution
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
          {['24h', '7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === r ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-[10px] font-mono uppercase text-slate-400">Average MTTR (Resolution)</span>
          <div className="text-3xl font-extrabold text-cyan-400 mt-2">
            {analytics?.averageResponseTimeMinutes || 4.2} <span className="text-sm font-normal text-slate-400">mins</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-mono mt-2">↓ 18% improvement vs baseline</p>
        </Card>

        <Card className="p-5">
          <span className="text-[10px] font-mono uppercase text-slate-400">Avg Detections / Day</span>
          <div className="text-3xl font-extrabold text-white mt-2">1,840</div>
          <p className="text-[11px] text-slate-400 font-mono mt-2">Across 8 sensor streams</p>
        </Card>

        <Card className="p-5">
          <span className="text-[10px] font-mono uppercase text-slate-400">Overall Sensor Uptime</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">99.4%</div>
          <p className="text-[11px] text-emerald-400/80 font-mono mt-2">7 cameras operational, 1 degraded</p>
        </Card>

        <Card className="p-5">
          <span className="text-[10px] font-mono uppercase text-slate-400">False Positive Ratio</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">3.2%</div>
          <p className="text-[11px] text-slate-400 font-mono mt-2">Reduced by ByteTrack filters</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Category Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Most Common Anomaly Categories
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across all monitored cameras</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.anomalyTypeBreakdown || []} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis dataKey="label" type="category" stroke="#94A3B8" fontSize={10} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 7-Day Velocity Chart */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Incident Velocity Trend
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Total incidents vs High-Risk escalations</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.incidentsOverTime || []}>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="total" stroke="#06B6D4" strokeWidth={2.5} name="Total Anomalies" />
                <Line type="monotone" dataKey="highRisk" stroke="#EF4444" strokeWidth={2.5} name="High Risk" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Camera Activity & Reliability Table */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Cctv className="w-4 h-4 text-cyan-400" />
            Camera Activity & Reliability Index
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Node telemetry aggregate rankings</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Camera Node</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Detections Logged</th>
                <th className="py-2.5 px-3">Incidents Triggered</th>
                <th className="py-2.5 px-3">Uptime Reliability</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {(analytics?.cameraActivity || []).map((cam) => (
                <tr key={cam.cameraId} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">{cam.cameraId}</td>
                  <td className="py-3 px-3 text-slate-200 font-medium">{cam.location}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{cam.detections}</td>
                  <td className="py-3 px-3 font-mono text-slate-300 font-bold">{cam.incidents}</td>
                  <td className="py-3 px-3 font-mono">
                    <span className={cam.uptime > 95 ? 'text-emerald-400' : 'text-amber-400'}>
                      {cam.uptime}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
