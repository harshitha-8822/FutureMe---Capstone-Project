import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { careersAsPromptContext, careerStreams } from '../data/indianCareers.js';

dotenv.config();

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/**
 * Call the model with a couple of retries on transient 429 (rate limit) errors,
 * honouring Gemini's suggested retry delay when present. Free-tier keys have a
 * low requests-per-minute cap, so a brief backoff smooths over bursts.
 */
async function generateWithRetry(model, prompt, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || '');
      const is429 = msg.includes('429') || /quota|rate.?limit/i.test(msg);
      if (!is429 || i === attempts - 1) throw err;
      const suggested = Number(msg.match(/retry in ([\d.]+)s/i)?.[1]);
      const waitMs = Number.isFinite(suggested) ? Math.ceil(suggested * 1000) + 500 : (i + 1) * 4000;
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw lastErr;
}

let client = null;
function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to backend/.env (get a free key at https://aistudio.google.com/app/apikey).',
    );
  }
  if (!client) client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client;
}

/**
 * Robustly pull a JSON object/array out of a model response, even if the
 * model wraps it in ```json fences or adds stray text.
 */
function parseJson(text) {
  if (!text) throw new Error('Empty AI response');
  let t = text.trim();
  // strip markdown code fences if present
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(t);
  } catch {
    // fallback: grab the first {...} or [...] block
    const match = t.match(/[[{][\s\S]*[\]}]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Could not parse AI response as JSON');
  }
}

// ── JSON schemas (constrained generation) ────────────────────

const careerListSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: 'ONE short encouraging sentence (max 25 words) about the student profile.' },
    careers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          stream: { type: 'string' },
          fit: {
            type: 'object',
            description: 'Rate each part of the fit separately, 0-100. Be honest and spread the scores out.',
            properties: {
              interest: { type: 'integer', description: 'How well the career matches the stated interests, 0-100' },
              interestReason: { type: 'string', description: 'Max 8 words' },
              skills: { type: 'integer', description: 'How much of the needed skill set they already have, 0-100' },
              skillsReason: { type: 'string', description: 'Max 8 words' },
              education: { type: 'integer', description: 'How well their education/stream suits the entry path, 0-100' },
              educationReason: { type: 'string', description: 'Max 8 words' },
            },
            required: ['interest', 'interestReason', 'skills', 'skillsReason', 'education', 'educationReason'],
          },
          whyItFits: { type: 'string', description: 'ONE short sentence (max 20 words) tying to their interests/skills' },
          description: { type: 'string', description: 'ONE short sentence (max 18 words)' },
          keySkills: { type: 'array', items: { type: 'string' } },
          salaryINR: {
            type: 'object',
            properties: {
              entry: { type: 'string', description: 'e.g. "4-8 LPA"' },
              mid: { type: 'string' },
              senior: { type: 'string' },
            },
            required: ['entry', 'mid', 'senior'],
          },
          demand: { type: 'string', description: 'e.g. Very High / High / Medium' },
          topHubs: { type: 'array', items: { type: 'string' } },
          exampleEmployers: { type: 'array', items: { type: 'string' } },
          growthOutlook: { type: 'string', description: 'max 10 words' },
        },
        required: ['name', 'stream', 'fit', 'whyItFits', 'description', 'keySkills', 'salaryINR', 'demand', 'topHubs'],
      },
    },
  },
  required: ['summary', 'careers'],
};

const roadmapSchema = {
  type: 'object',
  properties: {
    careerName: { type: 'string' },
    overview: { type: 'string', description: 'ONE or two short sentences (max 35 words)' },
    timelineMonths: { type: 'integer', description: 'Rough total months from now to job-ready' },
    phases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'e.g. "Foundations (Months 1-3)"' },
          goal: { type: 'string', description: 'max 15 words' },
          skillsToLearn: { type: 'array', items: { type: 'string' } },
          resources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string', description: 'Course / Book / Certification / Platform / YouTube' },
                note: { type: 'string', description: 'max 8 words' },
              },
              required: ['name', 'type'],
            },
          },
          projects: { type: 'array', items: { type: 'string' } },
          milestone: { type: 'string', description: 'max 15 words' },
        },
        required: ['title', 'goal', 'skillsToLearn', 'milestone'],
      },
    },
    certifications: { type: 'array', items: { type: 'string' } },
    entryExams: { type: 'array', items: { type: 'string' }, description: 'India-relevant exams if any (e.g. GATE, NEET, UPSC, CAT)' },
    portfolioTips: { type: 'array', items: { type: 'string' } },
    firstJobStrategy: { type: 'string', description: 'How to land the first role/internship in India (max 45 words)' },
    estimatedStartingSalaryINR: { type: 'string' },
  },
  required: ['careerName', 'overview', 'timelineMonths', 'phases', 'firstJobStrategy'],
};

