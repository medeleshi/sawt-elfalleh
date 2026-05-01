
# 🌾 Sawt ElFalleh — Foundation Blueprint Document (V1)
**Engineering Blueprint (Foundation Ready)**  
**Stack:** Next.js (App Router) + Supabase  
**Language:** Arabic UI (RTL)  
**Database:** Supabase PostgreSQL + RLS  
**Version:** 1.0  
**Goal:** Build a production-grade foundation that is secure, scalable, and clean.

---

# 1) Foundation Goals

## 1.1 What the Foundation Must Guarantee
- Correct authentication flow (Google + Email/Password)
- Secure access control (Middleware + RLS)
- Onboarding gating (no app access without completed profile)
- Clean App Router structure with route groups
- Stable Supabase client setup (server/client/middleware)
- Standardized data fetching pattern
- Standardized server actions pattern
- Reusable UI component system
- Error pages + loading states
- RTL Arabic UI base
- Clean env config and deployment readiness

---

# 2) Project Architecture Rules

## 2.1 App Router Must Be Used
- Use `app/` directory only.
- Use route groups for separation.

Route groups:
- `(public)`
- `(auth)`
- `(onboarding)`
- `(app)`
- `(admin)`

## 2.2 Rendering Strategy
### Server Components
Use for:
- Marketplace listing
- Post details
- Home feed queries
- Public pages (Landing)

### Client Components
Use for:
- Filters UI
- Forms (Auth / Onboarding / Post Form)
- Modals (Contact modal, Report modal)
- File upload

---

# 3) Folder Structure (Strict)

```

src/
app/
layout.tsx
globals.css
(public)/
landing/page.tsx
about/page.tsx
contact/page.tsx
how-it-works/page.tsx
privacy-policy/page.tsx
terms/page.tsx

```
(auth)/
  layout.tsx
  login/page.tsx
  register/page.tsx
  forgot-password/page.tsx
  reset-password/page.tsx
  reset-success/page.tsx

(onboarding)/
  layout.tsx
  onboarding/
    profile/page.tsx
    interests/page.tsx
    done/page.tsx

(app)/
  layout.tsx
  page.tsx                      # Home
  marketplace/
    page.tsx
    [id]/page.tsx
  post/
    new/page.tsx
    [id]/edit/page.tsx
  profile/
    me/page.tsx
    [username]/page.tsx
  settings/
    page.tsx
    profile/page.tsx
  notifications/page.tsx
  messages/page.tsx             # Phase 3

(admin)/
  admin/
    layout.tsx
    page.tsx
    users/page.tsx
    posts/page.tsx
    reports/page.tsx
    categories/page.tsx
```

actions/
auth.actions.ts
onboarding.actions.ts
posts.actions.ts
profile.actions.ts
saved.actions.ts
reports.actions.ts

components/
auth/
AuthShell.tsx
AuthCard.tsx
app/
Navbar.tsx
Footer.tsx
posts/
PostCard.tsx
PostGrid.tsx
PostFilters.tsx
PostForm.tsx
PostImageUploader.tsx
ContactModal.tsx
SimilarPosts.tsx
profile/
ProfileHeader.tsx
ProfileStats.tsx
shared/
SectionHeader.tsx
EmptyState.tsx
ConfirmDialog.tsx
PageHeader.tsx
LoadingSpinner.tsx

lib/
supabase/
client.ts
server.ts
middleware.ts
validators/
auth.schema.ts
onboarding.schema.ts
post.schema.ts
profile.schema.ts
utils/
constants.ts
format.ts
slug.ts
security.ts

types/
db.ts
domain.ts

middleware.ts

```

---

# 4) Environment Variables (Required)

## 4.1 Next.js `.env.local`
```

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

SUPABASE_SERVICE_ROLE_KEY=...  # only if needed for admin scripts (NOT for client)
NEXT_PUBLIC_SITE_URL=[http://localhost:3000](http://localhost:3000)

```

## 4.2 Important Security Rule
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed in client code.
- It must never be used in middleware.
- It must never be committed.

---

# 5) Supabase Client Setup (Strict Standard)

## 5.1 Client Component Supabase (Browser)
File: `src/lib/supabase/client.ts`

**Purpose**
- Used only in client components for:
  - auth actions (sign in/out)
  - file upload to storage
  - realtime subscriptions (phase 2)

**Rules**
- Always use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 5.2 Server Supabase Client
File: `src/lib/supabase/server.ts`

