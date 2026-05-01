
# 🌾 Sawt ElFalleh — Implementation Plan + Milestones + Coding Rules (V1)
**Implementation Document (Engineering Ready)**  
**Project:** صوت الفلاح  
**Stack:** Next.js (App Router) + Supabase  
**Language:** Arabic UI  
**Database:** PostgreSQL (Supabase)  
**Version:** 1.0  
**Status:** Ready to Start Foundation

---

# 1) Implementation Strategy (منهجية التنفيذ)

## 1.1 Core Rule
أي feature لازم تتبنى وفق:
- **Database First**
- **Security First (RLS + Middleware)**
- **UI Second**
- **Performance Always**

## 1.2 Development Principles
- No hardcoding for catalog data (regions/categories/units) → always fetch from DB.
- No direct client DB writes without validation.
- No UI-only permissions (must be enforced in DB).
- Keep components reusable (AuthLayout, PostCard, Filters, etc.).
- Keep Arabic UI consistent and readable.

---

# 2) Milestones Roadmap (خارطة التنفيذ بالترتيب الصحيح)

## Milestone 0 — Project Setup (Day 1)
### Goals
- تجهيز بيئة التطوير
- ضبط linting و formatting
- ضبط structure الصحيح للمشروع

### Tasks
- Create Next.js project (App Router)
- Configure TypeScript
- Install dependencies:
  - @supabase/supabase-js
  - @supabase/ssr (recommended)
  - zod
  - react-hook-form
  - tailwindcss
  - lucide-react
  - shadcn/ui

### Output
- Running project locally
- Clean folder structure ready

---

## Milestone 1 — Supabase Setup (Day 1-2)
### Goals
- بناء قاعدة البيانات
- إعداد Storage
- تفعيل الأمن (RLS)

### Tasks (Supabase Dashboard)
1. Run `schema.sql`
2. Run `seed.sql`
3. Create storage buckets:
   - avatars
   - post-images
4. Confirm RLS is enabled
5. Create test accounts:
   - farmer
   - trader
   - citizen
   - admin

### Output
- Database ready
- Catalog data inserted (regions/categories/units)
- Storage ready

---

## Milestone 2 — Supabase Client Architecture (Day 2-3)
### Goals
- بناء client/server Supabase utilities بطريقة صحيحة
- تجهيز auth helpers

### Tasks
- Create:
  - `lib/supabase/server.ts`
  - `lib/supabase/client.ts`
  - `lib/supabase/middleware.ts`

### Output
- Supabase works in:
  - Server Components
  - Client Components
  - Middleware

---

## Milestone 3 — Routing Structure (Day 3)
### Goals
- إنشاء route groups
- بناء layouts الأساسية

### Tasks
Create route groups:
- `(public)`
- `(auth)`
- `(onboarding)`
- `(app)`
- `(admin)`

Create layouts:
- Global `app/layout.tsx`
- Auth layout
- App layout (navbar + main container)
- Admin layout

### Output
- Clean routing system ready

---

## Milestone 4 — Authentication System (Day 4-6)
### Goals
- Login/Register/Forgot/Reset
- Google OAuth integration
- Session handling

