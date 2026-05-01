
# 🌾 Sawt ElFalleh — PRD + Technical Specification (V1)
**Product Requirements Document + Technical Spec**  
**Project:** صوت الفلاح  
**Market:** Tunisia  
**Language:** Arabic (Primary) + French (Optional)  
**Stack:** Next.js (App Router) + Supabase  
**Status:** Ready for Foundation Implementation  
**Version:** 1.0

---

# 1) Product Overview

## 1.1 Product Name
**صوت الفلاح — Sawt ElFalleh**

## 1.2 Product Definition
منصة إلكترونية تونسية تساعد على **بيع وشراء المنتجات الفلاحية** عبر نشر منشورات (بيع/شراء) مع تصنيف دقيق حسب:
- الصنف (مواشي، حبوب، عسل، أعلاف...)
- الولاية (24 ولاية تونسية)
- المقاييس المحلية (كغ، رطل، رأس، لتر، طن، قنطار، ربطة، ڨلبة...)

## 1.3 Target Audience
- **Farmer (فلاح)**: يبيع منتجاته ويشتري ما يحتاجه
- **Trader (تاجر)**: يشتري بالجملة ويبيع/يبحث عن عروض
- **Citizen (مواطن)**: يشتري أو ينشر طلب شراء
- **Admin (مدير المنصة)**: مراقبة وإدارة النظام

---

# 2) Problem Statement

## 2.1 Current Market Pain
- غياب منصة تونسية متخصصة في المجال الفلاحي
- بيع وشراء غير منظم عبر وسطاء أو صفحات فيسبوك
- ضعف الثقة في الأسعار والمعلومات
- صعوبة الوصول إلى عروض حسب الولاية أو النشاط
- التواصل غير رسمي ولا يوجد نظام موثوق للإعلانات

## 2.2 Why This Product
"صوت الفلاح" يحول السوق الفلاحي إلى نظام رقمي منظم، مع تجربة سهلة حتى لمن ليست لديه خبرة تقنية.

---

# 3) Product Goals & Success Metrics

## 3.1 Primary Goals
- تسهيل نشر إعلانات بيع/شراء للفلاح والتاجر
- تسهيل وصول المواطن للمنتجات الفلاحية
- توفير بحث وفلترة قوية حسب الولاية والصنف والمقياس والسعر
- توفير تواصل مباشر سريع (Phone/WhatsApp)
- رفع جودة الإعلانات وتحسين الثقة في السوق

## 3.2 MVP Success Metrics (KPIs)
- عدد الحسابات الجديدة أسبوعياً
- عدد المنشورات المنشورة يومياً
- معدل إكمال Onboarding
- عدد clicks على "تواصل مع البائع"
- معدل حفظ المنشورات Saved Posts
- معدل البلاغات Reports (لرصد الجودة)
- متوسط وقت بقاء المنشور Active قبل Expire

---

# 4) User Roles & Permissions

## 4.1 Roles
- farmer
- trader
- citizen
- admin

## 4.2 Permissions Matrix

| Permission | Farmer | Trader | Citizen | Admin |
|---|---|---|---|---|
| Create Sell Post | ✅ | ✅ | ❌ | ❌ |
| Create Buy Post | ✅ | ✅ | ✅ | ❌ |
| View Marketplace | ✅ | ✅ | ✅ | ✅ |
| Contact Seller/Buyer | ✅ | ✅ | ✅ | ❌ |
| Save Posts | ✅ | ✅ | ✅ | ❌ |
| Report Posts/Users | ✅ | ✅ | ✅ | ❌ |
| Manage Own Posts | ✅ | ✅ | ✅ | ❌ |
| Admin Dashboard | ❌ | ❌ | ❌ | ✅ |
| Moderate Posts | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |

> Rule: المواطن لا ينشر بيعاً (sell) لأنه ليس منتجاً.

---

# 5) UX Principles (Design Rules)

## 5.1 Design Direction
- Modern UI
- طابع فلاحي واقعي (ألوان ترابية + عناصر زراعية minimal)
- واجهة بسيطة وسريعة
- تركيز على القراءة والوضوح وليس الزخرفة

## 5.2 Accessibility & User Simplicity
- أزرار كبيرة وواضحة (خصوصاً على الهاتف)
- لغة عربية واضحة
- تقليل الحقول في كل خطوة
- تجربة سريعة حتى مع ضعف الإنترنت

## 5.3 Performance Requirements
- تحميل صفحات Marketplace بسرعة
- تحسين الصور تلقائياً
- تقليل عدد requests قدر الإمكان

---

# 6) Information Architecture (Pages & Routing)

## 6.1 Auth Pages
```

/login
/register
/forgot-password
/reset-password
/reset-success

```

