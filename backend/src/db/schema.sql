-- ============================================================
--  FutureMe — MySQL schema
--  Run automatically by `npm run db:init`, or manually:
--    mysql -u root -p < src/db/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS futureme
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE futureme;

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(190)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Profiles ──────────────────────────────────────────────
-- One user can save many profiles (e.g. different "what if" scenarios).
CREATE TABLE IF NOT EXISTS profiles (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT           NOT NULL,
  title              VARCHAR(160)  NOT NULL DEFAULT 'My Profile',
  interests          JSON          NOT NULL,   -- ["AI", "Design", ...]
  skills             JSON          NOT NULL,   -- ["Python", "SQL", ...]
  education_level    VARCHAR(80)   NOT NULL,   -- e.g. "B.Tech (2nd year)"
  field_of_study     VARCHAR(160),
  academic_details   TEXT,                     -- free text: CGPA, subjects, etc.
  preferred_location VARCHAR(120),             -- e.g. "Bengaluru", "Remote"
  created_at         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Recommendations ───────────────────────────────────────
-- Stores the AI's career recommendations for a given profile so the
-- user can revisit them without re-calling the AI.
CREATE TABLE IF NOT EXISTS recommendations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT       NOT NULL,
  profile_id INT       NOT NULL,
  careers    JSON      NOT NULL,   -- full AI response (array of career objects)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_recs_profile
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Saved roadmaps ────────────────────────────────────────
-- Detailed guided path generated for a specific chosen career.
CREATE TABLE IF NOT EXISTS roadmaps (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT           NOT NULL,
  profile_id  INT,
  career_name VARCHAR(200)  NOT NULL,
  roadmap     JSON          NOT NULL,   -- full AI roadmap object
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_roadmaps_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_roadmaps_profile
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Saved skill gap analyses ──────────────────────────────
-- The hero feature: how ready the student is for a target career,
-- skill by skill (including any levels they adjusted themselves).
CREATE TABLE IF NOT EXISTS skill_gaps (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT           NOT NULL,
  career_name VARCHAR(200)  NOT NULL,
  readiness   TINYINT       NOT NULL,   -- 0-100 readiness score
  analysis    JSON          NOT NULL,   -- full analysis object
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_skillgaps_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── User career profile ───────────────────────────────────
-- One per user: pre-fills the career search and skill gap forms.
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id            INT           PRIMARY KEY,
  interests          JSON          NOT NULL,
  skills             JSON          NOT NULL,
  education_level    VARCHAR(80)   NOT NULL DEFAULT '',
  field_of_study     VARCHAR(160)  NOT NULL DEFAULT '',
  academic_details   TEXT,
  preferred_location VARCHAR(120)  NOT NULL DEFAULT '',
  updated_at         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_userprofiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