### Pages
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/reset-success`

### Requirements
- Shared Auth UI component:
  - Logo
  - motivational text
  - consistent form layout
  - footer links

### Output
- Full auth system working

---

## Milestone 5 — Middleware Protection (Day 6-7)
### Goals
- حماية routes
- منع الوصول قبل onboarding
- حماية admin routes

### Middleware Rules
- If not logged in → redirect to `/login`
- If logged in but profile incomplete → redirect to `/onboarding/profile`
- If role is not admin and route starts with `/admin` → redirect to `/`

### Output
- Proper security routing flow

---

## Milestone 6 — Onboarding System (Day 7-10)
### Goals
- onboarding steps
- saving profile data
- activities + followed regions with limits

### Pages
- `/onboarding/profile`
- `/onboarding/interests`
- `/onboarding/done`

### Tasks
- Fetch regions from DB
- Fetch categories (activities) from DB
- Insert into:
  - profiles
  - user_activities
  - user_followed_regions
- Enforce max 5 (already enforced in DB triggers)

### Output
- Users cannot access app until onboarding complete

---

## Milestone 7 — App Layout + Navbar (Day 10-12)
### Goals
- create main navigation UI
- create dropdown menu
- create notifications icon placeholder

### Navbar Features
- logo + name
- search input
- notifications icon
- user dropdown:
  - profile
  - saved posts
  - settings
  - logout

### Output
- app shell ready

---

## Milestone 8 — Home Page Feed (Day 12-15)
### Goals
- sections personalized
- fetch posts based on profile data

### Sections
1. Posts from user region
2. Posts matching activities
3. Latest posts
4. Posts from followed regions

### Rules
- Each section shows 10 posts
- Each section has "View More" button linking to marketplace with filters

### Output
- Home page dynamic and personalized

---

## Milestone 9 — Marketplace Listing + Filters (Day 15-20)
### Goals
- search + filters + sorting
- pagination or infinite scroll

### Page
- `/marketplace`

### Filters
- type (sell/buy)
- category
- region
- unit
- price min/max
- negotiable
- sort

### Output
- marketplace works with real DB queries

---

## Milestone 10 — Post CRUD (Day 20-26)
### Goals
- create post
- edit post
- delete post
- upload images (max 5)

### Pages
- `/post/new`
- `/post/[id]/edit`

### Requirements
- Validate form using Zod
- Use Server Actions for submission
- Upload images to Supabase Storage
- Insert into post_images

### Output
- full post creation/edit system

---

## Milestone 11 — Post Details Page (Day 26-29)
### Goals
- show full post info
- contact modal
- similar posts

### Page
- `/marketplace/[id]`

### Features
- slider images
- contact modal:
  - phone
  - WhatsApp
  - copy button
- insert into post_views
- insert into post_contacts on click

### Output
- post details production ready

---

## Milestone 12 — Profile System (Day 29-33)
### Goals
- public profile
- my profile page
- saved posts section

### Pages
- `/profile/[username]`
- `/profile/me`

### Output
- profile system complete

---

## Milestone 13 — Settings System (Day 33-36)
### Goals
- settings UI
- update profile
- show/hide phone
- notification settings

### Pages
- `/settings`
- `/settings/profile`

### Output
- settings complete

---

## Milestone 14 — Saved Posts (Day 36-38)
### Goals
- save/un-save
- list saved posts

### Table
- saved_posts

### Output
- saved posts working

---

## Milestone 15 — Reports System (Day 38-41)
### Goals
- report posts/users
- admin review later

### Table
- reports

### Output
- report system ready

---

## Milestone 16 — Public Pages + Static Pages (Day 41-44)
### Goals
- landing page
- about/contact/privacy/terms/how-it-works

### Option
- Use static_pages table to manage content dynamically.

### Output
- marketing pages ready

---

## Milestone 17 — Admin Panel MVP (Day 44-50)
### Goals
- manage posts
- manage users
- review reports
- edit categories/units/regions

### Pages
- `/admin`
- `/admin/posts`
- `/admin/users`
- `/admin/reports`
- `/admin/categories`

### Output
- admin dashboard working

---

# 3) Folder Structure (Next.js App Router)

Recommended structure:

```

src/
app/
(public)/
landing/
about/
contact/
how-it-works/
privacy-policy/
terms/
(auth)/
login/
register/
forgot-password/
reset-password/
reset-success/
layout.tsx
(onboarding)/
onboarding/
profile/
interests/
done/
layout.tsx
(app)/
layout.tsx
page.tsx                 # Home
marketplace/
page.tsx
[id]/
page.tsx
post/
new/
page.tsx
[id]/
edit/
page.tsx
profile/
me/
page.tsx
[username]/
page.tsx
settings/
page.tsx
profile/
page.tsx
notifications/
page.tsx
messages/
page.tsx               # phase 3
(admin)/
admin/
layout.tsx
page.tsx
posts/
page.tsx
users/
page.tsx
reports/
page.tsx
categories/
page.tsx

components/
auth/
AuthLayout.tsx
AuthCard.tsx
ui/
(shadcn components)
posts/
PostCard.tsx
PostGrid.tsx
PostFilters.tsx
PostForm.tsx
PostSlider.tsx
profile/
ProfileHeader.tsx
shared/
Navbar.tsx
Footer.tsx
SectionHeader.tsx
EmptyState.tsx
ConfirmDialog.tsx

