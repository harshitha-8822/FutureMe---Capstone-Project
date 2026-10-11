import { Link } from 'react-router-dom';
import { Target, ArrowRight, MapPin, IndianRupee, Flame } from 'lucide-react';
import { streamStyle } from '../utils/streams.js';
import { ScoreRing } from './ui.jsx';
import MatchBreakdown from './MatchBreakdown.jsx';

function matchColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#6366f1';
  return '#f59e0b';
}

export default function CareerCard({ career, rank }) {
  const { name, stream, matchScore = 0, matchBreakdown, matchCap, whyItFits, salaryINR = {}, demand, topHubs = [] } = career;
  const { icon: Icon, tone, chip } = streamStyle(stream);
  const href = `/career/${encodeURIComponent(name)}`;

  return (
    <div className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`h-1.5 bg-gradient-to-r ${tone}`} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${chip}`}>{stream}</span>
              {rank === 0 && <span className="whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">★ Top pick</span>}
            </div>
            <h3 className="mt-1 text-lg font-bold leading-snug text-slate-900">{name}</h3>
          </div>
          <ScoreRing value={matchScore} size={56} stroke={6} color={matchColor(matchScore)} label="Match">
            <div className="leading-none">
              <div className="text-sm font-extrabold text-slate-900">{matchScore}</div>
              <div className="text-[9px] font-semibold uppercase text-slate-400">match</div>
            </div>
          </ScoreRing>
        </div>

        {whyItFits && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{whyItFits}</p>}

        {matchBreakdown && (
          <div className="mt-3">
            <MatchBreakdown parts={matchBreakdown} cap={matchCap} />
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase text-slate-400">
              <IndianRupee className="h-3 w-3" /> Starting
            </div>
            <div className="font-bold text-slate-800">₹ {salaryINR.entry || '—'}</div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase text-slate-400">
              <Flame className="h-3 w-3" /> Demand
            </div>
            <div className="font-bold text-slate-800">{demand || '—'}</div>
          </div>
        </div>

        {topHubs.length > 0 && (
          <p className="mt-3 flex items-center gap-1.5 truncate text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {topHubs.slice(0, 3).join(' · ')}
          </p>
        )}

        <div className="mt-auto pt-5">
          <Link to={href} className="btn-primary w-full text-sm">
            <Target className="h-4 w-4" /> Check my skill gap <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
