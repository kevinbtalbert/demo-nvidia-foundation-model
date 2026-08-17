import { Loader2, Play } from 'lucide-react';
import type { Example, TxnPayload } from '../api';

export interface FormState {
  amount: string;
  merchant: string;
  city: string;
  state: string;
  channel: string;
  mcc: string;
  zip: string;
  time: string;
  card: string;
}

export const DEFAULT_FORM: FormState = {
  amount: '$842.50',
  merchant: 'DIGITAL-GOODS-LLC',
  city: 'ONLINE',
  state: 'ONLINE',
  channel: 'Online Transaction',
  mcc: '5942',
  zip: '00000',
  time: '03:14',
  card: '0',
};

export function formToPayload(f: FormState): TxnPayload {
  return {
    Amount: f.amount,
    'Merchant Name': f.merchant,
    'Merchant City': f.city,
    'Merchant State': f.state,
    'Use Chip': f.channel,
    MCC: parseInt(f.mcc, 10) || 0,
    Zip: f.zip,
    Time: f.time,
    Year: 2019,
    Month: 11,
    Day: 22,
    Card: parseInt(f.card, 10) || 0,
    User: 0,
  };
}

export function exampleToForm(t: Record<string, string | number>): FormState {
  const s = (k: string, d = '') => (t[k] != null ? String(t[k]) : d);
  return {
    amount: s('Amount'),
    merchant: s('Merchant Name'),
    city: s('Merchant City'),
    state: s('Merchant State'),
    channel: s('Use Chip', 'Online Transaction'),
    mcc: s('MCC'),
    zip: s('Zip'),
    time: s('Time'),
    card: s('Card', '0'),
  };
}

const CHANNELS = ['Online Transaction', 'Swipe Transaction', 'Chip Transaction'];

interface Props {
  form: FormState;
  setForm: (f: FormState) => void;
  examples: Example[];
  /** Example-card click — lets the app track which example the form holds
   *  (cleared again on any manual field edit via setForm). */
  onLoadExample: (ex: Example) => void;
  onRun: () => void;
  scoring: boolean;
}

export default function TransactionComposer({ form, setForm, examples, onLoadExample, onRun, scoring }: Props) {
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-3">
        <h2 className="panel-title">Transaction input</h2>
        <span className="panel-kicker">Compose</span>
      </div>

      {examples.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => onLoadExample(ex)}
              className="text-left bg-surface-0 border border-surface-4 rounded-lg px-3 py-2.5 transition-colors hover:border-cloudera-purple/40 hover:bg-white"
            >
              <div className="text-sm font-medium text-ink">{ex.label}</div>
              <div className="text-[11px] font-mono text-ink-muted mt-0.5">
                {String(ex.txn['Amount'] ?? '')} ·{' '}
                {String(ex.txn['Use Chip'] ?? '').split(' ')[0].toUpperCase()}
                {ex.is_fraud != null && ` · Ground truth: ${ex.is_fraud ? 'Fraud' : 'Legit'}`}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="field-label">Amount</label>
          <input className="field-input" value={form.amount} onChange={set('amount')} />
        </div>
        <div>
          <label className="field-label">Merchant</label>
          <input className="field-input" value={form.merchant} onChange={set('merchant')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">City</label>
            <input className="field-input" value={form.city} onChange={set('city')} />
          </div>
          <div>
            <label className="field-label">State</label>
            <input className="field-input" value={form.state} onChange={set('state')} />
          </div>
        </div>
        <div>
          <label className="field-label">Channel</label>
          <select className="field-input" value={form.channel} onChange={set('channel')}>
            {CHANNELS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">MCC</label>
            <input className="field-input" value={form.mcc} onChange={set('mcc')} />
          </div>
          <div>
            <label className="field-label">ZIP</label>
            <input className="field-input" value={form.zip} onChange={set('zip')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Time (HH:MM)</label>
            <input className="field-input" value={form.time} onChange={set('time')} />
          </div>
          <div>
            <label className="field-label">Card</label>
            <input className="field-input" value={form.card} onChange={set('card')} />
          </div>
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={scoring}
        className="btn-primary w-full mt-5 py-2.5"
      >
        {scoring ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Scoring…
          </>
        ) : (
          <>
            <Play className="w-4 h-4" /> Run inference
          </>
        )}
      </button>
    </div>
  );
}
