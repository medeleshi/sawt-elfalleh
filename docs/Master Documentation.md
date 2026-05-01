تمام. هذا هو الـ **Master Documentation** كامل بصيغة **Markdown (.md)** ويحتوي **كل ما قدمته أنت + كل ما قمنا بتنظيمه وبنائه وتحسينه** دون إسقاط أي نقطة.

# 🌾 Sawt ElFalleh — Master Documentation (V1)
منصة إلكترونية تونسية لبيع وشراء المنتجات الفلاحية  
**اللغة:** العربية (مع دعم فرنسي اختياري)  
**التصميم:** Modern + طابع فلاحي (ألوان ترابية / زراعية)

---

# 0) Executive Summary (ملخص المشروع)

**صوت الفلاح** هو Marketplace تونسي مخصص للفلاحة، يساعد:
- الفلاح على بيع وشراء المنتجات الفلاحية
- التاجر على توفير وشراء المنتجات بالجملة
- المواطن على شراء المنتجات أو نشر طلب شراء

المنصة تغطي:
- جميع الولايات التونسية (24 ولاية)
- جميع الأصناف الفلاحية (مواشي، حبوب، عسل، أعلاف، خضر، فواكه...)
- جميع المقاييس المحلية (كغ، رطل، رأس، لتر، طن، قنطار، ربطة، ڨلبة...)

الهدف الأساسي:
- تبسيط عملية البيع والشراء في القطاع الفلاحي
- خلق سوق رقمي موثوق وواقعي يخدم المجتمع الريفي والتجاري

---

# 1) Vision & Value Proposition (الرؤية والقيمة)

## 1.1 المشكلة
- الفلاح يبيع غالباً عبر وسطاء أو سوق غير منظم
- الأسعار غير واضحة
- صعوبة الوصول لمشترين من ولايات أخرى
- غياب منصة تونسية متخصصة في الفلاحة

## 1.2 الحل
منصة سهلة وبسيطة تتيح:
- نشر إعلان بيع أو شراء
- البحث والفلترة حسب الولاية والصنف والمقياس والسعر
- التواصل المباشر عبر الهاتف أو واتساب
- إدارة الإعلانات وتنظيمها
- إمكانية حفظ المنشورات والإبلاغ عنها

## 1.3 نقاط القوة
- فكرة واقعية تحل مشكلة حقيقية في السوق التونسية الرقمية
- الجمهور المستهدف واضح (فلاح، تاجر، مواطن)
- دعم المقاييس المحلية (رطل، قنطار، ڨلبة) = ميزة تنافسية قوية
- تغطية كل الولايات التونسية
- قرار إزالة verification email عملي لأن الجمهور قد لا يفهم التفعيل
- اعتماد التواصل عبر واتساب/الهاتف بدل نظام رسائل معقد
- خارطة طريق تدريجية MVP → Phase 2 → Phase 3

---

# 2) User Roles & Permissions (الأدوار والصلاحيات)

## 2.1 المستخدمون
- Farmer (فلاح)
- Trader (تاجر)
- Citizen (مواطن)
- Admin (مدير المنصة)

## 2.2 جدول الصلاحيات النهائي

| الصلاحية | فلاح | تاجر | مواطن | مدير |
|---|---|---|---|---|
| نشر إعلان بيع | ✅ | ✅ | ❌ | ❌ |
| نشر إعلان شراء | ✅ | ✅ | ✅ | ❌ |
| تصفح Marketplace | ✅ | ✅ | ✅ | ✅ |
| التواصل (واتساب/هاتف) | ✅ | ✅ | ✅ | ❌ |
| حفظ المنشورات | ✅ | ✅ | ✅ | ❌ |
| الإبلاغ عن منشور | ✅ | ✅ | ✅ | ❌ |
| تعديل/حذف منشوراته | ✅ | ✅ | ✅ | ❌ |
| لوحة تحكم الإدارة | ❌ | ❌ | ❌ | ✅ |
| تفعيل/تعطيل أي منشور | ❌ | ❌ | ❌ | ✅ |
| إدارة المستخدمين | ❌ | ❌ | ❌ | ✅ |

