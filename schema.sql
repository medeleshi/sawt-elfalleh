-- ============================================================
-- 🌾 صوت الفلاح — schema.sql
-- Supabase PostgreSQL — Version 1.0
-- ============================================================
-- الترتيب: Catalog → Auth → Posts → Social → Admin
-- ============================================================

-- ─────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- للبحث النصي السريع

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────
create type user_role as enum ('farmer', 'trader', 'citizen', 'admin');
create type user_status as enum ('active', 'suspended');
create type post_type as enum ('sell', 'buy');
create type post_status as enum ('active', 'expired', 'deleted', 'suspended');
create type report_status as enum ('pending', 'reviewed', 'dismissed');
create type contact_type as enum ('phone', 'whatsapp');

-- ─────────────────────────────────────────
-- 1. CATALOG TABLES (لا تعتمد على شيء)
-- ─────────────────────────────────────────

-- الولايات التونسية الـ24
create table regions (
  id          uuid primary key default uuid_generate_v4(),
  name_ar     text not null,
  name_fr     text,
  code        text unique not null, -- مثال: 'tunis', 'sfax'
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- الأصناف الفلاحية
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name_ar     text not null,
  name_fr     text,
  slug        text unique not null,
  icon        text, -- emoji أو اسم أيقونة
  parent_id   uuid references categories(id) on delete set null,
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- المقاييس
create table units (
  id          uuid primary key default uuid_generate_v4(),
  name_ar     text not null,
  name_fr     text,
  symbol      text not null, -- كغ، رطل، رأس...
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- 2. AUTH & PROFILES
-- ─────────────────────────────────────────

-- الملف الشخصي (1:1 مع auth.users)
create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  full_name             text not null default '',
  username              text unique,
  avatar_url            text,
  role                  user_role not null default 'citizen',
  status                user_status not null default 'active',
  phone                 text,
  bio                   text check (char_length(bio) <= 300),
  region_id             uuid references regions(id) on delete set null,
  city                  text,
  show_phone            boolean default true,
  is_profile_completed  boolean default false,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  deleted_at            timestamptz -- soft delete
);

-- الأنشطة الفلاحية للمستخدم (many-to-many)
create table user_activities (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  category_id  uuid not null references categories(id) on delete cascade,
  unique(user_id, category_id)
);

-- الولايات التي يتابعها المستخدم (أقصى 5)
create table user_followed_regions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  region_id  uuid not null references regions(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, region_id)
);

-- إعدادات الإشعارات
create table notification_settings (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid unique not null references profiles(id) on delete cascade,
  new_post_region      boolean default true,
  new_post_activity    boolean default true,
  messages             boolean default true,
  platform_updates     boolean default true,
  updated_at           timestamptz default now()
);

-- ─────────────────────────────────────────
-- 3. POSTS
-- ─────────────────────────────────────────

