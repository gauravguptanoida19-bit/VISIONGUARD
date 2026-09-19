import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cctv,
  AlertTriangle,
  Bot,
  Search,
  BarChart3,
  FileText,
  Users,
  Settings,
  Shield,
  Activity,
  LogOut,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cameras', label: 'Live Cameras', icon: Cctv },
    { to: '/incidents', label: 'Incidents', icon: AlertTriangle, badge: 'Active' },
    { to: '/ai-copilot', label: 'AI Copilot', icon: Bot, isNew: true },
    { to: '/search', label: 'Smart Search', icon: Search },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/reports', label: 'Reports', icon: FileText },
  ];

  const adminItems = [
    { to: '/users', label: 'User Directory', icon: Users },
    { to: '/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-[#070B14] border-r border-white/[0.06] flex flex-col justify-between shrink-0 select-none z-30">
      {/* Top Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 gap-3 border-b border-white/[0.06]">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-glow-cyan text-black">
            <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                VISIONGUARD
              </span>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Security AI Ops</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">Operations</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.isNew && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase font-mono">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}

          {isAdmin && (
            <div className="pt-5 space-y-1">
              <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">Administration</p>
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile & System Telemetry */}
      <div className="p-3 border-t border-white/[0.06] space-y-3">
        {/* Live Engine Status */}
        <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AI Stream Engine</span>
          </div>
          <span className="text-emerald-400 font-semibold">ONLINE</span>
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'Ananya Deshmukh'}
              className="w-8 h-8 rounded-full border border-white/10 shrink-0 bg-slate-800 object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Ananya Deshmukh'}</p>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                {user?.role || 'analyst'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/[0.04] rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
