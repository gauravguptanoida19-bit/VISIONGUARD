import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@visionguard/shared';

interface OperatorPreset {
  role: UserRole;
  name: string;
  title: string;
  email: string;
  avatar: string;
  badge: string;
  clearance: string;
}

const OPERATOR_PRESETS: OperatorPreset[] = [
  {
    role: 'analyst',
    name: 'Ananya Deshmukh',
    title: 'Senior Threat Analyst',
    email: 'analyst@visionguard.ai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badge: 'VG-ANL-409',
    clearance: 'Tier-2 Forensic Access',
  },
  {
    role: 'admin',
    name: 'Vikramaditya Sharma',
    title: 'Chief Security Officer',
    email: 'admin@visionguard.ai',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    badge: 'VG-CSO-001',
    clearance: 'Tier-1 Root Admin',
  },
  {
    role: 'viewer',
    name: 'Rohan Verma',
    title: 'Facility Operations Monitor',
    email: 'viewer@visionguard.ai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    badge: 'VG-MON-112',
    clearance: 'Tier-3 Surveillance',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const requestedRole = searchParams.get('role');

  const initialPreset =
    OPERATOR_PRESETS.find((p) => p.role === requestedRole) || OPERATOR_PRESETS[0];

  const [selectedPreset, setSelectedPreset] = useState<OperatorPreset>(initialPreset);
  const [email, setEmail] = useState(initialPreset.email);
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<'idle' | 'verifying' | 'granted'>('idle');

  // When selectedPreset changes, update form fields
  const handleSelectPreset = (preset: OperatorPreset) => {
    setSelectedPreset(preset);
    setEmail(preset.email);
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthStep('verifying');

    try {
      // Execute genuine JWT backend authentication
      await login(email, password);
      setAuthStep('granted');

      // Brief pause to show authentication confirmation
      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (err: any) {
      setAuthStep('idle');
      setError(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#06090F] flex items-center justify-center p-6 relative select-none">
      {/* Background ambient lighting */}
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="w-full max-w-lg bg-[#0B111E]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-glow-cyan text-black mb-3">
            <Shield className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">Operator Access Terminal</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">VISIONGUARD SECURE GATEWAY</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Select Operator Profile */}
        <div className="mb-5 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            Select Operator Profile to Authorize:
          </p>

          <div className="grid grid-cols-3 gap-2">
            {OPERATOR_PRESETS.map((p) => {
              const isSelected = selectedPreset.role === p.role;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-6 h-6 rounded-full object-cover border border-white/20"
                    />
                    <span
                      className={`text-[9px] font-mono uppercase font-bold px-1 rounded ${
                        p.role === 'admin'
                          ? 'bg-rose-500/20 text-rose-300'
                          : p.role === 'analyst'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {p.role}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">{p.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-400 truncate">{p.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Operator Identity Card */}
        <div className="mb-5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
          <img
            src={selectedPreset.avatar}
            alt={selectedPreset.name}
            className="w-11 h-11 rounded-xl object-cover border border-cyan-500/40 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">{selectedPreset.name}</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/30">
                {selectedPreset.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{selectedPreset.title}</p>
            <p className="text-[10px] font-mono text-emerald-400">{selectedPreset.clearance}</p>
          </div>
        </div>

        {/* Step 2: Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">Operator ID / Email</label>
            <div className="flex items-center gap-2 bg-[#070B14] border border-white/10 rounded-lg px-3 py-2 focus-within:border-cyan-500/50 transition-all">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@visionguard.ai"
                required
                className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-600 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">Security Credential (Password)</label>
            <div className="flex items-center gap-2 bg-[#070B14] border border-white/10 rounded-lg px-3 py-2 focus-within:border-cyan-500/50 transition-all">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-600 outline-none font-mono"
              />
            </div>
          </div>

          {/* Authentication Progress Banner */}
          {authStep === 'verifying' && (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-pulse">
              <Cpu className="w-4 h-4 animate-spin" />
              <span>Verifying JWT token & cryptographic role authorization...</span>
            </div>
          )}

          {authStep === 'granted' && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Access Granted. Launching Operations Console for {selectedPreset.name}...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || authStep !== 'idle'}
            className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/30 mt-2"
          >
            <span>
              {authStep === 'verifying'
                ? 'Authenticating...'
                : authStep === 'granted'
                ? 'Session Authorized'
                : `Authorize Session as ${selectedPreset.name.split(' ')[0]}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <span>Need an account?</span>
          <Link to="/register" className="text-cyan-400 hover:underline font-medium">
            Register new operator
          </Link>
        </div>
      </div>
    </div>
  );
};