**Purpose**
- Used inside:
  - Server Components
  - Server Actions
  - Route handlers if needed

**Rules**
- Must read cookies (session) properly.
- Must use `@supabase/ssr`.

---

## 5.3 Middleware Supabase Client
File: `src/lib/supabase/middleware.ts`

**Purpose**
- Read session inside middleware.
- Protect routes.

**Rules**
- Must not do heavy DB queries in middleware.
- Only session validation + small profile check.

---

# 6) Authentication Flow (Full Specification)

## 6.1 Supported Login Methods
- Google OAuth
- Email/Password

## 6.2 Register Flow
**Register Page**
- Role selection must happen in register.
- Terms checkbox required.

**After register**
- Supabase trigger auto-creates:
  - profiles row
  - notification_settings row

User is redirected to:
- `/onboarding/profile`

---

## 6.3 Login Flow
After login success:
- if profile.is_profile_completed = false → redirect onboarding
- else redirect to `/` (home)

---

## 6.4 Password Reset Flow
Pages:
- forgot-password → sends email reset link
- reset-password → updates password
- reset-success → success page with CTA to login

---

## 6.5 Email Verification Policy
No forced verification.
Verification is optional from settings.

---

# 7) Middleware Blueprint (Route Protection)

File: `src/middleware.ts`

## 7.1 Routes to Protect
Protected:
- `(app)` routes
- `(onboarding)` routes
- `(admin)` routes

Public:
- landing + public pages
- auth pages

## 7.2 Redirect Logic (Strict)
### Rule A: Not logged in
If no session:
- redirect to `/login`

### Rule B: Logged in but onboarding incomplete
If session exists and profile.is_profile_completed = false:
- redirect to `/onboarding/profile`

### Rule C: Admin route access
If route starts with `/admin`:
- allow only if profile.role = 'admin'
- else redirect to `/`

---

## 7.3 Middleware Performance Rule
Middleware should not fetch heavy data.
Allowed query:
- profiles select `role, is_profile_completed`

---

# 8) Onboarding Blueprint (Data + Actions)

## 8.1 Step 1: Profile Completion
Route:
- `/onboarding/profile`

Data required:
- full_name
- role (already set but editable)
- region_id
- city
- phone
- avatar_url (optional)
- bio (optional)

DB table:
- profiles

Action:
- update profiles
- set is_profile_completed = false until Step 2 finishes

---

## 8.2 Step 2: Interests
Route:
- `/onboarding/interests`

Data:
- user_activities (max 5)
- user_followed_regions (max 5)

DB tables:
- user_activities
- user_followed_regions

Rules:
- enforce max 5 via DB triggers
- frontend must also prevent selecting more than 5

---

## 8.3 Step 3: Done
Route:
- `/onboarding/done`

Action:
- update profiles set is_profile_completed = true
- redirect to home

---

# 9) Server Actions Blueprint (Naming + Pattern)

## 9.1 Rule
All DB mutations must be implemented via server actions.

Location:
- `src/actions/*`

## 9.2 Naming Convention
- `createPostAction`
- `updatePostAction`
- `deletePostAction`
- `savePostAction`
- `unsavePostAction`
- `reportPostAction`
- `updateProfileAction`
- `completeOnboardingAction`

## 9.3 Server Action Requirements
- validate input using Zod
- return typed result:
  - `{ success: true }`
  - `{ success: false, error: string }`

---

# 10) Database Query Helpers (Recommended Pattern)

## 10.1 Read Queries
Read queries should live in:
- `src/lib/queries/*` (optional but recommended)

Examples:
- `getHomeSections(userId)`
- `getMarketplacePosts(filters)`
- `getPostById(postId)`
- `getSimilarPosts(categoryId, regionId)`

---

# 11) Home Page Blueprint (Feed Logic)

Route:
- `/` inside `(app)`

## 11.1 Data Inputs
From profiles:
- region_id
From user_activities:
- category_ids
From user_followed_regions:
- region_ids

## 11.2 Sections Query Logic
### Section 1: My Region Posts
- active posts
- region_id = user.region_id
- order created_at desc
- limit 10

### Section 2: Activity Matching Posts
- active posts
- category_id in user_activities
- order created_at desc
- limit 10

### Section 3: Latest Posts
- active posts
- order created_at desc
- limit 10

### Section 4: Followed Regions Posts
- active posts
- region_id in followed regions
- order created_at desc
- limit 10

