-- TASK 1: Supabase Database Schema Updates

-- Update ngos table
ALTER TABLE ngos 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blacklisted', 'gov_funded')),
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT,
ADD COLUMN IF NOT EXISTS transparency_score INT DEFAULT 75,
ADD COLUMN IF NOT EXISTS improvement_tips TEXT;

-- Update donations table
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'escrow' CHECK (refund_status IN ('completed', 'refunded', 'escrow'));

-- Update proof_updates table
ALTER TABLE proof_updates 
ADD COLUMN IF NOT EXISTS reverse_image_passed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ai_generated_flag BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS improvement_tips TEXT,
ADD COLUMN IF NOT EXISTS community_upvotes INT DEFAULT 0;

-- Create community_feed table
CREATE TABLE IF NOT EXISTS community_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
