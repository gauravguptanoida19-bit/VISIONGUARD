import React from 'react';
import { Severity, IncidentStatus, CameraStatus } from '@visionguard/shared';

export const SeverityBadge: React.FC<{ severity: Severity; className?: string }> = ({ severity, className = '' }) => {
  const styles: Record<Severity, string> = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono uppercase tracking-wider border ${styles[severity]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {severity}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus; className?: string }> = ({ status, className = '' }) => {
  const styles: Record<IncidentStatus, { label: string; class: string }> = {
    new: { label: 'New Alert', class: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    investigating: { label: 'Investigating', class: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
    resolved: { label: 'Resolved', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    false_positive: { label: 'False Positive', class: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  };

  const item = styles[status] || styles.new;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${item.class} ${className}`}
    >
      {item.label}
    </span>
  );
};

export const CameraStatusBadge: React.FC<{ status: CameraStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const styles: Record<CameraStatus, { label: string; class: string }> = {
    online: { label: 'ONLINE', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    offline: { label: 'OFFLINE', class: 'bg-slate-700/20 text-slate-400 border-slate-700/40' },
    degraded: { label: 'DEGRADED', class: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  };

  const item = styles[status] || styles.online;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${item.class} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'online' ? 'bg-emerald-400 animate-ping' : status === 'degraded' ? 'bg-amber-400' : 'bg-slate-500'
        }`}
      />
      {item.label}
    </span>
  );
};
