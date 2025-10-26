# NexaFund Platform Extensions

This document outlines the new features added to transform NexaFund into a white-label mentorship and networking platform for companies and underrepresented creators.

## 🚀 New Features

### 1. **Company Profiles & White-Label Branding**
Companies can create branded profiles with:
- Custom logos and colors
- Company description and industry
- Social media links (LinkedIn, Twitter)
- Custom domain support (configured via `custom_domain` field)
- Public directory visibility controls

**Database:** `company_profiles` table
**API:** `/api/company/profile`
**UI:** 
- `/companies` - Company directory
- `/company/[id]` - Individual company showcase page

### 2. **Mentorship Program**
Connect companies with campaign creators:
- Companies can mentor multiple creators
- Track mentorship type (technical, business, funding, general)
- Display mentor badges on campaigns
- Feature success stories with testimonials
- Show active and completed mentorships

**Database:** `mentorships` table
**API:** `/api/mentorship`
**UI Components:**
- `MentorBadge` - Shows mentor companies on campaign pages
- Company profile pages display all mentees with success metrics

### 3. **Networking & Connections**
Enable user-to-user networking:
- Send connection requests
- Accept/reject/block connections
- Discover people seeking mentorship
- Connect with companies and other creators
- View and manage your network

**Database:** `connections` table
**API:** `/api/connections`
**UI:** `/network` - Connection management and discovery page

### 4. **Endorsements**
Companies can publicly endorse campaigns they support:
- Visible endorsement badges
- Custom endorsement text
- Track company's endorsed campaigns

**Database:** `endorsements` table

### 5. **Company Impact Metrics**
Track and showcase mentorship ROI:
- Total mentees supported
- Campaigns funded
- Success rate metrics
- Time period reporting

**Database:** `company_metrics` table

## 📊 Database Schema

### Extended Schema File
Run `supabase-schema-extended.sql` to add:
- `company_profiles` - White-label company information
- `mentorships` - Company-creator mentorship relationships
- `connections` - User networking
- `endorsements` - Company campaign endorsements
- `company_metrics` - Impact tracking

### Profile Extensions
Added fields to `profiles` table:
- `company_id` - Link to company profile
- `user_type` - 'creator', 'company', 'mentor', 'donor'
- `bio` - User biography
- `linkedin_url` - Professional profile
- `location` - Geographic location
- `seeking_mentorship` - Flag for mentor discovery

### Campaign Extensions
Added fields to `campaigns` table:
- `mentor_company_id` - Direct link to mentoring company
- `is_featured` - Highlight successful campaigns

## 🎨 White-Label Customization

Companies can customize:
1. **Brand Colors** - Primary and secondary colors for their campaigns
2. **Custom Logos** - Display company logo on mentee campaigns
3. **Custom Domains** - Point their own domain to their NexaFund showcase
4. **Showcase Settings** - Control visibility and featured content

## 💼 Value Proposition for Companies

### Brand Building
- Public showcase of diversity & inclusion efforts
- Featured success stories with testimonials
- Impact metrics dashboard
- Social sharing of mentee achievements

### Talent Discovery
- Direct access to underrepresented creators
- Filter by industry, location, skills
- Review campaign proposals before funding
- Build long-term mentorship relationships

### Measurable ROI
- Track mentee success rates
- Monitor funds raised through mentorship
- Generate impact reports for stakeholders
- Showcase CSR initiatives publicly

## 🔗 Navigation Structure

Updated TopBar includes:
- **Browse Campaigns** - All active campaigns
- **Mentors** - Company directory
- **Network** - User connections and discovery
- **Success Stories** - Testimonials and impact stories

## 📱 Key Pages

1. **`/companies`** - Browse mentor companies
2. **`/company/[id]`** - Company profile with mentees and impact stats
3. **`/network`** - Connection requests and discovery
4. **`/campaign/[slug]`** - Campaign page (now shows mentor badge)
5. **`/`** - Homepage (updated with company value prop)

## 🛠 API Endpoints

### Company Profile
- `GET /api/company/profile?company_id={id}` - Get single company
- `GET /api/company/profile?user_id={id}` - Get company by user
- `GET /api/company/profile` - Get all public companies
- `POST /api/company/profile` - Create/update company profile

### Mentorship
- `GET /api/mentorship?company_id={id}` - Get company's mentees
- `GET /api/mentorship?mentee_id={id}` - Get user's mentors
- `GET /api/mentorship?campaign_id={id}` - Get campaign mentors
- `POST /api/mentorship` - Create mentorship relationship

### Connections
- `GET /api/connections?user_id={id}` - Get user's connections
- `GET /api/connections?user_id={id}&status=pending` - Get pending requests
- `POST /api/connections` - Send connection request
- `PATCH /api/connections` - Accept/reject connection

## 🚦 Next Steps for Implementation

To fully activate these features:

1. **Run Extended Schema**
   ```sql
   -- Execute supabase-schema-extended.sql in your Supabase SQL editor
   ```

2. **Set Environment Variables**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for server APIs

3. **Create Sample Data** (Optional)
   - Add sample companies via API
   - Create sample mentorships
   - Populate test connections

4. **Company Onboarding Flow**
   - Create `/company/register` page for company sign-up
   - Add company profile editing UI
   - Implement mentorship request workflow

5. **White-Label Features**
   - Implement custom domain routing
   - Create theme provider for brand colors
   - Build branded campaign templates

## 🎯 Business Model

### For Companies (B2B)
- **Freemium Model:** Basic company profile free
- **Premium Tier:** Advanced analytics, featured placement, custom branding
- **Enterprise:** Full white-label, dedicated support, custom features

### Platform Features
- **Company Directory:** Showcase all mentor companies
- **Impact Reports:** Quarterly reports for companies
- **Success Stories:** Public testimonials from mentees
- **Networking Events:** Virtual matchmaking between companies and creators

## 🔐 Privacy & Security

- Anonymous donations supported
- Connection requests can be rejected/blocked
- Company profiles can be hidden from directory
- Mentorship details private until approved
- GDPR-compliant data handling

## 📈 Success Metrics

Track platform health via:
- Total active mentorships
- Company retention rate
- Campaign success rate (mentored vs. non-mentored)
- Network growth (connections over time)
- Company engagement (endorsements, testimonials)

---

**Note:** This is a white-label platform designed to be customized and deployed for different company brands. Each company can have their own branded instance showcasing their specific mentorship initiatives.
