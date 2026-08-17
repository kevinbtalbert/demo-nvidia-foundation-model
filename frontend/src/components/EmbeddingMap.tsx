import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, ResponsiveContainer } from 'recharts';
import { Map as MapIcon } from 'lucide-react';
import type { ScoreResp, UmapPoint } from '../api';

interface Props {
  umap: UmapPoint[];
  result: ScoreResp | null;
  /** Batch-path map position of the loaded example (diagnostic ring): where
   *  the export projected this exact row. Null when the form was hand-edited. */
  expected?: { x: number; y: number } | null;
}

const MAX_BG = 1500;
const PURPLE = '#5555F9';
const NAVY = '#120046';
const NORMAL = '#413CC3';
const FRAUD = '#D92D20';

function LiveDot(props: { cx?: number; cy?: number }) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={11} fill={PURPLE} fillOpacity={0.18} />
      <circle cx={cx} cy={cy} r={5} fill={PURPLE} stroke="#FFFFFF" strokeWidth={2} />
    </g>
  );
}

function ExpectedRing(props: { cx?: number; cy?: number }) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <circle cx={cx} cy={cy} r={8} fill="none" stroke={NAVY} strokeWidth={1.5} strokeDasharray="3 2.5" opacity={0.7} />
  );
}

export default function EmbeddingMap({ umap, result, expected }: Props) {
  const { normal, fraud, dropped } = useMemo(() => {
    const fraudPts = umap.filter((p) => p.fraud);
    const normalPts = umap.filter((p) => !p.fraud);
    const budget = Math.max(0, MAX_BG - fraudPts.length);
    const stride = normalPts.length > budget ? Math.ceil(normalPts.length / budget) : 1;
    const sampled = stride > 1 ? normalPts.filter((_, i) => i % stride === 0) : normalPts;
    return { normal: sampled, fraud: fraudPts, dropped: normalPts.length - sampled.length };
  }, [umap]);

  const domain = useMemo(() => {
    if (!umap.length) return null;
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    for (const p of umap) {
      if (p.x < xmin) xmin = p.x;
      if (p.x > xmax) xmax = p.x;
      if (p.y < ymin) ymin = p.y;
      if (p.y > ymax) ymax = p.y;
    }
    const padX = (xmax - xmin || 1) * 0.08;
    const padY = (ymax - ymin || 1) * 0.08;
    return {
      x: [xmin - padX, xmax + padX] as [number, number],
      y: [ymin - padY, ymax + padY] as [number, number],
    };
  }, [umap]);

  const clamp = (p: { x: number; y: number }) =>
    domain
      ? {
          x: Math.min(Math.max(p.x, domain.x[0]), domain.x[1]),
          y: Math.min(Math.max(p.y, domain.y[0]), domain.y[1]),
        }
      : p;

  const rawLive = result?.position ?? null;
  const live = rawLive ? [clamp(rawLive)] : [];
  const liveClamped =
    rawLive != null && (live[0].x !== rawLive.x || live[0].y !== rawLive.y);
  const expectedPts = expected ? [clamp(expected)] : [];
  const hasData = umap.length > 0 || live.length > 0;

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-3">
        <h2 className="panel-title">Embedding map</h2>
        <span className="panel-kicker">UMAP · test set</span>
      </div>

      <div className="h-[300px] rounded-lg border border-surface-3 bg-surface-0">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-ink-muted">
            <MapIcon className="w-10 h-10 mb-3 text-ink-faint opacity-50" />
            <p className="text-ink-secondary text-sm">No embedding background yet</p>
            <p className="text-xs text-ink-faint mt-2 text-center px-4">
              Available after export_for_demo.py runs on the GPU box.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
              <XAxis type="number" dataKey="x" hide domain={domain?.x ?? ['dataMin', 'dataMax']} allowDataOverflow />
              <YAxis type="number" dataKey="y" hide domain={domain?.y ?? ['dataMin', 'dataMax']} allowDataOverflow />
              <ZAxis range={[16, 16]} />
              <Scatter data={normal} fill={NORMAL} fillOpacity={0.4} isAnimationActive={false} />
              <Scatter data={fraud} fill={FRAUD} fillOpacity={0.75} isAnimationActive={false} />
              {expectedPts.length > 0 && (
                <Scatter data={expectedPts} isAnimationActive={false} shape={<ExpectedRing />} />
              )}
              {live.length > 0 && (
                <Scatter data={live} isAnimationActive={false} shape={<LiveDot />} />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-mono text-ink-muted">
        <span className="flex items-center gap-1.5">
          <i className="w-2 h-2 rounded-full inline-block" style={{ background: NORMAL }} /> Normal
        </span>
        <span className="flex items-center gap-1.5">
          <i className="w-2 h-2 rounded-full inline-block" style={{ background: FRAUD }} /> Fraud
        </span>
        <span className="flex items-center gap-1.5">
          <i
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: PURPLE, boxShadow: `0 0 6px ${PURPLE}` }}
          />{' '}
          This transaction
        </span>
        {expectedPts.length > 0 && (
          <span className="flex items-center gap-1.5">
            <i
              className="w-2.5 h-2.5 rounded-full inline-block border border-dashed"
              style={{ borderColor: NAVY }}
            />{' '}
            Expected (batch)
          </span>
        )}
      </div>

      <p className="text-[11px] text-ink-faint mt-3 leading-relaxed">
        512-d embeddings projected to 2-D. The decoder learns the geometry from raw sequences — fraud
        clusters emerge with no labels.
        {liveClamped && ' Live point landed beyond the background extent — pinned to the frame edge.'}
        {dropped > 0 && ` ${dropped.toLocaleString()} background points downsampled for rendering.`}
      </p>
    </div>
  );
}
