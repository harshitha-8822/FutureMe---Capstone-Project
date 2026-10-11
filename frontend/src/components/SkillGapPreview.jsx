import { CheckCircle2, CircleDashed, AlertCircle } from 'lucide-react';
import { ScoreRing } from './ui.jsx';

const SAMPLE = [
  { name: 'Excel', level: 4, need: 4, icon: CheckCircle2, bar: 'bg-emerald-500', text: 'text-emerald-700' },
  { name: 'Statistics', level: 2, need: 3, icon: CircleDashed, bar: 'bg-amber-400', text: 'text-amber-700' },
  { name: 'SQL', level: 0, need: 3, icon: AlertCircle, bar: 'bg-rose-500', text: 'text-rose-700' },
];

/** A static preview of the result, so students know what they'll get. */
export default function SkillGapPreview({ className = '' }) {
  return (
    <div className={`card relative overflow-hidden p-6 ${className}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-200/50 blur-2xl" />
      <p className="eyebrow">Example · Data Analyst</p>
      <div className="mt-4 flex items-center gap-4">
        <ScoreRing value={62} size={84} stroke={9} color="#f59e0b" label="Example readiness">
          <span className="font-display text-xl font-extrabold text-slate-900">62%</span>
        </ScoreRing>
        <div>
          <p className="font-bold text-slate-900">Getting there</p>
          <p className="text-sm text-slate-500">~10 weeks to job-ready</p>
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {SAMPLE.map(({ name, level, need, icon: Icon, bar, text }) => (
          <li key={name}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Icon className={`h-4 w-4 ${text}`} /> {name}
              </span>
              <span className="text-xs text-slate-400">{level}/{need}</span>
            </div>
            <div className="mt-1.5 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`h-2 flex-1 rounded-full ${n <= level ? bar : n <= need ? 'bg-slate-200 ring-1 ring-inset ring-slate-300' : 'bg-slate-100'}`} />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