// ── Prompt builders ──────────────────────────────────────────

function buildProfileText(profile) {
  const {
    interests = [],
    skills = [],
    educationLevel = '',
    fieldOfStudy = '',
    academicDetails = '',
    preferredLocation = '',
  } = profile;

  return [
    `Interests: ${interests.length ? interests.join(', ') : 'not specified'}`,
    `Current skills: ${skills.length ? skills.join(', ') : 'not specified'}`,
    `Education level: ${educationLevel || 'not specified'}`,
    `Field of study: ${fieldOfStudy || 'not specified'}`,
    `Academic details: ${academicDetails || 'not specified'}`,
    `Preferred work location: ${preferredLocation || 'flexible / any'}`,
  ].join('\n');
}

// ── Match score ──────────────────────────────────────────────

/**
 * Match score = a fixed, explainable formula over three AI-rated parts:
 *   interest 40% — the strongest predictor of sticking with a career
 *   skills   35% — where the student stands today
 *   education 25% — whether the entry path is open to them
 * A part the student left blank is dropped and the other weights rescaled,
 * so missing input neither helps nor hurts.
 *
 * Eligibility cap: a weighted average lets strong interest make up for a route
 * that is closed (e.g. MBBS for a Commerce student — no PCB, no NEET). Skills can
 * be learned; some entry requirements can't. So when education fit is below
 * EDU_GATE, the match can be at most education fit + EDU_CAP_MARGIN.
 */
export const MATCH_WEIGHTS = { interest: 0.4, skills: 0.35, education: 0.25 };
export const EDU_GATE = 40;
export const EDU_CAP_MARGIN = 20;

export function scoreMatch(fit = {}, profile = {}) {
  const given = {
    interest: (profile.interests || []).length > 0,
    skills: (profile.skills || []).length > 0,
    education: Boolean(profile.educationLevel || profile.fieldOfStudy),
  };
  const parts = Object.keys(MATCH_WEIGHTS).map((key) => ({
    key,
    score: clamp(fit[key], 0, 100),
    reason: fit[`${key}Reason`] || '',
    weight: MATCH_WEIGHTS[key],
    used: given[key],
  }));
  const used = parts.filter((p) => p.used);
  const active = used.length ? used : parts;
  const totalWeight = active.reduce((s, p) => s + p.weight, 0);
  const weighted = Math.round(active.reduce((s, p) => s + p.score * p.weight, 0) / totalWeight);

  const edu = parts.find((p) => p.key === 'education');
  const capped = edu.used && edu.score < EDU_GATE && weighted > edu.score + EDU_CAP_MARGIN;
  const matchScore = capped ? edu.score + EDU_CAP_MARGIN : weighted;

  return {
    matchScore,
    ...(capped && { matchCap: { from: weighted, reason: edu.reason } }),
    matchBreakdown: parts.map(({ key, score, reason, weight, used: u }) => ({
      key,
      score,
      reason,
      weight: u || !used.length ? Math.round((weight / totalWeight) * 100) : 0,
    })),
  };
}

// ── Public API ───────────────────────────────────────────────

/**
 * Generate career recommendations for a student profile.
 * AI-first: it may suggest careers across ANY stream, not just the grounding list.
 */
