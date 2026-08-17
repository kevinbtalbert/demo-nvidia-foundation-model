import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import MetricsStrip from './components/MetricsStrip';
import TransactionComposer, {
  DEFAULT_FORM,
  exampleToForm,
  formToPayload,
  type FormState,
} from './components/TransactionComposer';
import ModelHeads from './components/ModelHeads';
import ExportDialog from './components/ExportDialog';
import DataDialog from './components/DataDialog';
import clouderaLogo from './assets/partners/cloudera-white.png';
import vastLogo from './assets/partners/vast-white.svg';
import fundamentalLogo from './assets/partners/fundamental-white.png';

// Recharts is heavy and only the embedding map needs it — load it in its own
// chunk so the first paint (header / composer / heads) isn't blocked on it.
const EmbeddingMap = lazy(() => import('./components/EmbeddingMap'));
import {
  getExamples,
  getStatus,
  getSummary,
  getUmap,
  postScore,
  type Example,
  type ScoreResp,
  type StatusResp,
  type Summary,
  type UmapPoint,
} from './api';

export default function App() {
  const [status, setStatus] = useState<StatusResp | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [examples, setExamples] = useState<Example[]>([]);
  const [umap, setUmap] = useState<UmapPoint[]>([]);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  // The example the form currently holds untouched, if any — its
  // expected_position drives the diagnostic ring on the embedding map.
  const [loadedExample, setLoadedExample] = useState<Example | null>(null);
  const [result, setResult] = useState<ScoreResp | null>(null);
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);

  // Load (or reload) all dashboard data. Each call degrades on its own.
  const refresh = useCallback(() => {
    getStatus()
      .then((s) => {
        setStatus(s);
        setStatusError(false);
      })
      .catch(() => setStatusError(true));
    getSummary()
      .then(setSummary)
      .catch(() => {});
    getExamples()
      .then(setExamples)
      .catch(() => {});
    getUmap()
      .then(setUmap)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const runInference = useCallback(async () => {
    setScoring(true);
    setScoreError(null);
    try {
      const r = await postScore(formToPayload(form));
      setResult(r);
    } catch (e) {
      setScoreError(e instanceof Error ? e.message : 'Inference request failed');
    } finally {
      setScoring(false);
    }
  }, [form]);

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <Header
        status={status}
        error={statusError}
        onBuild={() => setExportOpen(true)}
        onData={() => setDataOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1400px] w-full mx-auto">
        <section>
          <div className="mb-4">
            <div className="section-accent mb-2" />
            <h2 className="text-lg font-semibold text-ink">Model performance</h2>
            <p className="text-sm text-ink-muted mt-0.5">
              Test-set metrics from the latest artifact export — compare paradigms below.
            </p>
          </div>
          <MetricsStrip summary={summary} />
        </section>

        <section>
          <div className="mb-4">
            <div className="section-accent mb-2" />
            <h2 className="text-lg font-semibold text-ink">Live inference</h2>
            <p className="text-sm text-ink-muted mt-0.5">
              Compose or load a transaction, score it across model heads, and locate it on the embedding map.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_400px] gap-6 items-start">
            <TransactionComposer
              form={form}
              setForm={(f) => {
                setForm(f);
                setLoadedExample(null); // manual edit — no longer "the" example
              }}
              examples={examples}
              onLoadExample={(ex) => {
                setForm(exampleToForm(ex.txn));
                setLoadedExample(ex);
              }}
              onRun={runInference}
              scoring={scoring}
            />
            <ModelHeads result={result} summary={summary} scoring={scoring} error={scoreError} />
            <Suspense
              fallback={
                <div className="panel p-4 h-[420px] animate-pulse bg-surface-0" />
              }
            >
              <EmbeddingMap umap={umap} result={result} expected={loadedExample?.expected_position ?? null} />
            </Suspense>
          </div>
        </section>
      </main>

      <footer className="mt-auto bg-cloudera-navy border-t border-white/10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-[1400px] w-full mx-auto flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            NVIDIA Transaction Foundation Model · deployed via Cloudera AI Applied ML Prototype
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">Powered by</span>
            <img src={clouderaLogo} alt="Cloudera" className="h-4 opacity-80" />
            <img src={vastLogo} alt="VAST Data" className="h-[15px] opacity-80" />
            <img src={fundamentalLogo} alt="Fundamental (NEXUS)" className="h-[18px] opacity-80" />
          </div>
        </div>
      </footer>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExported={refresh}
      />
      <DataDialog open={dataOpen} onClose={() => setDataOpen(false)} />
    </div>
  );
}
