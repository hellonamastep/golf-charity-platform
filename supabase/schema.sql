-- ============================================================
-- GOLF CHARITY PLATFORM — SUPABASE SCHEMA
-- Run this in your Supabase SQL editor (new project)
-- ============================================================

-- ── Enable UUID extension ──────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique not null,
  avatar_url text,
  role text not null default 'subscriber' check (role in ('subscriber', 'admin')),
  handicap integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all profiles"
  on profiles for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── SUBSCRIPTIONS ─────────────────────────────────────────
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'inactive' check (status in ('active', 'inactive', 'cancelled', 'lapsed', 'trialing')),
  amount_pence integer not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select using (auth.uid() = user_id);

create policy "Service role full access to subscriptions"
  on subscriptions for all using (auth.role() = 'service_role');

create policy "Admins can view all subscriptions"
  on subscriptions for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── CHARITIES ─────────────────────────────────────────────
create table public.charities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  cover_url text,
  website text,
  is_featured boolean default false,
  is_active boolean default true,
  total_raised integer default 0, -- in pence
  upcoming_events jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.charities enable row level security;

create policy "Anyone can view active charities"
  on charities for select using (is_active = true);

create policy "Admins can manage charities"
  on charities for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── USER CHARITY SELECTIONS ───────────────────────────────
create table public.user_charities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  charity_id uuid references public.charities(id) not null,
  contribution_percentage integer not null default 10 check (contribution_percentage between 10 and 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.user_charities enable row level security;

create policy "Users can manage own charity selection"
  on user_charities for all using (auth.uid() = user_id);

create policy "Admins can view all charity selections"
  on user_charities for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── GOLF SCORES ───────────────────────────────────────────
create table public.golf_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score between 1 and 45),
  played_at date not null,
  course_name text,
  notes text,
  created_at timestamptz default now()
);

alter table public.golf_scores enable row level security;

create policy "Users can manage own scores"
  on golf_scores for all using (auth.uid() = user_id);

create policy "Admins can manage all scores"
  on golf_scores for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Trigger: keep only latest 5 scores per user
create or replace function enforce_score_limit()
returns trigger as $$
begin
  delete from golf_scores
  where user_id = new.user_id
    and id not in (
      select id from golf_scores
      where user_id = new.user_id
      order by played_at desc, created_at desc
      limit 5
    );
  return null;
end;
$$ language plpgsql security definer;

create trigger after_score_insert
  after insert on golf_scores
  for each row execute function enforce_score_limit();