### Login UX Requirements
- Logo (ورقة)
- motivational message
- Login with Google
- Email/password login
- forgot password link
- login button
- link to register
- footer links (privacy, terms, about...)

### Register UX Requirements
- Logo + motivational message
- Google signup + email/password signup
- Role selection (farmer/trader/citizen)
- Accept terms checkbox
- Create account button
- link to login
- footer links

### Forgot Password UX Requirements
- email input
- send button
- back to login link

### Reset Password UX Requirements
- new password
- confirm password
- submit button

### Reset Success UX Requirements
- success message
- CTA to login

---

## 6.2 Email Verification Policy
- لا يوجد verification email إجباري
- verification يكون optional من داخل Settings

Reason:
- الجمهور المستهدف قد لا يفهم verification email

---

## 6.3 Onboarding Pages
```

/onboarding/profile
/onboarding/interests
/onboarding/done

```

### Onboarding Step 1 (Profile)
Required:
- full_name
- role
- region
- city
- phone

Optional:
- avatar
- bio

### Onboarding Step 2 (Interests)
Optional but recommended:
- activities (max 5)
- followed regions (max 5)

### Onboarding Step 3
- welcome screen
- CTA to Home

---

## 6.4 Main App Pages
```

/                    (Home)
/marketplace
/marketplace/[id]
/post/new
/post/[id]/edit
/profile/[username]
/profile/me
/settings
/settings/profile
/notifications
/messages   (phase 3)

```

---

## 6.5 Public Pages
```

/landing
/about
/contact
/how-it-works
/privacy-policy
/terms

```

---

## 6.6 System Pages
```

/404
/500
/offline

```

---

## 6.7 Admin Pages
```

/admin
/admin/users
/admin/posts
/admin/reports
/admin/categories

```

---

# 7) Home Page Specification

## 7.1 Navbar Requirements
- Logo + project name
- Search input
- Notifications icon
- Profile dropdown menu:
  - My profile
  - Saved posts
  - Settings
  - Price tracking (future)
  - Logout

## 7.2 Header Banner
- motivational copy
- CTA buttons:
  - Add Post
  - Browse Marketplace

## 7.3 Home Sections (Personalized Feed)
Each section shows **10 posts**.

Priority order:
1. منشورات من ولايتك
2. منشورات تناسب نشاطك
3. أحدث المنشورات
4. منشورات من ولايات تتابعها

Mobile layout:
- 2 cards per row

Each section must include:
- "View More" → redirect to marketplace with filters preserved

---

# 8) Marketplace Specification

## 8.1 Search
- keyword search (title-based)

## 8.2 Filters
- post_type (sell/buy)
- category
- region
- unit
- price range (min/max)
- negotiable
- sort (newest, price low/high)

## 8.3 Listing
- clean post cards
- pagination or infinite scroll (MVP can start with pagination)

---

# 9) Post Management Specification

## 9.1 Post Data Model (Business Definition)
- type: sell/buy
- category
- title
- description
- quantity + unit
- price (TND)
- negotiable flag
- images (max 5)
- region
- city
- status
- expires_at

## 9.2 Create/Edit Post Page
Required fields:
- type
- category
- title
- quantity
- unit
- price
- region

Optional:
- description
- city
- images
- negotiable

Validation:
- title 5–100 chars
- description max 1000 chars
- quantity > 0
- price >= 0

## 9.3 Post Details Page
Must display:
- image slider
- title
- type badge
- category
- price + negotiable badge
- quantity + unit
- region + city
- description
- posted date
- expiration date

CTA:
- Contact modal:
  - phone (if allowed)
  - WhatsApp direct button
  - copy number button

Below:
- similar posts (same category + region)

---

# 10) Profile Specification

## 10.1 Public Profile
- avatar
- full_name
- region/city
- bio
- stats:
  - total posts
  - active posts
- listing posts

## 10.2 My Profile (/profile/me)
- user posts
- saved posts section
- quick access to settings

---

# 11) Settings Specification

## 11.1 Settings Page
- profile settings
- show/hide phone
- notification settings
- password change
- optional email verification
- logout

## 11.2 Edit Profile Page
- full_name
- avatar
- region/city
- activities (max 5)
- followed regions (max 5)
- bio
- phone

---

# 12) Notifications Specification

## 12.1 MVP
- notifications table exists
- can be fetched normally (non-realtime)

## 12.2 Phase 2 (Realtime)
- Supabase Realtime enabled for notifications

Notification types:
- new_post_region
- new_post_activity
- platform_update

---

# 13) Reports & Moderation

## 13.1 Report System
Users can report:
- post
- user

Fields:
- reason text
- status: pending/reviewed/dismissed
- admin_note