export async function recommendCareers(profile) {
  const model = getClient().getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.3, // lower = steadier scores between runs
      responseMimeType: 'application/json',
      responseSchema: careerListSchema,
    },
  });

  const prompt = `You are FutureMe, an expert career counsellor for STUDENTS IN INDIA.
Recommend the best-fit careers for the student below, spanning ANY relevant stream
(technology, commerce, science, arts/humanities, medicine, law, design, media,
government, education, vocational, sports, etc.) — choose based on THEIR profile,
do not default to engineering.

RULES:
- Recommend 5 to 6 careers that fit this student best.
- For each, rate the three parts of "fit" (interest, skills, education) INDEPENDENTLY and
  honestly. A career can be a great interest fit but a weak skills fit — say so.
  If the student left a part blank, give it 50 (neutral).
- Use this SCALE for every part, so scores mean the same thing every time:
    90-100  already strong here / studying exactly this
    70-89   good fit, small gaps
    50-69   possible with real effort or a switch
    20-49   weak fit, big gaps
    0-19    not a fit — for education: NOT ELIGIBLE from their current route
- Education is about the ENTRY ROUTE in India. If the career needs a stream, subject or
  qualification they don't have and can't realistically add (e.g. MBBS needs PCB in
  Class 12 + NEET; a Commerce student can't take that route), rate education below 20
  and say why in educationReason.
- Cover a realistic MIX of streams that suit this student (not all from one field).
- Use REALISTIC INDIAN salaries in ₹ LPA and real Indian hiring hubs/employers.
- "whyItFits" must reference the student's actual interests/skills/background, and speak
  to the student directly as "you" (e.g. "Uses your Excel skills…"), never "their".
- You MAY recommend careers not in the reference list below when they fit better.
- Keep every field concise.

REFERENCE (Indian market anchors — for realistic salaries/hubs, NOT an exhaustive list):
${careersAsPromptContext()}

Known streams (you may use others too): ${careerStreams.join(', ')}.

STUDENT PROFILE:
${buildProfileText(profile)}

Return ONLY JSON matching the required schema.`;

  const result = await generateWithRetry(model, prompt);
  const data = parseJson(result.response.text());

  if (!data.careers || !Array.isArray(data.careers) || data.careers.length === 0) {
    throw new Error('AI returned no careers. Please try again.');
  }
  data.careers = data.careers.map((c) => ({ ...c, ...scoreMatch(c.fit, profile) }));
  data.careers.sort((a, b) => b.matchScore - a.matchScore);
  return data;
}

/**
 * Generate a detailed, India-specific guided roadmap for one chosen career,
 * tailored to the student's current profile (so it starts from where they are).
 */
export async function generateRoadmap(careerName, profile = {}, gapSkills = []) {
  const model = getClient().getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.6,
      responseMimeType: 'application/json',
      responseSchema: roadmapSchema,
    },
  });

  const prompt = `You are FutureMe, an expert career counsellor for STUDENTS IN INDIA.
Create a practical, step-by-step guided roadmap to become a "${careerName}" in India,
tailored to the student's CURRENT starting point below (start from where they are).

RULES:
- Break the journey into 3 to 5 sequential phases with clear month ranges.
- Each phase: a goal, specific skills to learn, concrete resources (prefer ones
  accessible in India — NPTEL, Coursera, YouTube, ICAI, specific books, etc.),
  1-2 hands-on projects, and a measurable milestone.
- Include India-relevant entry exams/certifications where applicable
  (e.g. GATE, NEET, UPSC, CAT, CA/CFA, cloud certs) — leave empty if none.
- "firstJobStrategy" must be India-specific and actionable (internships, campus
  placements, portfolio, referrals, Naukri/LinkedIn, etc.).
- Give a realistic estimatedStartingSalaryINR in ₹ LPA.
- Be SHORT and concrete — students skim. Max 3 resources and 2 projects per phase,
  max 4 items in each list. Return ONLY JSON matching the required schema.

STUDENT'S CURRENT PROFILE:
${buildProfileText(profile)}${
    gapSkills.length
      ? `

SKILL GAPS TO CLOSE FIRST (from their skill gap analysis): ${gapSkills.join(', ')}`
      : ''
  }`;

  const result = await generateWithRetry(model, prompt);
  const data = parseJson(result.response.text());
  if (!data.phases || !Array.isArray(data.phases) || data.phases.length === 0) {
    throw new Error('AI returned an empty roadmap. Please try again.');
  }
  return data;
}

// ── Skill gap analysis (the hero feature) ────────────────────

