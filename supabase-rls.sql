-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Campaigns policies
CREATE POLICY "Public can view approved campaigns"
  ON campaigns FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Owners can view their own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create their own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Donations policies
CREATE POLICY "Donors can view their own donations"
  ON donations FOR SELECT
  USING (auth.uid() = donor_id);

CREATE POLICY "Donors can insert donations for themselves"
  ON donations FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Campaign owners can view donations to their campaigns"
  ON donations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = donations.campaign_id
      AND campaigns.owner_id = auth.uid()
    )
  );

-- Campaign Updates policies
CREATE POLICY "Public can view updates for approved campaigns"
  ON campaign_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_updates.campaign_id
      AND campaigns.status = 'approved'
    )
  );

CREATE POLICY "Campaign owners can manage updates"
  ON campaign_updates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_updates.campaign_id
      AND campaigns.owner_id = auth.uid()
    )
  );

-- Comments policies
CREATE POLICY "Public can view comments on approved campaigns"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = comments.campaign_id
      AND campaigns.status = 'approved'
    )
  );

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Comment authors can update their comments"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Reports policies
CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);