lib/
supabase/
client.ts
server.ts
middleware.ts
validators/
post.schema.ts
profile.schema.ts
utils/
format.ts
slug.ts
constants.ts

actions/
auth.actions.ts
post.actions.ts
profile.actions.ts
saved.actions.ts
report.actions.ts

styles/
globals.css

```

---

# 4) Coding Rules (قواعد هندسية صارمة)

## 4.1 Data Validation
- Use Zod validation for every form:
  - post create/edit
  - onboarding
  - profile update

## 4.2 Server Actions Rule
- CRUD operations must be done via:
  - Server Actions (preferred)
  - not via client direct inserts

## 4.3 DB Query Rules
- No `select *`
- Always select required fields
- Always use indexes-friendly filters:
  - status
  - created_at
  - region_id
  - category_id

## 4.4 Performance Rules
- Use server rendering for marketplace and post details
- Use caching only for static pages
- Use `next/image` always

## 4.5 UI Rules
- Arabic RTL support
- cards consistent
- spacing consistent
- avoid cluttered filters

---

# 5) Database Usage Rules

## 5.1 Mandatory Tables in MVP
- profiles
- posts
- post_images
- categories
- units
- regions
- saved_posts
- reports
- notification_settings
- user_activities
- user_followed_regions

## 5.2 Tables for Analytics (MVP)
- post_views
- post_contacts

## 5.3 Admin Tables (Phase 2 but recommended now)
- admin_logs
- static_pages

---

# 6) Middleware Rules (Final Specification)

## 6.1 Auth Protection
Protected routes:
- /(app)/*
- /(onboarding)/*
- /(admin)/*

## 6.2 Onboarding Protection
If:
- auth session exists
- but profiles.is_profile_completed = false

Redirect to:
- `/onboarding/profile`

## 6.3 Admin Protection
If route starts with `/admin`:
- allow only profiles.role = 'admin'

---

# 7) Supabase Storage Rules

## 7.1 Buckets
- avatars
- post-images

## 7.2 File Constraints
- Max size: 5MB
- Post images max count: 5 (DB trigger)
- Accept formats:
  - jpg/jpeg
  - png
  - webp

---

# 8) Query Logic Specification

## 8.1 Home Queries

### Section: Posts from my region
```

where status = 'active'
and region_id = user.region_id
order by created_at desc
limit 10

```

### Section: Posts matching my activities
```

where status = 'active'
and category_id in (user_activities.category_ids)
order by created_at desc
limit 10

```

### Section: Latest posts
```

where status = 'active'
order by created_at desc
limit 10

```

### Section: Posts from followed regions
```

where status = 'active'
and region_id in (followed_regions)
order by created_at desc
limit 10

```

---

## 8.2 Marketplace Query Rules
Base query:
```

where status = 'active'

```

Optional filters:
- type
- category_id
- region_id
- unit_id
- negotiable
- price range
- keyword search (title)

Sorting:
- created_at desc (default)

Pagination:
- offset/limit OR cursor-based

---

# 9) Notifications Logic (Phase 2)

## 9.1 Notification Generation
Triggers or server jobs can insert notifications when:
- new post in user region
- new post matching user activity
- platform update

## 9.2 Delivery
- Normal fetch in MVP
- Realtime subscription in phase 2

---

# 10) Messaging Logic (Phase 3)

Tables:
- conversations
- conversation_participants
- messages

Rules:
- conversation can be linked to post_id (optional)
- only participants can read messages

---

# 11) Deployment Checklist

## 11.1 Supabase
- schema.sql executed
- seed.sql executed
- storage buckets created
- RLS enabled and verified
- cron job added

## 11.2 Next.js
- environment variables configured
- middleware working
- build passes

## 11.3 Production
- CDN enabled for images
- error monitoring (optional)
- rate limiting (recommended)

---

# 12) Final Engineering Notes

## 12.1 MVP must be stable before Phase 2
No new features added until:
- post CRUD stable
- marketplace stable
- onboarding stable
- RLS verified

## 12.2 Main Technical Focus
- security
- performance
- clarity of UX
- simplicity for farmer user

---

# 🌾 End of Implementation Plan

