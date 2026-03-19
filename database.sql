-- ============================================
-- WARFACE TRACKER - Database Schema
-- Для Supabase PostgreSQL
-- ============================================

-- ============================================
-- Players Table
-- ============================================
CREATE TABLE IF NOT EXISTS "players" (
    "id" TEXT PRIMARY KEY DEFAULT ('cm' || replace(gen_random_uuid()::text, '-', '')),
    "nickname" TEXT NOT NULL UNIQUE,
    "display_nickname" TEXT DEFAULT '',
    "user_id" TEXT UNIQUE,
    "rank_id" INTEGER DEFAULT 1,
    "experience" BIGINT DEFAULT 0,
    "clan_id" TEXT,
    "fav_pvp" TEXT DEFAULT '',
    "fav_pve" TEXT DEFAULT '',
    "last_updated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "players_nickname_idx" ON "players"("nickname");
CREATE INDEX IF NOT EXISTS "players_clan_id_idx" ON "players"("clan_id");

-- ============================================
-- Clans Table
-- ============================================
CREATE TABLE IF NOT EXISTS "clans" (
    "id" TEXT PRIMARY KEY DEFAULT ('cm' || replace(gen_random_uuid()::text, '-', '')),
    "clan_id" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "tag" TEXT DEFAULT '',
    "points" INTEGER DEFAULT 0,
    "rank_points" INTEGER DEFAULT 0,
    "member_count" INTEGER DEFAULT 0,
    "last_updated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "clans_points_idx" ON "clans"("points" DESC);

-- ============================================
-- Stat Snapshots Table (time-series)
-- ============================================
CREATE TABLE IF NOT EXISTS "stat_snapshots" (
    "id" TEXT PRIMARY KEY DEFAULT ('cm' || replace(gen_random_uuid()::text, '-', '')),
    "player_id" TEXT NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
    "kills" INTEGER DEFAULT 0,
    "deaths" INTEGER DEFAULT 0,
    "assists" INTEGER DEFAULT 0,
    "friendly_kills" INTEGER DEFAULT 0,
    "wins" INTEGER DEFAULT 0,
    "losses" INTEGER DEFAULT 0,
    "draws" INTEGER DEFAULT 0,
    "playtime" INTEGER DEFAULT 0,
    "accuracy" DOUBLE PRECISION DEFAULT 0.0,
    "headshot_pct" DOUBLE PRECISION DEFAULT 0.0,
    "kd_ratio" DOUBLE PRECISION DEFAULT 0.0,
    "rank_id" INTEGER DEFAULT 1,
    "experience" BIGINT DEFAULT 0,
    "pve_kills" INTEGER DEFAULT 0,
    "pve_deaths" INTEGER DEFAULT 0,
    "pve_friendly_kills" INTEGER DEFAULT 0,
    "pve_wins" INTEGER DEFAULT 0,
    "pve_losses" INTEGER DEFAULT 0,
    "pve_total" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "stat_snapshots_player_id_created_at_idx" ON "stat_snapshots"("player_id", "created_at" DESC);

-- ============================================
-- Weapon Stats Table
-- ============================================
CREATE TABLE IF NOT EXISTS "weapon_stats" (
    "id" TEXT PRIMARY KEY DEFAULT ('cm' || replace(gen_random_uuid()::text, '-', '')),
    "player_id" TEXT NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
    "weapon_id" TEXT NOT NULL,
    "weapon_name" TEXT NOT NULL,
    "weapon_class" TEXT DEFAULT 'rifle',
    "kills" INTEGER DEFAULT 0,
    "shots" INTEGER DEFAULT 0,
    "hits" INTEGER DEFAULT 0,
    "headshots" INTEGER DEFAULT 0,
    "headshot_pct" DOUBLE PRECISION DEFAULT 0.0,
    "accuracy" DOUBLE PRECISION DEFAULT 0.0,
    "is_gold" BOOLEAN DEFAULT false,
    "gold_progress" INTEGER DEFAULT 0,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("player_id", "weapon_id")
);

CREATE INDEX IF NOT EXISTS "weapon_stats_player_id_kills_idx" ON "weapon_stats"("player_id", "kills" DESC);

-- ============================================
-- Users Table (for authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY DEFAULT ('cm' || replace(gen_random_uuid()::text, '-', '')),
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL UNIQUE,
    "avatar_url" TEXT,
    "banner_url" TEXT,
    "background_preset" TEXT DEFAULT 'none',
    "banner_preset" TEXT DEFAULT 'none',
    "bg_color" TEXT DEFAULT '#0f172a',
    "accent_color" TEXT DEFAULT '#22c55e',
    "bio" TEXT,
    "is_verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users"("username");

-- ============================================
-- User Sessions Table
-- ============================================
CREATE TABLE IF NOT EXISTS "user_sessions" (
    "id" TEXT PRIMARY KEY DEFAULT ('cm' || replace(gen_random_uuid()::text, '-', '')),
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "token" TEXT NOT NULL UNIQUE,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "user_sessions_user_id_idx" ON "user_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "user_sessions_token_idx" ON "user_sessions"("token");

-- ============================================
-- Linked Players Table
-- ============================================
CREATE TABLE IF NOT EXISTS "linked_players" (
    "id" TEXT PRIMARY KEY DEFAULT ('cm' || replace(gen_random_uuid()::text, '-', '')),
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "warface_nick" TEXT NOT NULL UNIQUE,
    "is_primary" BOOLEAN DEFAULT false,
    "verified_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "linked_players_user_id_idx" ON "linked_players"("user_id");

-- ============================================
-- User Activity Table
-- ============================================
CREATE TABLE IF NOT EXISTS "user_activity" (
    "id" TEXT PRIMARY KEY DEFAULT ('cm' || replace(gen_random_uuid()::text, '-', '')),
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "user_activity_user_id_created_at_idx" ON "user_activity"("user_id", "created_at" DESC);

-- ============================================
-- Verification Sessions Table
-- ============================================
CREATE TABLE IF NOT EXISTS "verification_sessions" (
    "id" TEXT PRIMARY KEY DEFAULT ('cm' || replace(gen_random_uuid()::text, '-', '')),
    "user_id" TEXT NOT NULL,
    "warface_nick" TEXT NOT NULL,
    "badges" TEXT[] DEFAULT '{}',
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "verification_sessions_user_id_idx" ON "verification_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "verification_sessions_expires_at_idx" ON "verification_sessions"("expires_at");

-- ============================================
-- Add foreign key for clan reference
-- ============================================
ALTER TABLE "players" 
ADD CONSTRAINT "players_clan_id_fkey" 
FOREIGN KEY ("clan_id") 
REFERENCES "clans"("id") 
ON DELETE SET NULL;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE "players" IS 'Warface players with their stats';
COMMENT ON TABLE "clans" IS 'Warface clans information';
COMMENT ON TABLE "stat_snapshots" IS 'Time-series player statistics';
COMMENT ON TABLE "weapon_stats" IS 'Player weapon statistics';
COMMENT ON TABLE "users" IS 'Application users for authentication';
COMMENT ON TABLE "user_sessions" IS 'User authentication sessions';
COMMENT ON TABLE "linked_players" IS 'Linked Warface accounts to users';
COMMENT ON TABLE "user_activity" IS 'User activity log';
COMMENT ON TABLE "verification_sessions" IS 'Verification sessions for account linking';
