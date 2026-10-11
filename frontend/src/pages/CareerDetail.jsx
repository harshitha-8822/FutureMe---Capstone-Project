import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Target, Map, IndianRupee, Flame, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getCareerRoadmap, getSkillGap, saveRoadmap, saveSkillGap, errorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import SkillGapView from '../components/SkillGapView.jsx';
import RoadmapView from '../components/RoadmapView.jsx';
import { ErrorBox } from '../components/ui.jsx';
import { streamStyle } from '../utils/streams.js';
import { skillStatus } from '../utils/skillGap.js';

const TABS = [
  { key: 'gap', label: 'Skill Gap', icon: Target },
  { key: 'roadmap', label: 'Roadmap', icon: Map },
];

/** Skills the roadmap should focus on: the AI's priority gaps, then any other unmet must-haves. */
function gapFocus(gap) {
  if (!gap) return [];
  const names = (gap.priorityGaps || []).map((g) => g.skill);
  for (const s of gap.skills || []) {
    if (s.importance === 'Must-have' && skillStatus(s) !== 'strong' && !names.includes(s.name)) names.push(s.name);
  }
  return names.slice(0, 6);
}

function CareerDetailInner({ name }) {
  const careerName = decodeURIComponent(name || '');
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'roadmap' ? 'roadmap' : 'gap';
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, result, getCached, putCached } = useApp();
  const { isAuthed } = useAuth();

  const gap = getCached('gap', careerName);
  const roadmap = getCached('roadmap', careerName);
  const career = result?.careers?.find((c) => c.name === careerName);
  const { icon: StreamIcon, tone } = streamStyle(career?.stream || careerName);

  const [loading, setLoading] = useState({ gap: false, roadmap: false });
  const [error, setError] = useState({ gap: '', roadmap: '' });
  const [saveState, setSaveState] = useState({ gap: 'idle', roadmap: 'idle' });
  const inFlight = useRef({});

  const fetchTab = async (kind) => {
    const key = `${kind}:${careerName}`;
    if (inFlight.current[key]) return;
    inFlight.current[key] = true;
    setLoading((l) => ({ ...l, [kind]: true }));
    setError((e) => ({ ...e, [kind]: '' }));
    try {
      if (kind === 'gap') {
        putCached('gap', careerName, await getSkillGap(careerName, profile || {}));
      } else {
        const focus = gapFocus(getCached('gap', careerName));
        const data = await getCareerRoadmap(careerName, profile || {}, focus);
        putCached('roadmap', careerName, { ...data, __gapAware: focus.length > 0 });
      }
    } catch (err) {
      setError((e) => ({ ...e, [kind]: errorMessage(err, 'The AI could not finish. Please retry.') }));
    } finally {
      inFlight.current[key] = false;
      setLoading((l) => ({ ...l, [kind]: false }));
    }
  };

  useEffect(() => {
    const has = tab === 'gap' ? gap : roadmap;
    if (!has && !error[tab]) fetchTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, careerName]);

  const setTab = (t) => {
    // A roadmap built before the gap analysis wouldn't target the gaps — rebuild it.
    if (t === 'roadmap' && gap && roadmap && !roadmap.__gapAware) putCached('roadmap', careerName, null);
    setParams({ tab: t }, { replace: true });
  };

  const onSave = async (kind) => {
    if (!isAuthed) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    setSaveState((s) => ({ ...s, [kind]: 'saving' }));
    try {
      if (kind === 'gap') await saveSkillGap(careerName, gap);
      else await saveRoadmap(careerName, roadmap);
      setSaveState((s) => ({ ...s, [kind]: 'saved' }));
    } catch {
      setSaveState((s) => ({ ...s, [kind]: 'error' }));
    }
  };

  return (
    <div className="page">
      <Link to={result ? '/results' : '/skill-gap'} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> {result ? 'All matches' : 'Back'}
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-md`}>
          <StreamIcon className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{careerName}</h1>
          {career && (
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500"
              title="AI estimates for the Indian job market (approximate)">
              {career.salaryINR?.entry && <span className="inline-flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{career.salaryINR.entry}</span>}
              {career.demand && <span className="inline-flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{career.demand} demand</span>}
              {career.topHubs?.length > 0 && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{career.topHubs.slice(0, 2).join(', ')}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 inline-flex rounded-2xl bg-surface p-1.5 shadow-soft ring-1 ring-slate-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition sm:px-6 ${
              tab === key ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-glow' : 'text-slate-500 hover:text-slate-800'}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'gap' && (
          <>
            {loading.gap && (
              <Loader label="Analysing your skill gap…" steps={[
                'Reading your skills', `Mapping what a ${careerName} needs`, 'Scoring each skill', 'Planning your next steps',
              ]} />
            )}
            {error.gap && !loading.gap && <ErrorBox message={error.gap} onRetry={() => fetchTab('gap')} />}
            {gap && !loading.gap && (
              <SkillGapView
                analysis={gap}
                onChange={(next) => { putCached('gap', careerName, next); setSaveState((s) => ({ ...s, gap: 'idle' })); }}
                onSave={() => onSave('gap')}
                saveState={saveState.gap}
              />
            )}
          </>
        )}

        {tab === 'roadmap' && (
          <>
            {loading.roadmap && (
              <Loader label="Building your roadmap…" steps={[
                'Starting from where you are', 'Ordering skills into phases', 'Picking courses & projects', 'Adding exams & job tips',
              ]} />
            )}
            {error.roadmap && !loading.roadmap && <ErrorBox message={error.roadmap} onRetry={() => fetchTab('roadmap')} />}
            {roadmap && !loading.roadmap && (
              <RoadmapView roadmap={roadmap} focusGaps={roadmap.__gapAware ? gapFocus(gap) : []} onSave={() => onSave('roadmap')} saveState={saveState.roadmap} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Keyed by career so loading/error/save state never leaks between careers.
export default function CareerDetail() {
  const { name } = useParams();
  return <CareerDetailInner key={name} name={name} />;
}
