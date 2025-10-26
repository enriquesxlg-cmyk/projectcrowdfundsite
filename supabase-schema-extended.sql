-- Extended schema for mentorship, networking, and white-label features

-- Create company profiles table for white-label customization
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  company_website TEXT,
  company_description TEXT,
  industry TEXT,
  
  -- White-label branding
  primary_color TEXT DEFAULT '#9333ea', -- purple-600
  secondary_color TEXT DEFAULT '#ec4899', -- pink-600
  custom_domain TEXT,
  
  -- Showcase settings
  show_in_directory BOOLEAN DEFAULT true,
  showcase_mentees BOOLEAN DEFAULT true,
  
  -- Contact & social
  contact_email TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create mentorship table (company -> campaign creator relationships)
CREATE TABLE mentorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Mentorship details
  status TEXT DEFAULT 'active', -- active, completed, paused
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  
  -- Impact tracking
  mentorship_type TEXT, -- 'technical', 'business', 'funding', 'general'
  description TEXT,
  hours_committed INTEGER,
  
  -- Showcase
  is_featured BOOLEAN DEFAULT false,
  testimonial TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, mentee_id, campaign_id)
);

-- Create connections table (user-to-user networking)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected, blocked
  message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(requester_id, recipient_id),
  CHECK (requester_id != recipient_id)
);

-- Create endorsements table (companies endorsing campaigns)
CREATE TABLE endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  endorsement_text TEXT,
  is_visible BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, campaign_id)
);

-- Create company impact metrics table (for showcasing ROI)
CREATE TABLE company_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  
  -- Calculated metrics
  total_mentees INTEGER DEFAULT 0,
  total_campaigns_supported INTEGER DEFAULT 0,
  total_funds_raised_cents INTEGER DEFAULT 0,
  successful_campaigns INTEGER DEFAULT 0,
  
  -- Time period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add company_id to profiles for linking
ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES company_profiles(id);
ALTER TABLE profiles ADD COLUMN user_type TEXT DEFAULT 'creator'; -- 'creator', 'company', 'mentor', 'donor'
ALTER TABLE profiles ADD COLUMN bio TEXT;
ALTER TABLE profiles ADD COLUMN linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN location TEXT;
ALTER TABLE profiles ADD COLUMN seeking_mentorship BOOLEAN DEFAULT false;

-- Add mentor_id to campaigns for direct mentorship tracking
ALTER TABLE campaigns ADD COLUMN mentor_company_id UUID REFERENCES company_profiles(id);
ALTER TABLE campaigns ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Create indexes
CREATE INDEX idx_company_profiles_user ON company_profiles(user_id);
CREATE INDEX idx_company_profiles_directory ON company_profiles(show_in_directory) WHERE show_in_directory = true;
CREATE INDEX idx_mentorships_company ON mentorships(company_id);
CREATE INDEX idx_mentorships_mentee ON mentorships(mentee_id);
CREATE INDEX idx_mentorships_campaign ON mentorships(campaign_id);
CREATE INDEX idx_mentorships_status ON mentorships(status);
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_recipient ON connections(recipient_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_endorsements_company ON endorsements(company_id);
CREATE INDEX idx_endorsements_campaign ON endorsements(campaign_id);
CREATE INDEX idx_campaigns_mentor ON campaigns(mentor_company_id);

-- Add updated_at triggers
CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorships_updated_at
  BEFORE UPDATE ON mentorships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_metrics_updated_at
  BEFORE UPDATE ON company_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Mentorship posts (company-branded opportunities)
CREATE TABLE mentorship_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT NOT NULL,
  skills TEXT, -- comma-separated or JSON array in future
  location TEXT, -- Remote, City, etc.
  stipend_cents INTEGER,
  apply_url TEXT,
  banner_image_url TEXT,
  
  status TEXT DEFAULT 'open', -- open, closed, draft
  featured BOOLEAN DEFAULT false,
  
  -- Optional brand overrides (fallback to company branding)
  brand_primary_color TEXT,
  brand_secondary_color TEXT,
  cta_text TEXT,
  cta_subtext TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mentorship_posts_company ON mentorship_posts(company_id);
CREATE INDEX idx_mentorship_posts_status ON mentorship_posts(status);
CREATE INDEX idx_mentorship_posts_featured ON mentorship_posts(featured) WHERE featured = true;

CREATE TRIGGER update_mentorship_posts_updated_at
  BEFORE UPDATE ON mentorship_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