const skillGapSchema = {
  type: 'object',
  properties: {
    careerName: { type: 'string' },
    verdict: { type: 'string', description: 'ONE short, honest, encouraging sentence (max 18 words)' },
    skills: {
      type: 'array',
      description: '8 to 12 skills this career needs, most important first',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Short skill name, max 4 words' },
          category: { type: 'string', description: 'One of: Technical, Tool, Knowledge, Soft skill' },
          importance: { type: 'string', description: 'Exactly "Must-have" or "Nice-to-have"' },
          requiredLevel: { type: 'integer', description: 'Level needed for an entry-level job, 1-5' },
          currentLevel: { type: 'integer', description: "Student's estimated current level, 0-5 (0 = none)" },
          tip: { type: 'string', description: 'Max 10 words: the single next step for this skill' },
        },
        required: ['name', 'category', 'importance', 'requiredLevel', 'currentLevel', 'tip'],
      },
    },
    strengths: { type: 'array', items: { type: 'string' }, description: 'Max 4 short phrases (max 6 words each)' },
    priorityGaps: {
      type: 'array',
      description: 'Top 3 to 4 gaps to close first, in order',
      items: {
        type: 'object',
        properties: {
          skill: { type: 'string' },
          why: { type: 'string', description: 'Max 12 words' },
          action: { type: 'string', description: 'Concrete action, max 14 words' },
          weeks: { type: 'integer', description: 'Realistic weeks to close this gap' },
          resource: { type: 'string', description: 'One free/affordable resource accessible in India, max 8 words' },
        },
        required: ['skill', 'why', 'action', 'weeks', 'resource'],
      },
    },
    quickWins: { type: 'array', items: { type: 'string' }, description: 'Max 3 things doable within 2 weeks, max 10 words each' },
    weeksToReady: { type: 'integer', description: 'Realistic total weeks to become entry-level job ready' },
  },
  required: ['careerName', 'verdict', 'skills', 'strengths', 'priorityGaps', 'quickWins', 'weeksToReady'],
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)));

/**
 * Readiness = weighted share of required skill levels the student already has.
 * Must-have skills count double. Mirrored in frontend/src/utils/skillGap.js so
 * the score updates live when the student adjusts their own levels.
 */
export function readinessScore(skills = []) {
  let have = 0;
  let need = 0;
  for (const s of skills) {
    const w = s.importance === 'Must-have' ? 2 : 1;
    have += Math.min(s.currentLevel, s.requiredLevel) * w;
    need += s.requiredLevel * w;
  }
  return need ? Math.round((have / need) * 100) : 0;
}

/**
 * Compare a student's current profile against what a target career needs
 * in the Indian job market, skill by skill.
 */
export async function analyzeSkillGap(careerName, profile = {}) {
  const model = getClient().getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: skillGapSchema,
    },
  });

  const prompt = `You are FutureMe, an expert career counsellor for STUDENTS IN INDIA.
Do a SKILL GAP ANALYSIS: compare the student below with what an ENTRY-LEVEL
"${careerName}" needs in the Indian job market today.

RULES:
- List 8-12 skills the role needs (mix of technical, tools, domain knowledge, soft skills).
- requiredLevel: 1-5 for an entry-level hire. currentLevel: 0-5, estimated ONLY from
  the student's stated skills, education and details. Be honest — if a skill isn't
  mentioned or implied, use 0 or 1. Don't inflate.
- Use skill names a student will recognise; match the student's own wording when they list a skill.
- priorityGaps: the 3-4 gaps with the biggest impact, ordered. Resources should be
  free or cheap and accessible in India (NPTEL, SWAYAM, YouTube channels, Coursera audit, etc.).
- Every text field must be SHORT — students skim on mobile.

STUDENT PROFILE:
${buildProfileText(profile)}

Return ONLY JSON matching the required schema.`;

  const result = await generateWithRetry(model, prompt);
  const data = parseJson(result.response.text());
  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    throw new Error('AI returned an empty skill analysis. Please try again.');
  }

  data.skills = data.skills.map((s) => {
    const requiredLevel = clamp(s.requiredLevel, 1, 5);
    return {
      ...s,
      importance: s.importance === 'Nice-to-have' ? 'Nice-to-have' : 'Must-have',
      requiredLevel,
      currentLevel: clamp(s.currentLevel, 0, 5),
    };
  });
  data.careerName = data.careerName || careerName;
  data.readinessScore = readinessScore(data.skills);
  return data;
}
