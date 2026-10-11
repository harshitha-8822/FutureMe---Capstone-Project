/**
 * Curated GROUNDING dataset for the INDIAN job market.
 *
 * Design note (important):
 *  - FutureMe is AI-FIRST. Gemini generates career recommendations across
 *    ALL streams (tech, commerce, science, arts/humanities, medicine, law,
 *    design, media, government, vocational, sports, etc.).
 *  - This list is NOT the source of truth. It is a small but DELIBERATELY
 *    DIVERSE set of anchors, one-or-two per major stream, that we feed the
 *    AI as context so its salary numbers (₹ LPA), hiring hubs, and entry
 *    paths stay realistic and India-specific instead of US-centric or made up.
 *  - The AI is explicitly allowed to recommend careers NOT in this list.
 *
 * Salary figures are approximate 2024–25 ranges — guidance, not guarantees.
 */

export const indianCareers = [
  // ── Technology / Data & AI ──────────────────────────────
  {
    name: 'Software Engineer',
    stream: 'Technology',
    coreSkills: ['Data Structures', 'Algorithms', 'A language (Java/Python)', 'Databases', 'Git'],
    salaryLPA: { entry: '4-12', mid: '12-30', senior: '30-70' },
    hubs: ['Bengaluru', 'Hyderabad', 'Pune', 'Gurugram'],
    demand: 'Very High',
    education: ['B.Tech/BCA', 'Self-taught + strong portfolio'],
  },
  {
    name: 'Data Scientist',
    stream: 'Data & AI',
    coreSkills: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization'],
    salaryLPA: { entry: '6-14', mid: '14-30', senior: '30-60' },
    hubs: ['Bengaluru', 'Hyderabad', 'Mumbai', 'Gurugram'],
    demand: 'Very High',
    education: ['B.Tech / M.Sc Stats / MBA Analytics + upskilling'],
  },

  // ── Commerce & Finance ──────────────────────────────────
  {
    name: 'Chartered Accountant (CA)',
    stream: 'Commerce & Finance',
    coreSkills: ['Accounting', 'Taxation', 'Auditing', 'Financial Analysis', 'Compliance'],
    salaryLPA: { entry: '7-12', mid: '12-25', senior: '25-60' },
    hubs: ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai'],
    demand: 'High',
    education: ['CA (ICAI) after 12th/B.Com'],
  },
  {
    name: 'Investment Banking Analyst',
    stream: 'Commerce & Finance',
    coreSkills: ['Financial Modeling', 'Valuation', 'Excel', 'Accounting', 'Communication'],
    salaryLPA: { entry: '8-16', mid: '16-40', senior: '40-100+' },
    hubs: ['Mumbai', 'Gurugram', 'Bengaluru'],
    demand: 'Medium-High',
    education: ['B.Com/BBA + CFA', 'MBA Finance (top B-school)'],
  },

  // ── Science & Research ──────────────────────────────────
  {
    name: 'Research Scientist (R&D)',
    stream: 'Science & Research',
    coreSkills: ['Research Methodology', 'Domain expertise', 'Lab/Analytical skills', 'Scientific Writing'],
    salaryLPA: { entry: '4-9', mid: '9-20', senior: '20-45' },
    hubs: ['Bengaluru', 'Hyderabad', 'Pune', 'labs pan-India'],
    demand: 'Medium',
    education: ['M.Sc + PhD', 'B.Tech/M.Tech for applied R&D'],
  },
  {
    name: 'Biotechnologist',
    stream: 'Science & Research',
    coreSkills: ['Molecular Biology', 'Lab Techniques', 'Data Analysis', 'Bioinformatics (plus)'],
    salaryLPA: { entry: '3-6', mid: '6-14', senior: '14-30' },
    hubs: ['Hyderabad', 'Bengaluru', 'Pune'],
    demand: 'Medium',
    education: ['B.Tech/M.Sc Biotech'],
  },

  // ── Healthcare ──────────────────────────────────────────
  {
    name: 'Doctor (MBBS)',
    stream: 'Healthcare',
    coreSkills: ['Biology', 'Clinical Skills', 'Diagnostics', 'Empathy'],
    salaryLPA: { entry: '6-12', mid: '12-30', senior: '30-100+' },
    hubs: ['pan-India'],
    demand: 'High',
    education: ['MBBS via NEET → MD/MS specialization'],
  },
  {
    name: 'Psychologist / Counsellor',
    stream: 'Healthcare',
    coreSkills: ['Active Listening', 'Psychology', 'Assessment', 'Empathy', 'Communication'],
    salaryLPA: { entry: '3-6', mid: '6-14', senior: '14-30' },
    hubs: ['Metro cities', 'Remote (teletherapy)'],
    demand: 'Medium-High',
    education: ['BA/MA Psychology → M.Phil/RCI (clinical)'],
  },

  // ── Law ─────────────────────────────────────────────────
  {
    name: 'Lawyer / Corporate Counsel',
    stream: 'Law',
    coreSkills: ['Legal Research', 'Drafting', 'Argumentation', 'Analytical Reasoning'],
    salaryLPA: { entry: '4-12', mid: '12-30', senior: '30-80+' },
    hubs: ['Delhi', 'Mumbai', 'Bengaluru'],
    demand: 'Medium-High',
    education: ['5-yr BA-LLB / 3-yr LLB after graduation'],
  },

  // ── Design & Creative ───────────────────────────────────
  {
    name: 'UI/UX Designer',
    stream: 'Design & Creative',
    coreSkills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Visual Design'],
    salaryLPA: { entry: '3-8', mid: '8-18', senior: '18-40' },
    hubs: ['Bengaluru', 'Mumbai', 'Pune', 'Remote'],
    demand: 'High',
    education: ['Design degree / any degree + UX bootcamp + portfolio'],
  },
  {
    name: 'Graphic / Motion Designer',
    stream: 'Design & Creative',
    coreSkills: ['Adobe Suite', 'Typography', 'Branding', 'Animation (After Effects)'],
    salaryLPA: { entry: '2.5-6', mid: '6-14', senior: '14-30' },
    hubs: ['Mumbai', 'Delhi', 'Bengaluru', 'Remote'],
    demand: 'Medium-High',
    education: ['Design diploma/degree + strong portfolio'],
  },

  // ── Media & Content ─────────────────────────────────────
  {
    name: 'Journalist / Content Creator',
    stream: 'Media & Communication',
    coreSkills: ['Writing', 'Research', 'Storytelling', 'Editing', 'Social Media'],
    salaryLPA: { entry: '2.5-6', mid: '6-14', senior: '14-35' },
    hubs: ['Delhi', 'Mumbai', 'Remote'],
    demand: 'Medium',
    education: ['BA Journalism/Mass Comm + portfolio'],
  },

  // ── Business, Product & Marketing ───────────────────────
  {
    name: 'Product Manager',
    stream: 'Business & Product',
    coreSkills: ['Product Strategy', 'User Empathy', 'Analytics', 'Communication', 'Roadmapping'],
    salaryLPA: { entry: '8-18', mid: '18-40', senior: '40-90' },
    hubs: ['Bengaluru', 'Gurugram', 'Mumbai'],
    demand: 'High',
    education: ['Any degree + MBA/APM programs; tech background common'],
  },
  {
    name: 'Digital Marketing Specialist',
    stream: 'Marketing',
    coreSkills: ['SEO', 'Google/Meta Ads', 'Content', 'Analytics', 'Social Media'],
    salaryLPA: { entry: '2.5-6', mid: '6-15', senior: '15-35' },
    hubs: ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Remote'],
    demand: 'High',
    education: ['Any graduate + digital marketing certification'],
  },

  // ── Government & Public Service ──────────────────────────
  {
    name: 'Civil Services (IAS/IPS/IFS)',
    stream: 'Government & Public Service',
    coreSkills: ['General Studies', 'Current Affairs', 'Essay Writing', 'Aptitude', 'Perseverance'],
    salaryLPA: { entry: '8-12', mid: '12-20', senior: '20-30 (+perks)' },
    hubs: ['pan-India'],
    demand: 'Very Competitive',
    education: ['Any graduate + UPSC CSE'],
  },

  // ── Education ────────────────────────────────────────────
  {
    name: 'Teacher / EdTech Educator',
    stream: 'Education',
    coreSkills: ['Subject expertise', 'Communication', 'Content creation', 'Patience'],
    salaryLPA: { entry: '3-7', mid: '7-15', senior: '15-40' },
    hubs: ['pan-India', 'Remote (EdTech)'],
    demand: 'Medium-High',
    education: ['B.Ed / Masters in subject; domain expertise for EdTech'],
  },

  // ── Core Engineering (non-software) ─────────────────────
  {
    name: 'Mechanical / Design Engineer',
    stream: 'Core Engineering',
    coreSkills: ['CAD (SolidWorks/CATIA)', 'Thermodynamics', 'Manufacturing', 'GD&T'],
    salaryLPA: { entry: '3-6', mid: '6-14', senior: '14-30' },
    hubs: ['Pune', 'Chennai', 'Coimbatore', 'Gujarat'],
    demand: 'Medium',
    education: ['B.Tech Mechanical (+ M.Tech for design roles)'],
  },

  // ── Hospitality & Vocational ────────────────────────────
  {
    name: 'Chef / Hospitality Manager',
    stream: 'Hospitality & Vocational',
    coreSkills: ['Culinary/Service skills', 'Management', 'Hygiene standards', 'Customer focus'],
    salaryLPA: { entry: '2.5-5', mid: '5-12', senior: '12-30' },
    hubs: ['Metro cities', 'tourist hubs', 'abroad'],
    demand: 'Medium',
    education: ['Hotel Management degree/diploma (IHM)'],
  },
];

/**
 * Compact string version fed to the AI as grounding context.
 * Grouped feel is preserved via the `stream` tag on each line.
 */
export function careersAsPromptContext() {
  return indianCareers
    .map(
      (c) =>
        `- ${c.name} [${c.stream}] | skills: ${c.coreSkills.slice(0, 4).join(', ')} | ` +
        `salary ₹LPA entry ${c.salaryLPA.entry}, mid ${c.salaryLPA.mid} | ` +
        `hubs: ${c.hubs.slice(0, 3).join(', ')} | demand: ${c.demand}`,
    )
    .join('\n');
}

export const careerStreams = [...new Set(indianCareers.map((c) => c.stream))];
