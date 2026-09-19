import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Eye,
  Crosshair,
  AlertTriangle,
  Bot,
  Search,
  BarChart3,
  Cpu,
  Layers,
  ArrowRight,
  Play,
  CheckCircle2,
  Lock,
  Radio,
  Server,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, demoLogin } = useAuth();

  const handleLaunch = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleWatchDemo = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login?role=analyst');
    }
  };

  return (
    <div className="min-h-screen bg-[#06090F] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-[#06090F]/80 backdrop-blur-md border-b border-white/[0.06] z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-glow-cyan text-black">
            <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            VISIONGUARD
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#pipeline" className="hover:text-cyan-400 transition-colors">AI Pipeline</a>
          <a href="#architecture" className="hover:text-cyan-400 transition-colors">Architecture</a>
          <a href="#demo" className="hover:text-cyan-400 transition-colors">Live Demo</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={handleLaunch}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-900/30"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-24 px-6 sm:px-12 max-w-7xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>NEXT-GEN SURVEILLANCE PLATFORM</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            <span className="text-white">See. Understand. </span>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Respond.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 font-normal leading-relaxed">
            AI-powered video intelligence for real-time detection, tracking and incident analysis.
            Zero-latency anomaly detection backed by Gemini 3.8 and autonomous RAG reasoning.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={handleLaunch}
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-xl shadow-cyan-900/40 hover:-translate-y-0.5"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleWatchDemo}
              className="px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current text-cyan-400" />
              <span>Watch Live Demo</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Interactive Animated Pipeline: Camera -> Detection -> AI Analysis -> Alert */}
      <section id="pipeline" className="py-16 px-6 sm:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">Real-Time Autonomous Pipeline</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">From Raw RTSP Stream to Grounded AI Triage</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {[
            {
              step: '01',
              title: 'Multi-Camera Ingest',
              icon: Eye,
              desc: 'Continuous frame decoding from 8 edge cameras at 30 FPS with hardware acceleration.',
              color: 'text-cyan-400',
              border: 'border-cyan-500/20',
            },
            {
              step: '02',
              title: 'YOLOv8 & ByteTrack',
              icon: Crosshair,
              desc: 'Sub-15ms object classification and trajectory continuity with persistent Track IDs (#27, #31).',
              color: 'text-emerald-400',
              border: 'border-emerald-500/20',
            },
            {
              step: '03',
              title: 'Anomaly Engine',
              icon: AlertTriangle,
              desc: 'Ray-casting point-in-polygon checks for restricted zones, loitering dwell timers, and unattended bags.',
              color: 'text-amber-400',
              border: 'border-amber-500/20',
            },
            {
              step: '04',
              title: 'LLM RAG & Live Alert',
              icon: Bot,
              desc: 'Gemini 3.8 Flash synthesizes forensic narrative and pushes instant WebSocket notifications.',
              color: 'text-rose-400',
              border: 'border-rose-500/20',
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-2xl bg-[#0B111E]/80 border ${card.border} backdrop-blur-xl relative group hover:border-white/20 transition-all`}
              >
                <span className="text-[10px] font-mono text-slate-500 font-bold block mb-4">PHASE {card.step}</span>
                <div className={`p-3 rounded-xl bg-white/[0.03] w-fit mb-4 ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-2">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">Core Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">Enterprise AI Security Without Compromise</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Restricted Zone Perimetering',
              desc: 'Define custom polygon boundaries directly over live camera canvas with active schedules and severity policies.',
              icon: Shield,
            },
            {
              title: 'Loitering & Dwell Timers',
              desc: 'Continuously measures subject stationary duration in sensitive bays, triggering alarms when thresholds are breached.',
              icon: Radio,
            },
            {
              title: 'Abandoned Object Detection',
              desc: 'Identifies backpacks, luggage, and crates left unattended without a correlated owner within a 10m perimeter.',
              icon: AlertTriangle,
            },
            {
              title: 'AI Incident Explanations',
              desc: 'Generates structured forensic summaries, evidence timeline reconstructions, and actionable investigation next steps.',
              icon: Bot,
            },
            {
              title: 'Retrieval-Augmented Copilot',
              desc: 'Natural language semantic search and conversational triage across all past surveillance events and incident records.',
              icon: Search,
            },
            {
              title: 'Executive Telemetry Analytics',
              desc: 'Live statistical dashboards tracking threat distributions, active camera uptime, and incident resolution MTTR.',
              icon: BarChart3,
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#090E18] border border-white/[0.06] hover:border-cyan-500/30 transition-all group"
              >
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit mb-4 group-hover:bg-cyan-500/20 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Architecture Section */}
      <section id="architecture" className="py-20 px-6 sm:px-12 max-w-5xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">Technical Rigor</p>
          <h2 className="text-3xl font-bold text-slate-100">Production Full-Stack Architecture</h2>
        </div>

        <div className="p-8 rounded-2xl bg-[#0B111E] border border-white/10 font-mono text-xs text-slate-300 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-cyan-400 font-bold">COMPONENT</span>
            <span className="text-slate-400">ENGINEERING DESIGN</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
            <span className="text-slate-200">Frontend Client</span>
            <span className="text-slate-400">React 18 + Vite + TypeScript + Tailwind + Framer Motion + Canvas</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
            <span className="text-slate-200">Backend API</span>
            <span className="text-slate-400">Node.js + Express + TypeScript + Socket.IO + JWT RBAC</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
            <span className="text-slate-200">Storage Layer</span>
            <span className="text-slate-400">Dual-tier MongoDB Mongoose + Resilient In-Memory Fallback</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
            <span className="text-slate-200">Vision Inference</span>
            <span className="text-slate-400">Python FastAPI + Ultralytics YOLOv8 + ByteTrack + Ray-Casting</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
            <span className="text-slate-200">AI Intelligence & RAG</span>
            <span className="text-slate-400">Google GenAI SDK (gemini-3.8-flash) + Cosine Vector Retrieval</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 sm:px-12 border-t border-white/[0.06] text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-bold">VISIONGUARD</span>
          <span>© 2026 AI Surveillance Platform</span>
        </div>
        <p>Built for High-Stakes Security Operations & Defense Hackathon</p>
      </footer>
    </div>
  );
};
