export type CampaignStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'completed';

export interface Profile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  story: string;
  category: string;
  goal_cents: number;
  raised_cents: number;
  deadline: string;
  hero_image_url: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  campaign_id: string;
  donor_id: string;
  amount_cents: number;
  is_anonymous: boolean;
  created_at: string;
}

// Commonly used subsets for list views
export type CampaignSummary = Pick<Campaign, 
  | 'id' 
  | 'title' 
  | 'slug' 
  | 'goal_cents' 
  | 'raised_cents' 
  | 'hero_image_url'
  | 'status'
  | 'created_at'
  | 'category'
>;

export type CampaignWithOwner = Campaign & {
  owner: Profile;
};

// For admin views
export type PendingCampaign = Pick<Campaign,
  | 'id'
  | 'title'
  | 'slug'
  | 'goal_cents'
  | 'created_at'
  | 'owner_id'
>;