create table posts (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references profiles(id) on delete cascade,
  type           post_type not null,
  category_id    uuid not null references categories(id) on delete restrict,
  title          text not null check (char_length(title) between 5 and 100),
  description    text check (char_length(description) <= 1000),
  quantity       numeric(12, 2) not null check (quantity > 0),
  unit_id        uuid not null references units(id) on delete restrict,
  price          numeric(12, 3) not null check (price >= 0),
  is_negotiable  boolean default false,
  region_id      uuid not null references regions(id) on delete restrict,
  city           text,
  status         post_status default 'active',
  expires_at     timestamptz not null default (now() + interval '60 days'),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- صور المنشور
create table post_images (
  id            uuid primary key default uuid_generate_v4(),
  post_id       uuid not null references posts(id) on delete cascade,
  url           text not null,
  storage_path  text not null, -- المسار في Supabase Storage
  sort_order    int default 0,
  created_at    timestamptz default now()
);

-- إحصائيات المشاهدة
create table post_views (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references posts(id) on delete cascade,
  viewer_id   uuid references profiles(id) on delete set null, -- nullable للزوار
  ip_hash     text,
  created_at  timestamptz default now()
);

-- تتبع طلبات التواصل
create table post_contacts (
  id             uuid primary key default uuid_generate_v4(),
  post_id        uuid not null references posts(id) on delete cascade,
  requester_id   uuid references profiles(id) on delete set null,
  contact_type   contact_type not null,
  created_at     timestamptz default now()
);

-- ─────────────────────────────────────────
-- 4. SOCIAL
-- ─────────────────────────────────────────

-- المنشورات المحفوظة
create table saved_posts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  post_id    uuid not null references posts(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- البلاغات
create table reports (
  id               uuid primary key default uuid_generate_v4(),
  reporter_id      uuid not null references profiles(id) on delete cascade,
  post_id          uuid references posts(id) on delete cascade,
  reported_user_id uuid references profiles(id) on delete cascade,
  reason           text not null check (char_length(reason) between 5 and 500),
  status           report_status default 'pending',
  admin_note       text,
  created_at       timestamptz default now(),
  check (post_id is not null or reported_user_id is not null)
);

-- الإشعارات
create table notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       text not null, -- 'new_post_region' | 'new_post_activity' | 'platform' | ...
  title      text,
  body       text,
  data       jsonb default '{}',
  is_read    boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- 5. MARKET
-- ─────────────────────────────────────────

create table price_history (
  id           uuid primary key default uuid_generate_v4(),
  category_id  uuid not null references categories(id) on delete cascade,
  region_id    uuid references regions(id) on delete set null,
  unit_id      uuid not null references units(id) on delete restrict,
  min_price    numeric(12, 3) not null check (min_price >= 0),
  max_price    numeric(12, 3) not null check (max_price >= min_price),
  recorded_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- 6. ADMIN
-- ─────────────────────────────────────────

create table admin_logs (
  id           uuid primary key default uuid_generate_v4(),
  admin_id     uuid not null references profiles(id) on delete restrict,
  action       text not null,
  target_type  text check (target_type in ('user', 'post', 'report', 'category', 'unit')),
  target_id    uuid,
  details      jsonb default '{}',
  created_at   timestamptz default now()
);

create table static_pages (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null, -- 'about' | 'privacy' | 'terms' | 'how-it-works'
  title_ar    text not null,
  content_ar  text,
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- INDEXES (أداء البحث)
-- ─────────────────────────────────────────

-- posts — الأكثر استخداماً في البحث
create index idx_posts_status         on posts(status);
create index idx_posts_type           on posts(type);
create index idx_posts_region         on posts(region_id);
create index idx_posts_category       on posts(category_id);
create index idx_posts_user           on posts(user_id);
create index idx_posts_expires        on posts(expires_at);
create index idx_posts_created        on posts(created_at desc);
create index idx_posts_title_search   on posts using gin(to_tsvector('arabic', title));

-- profiles
create index idx_profiles_region      on profiles(region_id);
create index idx_profiles_role        on profiles(role);
create index idx_profiles_username    on profiles(username);

-- social
create index idx_saved_posts_user     on saved_posts(user_id);
create index idx_notifications_user   on notifications(user_id, is_read);
create index idx_post_views_post      on post_views(post_id);
create index idx_reports_status       on reports(status);

-- ─────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────

-- تحديث updated_at تلقائياً
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

create trigger trg_posts_updated_at
  before update on posts
  for each row execute function handle_updated_at();

-- إنشاء profile تلقائياً عند تسجيل مستخدم جديد
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    'farmer'
  )
  on conflict (id) do nothing;

  insert into public.notification_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- منع تجاوز 5 ولايات متابَعة
create or replace function check_followed_regions_limit()
returns trigger as $$
begin
  if (select count(*) from user_followed_regions where user_id = new.user_id) >= 5 then
    raise exception 'لا يمكنك متابعة أكثر من 5 ولايات';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_limit_followed_regions
  before insert on user_followed_regions
  for each row execute function check_followed_regions_limit();

-- منع تجاوز 5 أنشطة فلاحية
create or replace function check_activities_limit()
returns trigger as $$
begin
  if (select count(*) from user_activities where user_id = new.user_id) >= 5 then
    raise exception 'لا يمكنك اختيار أكثر من 5 أنشطة';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_limit_activities
  before insert on user_activities
  for each row execute function check_activities_limit();

-- تحديث حالة المنشورات المنتهية تلقائياً (يُشغَّل عبر Supabase Cron)
create or replace function expire_old_posts()
returns void as $$
begin
  update posts
  set status = 'expired'
  where status = 'active'
    and expires_at < now();
end;
$$ language plpgsql;

-- منع تجاوز 5 صور للمنشور
create or replace function check_post_images_limit()
returns trigger as $$
begin
  if (select count(*) from post_images where post_id = new.post_id) >= 5 then
    raise exception 'لا يمكنك رفع أكثر من 5 صور للمنشور';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_limit_post_images
  before insert on post_images
  for each row execute function check_post_images_limit();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────

-- تفعيل RLS على جميع الجداول
alter table profiles               enable row level security;
alter table user_activities        enable row level security;
alter table user_followed_regions  enable row level security;
alter table notification_settings  enable row level security;
alter table posts                  enable row level security;
alter table post_images            enable row level security;
alter table post_views             enable row level security;
alter table post_contacts          enable row level security;
alter table saved_posts            enable row level security;
alter table reports                enable row level security;
alter table notifications          enable row level security;
alter table price_history          enable row level security;
alter table admin_logs             enable row level security;
alter table static_pages           enable row level security;
alter table regions                enable row level security;
alter table categories             enable row level security;
alter table units                  enable row level security;

-- ── Catalog (قراءة عامة) ──
create policy "catalog_public_read" on regions    for select using (true);
create policy "catalog_public_read" on categories for select using (true);
create policy "catalog_public_read" on units      for select using (true);
create policy "static_pages_read"   on static_pages for select using (true);

-- ── Profiles ──
create policy "profiles_public_read"
  on profiles for select using (deleted_at is null);

create policy "profiles_own_update"
  on profiles for update
  using (auth.uid() = id);

-- ── User Activities ──
create policy "activities_own_read"
  on user_activities for select
  using (auth.uid() = user_id);

create policy "activities_own_write"
  on user_activities for insert
  with check (auth.uid() = user_id);

create policy "activities_own_delete"
  on user_activities for delete
  using (auth.uid() = user_id);

-- ── User Followed Regions ──
create policy "followed_regions_own"
  on user_followed_regions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Notification Settings ──
create policy "notif_settings_own"
  on notification_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Posts (عام للقراءة، خاص للكتابة) ──
create policy "posts_public_read"
  on posts for select
  using (status = 'active');

create policy "posts_own_insert"
  on posts for insert
  with check (
    auth.uid() = user_id
    and (
      -- المواطن لا ينشر بيعاً
      (select role from profiles where id = auth.uid()) != 'citizen'
      or type = 'buy'
    )
  );

create policy "posts_own_update"
  on posts for update
  using (auth.uid() = user_id);

create policy "posts_own_delete"
  on posts for delete
  using (auth.uid() = user_id);

-- ── Post Images ──
create policy "post_images_public_read"
  on post_images for select using (true);

create policy "post_images_own_write"
  on post_images for insert
  with check (
    exists (select 1 from posts where id = post_id and user_id = auth.uid())
  );

create policy "post_images_own_delete"
  on post_images for delete
  using (
    exists (select 1 from posts where id = post_id and user_id = auth.uid())
  );

-- ── Post Views ──
create policy "post_views_insert"
  on post_views for insert with check (true); -- الجميع يستطيع تسجيل مشاهدة

create policy "post_views_own_read"
  on post_views for select
  using (
    exists (select 1 from posts where id = post_id and user_id = auth.uid())
  );

-- ── Post Contacts ──
create policy "post_contacts_insert"
  on post_contacts for insert with check (true);

create policy "post_contacts_own_read"
  on post_contacts for select
  using (
    exists (select 1 from posts where id = post_id and user_id = auth.uid())
  );

-- ── Saved Posts ──
create policy "saved_posts_own"
  on saved_posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Reports ──
create policy "reports_own_insert"
  on reports for insert
  with check (auth.uid() = reporter_id);

create policy "reports_own_read"
  on reports for select
  using (auth.uid() = reporter_id);

-- ── Notifications ──
create policy "notifications_own"
  on notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Admin-only policies ──
create policy "admin_full_access_posts"
  on posts for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_full_access_reports"
  on reports for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_logs_own"
  on admin_logs for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_catalog_write"
  on categories for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_units_write"
  on units for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_regions_write"
  on regions for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_static_pages_write"
  on static_pages for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_price_history_write"
  on price_history for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "price_history_public_read"
  on price_history for select using (true);
