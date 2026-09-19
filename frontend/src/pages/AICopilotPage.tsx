import React from 'react';
import { CopilotChat } from '../components/copilot/CopilotChat';
import { Bot, Sparkles, Shield, Database } from 'lucide-react';

export const AICopilotPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Bot className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-wide">AI Incident Copilot</h1>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous threat assistant backed by Gemini 3.8 and dense incident vector retrieval
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>ChromaDB Vector Store</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>SOP Guardrails Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <CopilotChat />
      </div>
    </div>
  );
};
