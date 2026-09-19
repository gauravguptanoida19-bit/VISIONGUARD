import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { SeverityBadge } from './Badge';

export const ToastAlert: React.FC = () => {
  const { activeAlert, dismissAlert } = useSocket();
  const navigate = useNavigate();

  if (!activeAlert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl"
      >
        <div className="rounded-xl border border-rose-500/50 bg-[#0F1423]/95 backdrop-blur-xl p-4 shadow-[0_0_40px_rgba(239,68,68,0.3)] flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <SeverityBadge severity={activeAlert.severity} />
              <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wide">
                Live Anomaly Alert
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeAlert.cameraId} • {new Date(activeAlert.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-100 line-clamp-1">{activeAlert.description}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Camera: <span className="text-slate-200">{activeAlert.cameraName}</span> ({activeAlert.location})
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                dismissAlert();
                navigate(`/incidents/${activeAlert.id}`);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-rose-900/30"
            >
              Investigate
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={dismissAlert}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
