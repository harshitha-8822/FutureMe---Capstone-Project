import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Zap, GraduationCap, ArrowLeft, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import TagInput from '../components/TagInput.jsx';
import Loader from '../components/Loader.jsx';
import { ErrorBox } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getCareerRecommendations, errorMessage } from '../api/client.js';
import { EDUCATION_LEVELS, INTEREST_SUGGESTIONS, SKILL_SUGGESTIONS } from '../utils/options.js';

const STEPS = [
  { title: 'What do you enjoy?', sub: 'Pick a few interests.', icon: Heart },
  { title: 'What are you good at?', sub: 'Add skills, even basic ones.', icon: Zap },
  { title: 'Your studies', sub: 'Helps us match realistic paths.', icon: GraduationCap },
];

export default function ProfileForm() {
  const navigate = useNavigate();
  const { profile, setProfile, setResult } = useApp();

  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState(profile?.interests || []);
  const [skills, setSkills] = useState(profile?.skills || []);
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || '');
  const [fieldOfStudy, setFieldOfStudy] = useState(profile?.fieldOfStudy || '');
  const [academicDetails, setAcademicDetails] = useState(profile?.academicDetails || '');
  const [preferredLocation, setPreferredLocation] = useState(profile?.preferredLocation || '');
  const [showMore, setShowMore] = useState(Boolean(profile?.academicDetails || profile?.preferredLocation));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = interests.length > 0 || skills.length > 0 || fieldOfStudy.trim();
  const { title, sub, icon: StepIcon } = STEPS[step];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    setError('');
    if (!canSubmit) {
      setError('Add a few interests, skills, or your field of study.');
      return;
    }
    const p = {
      interests,
      skills,
      educationLevel,
      fieldOfStudy: fieldOfStudy.trim(),
      academicDetails: academicDetails.trim(),
      preferredLocation: preferredLocation.trim(),
    };
    setProfile(p);
    setLoading(true);
    try {
      setResult(await getCareerRecommendations(p));
      navigate('/results');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page max-w-2xl">
        <Loader label="Finding your best careers…" steps={[
          'Reading your profile', 'Scanning careers across every stream', 'Checking Indian salaries & demand', 'Ranking your matches',
        ]} />
      </div>
    );
  }

  return (
    <div className="page max-w-2xl">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button key={s.title} type="button" onClick={() => setStep(i)} aria-label={`Step ${i + 1}`}
            className={`h-2 flex-1 rounded-full transition ${i <= step ? 'bg-gradient-to-r from-brand-500 to-violet-500' : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-400">Step {step + 1} of {STEPS.length}</p>

      <form onSubmit={onSubmit} className="card mt-4 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-glow">
            <StepIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{sub}</p>
          </div>
        </div>

        <div key={step} className="mt-6 animate-fade-up">
          {step === 0 && (
            <TagInput values={interests} onChange={setInterests} placeholder="Type an interest, press Enter"
              suggestions={INTEREST_SUGGESTIONS} />
          )}

          {step === 1 && (
            <TagInput values={skills} onChange={setSkills} placeholder="Type a skill, press Enter"
              suggestions={SKILL_SUGGESTIONS} />
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="edu">Education level</label>
                  <select id="edu" className="input" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                    <option value="">Select…</option>
                    {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="field">Field / stream</label>
                  <input id="field" className="input" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. B.Com, B.Tech CSE" />
                </div>
              </div>

              <button type="button" onClick={() => setShowMore((v) => !v)}
                className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
                <ChevronDown className={`h-4 w-4 transition ${showMore ? 'rotate-180' : ''}`} />
                {showMore ? 'Hide extra details' : 'Add more details (optional)'}
              </button>

              {showMore && (
                <div className="space-y-4 animate-fade-up">
                  <div>
                    <label className="label" htmlFor="details">Marks, favourite subjects, achievements</label>
                    <textarea id="details" className="input min-h-[80px]" value={academicDetails}
                      onChange={(e) => setAcademicDetails(e.target.value)} placeholder="e.g. 8.2 CGPA, love statistics" />
                  </div>
                  <div>
                    <label className="label" htmlFor="loc">Preferred city</label>
                    <input id="loc" className="input" value={preferredLocation}
                      onChange={(e) => setPreferredLocation(e.target.value)} placeholder="e.g. Bengaluru, Remote" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && <div className="mt-5"><ErrorBox message={error} /></div>}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
          <button type="submit" className="btn-primary flex-1 py-3 text-base">
            {step < STEPS.length - 1 ? (
              <>Next <ArrowRight className="h-4 w-4" /></>
            ) : (
              <><Sparkles className="h-5 w-5" /> Show my matches</>
            )}
          </button>
        </div>
        {step < STEPS.length - 1 && (
          <button type="button" onClick={() => setStep(step + 1)} className="mt-3 w-full text-center text-sm text-slate-400 hover:text-slate-600">
            Skip this step
          </button>
        )}
      </form>
    </div>
  );
}