> ملاحظة: المواطن لا ينشر بيعاً لأنه ليس منتجاً — قرار منطقي وواقعي.

---

# 3) Pages Architecture (هيكل الصفحات النهائي)

## 3.1 Auth Pages (المصادقة)
```

/login              — تسجيل الدخول
/register           — إنشاء حساب
/forgot-password    — نسيت كلمة المرور
/reset-password     — إعادة تعيين كلمة المرور
/reset-success      — نجاح تغيير كلمة المرور

```

### Login Page UX
- شعار المنصة (ورقة)
- عبارة تحفيزية
- Login with Google
- Email/Password login
- رابط نسيت كلمة المرور
- زر تسجيل الدخول
- رابط للتسجيل (Register)
- روابط أسفل الصفحة: سياسة الخصوصية، قواعد الاستخدام، من نحن...

### Register Page UX
- شعار + عبارة تحفيزية
- Google OAuth أو Email/Password
- اختيار الدور (فلاح / تاجر / مواطن)
- checkbox الموافقة على القوانين وسياسة الخصوصية
- زر فتح حساب
- رابط العودة لصفحة Login
- روابط عامة أسفل الصفحة

### Forgot Password UX
- شعار + عبارة تحفيزية
- إدخال email
- زر إرسال رابط الاسترجاع
- رابط الرجوع لصفحة login
- روابط عامة أسفل الصفحة

### Reset Password UX
- شعار + عبارة تحفيزية
- password + confirm password
- زر تغيير كلمة المرور

### Reset Success UX
- رسالة نجاح واضحة
- زر العودة لتسجيل الدخول

---

## 3.2 Verification Email Policy
لن يكون هناك email verification مباشرة.

التفعيل سيكون داخل الإعدادات:
- لأن الفلاح أو التاجر قد لا يفهم التفعيل
- الحرية للمستخدم لتفعيل بريده لاحقاً

---

## 3.3 Onboarding Pages (الإعداد الأولي)

```

/onboarding/profile
/onboarding/interests
/onboarding/done

```

### Onboarding Step 1: Profile
الحقول:
- avatar (اختياري)
- full_name (إجباري)
- role (إجباري)
- region (إجباري)
- city/area (إجباري)
- phone (إجباري)
- bio (اختياري)

### Onboarding Step 2: Interests
- الأنشطة الفلاحية (اختياري متعدد) — أقصى 5
- الولايات المتابعة (اختياري متعدد) — أقصى 5

### Onboarding Step 3: Done
- شاشة ترحيب
- CTA للانتقال إلى Home

> تقسيم onboarding لخطوتين يقلل الضغط على المستخدم خاصة الفلاح.

---

## 3.4 Main App Pages (التطبيق الرئيسي)

```

/                   — Home
/marketplace        — Marketplace listing
/marketplace/[id]   — Post details
/post/new           — إضافة منشور
/post/[id]/edit     — تعديل منشور
/profile/[username] — الملف الشخصي العام
/profile/me         — ملفي + المحفوظات
/settings           — إعدادات عامة
/settings/profile   — تعديل الملف الشخصي
/notifications      — الإشعارات
/messages           — الرسائل (مرحلة ثانية)

```

---

## 3.5 Public Pages (الصفحات العامة)
```

/landing
/about
/contact
/how-it-works
/privacy-policy
/terms

```

---

## 3.6 System Pages (صفحات النظام)
```

/404
/500
/offline

```

> صفحة offline مهمة جداً لأن المناطق الريفية تعاني من ضعف الإنترنت.

---

## 3.7 Admin Panel Pages
```

/admin
/admin/users
/admin/posts
/admin/reports
/admin/categories

```

---

# 4) Home Page (Dashboard UX)

## 4.1 Navigation Bar
يحتوي:
- شعار + اسم المنصة
- Search bar
- Notifications icon
- Menu dropdown فيه:
  - profile
  - settings
  - saved posts
  - متابعة الأسعار (future)
  - logout

