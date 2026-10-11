# 🎯 FutureMe — AI Career Guidance for Indian Students

FutureMe is a full-stack web app that helps students discover the right career.
A student enters their **interests, skills, and academic background**, and the app
uses **AI (Google Gemini)** — grounded on a curated **Indian job-market dataset** —
to recommend best-fit careers across **every stream** (technology, commerce, science,
arts, medicine, law, design, media, government, vocational, and more), each with a
**match score, realistic ₹ salary, hiring hubs**, and a **personalised step-by-step
roadmap** to get there.

> Final-year project. Focused on the **Indian** job market.

---

## ✨ Features

- ⭐ **Skill Gap Analysis (hero feature)** — pick any target career and see a **job-readiness
  score**, every required skill rated *Ready / Improve / Gap* against the level the job needs,
  the **top gaps to fix first** (with free Indian resources + weeks), quick wins and strengths.
  Students can tap the level bars to correct their own levels — the score updates live.
  The roadmap is then **built around those gaps**.
- **AI-first career recommendations** across all streams (not just engineering)
- **Match scores + "why it fits you"** tied to the student's actual profile
- **Realistic Indian salaries (₹ LPA), demand, hiring cities & employers**
- **Personalised guided roadmap** per career: phases, skills, courses, projects,
  entry exams (GATE/NEET/UPSC/CAT/…), certifications & first-job strategy
- **Auth (JWT)** — sign up / log in
- **User profile** — name + saved career profile (interests, skills, education) that pre-fills every form
- **Save & revisit** career matches and roadmaps from a personal **dashboard**

---

## 🏗️ Architecture

```
frontend (React + Vite + Tailwind)
   │   axios → /api  (Vite dev proxy)
   ▼
backend (Node.js + Express)
   ├── /api/recommend , /api/roadmap   → AI spine (Gemini)
   ├── /api/skill-gap                  → skill gap analysis (Gemini)
   ├── /api/auth/*                     → register / login / me (JWT + bcrypt)
   ├── /api/library/*                  → save & fetch profiles / recs / roadmaps
   └── /api/profile                    → user career profile (GET / PUT)
   │
   ├── AI layer  → Google Gemini, grounded on src/data/indianCareers.js
   └── MySQL     → users, user_profiles, profiles, recommendations, roadmaps, skill_gaps
```

**Tech stack:** React, Vite, Tailwind CSS, React Router · Node.js, Express ·
MySQL (`mysql2`) · Google Gemini (`@google/generative-ai`) · JWT + bcryptjs.

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- A **free Google Gemini API key** → https://aistudio.google.com/app/apikey
- **MySQL** 8+ — *optional*. The project ships with an **in-memory mock database**
  (`USE_MOCK_DB=true`) so login & saving work **without installing MySQL**. Data
  resets when the backend restarts. Switch to real MySQL anytime (see below).

---

## 🚀 Setup & Run

### 1. Backend

```bash
cd backend
npm install

# create your env file and fill in values
cp .env.example .env
#   → set GEMINI_API_KEY. Leave USE_MOCK_DB=true to run without MySQL.
#     (For real MySQL: set USE_MOCK_DB=false + DB_* values, then `npm run db:init`)

# start the API (http://localhost:5000)
npm run dev
```

### 2. Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** 🎉

> The Vite dev server proxies `/api` → `http://localhost:5000`, so no CORS
> config is needed in development.

---

## 🔑 Environment variables (`backend/.env`)

| Variable         | Description                                   |
|------------------|-----------------------------------------------|
| `PORT`           | Backend port (default 5000)                   |
| `CLIENT_URL`     | Frontend origin for CORS (default 5173)       |
| `USE_MOCK_DB`    | `true` = in-memory mock DB; `false` = real MySQL |
| `DB_HOST/PORT/USER/PASSWORD/NAME` | MySQL connection (used when `USE_MOCK_DB=false`) |
| `JWT_SECRET`     | Secret for signing auth tokens                |
| `GEMINI_API_KEY` | Your free Google Gemini key                   |
| `GEMINI_MODEL`   | Model id (default `gemini-2.5-flash`)         |

### Switching to real MySQL

