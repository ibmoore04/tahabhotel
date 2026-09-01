-- ==============================================================================
-- TAHAB HOTEL & SUITES LTD — PRODUCTION DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES & ROLES
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('guest', 'staff', 'admin');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'guest',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- ------------------------------------------------------------------------------
-- 2. ROOMS
-- ------------------------------------------------------------------------------
CREATE TYPE room_status AS ENUM ('available', 'maintenance', 'booked');
CREATE TYPE room_category AS ENUM ('standard', 'executive', 'presidential');

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category room_category NOT NULL DEFAULT 'standard',
    description TEXT NOT NULL,
    tagline TEXT,
    price_per_night NUMERIC(12, 2) NOT NULL CHECK (price_per_night >= 0),
    capacity INTEGER NOT NULL DEFAULT 2 CHECK (capacity > 0),
    bed_type TEXT NOT NULL,
    floor INTEGER NOT NULL DEFAULT 1,
    size_sqm INTEGER,
    status room_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. ROOM IMAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. ROOM AMENITIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    amenity_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_room_amenity UNIQUE (room_id, amenity_name)
);

-- ------------------------------------------------------------------------------
-- 5. BOOKINGS
-- ------------------------------------------------------------------------------
CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
    'rejected'
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guest_count INTEGER NOT NULL CHECK (guest_count > 0),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    special_request TEXT,
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_dates_order CHECK (check_out > check_in)
);

-- ------------------------------------------------------------------------------
-- 6. HOTEL AMENITIES & FACILITIES
-- ------------------------------------------------------------------------------
CREATE TYPE amenity_category AS ENUM (
    'dining',
    'wellness',
    'business',
    'entertainment',
    'general'
);

CREATE TABLE IF NOT EXISTS amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category amenity_category NOT NULL DEFAULT 'general',
    image_url TEXT,
    opening_hours TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. CONTACT MESSAGES
-- ------------------------------------------------------------------------------
CREATE TYPE message_status AS ENUM ('unread', 'read', 'archived', 'replied');

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status message_status NOT NULL DEFAULT 'unread',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. GALLERY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'hotel',
    alt_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. SITE SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_category ON rooms(category);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON room_images(room_id);
CREATE INDEX IF NOT EXISTS idx_room_amenities_room_id ON room_amenities(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

-- ------------------------------------------------------------------------------
-- AUTOMATIC updated_at TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER tr_rooms_updated BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER tr_bookings_updated BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER tr_amenities_updated BEFORE UPDATE ON amenities FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER tr_site_settings_updated BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admin full manage profiles" ON profiles
    FOR ALL USING (is_admin());

-- 2. Rooms & Details (Public Read, Admin Write)
CREATE POLICY "Public read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Admin manage rooms" ON rooms FOR ALL USING (is_admin());

CREATE POLICY "Public read room images" ON room_images FOR SELECT USING (true);
CREATE POLICY "Admin manage room images" ON room_images FOR ALL USING (is_admin());

CREATE POLICY "Public read room amenities" ON room_amenities FOR SELECT USING (true);
CREATE POLICY "Admin manage room amenities" ON room_amenities FOR ALL USING (is_admin());

-- 3. Bookings
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admin manage bookings" ON bookings
    FOR ALL USING (is_admin());

-- 4. Amenities & Gallery (Public Read, Admin Write)
CREATE POLICY "Public read amenities" ON amenities FOR SELECT USING (true);
CREATE POLICY "Admin manage amenities" ON amenities FOR ALL USING (is_admin());

CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Admin manage gallery" ON gallery FOR ALL USING (is_admin());

-- 5. Contact Messages
CREATE POLICY "Public insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage contact messages" ON contact_messages FOR ALL USING (is_admin());

-- 6. Site Settings
CREATE POLICY "Public read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage site settings" ON site_settings FOR ALL USING (is_admin());
