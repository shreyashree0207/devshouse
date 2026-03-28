-- ══════════════════════════════════════════════════════════════
-- Sustainify Schema V3: Image Verification, Crowd Voting, Impact Feed
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. Crowd Verification Votes
CREATE TABLE IF NOT EXISTS crowd_votes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id      uuid NOT NULL,              -- references proof_submissions.id
  voter_id      uuid NOT NULL,              -- user_id of the voter
  vote          text NOT NULL CHECK (vote IN ('genuine','fake')),
  created_at    timestamp DEFAULT now(),
  UNIQUE(proof_id, voter_id)                -- one vote per user per proof
);

-- 2. Impact Feed (donor activity stream)
CREATE TABLE IF NOT EXISTS impact_feed (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          text NOT NULL DEFAULT 'donation',  -- 'donation', 'verification', 'milestone', 'badge'
  user_id       uuid,
  user_name     text,
  ngo_id        uuid,
  ngo_name      text,
  amount        numeric,
  message       text,                        -- AI-generated impact sentence
  activity_title text,
  category      text,
  icon          text DEFAULT '🌱',
  created_at    timestamp DEFAULT now()
);

-- 3. Suspicious Activity Flags
CREATE TABLE IF NOT EXISTS suspicious_flags (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id        uuid REFERENCES ngos(id),
  flag_type     text NOT NULL,               -- 'burst_upload', 'gps_mismatch', 'metadata_clone', 'low_ai_score'
  description   text,
  severity      text DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  auto_resolved boolean DEFAULT false,
  created_at    timestamp DEFAULT now()
);

-- 4. Proof submissions enhancements (add crowd score columns)
ALTER TABLE proof_submissions ADD COLUMN IF NOT EXISTS crowd_genuine_count int DEFAULT 0;
ALTER TABLE proof_submissions ADD COLUMN IF NOT EXISTS crowd_fake_count int DEFAULT 0;
ALTER TABLE proof_submissions ADD COLUMN IF NOT EXISTS crowd_score numeric DEFAULT 0;
ALTER TABLE proof_submissions ADD COLUMN IF NOT EXISTS final_trust_score numeric DEFAULT 0;  -- AI(70%) + crowd(30%)
ALTER TABLE proof_submissions ADD COLUMN IF NOT EXISTS before_image_url text;
ALTER TABLE proof_submissions ADD COLUMN IF NOT EXISTS device_info text;
ALTER TABLE proof_submissions ADD COLUMN IF NOT EXISTS capture_timestamp timestamp;

-- 5. NGO health metrics columns
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS proof_upload_rate numeric DEFAULT 0;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS milestone_speed numeric DEFAULT 0;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS donor_retention numeric DEFAULT 0;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS avg_ai_score numeric DEFAULT 0;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS health_status text DEFAULT 'good' CHECK (health_status IN ('excellent','good','warning','critical'));
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS last_proof_at timestamp;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS is_govt_verified boolean DEFAULT false;

-- 6. Govt officials table
CREATE TABLE IF NOT EXISTS govt_officials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text UNIQUE NOT NULL,
  department    text DEFAULT 'Social Welfare Department',
  state         text DEFAULT 'Tamil Nadu',
  user_id       uuid,
  created_at    timestamp DEFAULT now()
);

-- 7. NGO accounts table (for auth flow)
CREATE TABLE IF NOT EXISTS ngo_accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  ngo_id        uuid,
  darpan_id     text,
  verified      boolean DEFAULT false,
  status        text DEFAULT 'pending',  -- pending, darpan_assigned, approved, rejected
  created_at    timestamp DEFAULT now()
);

-- 8. Darpan assignment tracking
CREATE TABLE IF NOT EXISTS darpan_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id        uuid REFERENCES ngos(id),
  darpan_id     text NOT NULL,
  assigned_by   uuid,
  sector        text,
  created_at    timestamp DEFAULT now()
);

-- 9. Sector milestone templates
CREATE TABLE IF NOT EXISTS sector_milestone_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector          text NOT NULL,
  phase           int DEFAULT 1,
  title           text NOT NULL,
  description     text,
  amount_suggested numeric DEFAULT 0,
  required_proof  text DEFAULT 'Photo evidence of activity'
);

-- 10. Seed sector templates
INSERT INTO sector_milestone_templates (sector, phase, title, description, amount_suggested, required_proof) VALUES
  ('Education', 1, 'Setup Learning Center', 'Establish classroom or distribute initial learning materials', 25000, 'Photo of classroom/materials with students'),
  ('Education', 2, 'First Batch Enrollment', 'Enroll minimum 20 students in program', 15000, 'Photo of enrolled students with attendance register'),
  ('Education', 3, 'Monthly Progress Report', 'Submit student progress data and photos', 10000, 'Photos of teaching sessions and exam results'),
  ('Healthcare', 1, 'Medical Camp Setup', 'Organize first medical camp in target area', 30000, 'Photo of medical camp with patients and doctors'),
  ('Healthcare', 2, 'Patient Treatment Records', 'Treat minimum 50 patients with documentation', 20000, 'Photo of treatment with blurred patient faces'),
  ('Healthcare', 3, 'Follow-up Health Check', 'Conduct follow-up health assessments', 15000, 'Photo of follow-up camp'),
  ('Environment', 1, 'Site Survey & Planning', 'Complete environmental survey of target area', 10000, 'Before photo of target area with GPS'),
  ('Environment', 2, 'Implementation Phase', 'Plant trees / clean area / install equipment', 25000, 'During-work photo showing volunteers and progress'),
  ('Environment', 3, 'Impact Documentation', 'Document measurable environmental improvement', 15000, 'After photo from same GPS location showing change')
ON CONFLICT DO NOTHING;

-- 11. Enable RLS on new tables
ALTER TABLE crowd_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE govt_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_accounts ENABLE ROW LEVEL SECURITY;

-- Open read policies (adjust for production)
CREATE POLICY IF NOT EXISTS "Allow read crowd_votes" ON crowd_votes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow insert crowd_votes" ON crowd_votes FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow read impact_feed" ON impact_feed FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow insert impact_feed" ON impact_feed FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all suspicious_flags" ON suspicious_flags FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all govt_officials" ON govt_officials FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all ngo_accounts" ON ngo_accounts FOR ALL USING (true);
