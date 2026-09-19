import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Filter, ArrowUpRight, Cctv, Calendar, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/common/Card';
import { SeverityBadge } from '../components/common/Badge';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    answer: string;
    sources: any[];
    query: string;
  } | null>(null);

  const sampleSearches = [
    'Find abandoned object incidents',
    'Show high severity incidents near Gate',
    'Incidents involving person #27',
    'Unauthorized movement in Server Room Vault',
    'Loitering in parking area',
  ];

  const handleSearch = async (text?: string) => {
    const q = text || query;
    if (!q.trim() || isSearching) return;
    setQuery(q);
    setIsSearching(true);
    try {
      const res = await api.ai.search(q);
      setResults(res);
    } catch (err: any) {
      alert(`Search failed: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-extrabold text-white tracking-wide">Semantic Intelligence Search</h1>
        </div>
        <p className="text-xs text-slate-400">
          Natural language and faceted retrieval across all historical camera footage, tracking IDs, and incidents
        </p>
      </div>

      {/* Big Search Input */}
      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="relative">
            <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type natural language query (e.g., 'Incidents involving person #27 near server vault')..."
              className="w-full bg-[#070B14] border border-white/10 rounded-xl pl-12 pr-28 py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/50 shadow-inner"
            />
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-900/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-mono text-slate-400">Try queries:</span>
            {sampleSearches.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(s)}
                className="px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-cyan-500/10 border border-white/[0.06] hover:border-cyan-500/30 text-[11px] text-slate-300 hover:text-cyan-300 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-5">
          {/* AI Synthesis Box */}
          <Card className="p-5" glow="cyan">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-mono font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI SYNTHESIZED INTELLIGENCE BRIEF</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{results.answer}</p>
          </Card>

          {/* Matching Incident Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Correlated Incident Records ({results.sources?.length || 0})
            </h3>

            <div className="space-y-3">
              {results.sources?.map((src) => (
                <Card
                  key={src.incidentId}
                  onClick={() => navigate(`/incidents/${src.incidentId}`)}
                  className="p-4 hover:border-cyan-500/40 cursor-pointer transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold font-mono text-cyan-400">{src.incidentNumber}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs font-semibold text-slate-200">{src.cameraName}</span>
                      <SeverityBadge severity={src.severity as any} />
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-bold">
                        Relevance: {(src.relevanceScore * 100).toFixed(0)}%
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(src.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{src.snippet}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