-- ── DRAWS ─────────────────────────────────────────────────
create table public.draws (
  id uuid default uuid_generate_v4() primary key,
  draw_month text not null, -- e.g. "2026-03"
  draw_type text not null default 'random' check (draw_type in ('random', 'algorithmic')),
  winning_numbers integer[] not null, -- 5 numbers
  status text not null default 'scheduled' check (status in ('scheduled', 'simulated', 'published')),
  jackpot_amount integer default 0, -- pence, includes rollover
  prize_pool_total integer default 0, -- total pool in pence
  participant_count integer default 0,
  rollover_amount integer default 0, -- from previous draw
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.draws enable row level security;

create policy "Anyone can view published draws"
  on draws for select using (status = 'published');

create policy "Admins can manage all draws"
  on draws for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── DRAW ENTRIES ─────────────────────────────────────────
create table public.draw_entries (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  entry_numbers integer[] not null, -- user's 5 scores at time of draw snapshot
  match_count integer, -- set after draw runs
  prize_tier text, -- '5-match', '4-match', '3-match', or null
  prize_amount integer, -- pence
  created_at timestamptz default now(),
  unique(draw_id, user_id)
);

alter table public.draw_entries enable row level security;

create policy "Users can view own draw entries"
  on draw_entries for select using (auth.uid() = user_id);

create policy "Admins can manage all draw entries"
  on draw_entries for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Service role full access to draw entries"
  on draw_entries for all using (auth.role() = 'service_role');

-- ── WINNERS ───────────────────────────────────────────────
create table public.winners (
  id uuid default uuid_generate_v4() primary key,
  draw_entry_id uuid references public.draw_entries(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  draw_id uuid references public.draws(id) on delete cascade not null,
  prize_tier text not null,
  prize_amount integer not null, -- pence
  proof_url text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  admin_notes text,
  verified_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.winners enable row level security;

create policy "Users can view own winnings"
  on winners for select using (auth.uid() = user_id);

create policy "Users can upload proof"
  on winners for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all winners"
  on winners for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── PRIZE POOL CONFIG ─────────────────────────────────────
create table public.prize_config (
  id uuid default uuid_generate_v4() primary key,
  subscription_pool_percentage integer not null default 30,
  five_match_share integer not null default 40,
  four_match_share integer not null default 35,
  three_match_share integer not null default 25,
  monthly_price_pence integer not null default 1499,
  yearly_price_pence integer not null default 14990,
  updated_at timestamptz default now()
);

alter table public.prize_config enable row level security;

create policy "Anyone can view prize config"
  on prize_config for select using (true);

create policy "Admins can update prize config"
  on prize_config for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Insert default config
insert into public.prize_config
  (subscription_pool_percentage, five_match_share, four_match_share, three_match_share, monthly_price_pence, yearly_price_pence)
values (30, 40, 35, 25, 1499, 14990);

-- ── SEED CHARITIES ────────────────────────────────────────
insert into public.charities (name, slug, description, is_featured, is_active) values
  ('Macmillan Cancer Support', 'macmillan-cancer', 'Macmillan Cancer Support improves the lives of people living with cancer. Not just with medical care, but with practical, emotional and financial support.', true, true),
  ('Age UK', 'age-uk', 'Age UK is the country''s leading charity dedicated to helping everyone make the most of later life, no matter who they are or where they live.', true, true),
  ('British Heart Foundation', 'british-heart-foundation', 'The British Heart Foundation funds research into heart and circulatory disease, champions the prevention of the condition, and supports people living with it.', false, true),
  ('Mental Health Foundation', 'mental-health-foundation', 'The Mental Health Foundation works to protect good mental health in communities across the UK through research, public information and campaigning.', false, true),
  ('Children''s Society', 'childrens-society', 'The Children''s Society runs local services, helping children who are at risk, vulnerable or unable to cope.', true, true),
  ('Shelter', 'shelter', 'Shelter helps millions of people every year struggling with bad housing or homelessness through advice, support and legal services.', false, true);

-- ── FUNCTIONS ─────────────────────────────────────────────

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when new.email = current_setting('app.admin_email', true) then 'admin' else 'subscriber' end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Get draw statistics for admin
create or replace function public.get_draw_stats(draw_uuid uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_entries', count(*),
    'five_match', count(*) filter (where match_count = 5),
    'four_match', count(*) filter (where match_count = 4),
    'three_match', count(*) filter (where match_count = 3)
  ) into result
  from draw_entries
  where draw_id = draw_uuid;
  return result;
end;
$$ language plpgsql security definer;

-- Calculate prize pools
create or replace function public.calculate_prize_pools(active_subscriber_count integer)
returns json as $$
declare
  cfg prize_config%rowtype;
  monthly_pool integer;
  jackpot integer;
  four_pool integer;
  three_pool integer;
begin
  select * into cfg from prize_config limit 1;
  monthly_pool := (active_subscriber_count * cfg.monthly_price_pence * cfg.subscription_pool_percentage) / 100;
  jackpot := (monthly_pool * cfg.five_match_share) / 100;
  four_pool := (monthly_pool * cfg.four_match_share) / 100;
  three_pool := (monthly_pool * cfg.three_match_share) / 100;
  return json_build_object(
    'total_pool', monthly_pool,
    'jackpot', jackpot,
    'four_match', four_pool,
    'three_match', three_pool
  );
end;
$$ language plpgsql security definer;
