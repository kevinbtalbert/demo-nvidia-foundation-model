import { useState } from 'react';
import { Scale, TrendingUp } from 'lucide-react';
import type { Lift, Summary } from '../api';
import ParadigmCompare from './ParadigmCompare';

interface Props {
  summary: Summary | null;
}

const PARADIGMS = {
  classic: { label: 'Classic ML', chip: 'bg-surface-0 text-ink-muted border border-surface-4' },
  hybrid: { label: 'FM + XGBoost', chip: 'bg-status-purple-dim text-cloudera-purple-dim border border-cloudera-purple/20' },
  foundation: { label: 'Foundation model', chip: 'bg-cloudera-navy/5 text-cloudera-navy border border-cloudera-navy/15' },
} as const;

const META: Record<
  string,
  { tag: string; featured: boolean; liftKey?: keyof Lift; paradigm: keyof typeof PARADIGMS }
> = {
  raw: { tag: 'Baseline', featured: false, paradigm: 'classic' },
  embed: { tag: 'Foundation model', featured: true, liftKey: 'embed_ap_pct', paradigm: 'hybrid' },
  combined: { tag: 'Raw + embeddings', featured: false, liftKey: 'combined_ap_pct', paradigm: 'hybrid' },
  nexus: { tag: 'Large tabular model', featured: true, liftKey: 'nexus_ap_pct', paradigm: 'foundation' },
};

const fmt = (v: number | null) => (v == null ? '—' : v.toFixed(4));
const liftStr = (v: number | null) => (v == null ? '' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`);

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted text-xs">{label}</span>
      <span className="font-mono text-ink text-sm font-medium">{value}</span>
    </div>
  );
}

export default function MetricsStrip({ summary }: Props) {
  const [compareOpen, setCompareOpen] = useState(false);
  if (!summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="panel p-4 h-28 animate-pulse bg-surface-0" />
        ))}
      </div>
    );
  }

  const cards = summary.models
    .filter((m) => META[m.key])
    .map((m) => {
      const { tag, featured, liftKey, paradigm } = META[m.key];
      return {
        m,
        tag: m.stub ? `${tag} · stub` : tag,
        lift: liftKey ? (summary.lift[liftKey] ?? null) : null,
        featured,
        paradigm: PARADIGMS[paradigm],
      };
    });
  const grid = cards.length > 3 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3';

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setCompareOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cloudera-purple-dim hover:text-cloudera-purple transition-colors"
        >
          <Scale className="w-3.5 h-3.5" /> Compare paradigms
        </button>
      </div>
      <div className={`grid grid-cols-1 ${grid} gap-4`}>
        {cards.map(({ m, tag, lift, featured, paradigm }) => (
          <div
            key={m.key}
            className={`panel p-4 ${
              featured ? 'ring-2 ring-cloudera-purple/25 border-cloudera-purple/30' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-medium text-ink-muted">{tag}</div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${paradigm.chip}`}
              >
                {paradigm.label}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-ink mt-1.5 mb-3">{m.label}</h3>
            <div className="space-y-2">
              <StatRow label="ROC-AUC" value={fmt(m.test_auc)} />
              <StatRow label="Avg precision" value={fmt(m.test_ap)} />
            </div>
            {lift != null && (
              <div
                className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${
                  lift < 0 ? 'text-status-red' : 'text-cloudera-green'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {liftStr(lift)} AP vs baseline
              </div>
            )}
          </div>
        ))}
      </div>
      {summary.placeholder && (
        <p className="text-xs text-ink-faint">
          {summary.note || 'Showing placeholder metrics — run export_for_demo.py on the GPU box for live numbers.'}
        </p>
      )}
      <ParadigmCompare open={compareOpen} onClose={() => setCompareOpen(false)} summary={summary} />
    </div>
  );
}