Admin actions:
- mark reviewed
- dismiss report
- suspend post

---

# 14) Landing Page Specification

Goal:
- convert visitors into registered users

Required sections:
- hero
- benefits
- how it works
- categories preview
- CTA register
- footer links

---

# 15) Admin Panel Specification

## 15.1 Admin Dashboard
Admin can:
- manage posts
- manage users
- review reports
- manage categories/units/regions
- edit static pages

Admin tables:
- admin_logs
- static_pages

---

# 16) Technical Architecture (Next.js)

## 16.1 App Router Strategy
- Use `app/` directory
- Route Groups:
  - `(auth)`
  - `(onboarding)`
  - `(app)`
  - `(admin)`
  - `(public)`

## 16.2 Rendering Strategy
Server Components:
- landing
- marketplace listing
- post details

Client Components:
- filters
- forms
- modals
- onboarding steps

## 16.3 Middleware Strategy
Middleware responsibilities:
- protect private routes
- redirect non-authenticated users
- redirect incomplete onboarding users
- protect admin routes

## 16.4 Server Actions
Server Actions used for:
- post CRUD
- upload references
- saved posts
- reports
- profile updates

## 16.5 Image Optimization
- Use next/image for all post images & avatars

## 16.6 SEO Metadata
- use generateMetadata for:
  - marketplace
  - post details
  - landing

## 16.7 Error Handling
- error.tsx
- not-found.tsx
- loading.tsx
- offline page

---

# 17) Technical Architecture (Supabase)

## 17.1 Supabase Auth
- Email/Password
- Google OAuth
- Auto profile creation trigger

## 17.2 Supabase Database
- PostgreSQL schema with:
  - enums
  - triggers
  - indexes
  - RLS policies

## 17.3 Supabase Storage
Buckets:
- avatars
- post-images

Rules:
- max image size: 5MB
- max 5 images per post (enforced in DB trigger)

## 17.4 Supabase RLS (Mandatory)
All tables must have RLS enabled.
Policies ensure:
- user reads only allowed content
- user edits only his data
- admin full access

## 17.5 Cron Jobs
Scheduled job calls:
- expire_old_posts()

Frequency:
- daily or every 6 hours

---

# 18) Database Specification (Schema Summary)

## 18.1 ENUMS
- user_role: farmer, trader, citizen, admin
- post_type: sell, buy
- post_status: active, expired, deleted, suspended
- report_status: pending, reviewed, dismissed
- contact_type: phone, whatsapp

## 18.2 Tables (Grouped)

### Catalog
- regions
- categories
- units

### Auth/Profile
- profiles
- user_activities
- user_followed_regions
- notification_settings

### Posts
- posts
- post_images
- post_views
- post_contacts

### Social
- saved_posts
- reports
- notifications

### Market
- price_history

### Admin
- admin_logs
- static_pages

---

# 19) Database Automation (Triggers & Functions)

## 19.1 updated_at
- profiles
- posts

## 19.2 handle_new_user()
Auto create:
- profiles row
- notification_settings row

## 19.3 Limits
- max 5 followed regions
- max 5 activities
- max 5 post images

## 19.4 expire_old_posts()
Updates active posts to expired when expires_at passed.

---

# 20) Security Model

## 20.1 Core Security Rule
لا يمكن الاعتماد على UI فقط.
كل شيء يجب enforce في Database عبر RLS.

## 20.2 Admin Access
Admin is controlled by:
- role in profiles
- middleware protection
- RLS full access policies

---

# 21) MVP Scope (Phase 1)

## Must Have
- Auth system
- Onboarding
- Post CRUD + images
- Marketplace search/filter
- Home personalized feed
- profile pages
- phone/WhatsApp contact system
- saved posts
- reports system
- basic admin moderation

## Not in MVP
- realtime notifications
- internal messages system
- advanced analytics dashboard
- price tracking UI

---

# 22) Roadmap

## Phase 1 — MVP (6–8 weeks)
- all core features listed above

## Phase 2
- notifications system improved
- landing page advanced
- admin panel full

## Phase 3
- messages system
- price tracking
- advanced admin analytics
- mobile app (React Native)

---

# 23) Critical Decisions (Final)

1) Marketplace visibility without login:
- recommended: public access for growth + SEO

2) Default post expiration:
- recommended: 60 days

3) farmer posting limit:
- recommended: no limit

4) role selection:
- recommended: register step

---

# 24) Final Deliverables

Files:
- ERD.jsx (interactive ERD)
- schema.sql (full database schema + RLS)
- seed.sql (Tunisia regions + categories + units + reference prices)
- Master Documentation (this PRD + Tech Spec)

---

# 🌾 End of PRD + Technical Specification

