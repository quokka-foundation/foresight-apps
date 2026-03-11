-- ============================================================
-- Foresight Alpha Intelligence — Supabase Initial Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── SIGNALS ────────────────────────────────────────────────
create table public.signals (
  id               uuid primary key default gen_random_uuid(),
  signal_type      text not null check (signal_type in (
                     'SMART_MONEY_ENTRY', 'WHALE_ENTRY', 'LIQUIDITY_SURGE',
                     'EARLY_MOMENTUM', 'COORDINATED_CLUSTER'
                   )),
  token_address    text not null,
  token_symbol     text,
  confidence_score numeric(5,2) not null check (confidence_score between 0 and 100),
  wallet_addresses text[]        not null default '{}',
  block_number     bigint,
  value_usd        numeric(20,2),
  description      text,
  ai_summary       text,        -- null until cron/ai generates it
  metadata         jsonb         not null default '{}',
  detected_at      timestamptz   not null default now(),
  created_at       timestamptz   not null default now()
);

create index signals_detected_at_idx   on public.signals (detected_at desc);
create index signals_token_address_idx on public.signals (token_address);
create index signals_signal_type_idx   on public.signals (signal_type);
create index signals_no_summary_idx    on public.signals (detected_at desc)
  where ai_summary is null;

-- ── WALLETS (smart money registry) ────────────────────────
create table public.wallets (
  id               uuid    primary key default gen_random_uuid(),
  address          text    unique not null,
  smart_score      numeric(5,2)  not null default 0,
  cluster_type     text,
  labels           text[]        not null default '{}',
  total_volume_usd numeric(20,2) not null default 0,
  trade_count      integer       not null default 0,
  win_rate         numeric(5,2)  not null default 0,
  avg_pnl_percent  numeric(8,2)  not null default 0,
  updated_at       timestamptz   not null default now()
);

create index wallets_smart_score_idx on public.wallets (smart_score desc);

-- ── TOKENS ─────────────────────────────────────────────────
create table public.tokens (
  id             uuid    primary key default gen_random_uuid(),
  address        text    unique not null,
  symbol         text    not null,
  name           text,
  decimals       integer not null default 18,
  price_usd      numeric(20,8)  not null default 0,
  change_24h     numeric(6,2)   not null default 0,
  volume_24h_usd numeric(20,2)  not null default 0,
  liquidity_usd  numeric(20,2)  not null default 0,
  market_cap_usd numeric(20,2),
  tx_count       integer        not null default 0,
  is_clanker     boolean        not null default false,
  pool_address   text,
  first_seen_at  timestamptz    not null default now(),
  created_at     timestamptz    not null default now(),
  updated_at     timestamptz    not null default now()
);

create index tokens_volume_idx  on public.tokens (volume_24h_usd desc);
create index tokens_created_idx on public.tokens (created_at desc);
create index tokens_clanker_idx on public.tokens (created_at desc) where is_clanker = true;

-- ── TOKEN OHLCV (TradingView chart data) ───────────────────
create table public.token_ohlcv (
  id            uuid    primary key default gen_random_uuid(),
  token_address text    not null,
  time          timestamptz not null,
  open          numeric(20,8) not null,
  high          numeric(20,8) not null,
  low           numeric(20,8) not null,
  close         numeric(20,8) not null,
  volume        numeric(20,2) not null default 0,
  resolution    text    not null check (resolution in ('1H', '1D', '1W', '1M'))
);

create unique index token_ohlcv_unique on public.token_ohlcv (token_address, time, resolution);
create index token_ohlcv_time_idx      on public.token_ohlcv (token_address, time desc);

-- ── USERS ──────────────────────────────────────────────────
create table public.users (
  id                uuid    primary key default gen_random_uuid(),
  fid               integer unique,          -- Farcaster FID
  wallet_address    text    unique,
  subscription_tier text    not null default 'free'
                    check (subscription_tier in ('free', 'pro', 'elite')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── NOTIFICATION TOKENS (replaces in-memory Map) ──────────
create table public.notification_tokens (
  fid        integer     primary key,
  url        text        not null,
  token      text        not null,
  created_at timestamptz not null default now()
);

-- ── ALERT SUBSCRIPTIONS ────────────────────────────────────
create table public.alert_subscriptions (
  id             uuid    primary key default gen_random_uuid(),
  user_id        uuid    references public.users (id) on delete cascade,
  signal_types   text[]  not null default
                   '{"SMART_MONEY_ENTRY","WHALE_ENTRY","LIQUIDITY_SURGE","EARLY_MOMENTUM","COORDINATED_CLUSTER"}',
  min_confidence numeric(5,2) not null default 70,
  min_value_usd  numeric(20,2) not null default 1000,
  created_at     timestamptz  not null default now()
);

-- ── ALERT HISTORY ──────────────────────────────────────────
create table public.alert_history (
  id           uuid    primary key default gen_random_uuid(),
  user_id      uuid    references public.users (id) on delete cascade,
  signal_id    uuid    references public.signals (id) on delete set null,
  signal_type  text,
  message      text,
  triggered_at timestamptz not null default now()
);

create index alert_history_user_idx on public.alert_history (user_id, triggered_at desc);

-- ── SOCIAL SIGNALS (Neynar / Farcaster) ────────────────────
create table public.social_signals (
  id            uuid    primary key default gen_random_uuid(),
  token_address text,
  token_symbol  text,
  mention_count integer not null default 0,
  cast_hashes   text[]  not null default '{}',
  sentiment     text check (sentiment in ('positive', 'neutral', 'negative')),
  window_start  timestamptz,
  window_end    timestamptz,
  created_at    timestamptz not null default now()
);

create index social_signals_token_idx on public.social_signals (token_address, created_at desc);

-- ── REALTIME PUBLICATIONS ──────────────────────────────────
-- Enable Realtime for live feed updates
alter publication supabase_realtime add table public.signals;
alter publication supabase_realtime add table public.tokens;

-- ── ROW LEVEL SECURITY ─────────────────────────────────────
-- Public read for signals, tokens, wallets
alter table public.signals           enable row level security;
alter table public.tokens            enable row level security;
alter table public.wallets           enable row level security;
alter table public.token_ohlcv       enable row level security;
alter table public.social_signals    enable row level security;
alter table public.notification_tokens enable row level security;
alter table public.users             enable row level security;
alter table public.alert_subscriptions enable row level security;
alter table public.alert_history     enable row level security;

create policy "Anyone can read signals"        on public.signals        for select using (true);
create policy "Anyone can read tokens"         on public.tokens         for select using (true);
create policy "Anyone can read wallets"        on public.wallets        for select using (true);
create policy "Anyone can read token_ohlcv"    on public.token_ohlcv    for select using (true);
create policy "Anyone can read social_signals" on public.social_signals for select using (true);

-- Service role can do everything (used by API routes with service key)
-- RLS is bypassed when using service_role key in server-side code.
