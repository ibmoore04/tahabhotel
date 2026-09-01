-- ==============================================================================
-- TAHAB HOTEL & SUITES LTD
-- MIGRATION 001: INITIAL SCHEMA
-- Fully idempotent — safe to re-run without errors.
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- ENUMS
-- ==============================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('guest', 'staff', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE room_status AS ENUM ('available', 'occupied', 'maintenance', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE room_category AS ENUM ('standard', 'executive', 'presidential');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE amenity_category AS ENUM (
    'dining', 'wellness', 'business', 'entertainment', 'general'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE message_status AS ENUM ('unread', 'read', 'archived', 'replied');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- `CREATE TYPE IF NOT EXISTS` does not add values to an existing enum. Keep
-- older projects compatible with the complete set of states used below and by
-- later migrations.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'available';
ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'occupied';
ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'maintenance';
ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'inactive';

ALTER TYPE room_category ADD VALUE IF NOT EXISTS 'standard';
ALTER TYPE room_category ADD VALUE IF NOT EXISTS 'executive';
ALTER TYPE room_category ADD VALUE IF NOT EXISTS 'presidential';

ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'checked_in';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'checked_out';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'rejected';

ALTER TYPE amenity_category ADD VALUE IF NOT EXISTS 'dining';
ALTER TYPE amenity_category ADD VALUE IF NOT EXISTS 'wellness';
ALTER TYPE amenity_category ADD VALUE IF NOT EXISTS 'business';
ALTER TYPE amenity_category ADD VALUE IF NOT EXISTS 'entertainment';
ALTER TYPE amenity_category ADD VALUE IF NOT EXISTS 'general';

ALTER TYPE message_status ADD VALUE IF NOT EXISTS 'unread';
ALTER TYPE message_status ADD VALUE IF NOT EXISTS 'read';
ALTER TYPE message_status ADD VALUE IF NOT EXISTS 'archived';
ALTER TYPE message_status ADD VALUE IF NOT EXISTS 'replied';

-- ==============================================================================
-- 1. PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    avatar_url  TEXT,
    role        user_role NOT NULL DEFAULT 'guest',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    -- Staff-specific optional fields
    department  TEXT,
    position    TEXT,
    hired_at    DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT profiles_user_id_unique UNIQUE (user_id),
    CONSTRAINT profiles_email_unique UNIQUE (email)
);

-- `CREATE TABLE IF NOT EXISTS` does not add columns to an existing table.
-- Keep this migration safe for projects created with an earlier profiles schema.
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'guest';

COMMENT ON TABLE profiles IS 'User profiles linked to auth.users. Single source of truth for role and permissions.';
COMMENT ON COLUMN profiles.is_active IS 'Set to false to deactivate staff/admin without deleting records.';
COMMENT ON COLUMN profiles.role IS 'Authorization role. Never allow users to set their own role.';

-- ==============================================================================
-- 2. ROOMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS rooms (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    category         room_category NOT NULL DEFAULT 'standard',
    description      TEXT NOT NULL,
    tagline          TEXT,
    price_per_night  NUMERIC(12, 2) NOT NULL CHECK (price_per_night >= 0),
    capacity         INTEGER NOT NULL DEFAULT 2 CHECK (capacity > 0),
    bed_type         TEXT NOT NULL,
    floor            INTEGER NOT NULL DEFAULT 1,
    size_sqm         INTEGER,
    status           room_status NOT NULL DEFAULT 'available',
    is_listed        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill columns introduced after the first rooms schema when the table exists.
ALTER TABLE rooms
    ADD COLUMN IF NOT EXISTS status room_status NOT NULL DEFAULT 'available',
    ADD COLUMN IF NOT EXISTS is_listed BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN rooms.status IS 'Physical room status. Available does not mean bookable for a given date range.';
COMMENT ON COLUMN rooms.is_listed IS 'Controls public visibility without deactivating the physical room.';

-- ==============================================================================
-- 3. ROOM IMAGES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS room_images (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    image_url  TEXT NOT NULL,
    alt_text   TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. ROOM AMENITIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS room_amenities (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id      UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    amenity_name TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT room_amenities_unique UNIQUE (room_id, amenity_name)
);

-- ==============================================================================
-- 5. BOOKINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS bookings (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT NOT NULL UNIQUE,
    user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    room_id           UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    check_in          DATE NOT NULL,
    check_out         DATE NOT NULL,
    guest_count       INTEGER NOT NULL CHECK (guest_count > 0),
    guest_name        TEXT NOT NULL,
    guest_email       TEXT NOT NULL,
    guest_phone       TEXT NOT NULL,
    status            booking_status NOT NULL DEFAULT 'pending',
    special_request   TEXT,
    -- Price is snapshotted at booking time — never recalculated from room's current price
    price_per_night   NUMERIC(12, 2) NOT NULL CHECK (price_per_night >= 0),
    num_nights        INTEGER NOT NULL CHECK (num_nights > 0),
    total_price       NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    -- Operations tracking
    checked_in_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checked_out_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checked_in_at     TIMESTAMPTZ,
    checked_out_at    TIMESTAMPTZ,
    confirmed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    confirmed_at      TIMESTAMPTZ,
    cancelled_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cancelled_at      TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT bookings_dates_order CHECK (check_out > check_in),
    CONSTRAINT bookings_num_nights_check CHECK (num_nights = (check_out - check_in))
);

-- Backfill pricing snapshots for databases created with the earlier bookings schema.
-- A temporary default permits existing booking rows to be migrated safely; it is
-- removed immediately so new bookings must supply their own server-calculated values.
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS price_per_night NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (price_per_night >= 0),
    ADD COLUMN IF NOT EXISTS total_price NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (total_price >= 0);

ALTER TABLE bookings
    ALTER COLUMN price_per_night DROP DEFAULT,
    ALTER COLUMN total_price DROP DEFAULT;

COMMENT ON COLUMN bookings.price_per_night IS 'Room price at time of booking — immutable snapshot.';
COMMENT ON COLUMN bookings.total_price IS 'Calculated server-side: price_per_night * num_nights. Never trusted from client.';

-- ==============================================================================
-- 6. HOTEL AMENITIES & FACILITIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS amenities (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL UNIQUE,
    description   TEXT NOT NULL,
    category      amenity_category NOT NULL DEFAULT 'general',
    image_url     TEXT,
    opening_hours TEXT,
    status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. CONTACT MESSAGES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT,
    subject    TEXT NOT NULL,
    message    TEXT NOT NULL,
    status     message_status NOT NULL DEFAULT 'unread',
    read_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    read_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. GALLERY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS gallery (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title      TEXT NOT NULL,
    image_url  TEXT NOT NULL,
    category   TEXT NOT NULL DEFAULT 'hotel',
    alt_text   TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The legacy gallery schema did not include display ordering.
ALTER TABLE gallery
    ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- ==============================================================================
-- 9. SITE SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key        TEXT NOT NULL UNIQUE,
    value      JSONB NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
