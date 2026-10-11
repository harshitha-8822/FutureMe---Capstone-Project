import { Link } from 'react-router-dom';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/** Small shared UI pieces used across pages. */

export function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-xl shadow-glow" />
      <span className={`font-display text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        Future<span className={light ? 'text-brand-300' : 'text-gradient'}>Me</span>
      </span>
    </Link>
  );
}

/** Circular score meter — the headline number with a ring that fills to `value`. */
export function ScoreRing({ value = 0, size = 120, stroke = 10, color = '#6366f1', label, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img"
      aria-label={`${label || 'Score'}: ${v} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-200" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {children ?? <span className="font-display text-2xl font-extrabold text-slate-900">{v}</span>}
      </div>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn bg-surface px-3 py-1.5 text-sm text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
          <RotateCcw className="h-4 w-4" /> Retry
        </button>
      )}
    </div>
  );
}

/** Icon-led empty state with one clear next action. */
export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
