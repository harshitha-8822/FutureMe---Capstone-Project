export const INTEREST_SUGGESTIONS = [
  'Technology', 'Design', 'Business', 'Finance', 'Healthcare', 'Teaching',
  'Writing', 'Research', 'Law', 'Social Impact', 'Sports', 'Art', 'Marketing',
];

export const SKILL_SUGGESTIONS = [
  'Communication', 'Python', 'Maths', 'Problem Solving', 'Leadership',
  'Drawing', 'Excel', 'Public Speaking', 'Writing', 'Biology', 'Accounting',
];

export const EDUCATION_LEVELS = [
  'Class 10', 'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)',
  'Diploma', 'Undergraduate (1st year)', 'Undergraduate (2nd year)',
  'Undergraduate (3rd year)', 'Undergraduate (final year)', 'Graduate', 'Postgraduate',
];

/** Popular targets for the standalone skill gap check, across streams. */
export const POPULAR_CAREERS = [
  'Data Analyst', 'Software Engineer', 'Chartered Accountant (CA)', 'UI/UX Designer',
  'Digital Marketer', 'Doctor (MBBS)', 'Lawyer', 'Civil Services (IAS)',
];

/**
 * Key skills for the popular targets, so the skill step can suggest skills that
 * actually matter for the chosen job. Careers from the student's own results use
 * the AI's keySkills instead; anything else falls back to SKILL_SUGGESTIONS.
 */
export const CAREER_SKILLS = {
  'Data Analyst': ['SQL', 'Excel', 'Statistics', 'Power BI', 'Python', 'Communication'],
  'Software Engineer': ['Data Structures', 'Java', 'Python', 'Git', 'Databases', 'Problem Solving'],
  'Chartered Accountant (CA)': ['Accounting', 'Taxation', 'Auditing', 'Excel', 'Tally', 'Business Law'],
  'UI/UX Designer': ['Figma', 'User Research', 'Wireframing', 'Visual Design', 'Prototyping', 'Communication'],
  'Digital Marketer': ['SEO', 'Social Media', 'Content Writing', 'Google Ads', 'Analytics', 'Canva'],
  'Doctor (MBBS)': ['Biology', 'Chemistry', 'Physics', 'Empathy', 'Communication', 'Patience'],
  Lawyer: ['Legal Research', 'Writing', 'Public Speaking', 'Logical Reasoning', 'Negotiation', 'Reading'],
  'Civil Services (IAS)': ['Current Affairs', 'Indian Polity', 'Essay Writing', 'History', 'Decision Making', 'Communication'],
};
