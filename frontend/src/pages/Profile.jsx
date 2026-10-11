import { useEffect, useState } from 'react';
import { Check, Save, UserRound, Sparkles, Mail, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { fetchProfile, updateProfile, errorMessage } from '../api/client.js';
import TagInput from '../components/TagInput.jsx';
import Loader from '../components/Loader.jsx';
import { ErrorBox } from '../components/ui.jsx';
import { EDUCATION_LEVELS, INTEREST_SUGGESTIONS, SKILL_SUGGESTIONS } from '../utils/options.js';

const EMPTY = {
  name: '', interests: [], skills: [], educationLevel: '', fieldOfStudy: '', academicDetails: '', preferredLocation: '',
};

function memberSince(d) {
  try {
    return new Date(d).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

function Section({ icon: Icon, title, sub, children }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <Icon className="h-5 w-5 text-brand-700" /> {title}
      </h2>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export default function Profile() {
  const { updateSession } = useAuth();
  const { setProfile } = useApp();

  const [account, setAccount] = useState(null); // { name, email, created_at }
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(EMPTY); // last saved copy, to know if anything changed
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(''); // '' | 'saved'
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { user, profile } = await fetchProfile();
      const next = { ...EMPTY, ...profile, name: user.name };
      delete next.updatedAt;
      setAccount(user);
      setForm(next);
      setSaved(next);
    } catch (err) {
      setError(errorMessage(err, 'Could not load your profile.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setStatus('');
  };
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name cannot be empty.');
    setSaving(true);
    setError('');
    try {
      const { user, profile, token } = await updateProfile(form);
      updateSession(token, user);
      const next = { ...EMPTY, ...profile, name: user.name };
      setAccount(user);
      setForm(next);
      setSaved(next);
      const { name, ...careerProfile } = next;
      setProfile(careerProfile); // new profile → forms pre-fill with it, old AI results are cleared
      setStatus('saved');
    } catch (err) {
      setError(errorMessage(err, 'Could not save. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading your profile…" />;

  return (
    <div className="page max-w-3xl">
      {/* Identity */}
      <div className="flex flex-wrap items-center gap-5">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-fuchsia-500 font-display text-3xl font-extrabold text-white shadow-glow">
          {(account?.name || form.name)?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-extrabold text-slate-900">{account?.name}</h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4" /> {account?.email}</span>
            {account?.created_at && (
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Joined {memberSince(account.created_at)}</span>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mt-6"><ErrorBox message={error} onRetry={account ? undefined : load} /></div>}

      {account && (
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <Section icon={UserRound} title="Your details">
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input id="name" className="input" value={form.name} onChange={(e) => set('name')(e.target.value)} autoComplete="name" />
            </div>
          </Section>

          <Section icon={Sparkles} title="Career profile" sub="We use this to pre-fill your career search and skill gap checks.">
            <TagInput label="Interests" values={form.interests} onChange={set('interests')}
              placeholder="Type an interest, press Enter" suggestions={INTEREST_SUGGESTIONS} />
            <TagInput label="Skills" values={form.skills} onChange={set('skills')}
              placeholder="Type a skill, press Enter" suggestions={SKILL_SUGGESTIONS} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="edu">Education level</label>
                <select id="edu" className="input" value={form.educationLevel} onChange={(e) => set('educationLevel')(e.target.value)}>
                  <option value="">Select…</option>
                  {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="field">Field / stream</label>
                <input id="field" className="input" value={form.fieldOfStudy} placeholder="e.g. B.Com, B.Tech CSE"
                  onChange={(e) => set('fieldOfStudy')(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="loc">Preferred city</label>
              <input id="loc" className="input" value={form.preferredLocation} placeholder="e.g. Hyderabad, Remote"
                onChange={(e) => set('preferredLocation')(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="details">Marks, favourite subjects, achievements</label>
              <textarea id="details" className="input min-h-[80px]" value={form.academicDetails} placeholder="e.g. 8.2 CGPA, love statistics"
                onChange={(e) => set('academicDetails')(e.target.value)} />
            </div>
          </Section>

          <div className="flex items-center justify-end gap-3">
            {status === 'saved' && !dirty && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
            <button type="submit" className="btn-primary px-6" disabled={saving || !dirty}>
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