---

## 11.3 UI Requirements
- each section shows 10 posts
- each section has "View More" linking to marketplace with params

---

# 12) Marketplace Blueprint

Route:
- `/marketplace`

## 12.1 Filters Model
Filters:
- query (text)
- type (sell/buy)
- category_id
- region_id
- unit_id
- price_min
- price_max
- is_negotiable
- sort (newest / price_low / price_high)

## 12.2 Query Requirements
Base:
- status = active

Text search:
- search title

Pagination:
- page + limit

---

# 13) Post CRUD Blueprint

## 13.1 Create Post
Route:
- `/post/new`

Rules:
- citizen cannot create sell posts (enforced in RLS)
- upload images to storage
- insert post_images rows

Max images:
- 5 enforced in DB

---

## 13.2 Edit Post
Route:
- `/post/[id]/edit`

Rules:
- only owner can edit
- allow changing fields
- allow image reorder/delete

---

## 13.3 Delete Post
Delete behavior:
- use hard delete OR soft delete depending on future needs
Recommended MVP:
- delete row directly (simpler)
- status system already exists for expiration/suspension

---

# 14) Post Details Blueprint

Route:
- `/marketplace/[id]`

## 14.1 Required Features
- show post data
- show images slider
- show seller profile summary
- contact modal

## 14.2 Analytics
### Views
Insert into post_views on page load:
- viewer_id nullable
- ip_hash optional

### Contacts
Insert into post_contacts on click:
- contact_type phone/whatsapp

---

## 14.3 Similar Posts
Fetch:
- same category_id
- same region_id
- exclude current post_id
- limit 8

---

# 15) Saved Posts Blueprint

## 15.1 Save/Unsave Action
Table:
- saved_posts

Rules:
- unique(user_id, post_id)

UI:
- save icon on PostCard
- saved posts list in `/profile/me`

---

# 16) Reports Blueprint

## 16.1 Report Post/User
Table:
- reports

Fields:
- reporter_id
- post_id OR reported_user_id
- reason
- status

UI:
- report button on post details
- confirm dialog

---

# 17) Admin Blueprint (Foundation Level)

## 17.1 Admin Access Rules
Admin routes protected by:
- middleware
- RLS policy

## 17.2 Admin MVP Features
- list posts (filter by status)
- suspend posts (set status suspended)
- list reports
- review reports
- manage categories/units/regions (basic CRUD)

---

# 18) UI Component Blueprint

## 18.1 Must-Have Components
- AuthShell
- AuthCard
- Navbar
- Footer
- PostCard
- PostGrid
- PostFilters
- PostForm
- ContactModal
- ConfirmDialog
- EmptyState
- LoadingSpinner
- SectionHeader

## 18.2 UI Standards
- consistent spacing (Tailwind)
- RTL support
- readable typography
- no crowded filters
- mobile-first layout

---

# 19) Error Handling Blueprint

## 19.1 Global
- `not-found.tsx`
- `error.tsx`
- `loading.tsx`

## 19.2 Offline Page
Route:
- `/offline`

UI:
- message: no internet
- retry button
- simple design

---

# 20) SEO Blueprint

## 20.1 generateMetadata Usage
- landing
- marketplace
- post details

Post details metadata:
- title includes category + region
- description includes price + quantity

---

# 21) Logging & Debugging Rules

## 21.1 No console.logs in production
Use:
- proper error boundaries
- structured error return from actions

## 21.2 Admin Logs (Future)
Admin actions should insert into admin_logs.

---

# 22) Foundation Acceptance Criteria (Must Pass)

## 22.1 Auth Flow
- user can register/login
- onboarding required
- logout works

## 22.2 Security Flow
- citizen cannot create sell post
- user cannot edit others posts
- admin can access admin routes only

## 22.3 UI Flow
- home loads personalized sections
- marketplace search works
- post details shows contact options

## 22.4 Performance
- pages load under 2 seconds on average connection
- images optimized

---

# 23) Final Notes (Strict Rules)

## 23.1 Do Not Break These Decisions
- marketplace can be public (recommended for growth)
- no forced email verification
- contact is phone/whatsapp in MVP
- max 5 activities/followed regions/images enforced by DB triggers

## 23.2 Development Order Must Follow Milestones
No skipping onboarding or middleware before building marketplace.

---

# 🌾 End of Foundation Blueprint Document
```

