import { AlertTriangle, CheckCircle, Cpu } from 'lucide-react';
import type { ScoreResp, Summary } from '../api';

interface Props {
  result: ScoreResp | null;
  summary: Summary | null;
  scoring: boolean;
  error: string | null;
}

const PARADIGMS: { id: 'classic' | 'hybrid' | 'foundation'; label: string; cls: string }[] = [
  { id: 'classic', label: 'Classic ML', cls: 'text-ink-muted' },
  { id: 'hybrid', label: 'Foundation-fed XGBoost', cls: 'text-cloudera-purple-dim' },
  { id: 'foundation', label: 'Foundation model', cls: 'text-cloudera-navy' },
];

const HEADS: {
  key: 'raw' | 'embed' | 'combined' | 'nexus';
  paradigm: 'classic' | 'hybrid' | 'foundation';
  label: string;
  fill: string;
  text: string;
}[] = [
  { key: 'raw', paradigm: 'classic', label: 'Raw features', fill: 'bg-ink-faint', text: 'text-ink-secondary' },
  { key: 'embed', paradigm: 'hybrid', label: 'Embeddings', fill: 'bg-cloudera-purple', text: 'text-cloudera-purple-dim' },
  { key: 'combined', paradigm: 'hybrid', label: 'Combined', fill: 'bg-cloudera-orange', text: 'text-cloudera-orange' },
  { key: 'nexus', paradigm: 'foundation', label: 'Large Tabular Model', fill: 'bg-cloudera-navy', text: 'text-cloudera-navy' },
];

const THRESHOLD = 0.5;

function meta(key: string, summary: Summary | null, result: ScoreResp): string {
  if (key === 'raw') return `P(fraud) · ${summary?.n_raw_features ?? '—'}-d tabular`;
  if (key === 'embed') return `P(fraud) · ${summary?.pca_dim ?? 64}-d PCA embedding`;
  if (key === 'nexus') {
    const info = result.nexus;
    if (info?.status === 'timeout') return 'Remote LTM timed out — no score';
    if (info?.status === 'unavailable') return 'Remote LTM unavailable — no score';
    const lat = info?.latency_ms != null ? ` · ${(info.latency_ms / 1000).toFixed(1)} s remote` : '';
    return `P(fraud) · raw table → NEXUS${lat}`;
  }
  return 'P(fraud) · raw + embedding';
}

export default function ModelHeads({ result, summary, scoring, error }: Props) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-3">
        <h2 className="panel-title">Model heads</h2>
        <span className="panel-kicker">
          {result && 'nexus' in result.scores
            ? 'Raw · embeddings · combined · LTM'
            : 'Raw · embeddings · combined'}
        </span>
      </div>

      {result && (
        <div className="flex flex-wrap gap-1.5 mb-4 min-h-[28px]">
          {result.tokens.slice(0, 16).map((t, i) => {
            const special = t.startsWith('<');
            return (
              <span
                key={i}
                className={`font-mono text-[11px] px-2 py-1 rounded border animate-fade-slide-in ${
                  special
                    ? 'bg-status-purple-dim border-cloudera-purple/25 text-cloudera-purple-dim'
                    : 'bg-surface-0 border-surface-4 text-ink-muted'
                }`}
                style={{ animationDelay: `${i * 45}ms` }}
              >
                {t}
              </span>
            );
          })}
        </div>
      )}

      {error && (
        <div className="px-4 py-3 bg-status-red-dim border border-status-red/30 rounded-lg text-sm text-status-red">
          {error}
        </div>
      )}

      {!result && !error && (
        <div className="text-center py-12">
          <Cpu className="w-12 h-12 mx-auto mb-3 text-ink-faint opacity-40" />
          <p className="text-ink-secondary text-sm">Load an example or compose a transaction, then run inference.</p>
          <p className="text-xs text-ink-faint mt-2 max-w-sm mx-auto">
            Each score is a forward pass through the decoder checkpoint when the backend is in REAL mode.
          </p>
        </div>
      )}

      {result && (
        <>
          <div className="space-y-4">
            {PARADIGMS.map(({ id, label: groupLabel, cls }) => {
              const heads = HEADS.filter((h) => h.paradigm === id && h.key in result.scores);
              if (!heads.length) return null;
              return (
                <div key={id} className="space-y-4">
                  <div className="flex items-center gap-2 -mb-1">
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${cls}`}>{groupLabel}</span>
                    <div className="flex-1 h-px bg-surface-3" />
                  </div>
                  {heads.map(({ key, label, fill, text }) => {
                    const p = result.scores[key];
                    const pct = typeof p === 'number' ? (p * 100).toFixed(1) : null;
                    return (
                      <div key={key}>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-sm font-medium text-ink-secondary">{label}</span>
                          <span className={`font-mono text-base font-semibold ${pct == null ? 'text-ink-faint' : text}`}>
                            {pct == null ? '—' : `${pct}%`}
                          </span>
                        </div>
                        <div className="h-2 bg-surface-0 rounded-full overflow-hidden border border-surface-3">
                          <div
                            className={`h-full rounded-full ${fill} transition-[width] duration-700 ease-out`}
                            style={{ width: `${pct ?? 0}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-ink-faint mt-1">{meta(key, summary, result)}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <Verdict result={result} scoring={scoring} />
        </>
      )}
    </div>
  );
}

function Verdict({ result, scoring }: { result: ScoreResp; scoring: boolean }) {
  const p = result.scores.combined;
  const flagged = p >= THRESHOLD;
  const pct = (p * 100).toFixed(1);
  return (
    <div
      className={`mt-5 flex items-center gap-3 px-4 py-3 rounded-lg border ${
        flagged
          ? 'bg-status-red-dim border-status-red/30 animate-pulse-glow'
          : 'bg-status-green-dim border-cloudera-green/30'
      } ${scoring ? 'opacity-60' : ''}`}
    >
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
          flagged ? 'bg-status-red/15 text-status-red' : 'bg-cloudera-green/15 text-cloudera-green'
        }`}
      >
        {flagged ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
        {flagged ? 'Flag · Review' : 'Clear'}
      </span>
      <p className="text-xs text-ink-secondary leading-relaxed">
        Combined head returns <span className="font-mono font-medium text-ink">{pct}%</span> fraud probability.{' '}
        {result.mode === 'real'
          ? `Embedding extracted live from the ${result.embedding_dim}-d decoder checkpoint.`
          : 'Synthetic score — run export_for_demo.py on the GPU box for live model output.'}
      </p>
    </div>
  );
}
