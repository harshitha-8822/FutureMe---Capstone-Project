import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Bookmark, BookmarkCheck, Sparkles, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { saveRecommendation } from '../api/client.js';
import CareerCard from '../components/CareerCard.jsx';
import { MatchFormula } from '../components/MatchBreakdown.jsx';
import { EmptyState } from '../components/ui.jsx';

export default function Results() {
  const { profile, result } = useApp();
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  const onSave = async () => {
    if (!isAuthed) {
      navigate('/login', { state: { from: '/results' } });
      return;
    }
    setSaveState('saving');
    try {
      await saveRecommendation(profile, result);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  if (!result) {
    return (
      <div className="page max-w-lg">
        <EmptyState icon={Compass} title="No matches yet" text="Answer 3 quick questions to see your careers."
          action={<Link to="/explore" className="btn-primary">Find my careers</Link>} />
      </div>
    );
  }

  const { summary, careers = [] } = result;

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Your <span className="text-gradient">top {careers.length}</span> careers
          </h1>
          {profile?.fieldOfStudy && <p className="mt-1 text-sm text-slate-500">For {profile.fieldOfStudy}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/explore')} className="btn-ghost px-4 text-sm">
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button onClick={onSave} className="btn-primary px-4 text-sm"
            disabled={saveState === 'saving' || saveState === 'saved'}>
            {saveState === 'saved' ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : isAuthed ? 'Save' : 'Log in to save'}
          </button>
        </div>
      </div>
      {saveState === 'error' && <p className="mt-2 text-sm text-rose-700">Could not save. Please try again.</p>}

      {summary && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-gradient-to-r from-brand-50 via-violet-50 to-fuchsia-50 p-4 ring-1 ring-brand-100">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
          <p className="text-slate-700">{summary}</p>
        </div>
      )}

      {careers.some((c) => c.matchBreakdown) && <div className="mt-4"><MatchFormula /></div>}


      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {careers.map((c, i) => (
          <div key={`${c.name}-${i}`} className="h-full animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <CareerCard career={c} rank={i} />
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-slate-400">Salaries are approximate Indian market estimates.</p>
    </div>
  );
}
