import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, Check } from 'lucide-react';
import TagInput from '../components/TagInput.jsx';
import { useApp } from '../context/AppContext.jsx';
import { CAREER_SKILLS, EDUCATION_LEVELS, POPULAR_CAREERS, SKILL_SUGGESTIONS } from '../utils/options.js';

const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Skills worth suggesting for a job: the AI's keySkills from the student's results, else our list. */
function skillsFor(job, careers = []) {
  if (!job.trim()) return null;
  const fromResults = careers.find((c) => same(c.name, job));
  if (fromResults?.keySkills?.length) return fromResults.keySkills.slice(0, 8);
  const known = Object.keys(CAREER_SKILLS).find((k) => same(k, job));
  return known ? CAREER_SKILLS[known] : null;
}

function Step({ n, title, done, children }) {
  return (
    <section className="animate-fade-up">
      <h2 className="flex items-center gap-2.5 text-base font-bold text-slate-900">
        <span className={`grid h-7 w-7 place-items-center rounded-full text-sm text-white transition ${
          done ? 'bg-emerald-500' : 'bg-gradient-to-br from-brand-500 to-violet-500'}`}>
          {done ? <Check className="h-4 w-4" /> : n}
        </span>
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function SkillGap() {
  const navigate = useNavigate();
  const { profile, setProfile, result } = useApp();

  const [career, setCareer] = useState('');
  const [skills, setSkills] = useState(profile?.skills || []);
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || '');
  const [error, setError] = useState('');

  const careers = result?.careers || [];
  const picked = career.trim();
  const jobSkills = skillsFor(career, careers);

  // Suggestions: the student's own matches first, then popular jobs. While typing, filter to what fits.
  const options = [...new Set([...careers.map((c) => c.name), ...POPULAR_CAREERS])];
  const typed = picked.toLowerCase();
  const showJobs = !options.some((o) => same(o, career));
  const jobOptions = (typed ? options.filter((o) => o.toLowerCase().includes(typed)) : options).slice(0, 6);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!picked) return setError('Tell us which job you want first.');
    if (!skills.length) return setError('Add at least one thing you can already do.');

    const changed =
      JSON.stringify(skills) !== JSON.stringify(profile?.skills || []) ||
      educationLevel !== (profile?.educationLevel || '');
    if (changed || !profile) setProfile({ interests: [], ...profile, skills, educationLevel });

    navigate(`/career/${encodeURIComponent(picked)}?tab=gap`);
  };

  return (
    <div className="page max-w-2xl">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          What do you want to <span className="text-gradient">become?</span>
        </h1>
        <p className="mt-2 text-slate-500">Pick a job. We’ll show you how close you are.</p>
      </div>

      <form onSubmit={onSubmit} className="card mt-8 space-y-8 p-6 sm:p-8">
        <Step n={1} title="Your dream job" done={Boolean(picked) && (!showJobs || jobOptions.length === 0)}>
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Your dream job"
              id="career"
              className="input py-4 pl-12 text-lg"
              value={career}
              onChange={(e) => { setCareer(e.target.value); setError(''); }}
              placeholder="Data Analyst, CA, Designer…"
              autoComplete="off"
            />
          </div>
          {showJobs && jobOptions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {jobOptions.map((c) => (
                <button key={c} type="button" onClick={() => { setCareer(c); setError(''); }}
                  className="rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-sm text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
                  {c}
                </button>
              ))}
            </div>
          )}
        </Step>

        {picked && (
          <>
            <Step n={2} title="What can you already do?" done={skills.length > 0}>
              <p className="-mt-1 mb-3 text-sm text-slate-500">
                {jobSkills ? <>Tap the <b className="text-slate-700">{picked}</b> skills you have, or add your own.</> : 'Add skills you have, even basic ones.'}
              </p>
              <TagInput values={skills} onChange={(v) => { setSkills(v); setError(''); }}
                placeholder="Type a skill, press Enter" suggestions={jobSkills || SKILL_SUGGESTIONS} />
            </Step>

            <Step n={3} title="Where are you in your studies?" done={Boolean(educationLevel)}>
              <select id="edu" aria-label="Education level" className="input" value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}>
                <option value="">Select (optional)</option>
                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Step>
          </>
        )}

        {error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">{error}</p>}

        <button type="submit" className="btn-primary w-full py-4 text-base">
          {picked ? <>See how ready I am for <span className="truncate">{picked}</span></> : 'See how ready I am'}
          <ArrowRight className="h-5 w-5 shrink-0" />
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-400">Free · takes about 20 seconds</p>
    </div>
  );
}