## 4.2 Header Section
- عبارة تحفيزية
- زر [+ أضف منشور]
- زر [تصفح السوق]

## 4.3 Sections في Home (مخصصة حسب بيانات المستخدم)
كل section فيه 10 منشورات.

### الترتيب المقترح
1) منشورات من ولايتك  
2) منشورات تناسب نشاطك  
3) أحدث المنشورات  
4) منشورات من ولايات تتابعها  

> في mobile: يظهر grid 2 posts بجنب بعضهم.

كل section يحتوي زر:
- "عرض المزيد" ينقل إلى marketplace مع parameters مخصصة.

---

# 5) Marketplace Page (السوق)

## 5.1 Features
- Search bar
- Filters منظمة غير مشتتة
- Listing posts
- Pagination أو Infinite scroll

## 5.2 Filters الأساسية
- نوع المنشور (بيع / شراء)
- الصنف category
- الولاية region
- المقياس unit
- السعر (min/max)
- قابل للتفاوض (true/false)
- الأحدث / السعر الأقل / السعر الأعلى

---

# 6) Post System (هيكلة المنشور)

## 6.1 Post Types
- Sell (بيع)
- Buy (شراء)

## 6.2 Post Fields
- type (بيع/شراء)
- category
- title
- description (اختياري)
- quantity + unit
- price بالدينار
- is_negotiable
- images (max 5)
- region
- city
- status (active/expired/deleted/suspended)
- created_at
- expires_at

---

# 7) Post Create/Edit Page

صفحة إضافة أو تعديل منشور تحتوي:
- type
- category
- title
- description
- quantity
- unit
- price
- negotiable toggle
- region
- city
- upload images (max 5)
- زر نشر / زر حفظ التعديل

Validation مهم:
- title min 5 max 100
- description max 1000
- quantity > 0
- price >= 0

---

# 8) Post Details Page

## 8.1 عرض البيانات
- الصور (slider)
- العنوان
- النوع (بيع/شراء)
- السعر + negotiable badge
- الكمية + المقياس
- الولاية + المنطقة
- الوصف
- تاريخ النشر + تاريخ انتهاء الصلاحية

## 8.2 CTA للتواصل
زر "تواصل مع البائع/المشتري" يفتح modal فيه:
- رقم الهاتف (حسب show_phone)
- زر واتساب مباشر
- زر نسخ الرقم

> هذا الحل واقعي لأن الفلاح يعتمد الهاتف وواتساب.

## 8.3 Similar Posts
أسفل الصفحة:
- منشورات مشابهة حسب category + region

---

# 9) Profile Page

## 9.1 عند زيارة Profile شخص آخر
- avatar + full_name
- region + city
- bio
- stats:
  - عدد المنشورات النشطة
  - عدد المنشورات الكلي
- posts listing

## 9.2 عند زيارة Profile الشخصي (Me)
- يظهر saved posts
- إعدادات خاصة

---

# 10) Settings Pages

## 10.1 Settings General
- إدارة الملف الشخصي
- تفعيل/إخفاء رقم الهاتف
- notification settings
- تغيير كلمة المرور
- email verification (optional)
- logout

## 10.2 Edit Profile
- تعديل full_name
- تعديل region/city
- تعديل الأنشطة
- تعديل الولايات المتابعة
- تعديل bio
- تعديل avatar

---

# 11) Notifications Page

إشعارات مخصصة حسب:
- منشورات جديدة في ولايتك
- منشورات جديدة في نشاطك
- إشعارات منصة (تحديثات/تنبيهات)

(Realtime مرحلة ثانية)

---

# 12) Reports & Alerts Pages

## 12.1 Report Post
- سبب الإبلاغ
- إرسال report

## 12.2 Alert Pages
- delete confirmation
- report confirmation
- success messages

---

# 13) Landing Page (Marketing)

هدفها:
- تعريف الزائر بالمنصة
- شرح الفوائد
- CTA للتسجيل

Sections:
- Hero section
- كيف تعمل المنصة
- فوائد للفلاح
- فوائد للتاجر
- فوائد للمواطن
- testimonials (اختياري)
- CTA register
- footer فيه الصفحات العامة

