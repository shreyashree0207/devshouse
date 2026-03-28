-- ── Sustainify Schema V2: Reputation & Control ───────────────────

-- 1. Complaints Table: Community reporting system
CREATE TABLE IF NOT EXISTS complaints (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id      uuid REFERENCES ngos(id),
  user_id     uuid,
  reason      text, -- e.g. "fake_proof" | "misuse_of_funds" | "harassment" | "other"
  description text,
  proof_url   text,
  status      text DEFAULT 'open', -- 'open' | 'investigated' | 'resolved'
  created_at  timestamp DEFAULT now()
);

-- 2. Status Audit Log: Tracking NGO reputation changes
CREATE TABLE IF NOT EXISTS status_audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id      uuid REFERENCES ngos(id),
  old_status  text,
  new_status  text,
  reason      text,
  admin_note  text,
  changed_at  timestamp DEFAULT now()
);

-- 3. Schema Upgrades: Adding mandatory control columns
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS complaint_count int DEFAULT 0;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved'; -- 'pending' | 'approved' | 'under_review' | 'suspended' | 'rejected'
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS has_darpan boolean DEFAULT false;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();
