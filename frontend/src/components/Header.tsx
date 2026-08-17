import { Activity, Cpu, Database, Hammer } from 'lucide-react';
import type { StatusResp } from '../api';
import clouderaLogo from '../assets/partners/cloudera-white.png';

interface Props {
  status: StatusResp | null;
  error: boolean;
  onBuild: () => void;
  onData: () => void;
}

function StatusDot({ tone }: { tone: 'green' | 'amber' | 'neutral' }) {
  const cls =
    tone === 'green'
      ? 'bg-cloudera-green animate-pulse'
      : tone === 'amber'
        ? 'bg-status-amber'
        : 'bg-white/30';
  return <span className={`w-2 h-2 rounded-full ${cls}`} />;
}

export default function Header({ status, error, onBuild, onData }: Props) {
  const real = status?.mode === 'real';
  const modeLabel = error
    ? 'Backend offline'
    : !status
      ? 'Connecting…'
      : real
        ? `Real mode · ${status.gpu ? 'GPU' : 'CPU'}`
        : 'Demo fallback';
  const modeTone: 'green' | 'amber' | 'neutral' = error
    ? 'neutral'
    : real
      ? 'green'
      : 'amber';

  return (
    <header className="bg-cloudera-navy text-white shadow-header">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 max-w-[1400px] w-full mx-auto">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={clouderaLogo}
            alt="Cloudera"
            className="h-5 w-auto shrink-0"
          />
          <span className="hidden sm:block w-px h-8 bg-white/15" aria-hidden />
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold leading-tight truncate">
              Transaction Foundation Model
            </h1>
            <p className="text-xs text-white/60 mt-0.5">
              Live fraud inference · Cloudera AI Applied ML Prototype
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="status-pill bg-white/8 text-white/80">
            <StatusDot tone={modeTone} />
            <Activity className="w-3.5 h-3.5 opacity-70" />
            <span>{modeLabel}</span>
          </div>
          <div className="status-pill bg-white/8 text-white/80">
            <StatusDot tone={status?.gpu ? 'green' : 'neutral'} />
            <Cpu className="w-3.5 h-3.5 opacity-70" />
            <span>{status?.gpu ? 'CUDA ready' : 'No GPU'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onData}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              Data
            </button>
            <button
              onClick={onBuild}
              className="inline-flex items-center gap-1.5 bg-cloudera-orange hover:bg-[#e64d0c] text-white px-3 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-sm"
            >
              <Hammer className="w-3.5 h-3.5" />
              Build artifacts
            </button>
          </div>
        </div>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-cloudera-orange via-cloudera-purple to-cloudera-purple-dim" />
    </header>
  );
}
