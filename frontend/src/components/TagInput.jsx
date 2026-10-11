import { useState } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * Chip-style multi-value input. Type a value + Enter/comma to add it.
 * Optional `suggestions` render as one-tap quick-add buttons.
 */
export default function TagInput({ label, hint, values, onChange, placeholder, suggestions = [] }) {
  const [draft, setDraft] = useState('');

  const add = (val) => {
    const v = val.trim();
    if (!v) return;
    if (values.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...values, v]);
    setDraft('');
  };

  const remove = (val) => onChange(values.filter((x) => x !== val));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && values.length) {
      remove(values[values.length - 1]);
    }
  };

  const remaining = suggestions.filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div>
      {label && <label className="label">{label}</label>}
      {hint && <p className="-mt-1 mb-2 text-xs text-slate-400">{hint}</p>}
      <div className="flex min-h-[3.25rem] flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-surface p-2 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-600 to-violet-600 py-1 pl-3 pr-1.5 text-sm font-semibold text-white">
            {v}
            <button type="button" onClick={() => remove(v)}
              className="grid h-5 w-5 place-items-center rounded-full hover:bg-white/20" aria-label={`Remove ${v}`}>
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={values.length ? 'Add more…' : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 outline-none"
        />
      </div>
      {remaining.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {remaining.slice(0, 12).map((s) => (
            <button key={s} type="button" onClick={() => add(s)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-sm text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
              <Plus className="h-3.5 w-3.5" /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