---

# 14) Technical Stack

## 14.1 Next.js Decisions
- App Router (ليس Pages Router)
- Server Components للـ SEO والـ performance
- Client Components للتفاعل (filters, forms)
- Middleware لحماية routes
- next/image لتحسين الصور

## 14.2 Supabase Decisions
- Auth: Google OAuth + Email/Password
- Storage: bucket avatars + bucket posts
- RLS من البداية
- Realtime لاحقاً للإشعارات
- Supabase Functions للـ automation

## 14.3 Security Decisions
- RLS policies لكل جدول
- التحقق من الدور داخل السيرفر (ليس UI فقط)
- تحديد حجم الصور قبل الرفع (max 5MB)
- rate limiting لمنع spam

---

# 15) Database Design (Supabase PostgreSQL)

## 15.1 ENUMS
- user_role: farmer, trader, citizen, admin
- post_type: sell, buy
- post_status: active, expired, deleted, suspended
- report_status: pending, reviewed, dismissed
- contact_type: phone, whatsapp

---

## 15.2 Core Tables

### regions
- 24 ولاية تونسية

### categories
- أصناف فلاحية رئيسية + فرعية (parent_id)

### units
- مقاييس (كغ، رطل، رأس...)

---

## 15.3 Auth & Profile Tables

### profiles (1:1 مع auth.users)
Fields:
- id (auth.users.id)
- full_name
- username
- avatar_url
- role
- phone
- bio
- region_id
- city
- show_phone
- is_profile_completed
- created_at / updated_at / deleted_at

### user_activities
- user_id
- category_id
- unique(user_id, category_id)

### user_followed_regions
- user_id
- region_id
- unique(user_id, region_id)
- max 5 enforced by trigger

### notification_settings
- user_id unique
- new_post_region
- new_post_activity
- messages
- platform_updates

---

## 15.4 Posts Tables

### posts
- user_id
- type
- category_id
- title
- description
- quantity
- unit_id
- price
- is_negotiable
- region_id
- city
- status
- expires_at
- created_at / updated_at

### post_images
- post_id
- url
- storage_path
- sort_order
- created_at
- max 5 enforced by trigger

### post_views
- post_id
- viewer_id nullable
- ip_hash
- created_at

### post_contacts
- post_id
- requester_id nullable
- contact_type
- created_at

---

## 15.5 Social Tables

### saved_posts
- user_id
- post_id
- unique(user_id, post_id)

### reports
- reporter_id
- post_id nullable
- reported_user_id nullable
- reason
- status
- admin_note
- created_at
- constraint: post_id OR reported_user_id must exist

### notifications
- user_id
- type
- title
- body
- data jsonb
- is_read
- created_at

---

## 15.6 Market Tables

### price_history
- category_id
- region_id nullable
- unit_id
- min_price
- max_price
- recorded_at

---

## 15.7 Admin Tables

### admin_logs
- admin_id
- action
- target_type
- target_id
- details jsonb
- created_at

### static_pages
- slug unique
- title_ar
- content_ar
- updated_at

---

# 16) Database Automation (Functions & Triggers)

## 16.1 updated_at trigger
يحدث updated_at تلقائياً في:
- profiles
- posts

## 16.2 Auto Profile Creation Trigger
عند تسجيل user جديد في auth.users:
- يتم إنشاء profile تلقائياً
- يتم إنشاء notification_settings تلقائياً

## 16.3 Limits Enforcement Triggers
- max 5 followed regions
- max 5 activities
- max 5 post images

## 16.4 Expire Old Posts Function
expire_old_posts():
- تحول posts active إلى expired إذا expires_at < now()

---

# 17) RLS Policies (Row Level Security)

## 17.1 Catalog Tables
- قراءة عامة للجميع:
  - regions
  - categories
  - units
  - static_pages

## 17.2 Profiles
- public read إذا deleted_at is null
- update فقط للمالك (auth.uid() = id)

## 17.3 Posts
- public read للـ active فقط
- insert للمالك
- citizen ممنوع ينشر sell
- update/delete للمالك

