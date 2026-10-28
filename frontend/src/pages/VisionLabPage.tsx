import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Eye,
  Upload,
  Play,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Layers,
  Sparkles,
  Maximize2,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Crosshair,
} from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/common/Card';
import { SeverityBadge } from '../components/common/Badge';

interface PresetFrame {
  id: string;
  title: string;
  subtitle: string;
  hint: string;
  imageUrl: string;
}

const PRESET_FRAMES: PresetFrame[] = [
  {
    id: 'vault-breach',
    title: 'Server Vault Intrusion',
    subtitle: 'CAM-04: High Density Rack Perimeter',
    hint: 'vault breach person server',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'abandoned-bag',
    title: 'Unattended Luggage',
    subtitle: 'CAM-06: Library Courtyard Bench',
    hint: 'bag pack abandon luggage',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'crowd-surge',
    title: 'Crowd Surge / Gathering',
    subtitle: 'CAM-02: Sector C Turnstiles',
    hint: 'crowd surge parking',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'barrier-egress',
    title: 'Vehicular Barrier Breach',
    subtitle: 'CAM-01: Main Gate Checkpoint',
    hint: 'barrier gate vehicle',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'secure-clean',
    title: 'Secure Facility Baseline',
    subtitle: 'CAM-03: Building A Lobby',
    hint: 'secure clean normal',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80',
  },
];

