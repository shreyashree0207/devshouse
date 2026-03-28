-- ══════════════════════════════════════════════════════════════
-- Sustainify Database Repair Script
-- Run this in your Supabase SQL Editor to fix 'Database integrity' errors
-- ══════════════════════════════════════════════════════════════

-- 1. FIX NGO STATUS CONSTRAINT
-- The existing constraint was too restrictive, blocking 'pending' and 'approved' statuses.
ALTER TABLE ngos DROP CONSTRAINT IF EXISTS status_check;
ALTER TABLE ngos DROP CONSTRAINT IF EXISTS ngos_status_check;
ALTER TABLE ngos ADD CONSTRAINT ngos_status_check CHECK (status IN ('pending', 'approved', 'darpan_pending', 'suspended', 'under_review', 'active', 'blacklisted', 'gov_funded'));

-- 2. FIX TYPE MISMATCHES (INT -> UUID)
-- Foreign keys must match the primary key type (UUID).

-- Check and replace integer column types back to UUID for references
-- Note: 'USING ngo_id::text::uuid' handles data that might exist as text.
DO $$ 
BEGIN
    -- Check activities table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'ngo_id' AND data_type = 'integer') THEN
        ALTER TABLE activities ALTER COLUMN ngo_id TYPE uuid USING ngo_id::text::uuid;
    END IF;
    
    -- Check proof_submissions table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proof_submissions' AND column_name = 'ngo_id' AND data_type = 'integer') THEN
        ALTER TABLE proof_submissions ALTER COLUMN ngo_id TYPE uuid USING ngo_id::text::uuid;
    END IF;
END $$;

-- 3. ENSURE ALL COLUMNS EXIST FOR GOVT OVERSIGHT
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS verified_by uuid;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS blacklisted_by uuid;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS blacklisted_at timestamp with time zone;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS gov_points int DEFAULT 0;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS pending_doc_request boolean DEFAULT false;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS doc_request_reason text;
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 4. DONATIONS TABLE FIXES
-- Ensure donations table has necessary columns used in routes/donations.py
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'status') THEN
        ALTER TABLE donations ADD COLUMN status text DEFAULT 'completed';
    END IF;
END $$;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS receipt_text text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS impact_text text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_name text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_email text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS anonymous boolean DEFAULT false;

-- 5. NEW SUPPORTING TABLES (if missing)
CREATE TABLE IF NOT EXISTS gov_actions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id      uuid REFERENCES ngos(id),
    action_type text,
    details     text,
    created_at  timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gov_document_requests (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id        uuid REFERENCES ngos(id),
    reason        text,
    document_types text[],
    status        text DEFAULT 'PENDING',
    created_at    timestamp with time zone DEFAULT now()
);

-- 6. GRANT PERMISSIONS (ensure frontend can write)
-- Loosening RLS for Demo/Dev environment
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public read" ON ngos FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow auth insert" ON ngos FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow auth update" ON ngos FOR UPDATE USING (true);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public read" ON donations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow auth insert" ON donations FOR INSERT WITH CHECK (true);

ALTER TABLE impact_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public read impact" ON impact_feed FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow all impact" ON impact_feed FOR ALL USING (true);