## 17.4 Post Images
- read public
- insert/delete فقط لصاحب post

## 17.5 Views & Contacts
- insert allowed للجميع
- select لصاحب post فقط

## 17.6 Saved Posts
- CRUD فقط للمالك

## 17.7 Reports
- insert/read فقط للمبلّغ
- admin full access

## 17.8 Admin Policies
- admin full access على:
  - posts
  - reports
  - admin_logs
  - catalog tables
  - static_pages
  - price_history

---

# 18) Supabase Storage Setup

Buckets:
- `avatars`
- `post-images`

Rules:
- size max 5MB per image
- max 5 images per post (DB enforced)

---

# 19) Supabase Cron Jobs

Scheduled Job:
- call expire_old_posts() يومياً أو كل 6 ساعات

---

# 20) Communication System Decision

## MVP
- زر اتصال مباشر (Phone/WhatsApp)

## Phase 3
- نظام رسائل داخلي
- conversations + participants + messages

---

# 21) Next.js Implementation Architecture

## 21.1 App Router Structure
اعتماد route groups:
- (public)
- (auth)
- (onboarding)
- (app)
- (admin)

## 21.2 Server vs Client Components
- Server Components للصفحات العامة والـ SEO
- Client Components للفلاتر والنماذج

## 21.3 Server Actions
تستخدم ل:
- create post
- edit post
- save post
- report post
- update profile

## 21.4 Middleware Protection
Middleware يحمي:
- app routes
- admin routes
- onboarding completion check

## 21.5 SEO Metadata
generateMetadata():
- marketplace
- post details
- landing

## 21.6 Error Handling
- error.tsx
- not-found.tsx
- loading.tsx
- offline page

---

# 22) Roadmap (خارطة الطريق)

## Phase 1 — MVP (6-8 أسابيع)
- Auth كامل
- Onboarding كامل
- Posts CRUD + images
- Marketplace search/filter
- Home sections personalized
- Profile basic
- Contact via phone/WhatsApp
- Reports system

## Phase 2
- Notifications system
- Saved posts UI
- Landing page احترافية
- Admin dashboard

## Phase 3
- Messages system
- Price tracking advanced
- Analytics admin
- Mobile app (React Native)

---

# 23) Critical Decisions Before Coding (القرارات الحرجة)

1) من يرى الـ Marketplace بدون تسجيل؟
- الجميع (موصى به) أو المسجلون فقط

2) مدة صلاحية المنشور الافتراضية؟
- 30 يوم أو 60 يوم (موصى به) أو 90 يوم

3) هل الفلاح يستطيع نشر عدة منشورات بدون حد؟
- نعم (موصى به) أو حد 5 منشورات نشطة

4) أين يختار المستخدم دوره؟
- Register مباشرة (موصى به) أو Onboarding فقط

---

# 24) MVP Features Summary (خصائص النسخة الأولى)

### Auth
- login/register/google
- forgot/reset password
- no email verification mandatory

### Profile & Onboarding
- complete profile
- activities (max 5)
- followed regions (max 5)

### Posts
- create/edit/delete
- upload images (max 5)
- post details
- similar posts
- expiration system

### Marketplace
- search + filters
- pagination/infinite scroll

### Social
- saved posts
- reports

### Analytics Basic
- views tracking
- contact clicks tracking

---

# 25) Official Project Files (Deliverables)

### ERD.jsx
- ERD interactive

### schema.sql
يحتوي:
- 17 جدول
- enums
- indexes
- triggers
- functions
- RLS policies

### seed.sql
يحتوي:
- 24 ولاية تونسية
- categories + subcategories
- units local
- reference prices

---

# 26) Deployment Notes

Order on Supabase:
1. Run schema.sql
2. Run seed.sql
3. Create test users
4. Insert sample posts

---

# 27) Final Notes

هذا المستند يمثل النسخة الرسمية الكاملة للمشروع.

أي تطوير جديد أو feature إضافية يجب إضافتها هنا للحفاظ على consistency.

---

# 🌾 End of Documentation

