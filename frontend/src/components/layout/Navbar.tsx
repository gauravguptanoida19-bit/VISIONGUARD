import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Play,
  Square,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useDemo } from '../../context/DemoContext';
import { SeverityBadge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, audioEnabled, setAudioEnabled } =
    useSocket();
  const { isDemoRunning, startDemo, stopDemo, triggerScenario, isTriggering } = useDemo();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-[#070B14]/80 backdrop-blur-md border-b border-white/[0.06] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Quick Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-slate-200 text-xs transition-all w-64 text-left group"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
          <span className="flex-1">Search incidents, cameras...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.08]">
            Ctrl K
          </kbd>
        </button>

        {/* Demo Mode Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>DEMO MODE ACTIVE</span>
        </div>
      </div>

      {/* Right Actions: Demo Controls, Audio, Notifications, Status */}
      <div className="flex items-center gap-3">
        {/* Instant Hackathon Scenario Trigger */}
        <button
          onClick={async () => {
            const inc = await triggerScenario();
            if (inc) {
              navigate(`/incidents/${inc.id}`);
            }
          }}
          disabled={isTriggering}
          className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-rose-900/30 border border-rose-400/30"
          title="Instantly simulate person entering restricted zone on CAM-04"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{isTriggering ? 'Simulating...' : 'Simulate Breach'}</span>
        </button>

        {/* Demo Start/Stop Toggle */}
        <button
          onClick={isDemoRunning ? stopDemo : startDemo}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            isDemoRunning
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
          }`}
        >
          {isDemoRunning ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Pause Stream</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Live Demo</span>
            </>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          title={audioEnabled ? 'Alert Audio On' : 'Alert Audio Muted'}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.08]"
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Real-time Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}
          />
          <span className="text-[11px] text-slate-400">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all relative border border-transparent hover:border-white/[0.08]"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0C1220] border border-white/10 shadow-2xl backdrop-blur-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">System Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-500">No active notifications</p>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.incidentId) {
                          navigate(`/incidents/${n.incidentId}`);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        n.read
                          ? 'bg-white/[0.01] border-white/[0.04] text-slate-400'
                          : 'bg-cyan-500/[0.03] border-cyan-500/20 text-slate-200 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <SeverityBadge severity={n.severity} />
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-200 line-clamp-1">{n.title}</p>
                      <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