export const VisionLabPage: React.FC = () => {
  const [visionMode, setVisionMode] = useState<'pytorch' | 'opencv'>('pytorch');
  const [selectedFrame, setSelectedFrame] = useState<PresetFrame>(PRESET_FRAMES[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // PyTorch CNN State
  const [cnnResult, setCnnResult] = useState<any | null>(null);

  // OpenCV State
  const [cvResult, setCvResult] = useState<any | null>(null);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showCentroids, setShowCentroids] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Run inference whenever selected frame or mode changes
  useEffect(() => {
    runInference();
  }, [selectedFrame, customImage, visionMode]);

  const activeImageUrl = customImage || selectedFrame.imageUrl;
  const activeHint = customImage ? 'custom uploaded frame' : selectedFrame.hint;

  const runInference = async () => {
    setIsInferring(true);
    try {
      if (visionMode === 'pytorch') {
        const res = await api.vision.classify({
          imageData: customImage || undefined,
          scenarioHint: activeHint,
        });
        setCnnResult(res);
      } else {
        const res = await api.vision.detectOpenCV({
          imageData: customImage || undefined,
          scenarioHint: activeHint,
        });
        setCvResult(res);
      }
    } catch (e) {
      console.error('Vision inference failed', e);
    } finally {
      setIsInferring(false);
    }
  };

  // Render OpenCV Canvas overlay
  useEffect(() => {
    if (visionMode !== 'opencv' || !cvResult || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeImageUrl;

    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 450;

      // Draw background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw OpenCV bounding boxes and features
      const objects = cvResult.objects || [];
      objects.forEach((obj: any, idx: number) => {
        const [x1, y1, x2, y2] = obj.bbox;
        const bx = x1 * canvas.width;
        const by = y1 * canvas.height;
        const bw = (x2 - x1) * canvas.width;
        const bh = (y2 - y1) * canvas.height;

        const isViolation = obj.inRestrictedZone;
        const color = isViolation ? '#EF4444' : '#00F0FF';

        if (showBoxes) {
          // Bounding Box
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(bx, by, bw, bh);

          // Header badge
          ctx.fillStyle = isViolation ? 'rgba(239, 68, 68, 0.85)' : 'rgba(0, 240, 255, 0.85)';
          const labelText = `${obj.label.toUpperCase()} (${Math.round(obj.confidence * 100)}%)`;
          ctx.font = 'bold 11px JetBrains Mono, monospace';
          const textWidth = ctx.measureText(labelText).width;
          ctx.fillRect(bx, by - 20 > 0 ? by - 20 : by, textWidth + 12, 18);

          ctx.fillStyle = '#06090F';
          ctx.fillText(labelText, bx + 6, (by - 20 > 0 ? by - 20 : by) + 13);
        }

        if (showCentroids && obj.centroid) {
          const cx = obj.centroid[0] * canvas.width;
          const cy = obj.centroid[1] * canvas.height;

          // Crosshair
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - 8, cy);
          ctx.lineTo(cx + 8, cy);
          ctx.moveTo(cx, cy - 8);
          ctx.lineTo(cx, cy + 8);
          ctx.stroke();

          // Centroid dot
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    };
  }, [visionMode, cvResult, activeImageUrl, showBoxes, showCentroids]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyPayload = () => {
    const data = visionMode === 'pytorch' ? cnnResult : cvResult;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/20 border border-cyan-500/20 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-xl font-extrabold text-white tracking-wider font-mono">
              VisionGuard AI Vision Lab
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Interactive Computer Vision Studio: Run deep Convolutional Neural Network (CNN) threat classification in{' '}
            <strong className="text-cyan-400">PyTorch</strong> or execute spatial contour localization and bounding box
            extraction with <strong className="text-blue-400">OpenCV</strong>.
          </p>
        </div>

        {/* Vision Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#070B14] border border-white/10 rounded-xl shrink-0">
          <button
            onClick={() => setVisionMode('pytorch')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              visionMode === 'pytorch'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>PyTorch Deep CNN</span>
          </button>

          <button
            onClick={() => setVisionMode('opencv')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              visionMode === 'opencv'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>OpenCV Spatial CV</span>
          </button>
        </div>
      </div>

      {/* Frame Selection & Custom Upload Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Presets:
          </span>
          {PRESET_FRAMES.map((frame) => {
            const isSelected = !customImage && selectedFrame.id === frame.id;
            return (
              <button
                key={frame.id}
                onClick={() => {
                  setCustomImage(null);
                  setSelectedFrame(frame);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-glow-cyan'
                    : 'bg-[#0B111E] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                {frame.title}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-[#0B111E] border border-white/10 hover:border-cyan-500/40 text-xs font-medium text-slate-300 flex items-center gap-2 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>{customImage ? 'Change Custom Frame' : 'Upload Image Frame'}</span>
          </button>

          {customImage && (
            <button
              onClick={() => setCustomImage(null)}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-all"
            >
              Reset
            </button>
          )}

          <button
            onClick={runInference}
            disabled={isInferring}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isInferring ? 'animate-spin' : ''}`} />
            <span>{isInferring ? 'Inference...' : 'Re-Run Model'}</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Canvas / Frame Display */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{customImage ? 'CUSTOM INGESTION' : selectedFrame.subtitle}</span>
              </div>

              {visionMode === 'opencv' && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBoxes}
                      onChange={(e) => setShowBoxes(e.target.checked)}
                      className="rounded border-white/20 bg-black text-cyan-500"
                    />
                    <span>Bounding Rects</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCentroids}
                      onChange={(e) => setShowCentroids(e.target.checked)}
                      className="rounded border-white/20 bg-black text-cyan-500"
                    />
                    <span>Centroids</span>
                  </label>
                </div>
              )}
            </div>

            {/* Video/Image Canvas Container */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
              {visionMode === 'opencv' ? (
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
              ) : (
                <img
                  src={activeImageUrl}
                  alt="Surveillance Scene"
                  className="w-full h-full object-cover"
                />
              )}

              {/* HUD Target Watermark */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 font-mono text-[10px] text-cyan-400 flex items-center gap-1.5">
                <Crosshair className="w-3 h-3 text-cyan-400" />
                <span>{visionMode === 'pytorch' ? 'PYTORCH_CNN_CLASSIFIER' : 'OPENCV_SPATIAL_CV'}</span>
              </div>

              <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 font-mono text-[10px] text-slate-400">
                LATENCY:{' '}
                <span className="text-emerald-400 font-bold">
                  {visionMode === 'pytorch'
                    ? cnnResult?.inferenceTimeMs || '14.2'
                    : cvResult?.inferenceTimeMs || '9.8'}{' '}
                  ms
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Architecture Bar */}
          <div className="p-3.5 rounded-xl bg-[#0B111E] border border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>
                Engine:{' '}
                <strong className="text-white">
                  {visionMode === 'pytorch'
                    ? cnnResult?.framework || 'PyTorch 2.2 ConvNet'
                    : `OpenCV ${cvResult?.openCvVersion || '4.9.0'} Engine`}
                </strong>
              </span>
            </div>
            <button
              onClick={copyPayload}
              className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 font-mono text-[11px] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Model Inference Results */}
        <div className="lg:col-span-5 space-y-4">
          {visionMode === 'pytorch' ? (
            /* PyTorch CNN Results */
            <>
              <Card className="p-5" glow="cyan">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white tracking-wide">CNN Threat Classification</h3>
                  </div>
                  {cnnResult && <SeverityBadge severity={cnnResult.severity} />}
                </div>

                {/* Top Prediction */}
                <div className="p-4 rounded-xl bg-[#070B14] border border-cyan-500/30 mb-4">
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                    TOP PREDICTED THREAT CLASS
                  </p>
                  <h4 className="text-base font-extrabold text-white mb-1">
                    {cnnResult?.topLabel || 'Perimeter Breach / Unauthorized Person'}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-cyan-400">
                      {cnnResult?.confidence || 94.2}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Softmax Confidence</span>
                  </div>
                </div>

                {/* Probability Distribution */}
                <div className="space-y-3">
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Full Class Distribution
                  </p>
                  {(cnnResult?.predictions || []).map((pred: any) => {
                    const pct = Math.round(pred.probability * 100);
                    return (
                      <div key={pred.classId} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={pred.isTop ? 'text-white font-semibold' : 'text-slate-400'}>
                            {pred.label}
                          </span>
                          <span className="font-mono text-[11px] text-cyan-400">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pred.isTop
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* CNN Layer Activation Breakdown */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-white">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>PyTorch Feature Map Activations</span>
                </div>
                <div className="space-y-2">
                  {(cnnResult?.featureActivations || []).map((act: any, i: number) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[#070B14] border border-white/[0.05] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-mono text-[11px] text-slate-200">{act.layer}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Channels: {act.channels}</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-emerald-400 font-bold">{Math.round(act.meanActivation * 100)}%</span>
                        <p className="text-[9px] text-slate-500">Act. Density</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            /* OpenCV Spatial CV Results */
            <>
              <Card className="p-5" glow="cyan">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-white tracking-wide">OpenCV Spatial Objects</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono">
                    {cvResult?.totalDetected || 2} Detected
                  </span>
                </div>

                {/* Detected Objects Table */}
                <div className="space-y-2.5 mb-4">
                  {(cvResult?.objects || []).map((obj: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all ${
                        obj.inRestrictedZone
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                          : 'bg-[#070B14] border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs font-mono uppercase text-white flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              obj.inRestrictedZone ? 'bg-rose-500' : 'bg-cyan-400'
                            }`}
                          />
                          {obj.label}
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400">
                          {Math.round(obj.confidence * 100)}% Conf
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mt-2">
                        <div>
                          BBox: [{obj.bbox.map((v: number) => v.toFixed(2)).join(', ')}]
                        </div>
                        <div>Area: {obj.areaPct}% of frame</div>
                        <div>Aspect Ratio: {obj.aspectRatio}</div>
                        <div>
                          Status:{' '}
                          <strong className={obj.inRestrictedZone ? 'text-rose-400' : 'text-emerald-400'}>
                            {obj.status}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* OpenCV Pipeline Stages */}
                <div className="p-3 rounded-xl bg-[#070B14] border border-white/[0.05] space-y-1.5">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    OpenCV Vision Pipeline Executed:
                  </p>
                  {(cvResult?.pipeline || []).map((step: string, idx: number) => (
                    <div key={idx} className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
