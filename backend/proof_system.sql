-- NEW SUPABASE TABLE: activities
CREATE TABLE IF NOT EXISTS activities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id          int REFERENCES ngos(id),
  title           text,              -- "Buy 50 textbooks for Class 6"
  description     text,
  category        text,
  target_amount   int,
  raised_amount   int DEFAULT 0,
  donor_count     int DEFAULT 0,
  status          text DEFAULT 'fundraising',
                  -- 'fundraising' | 'in_progress' | 'proof_submitted' 
                  -- | 'verified' | 'flagged'
  before_image    text,              -- uploaded when activity starts
  deadline        date,
  location_name   text,              -- "Ambattur, Chennai"
  created_at      timestamp with time zone DEFAULT now()
);

-- UPDATE donations TABLE
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS activity_id uuid REFERENCES activities(id),
ADD COLUMN IF NOT EXISTS released boolean DEFAULT false;

-- NEW TABLE: proof_submissions
CREATE TABLE IF NOT EXISTS proof_submissions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id       uuid REFERENCES activities(id),
  ngo_id            int REFERENCES ngos(id),
  after_image_url   text,
  description       text,
  latitude          float,
  longitude         float,
  location_name     text,
  device_timestamp  timestamp with time zone,     -- from EXIF metadata
  
  -- AI verification results
  reverse_image_score    int,      -- 0-100, is image original?
  geotag_match_score     int,      -- 0-100, does GPS match NGO district?
  content_match_score    int,      -- 0-100, does image match activity?
  before_after_score     int,      -- 0-100, visible progress from before img?
  overall_trust_score    int,      -- weighted average
  
  ai_verdict             text,
  ai_tags                text[],
  spoofing_flags         text[],   -- list of issues found if any
  status                 text DEFAULT 'pending',
                         -- 'pending' | 'verified' | 'flagged' | 'rejected'
  reviewed_at            timestamp with time zone,
  created_at             timestamp with time zone DEFAULT now()
);

-- NEW TABLE: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id),
  activity_id   uuid REFERENCES activities(id),
  type          text, -- 'proof_verified' | 'proof_flagged' | 'funds_released'
  message       text, -- AI generated from generateProofNotification()
  read          boolean DEFAULT false,
  created_at    timestamp with time zone DEFAULT now()
);