1. In `backend/.env` set `USE_MOCK_DB=false` and fill `DB_USER` / `DB_PASSWORD`.
2. Run `npm run db:init` (creates the `futureme` database + tables).
3. Restart the backend — you should see `✅ MySQL connected`.

---

## 🔌 API reference

| Method | Endpoint                        | Auth | Purpose                                  |
|--------|---------------------------------|------|------------------------------------------|
| GET    | `/api/health`                   | —    | Health check                             |
| GET    | `/api/streams`                  | —    | List career streams                      |
| POST   | `/api/recommend`                | —    | Get AI career recommendations            |
| POST   | `/api/roadmap`                  | —    | Get AI roadmap for one career            |
| POST   | `/api/auth/register`            | —    | Create account → `{ token, user }`       |
| POST   | `/api/auth/login`               | —    | Log in → `{ token, user }`               |
| GET    | `/api/auth/me`                  | ✅   | Current user                             |
| GET    | `/api/library`                  | ✅   | Saved recommendations + roadmaps         |
| POST   | `/api/library/recommendations`  | ✅   | Save a recommendation set                |
| POST   | `/api/library/roadmaps`         | ✅   | Save a roadmap                           |
| DELETE | `/api/library/recommendations/:id` | ✅ | Delete a saved recommendation          |
| DELETE | `/api/library/roadmaps/:id`     | ✅   | Delete a saved roadmap                   |

### Example: `POST /api/recommend`

```json
{
  "interests": ["Design", "Psychology"],
  "skills": ["Communication", "Drawing"],
  "educationLevel": "Undergraduate (2nd year)",
  "fieldOfStudy": "BA Psychology",
  "academicDetails": "Enjoy human behaviour, good at empathy",
  "preferredLocation": "Bengaluru"
}
```

---

## 🗂️ Project structure

```
Sem-7 FutureMe/
├── backend/
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── data/indianCareers.js      # Indian job-market grounding dataset
│       ├── services/ai.service.js      # Gemini prompts + JSON schemas
│       ├── db/{pool.js, schema.sql}
│       ├── scripts/initDb.js
│       ├── models/  controllers/  routes/  middleware/  utils/
│
└── frontend/
    └── src/
        ├── api/client.js
        ├── context/{AppContext, AuthContext}.jsx
        ├── components/  (Navbar, CareerCard, TagInput, Loader, ProtectedRoute)
        └── pages/  (Home, ProfileForm, Results, CareerDetail, Login, Register, Dashboard)
```

---

## 🧭 How the AI stays India-accurate

`backend/src/data/indianCareers.js` holds a small but **deliberately diverse**
set of careers (one–two per major stream) with realistic **₹ LPA** salary bands,
hiring hubs and entry paths. This is injected into every Gemini prompt as
grounding context, so recommendations use **Indian** numbers and pathways —
while the AI is still free to suggest careers beyond the list.

---

## 📝 Notes for the viva / report

- **Why AI-first + dataset grounding?** The AI covers thousands of careers across
  all streams; the dataset keeps salaries/hubs realistic and India-specific and
  prevents hallucinated numbers — best of both.
- **Security:** passwords hashed with bcrypt, auth via signed JWT, all SQL uses
  parameterised queries (injection-safe), AI endpoints rate-limited.
- **Extensible:** the AI provider is isolated in `ai.service.js` — swappable to
  another LLM without touching the rest of the app.

---

_Built as a final-year project. Salary figures are approximate 2024–25 market
estimates for guidance only._

---

## 📊 Reproducing the paper's evaluation

`evaluation/` contains the script and the raw model responses behind every number in the
evaluation section of the accompanying paper (runs on 9 Oct 2026, Gemini 2.5 Flash):

- `run_evaluation.mjs` — 12 deterministic scoring checks + 9 live API calls
  (recommendation consistency, skill-gap analysis, gap-aware roadmap, latency)
- `summary.json` — computed results
- `raw/` — the nine raw API responses

To re-run (backend running on `:5000`, uses ~9 Gemini requests):

```bash
node evaluation/run_evaluation.mjs backend/src/services/ai.service.js
```

Model outputs vary between runs, so new runs will differ slightly from the recorded ones.

## 📄 License

MIT — see [LICENSE](LICENSE).
