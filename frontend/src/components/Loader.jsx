import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * AI calls take ~10-20s, so instead of a bare spinner we walk through the
 * steps the AI is doing. `steps` advance on a timer and stop at the last one.
 */
export default function Loader({ label = 'Thinking…', steps = [] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (steps.length < 2) return undefined;
    const t = setInterval(() => setI((n) => Math.min(n + 1, steps.length - 1)), 3500);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-600 border-r-fuchsia-500" />
        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-brand-700" />
      </div>
      <p className="font-display text-lg font-bold text-slate-900">{label}</p>
      {steps.length > 0 && (
        <ul className="space-y-1.5 text-sm">
          {steps.map((s, n) => (
            <li key={s} className={`flex items-center justify-center gap-2 transition ${
              n < i ? 'text-emerald-700' : n === i ? 'font-semibold text-brand-700' : 'text-slate-300'}`}>
              <span>{n < i ? '✓' : n === i ? '•' : '○'}</span> {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
