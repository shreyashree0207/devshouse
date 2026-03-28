-- ── Sustainify Schema V3: AI Intelligence & Trust ───────────────────

-- 1. Proof Fingerprints (pHashing for Duplicate Detection)
-- Prevents recycling of the same images for multiple milestones or by different NGOs.
CREATE TABLE IF NOT EXISTS proof_fingerprints (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id      uuid REFERENCES ngos(id),
  proof_id    uuid, -- Link to proof_updates TABLE if it exists
  image_hash  text UNIQUE, -- The perceptual hash (pHashed)
  created_at  timestamp DEFAULT now()
);

-- 2. Crowd Votes (Community Trust Layer)
-- Allows the community to verify AI proofs, providing a human consensus score.
CREATE TABLE IF NOT EXISTS crowd_votes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id    uuid,
  voter_id    uuid,
  vote        text, -- 'genuine' | 'fake'
  comment     text,
  created_at  timestamp DEFAULT now(),
  UNIQUE(proof_id, voter_id)
);

-- 3. Additional NGO Intelligence Columns
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS transparency_ai_score int DEFAULT 50;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS health_status text DEFAULT 'Healthy';
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS verified_proof_count int DEFAULT 0;

-- 4. Impact Feed (Social Proof)
-- A social stream of donor and NGO activity.
CREATE TABLE IF NOT EXISTS impact_feed (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text, -- 'donation' | 'verification' | 'milestone' | 'badge'
  user_name       text,
  ngo_name        text,
  amount          numeric,
  message         text,
  activity_title  text,
  category        text,
  icon            text,
  created_at      timestamp DEFAULT now()
);
