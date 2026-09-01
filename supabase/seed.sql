-- ==============================================================================
-- TAHAB HOTEL & SUITES LTD — SEED DATA
--
-- RULES ENFORCED HERE:
--   ✓ No auth users are created
--   ✓ No admin accounts are created
--   ✓ No staff accounts are created
--   ✓ No guest accounts are created
--   ✓ No fake customer bookings
--   ✓ Only safe content/reference data: rooms, amenities, gallery, settings
--   ✓ All room/amenity information is based on verified hotel information only
--
-- To create the first admin: see supabase/migrations/004_admin_provisioning.sql
-- ==============================================================================

-- ==============================================================================
-- 1. ROOMS
-- Room descriptions and pricing are based on verified hotel product offerings.
-- ==============================================================================
INSERT INTO rooms (id, name, slug, category, description, tagline, price_per_night, capacity, bed_type, floor, size_sqm, status, is_listed)
VALUES
(
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Standard Luxury Room',
    'standard-luxury-room',
    'standard',
    'Experience the sweet spot of comfort and contemporary elegance. Thoughtfully appointed with a plush king-sized bed, individual room-number door indicators, climate-controlled split AC, smart entertainment system, and an ergonomic workspace for the discerning business or leisure traveler.',
    'The Sweet Spot of Comfort',
    35000.00,
    2,
    'King Bed',
    1,
    28,
    'available',
    TRUE
),
(
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Mini Suite',
    'mini-suite',
    'standard',
    'A harmonious blend of space and intimacy. Featuring distinct relaxation zones, smart ambient lighting, ultra-fast water heating, premium bathroom amenities, and soft boutique styling that guarantees restful nights in Ijebu Ode.',
    'Intimate Elegance & Quiet Sophistication',
    45000.00,
    2,
    'King Bed',
    1,
    35,
    'available',
    TRUE
),
(
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Executive Suite',
    'executive-suite',
    'executive',
    'Elevated space with refined luxury. Enjoy an expansive detached private lounge for entertaining guests, a private solarium offering scenic vistas of Ijebu Ode, rapid water heaters, smart high-definition TV with premium channels, and an artisanal vanity/amenities kit.',
    'Elevated Space, Refined Luxury',
    75000.00,
    3,
    'Super King Bed',
    2,
    54,
    'available',
    TRUE
),
(
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Presidential Suite',
    'presidential-suite',
    'presidential',
    'The crown jewel of Tahab Hotel & Suites. Designed for VIP dignitaries and luxury connoisseurs, this grandiose suite boasts an expansive master bedroom, separate lavish living room, dedicated private dining area, high-security smart access, executive workspace, and a spa-inspired walk-in bathroom with premium European fixtures.',
    'The Ultimate Luxury Experience',
    150000.00,
    4,
    'Grand Emperor Bed',
    3,
    95,
    'available',
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 2. ROOM AMENITIES
-- ==============================================================================
INSERT INTO room_amenities (room_id, amenity_name)
VALUES
-- Standard Room
('a1b2c3d4-0001-4000-8000-000000000001', 'King-sized Bed'),
('a1b2c3d4-0001-4000-8000-000000000001', 'Split Air Conditioning'),
('a1b2c3d4-0001-4000-8000-000000000001', 'Smart TV with Satellite'),
('a1b2c3d4-0001-4000-8000-000000000001', 'Modern Private Bathroom'),
('a1b2c3d4-0001-4000-8000-000000000001', 'Ergonomic Study Desk'),
('a1b2c3d4-0001-4000-8000-000000000001', 'High-speed Wi-Fi'),
('a1b2c3d4-0001-4000-8000-000000000001', 'Complimentary Breakfast'),

-- Mini Suite
('a1b2c3d4-0002-4000-8000-000000000002', 'King-sized Bed'),
('a1b2c3d4-0002-4000-8000-000000000002', 'Lounge Seating Corner'),
('a1b2c3d4-0002-4000-8000-000000000002', 'Rapid Water Heater'),
('a1b2c3d4-0002-4000-8000-000000000002', 'Smart TV with Streaming'),
('a1b2c3d4-0002-4000-8000-000000000002', 'Mini Bar & Refrigerator'),
('a1b2c3d4-0002-4000-8000-000000000002', 'Complimentary Breakfast'),

-- Executive Suite
('a1b2c3d4-0003-4000-8000-000000000003', 'Detached Private Lounge'),
('a1b2c3d4-0003-4000-8000-000000000003', 'Private Solarium / Balcony'),
('a1b2c3d4-0003-4000-8000-000000000003', 'Scenic Ijebu Ode Views'),
('a1b2c3d4-0003-4000-8000-000000000003', 'Rapid Water Heaters'),
('a1b2c3d4-0003-4000-8000-000000000003', 'Smart Entertainment System'),
('a1b2c3d4-0003-4000-8000-000000000003', 'Vanity & Luxury Amenities Kit'),
('a1b2c3d4-0003-4000-8000-000000000003', 'Coffee & Tea Maker'),
('a1b2c3d4-0003-4000-8000-000000000003', 'Complimentary Breakfast'),

-- Presidential Suite
('a1b2c3d4-0004-4000-8000-000000000004', 'Expansive Master Bedroom'),
('a1b2c3d4-0004-4000-8000-000000000004', 'Separate Palatial Living Room'),
('a1b2c3d4-0004-4000-8000-000000000004', 'Private Dining Area'),
('a1b2c3d4-0004-4000-8000-000000000004', 'Spa-Grade Walk-In Bathroom'),
('a1b2c3d4-0004-4000-8000-000000000004', 'High-End European Fixtures'),
('a1b2c3d4-0004-4000-8000-000000000004', 'Maximum Security & Keycard Access'),
('a1b2c3d4-0004-4000-8000-000000000004', 'Executive Workspace & High-Speed Fiber'),
('a1b2c3d4-0004-4000-8000-000000000004', 'VIP Butler & Concierge Support'),
('a1b2c3d4-0004-4000-8000-000000000004', 'Complimentary Champagne & Breakfast')
ON CONFLICT (room_id, amenity_name) DO NOTHING;

-- ==============================================================================
-- 3. ROOM IMAGES (Curated Unsplash hospitality photography)
-- ==============================================================================
INSERT INTO room_images (room_id, image_url, alt_text, is_primary, sort_order)
SELECT room_id::UUID, image_url, alt_text, is_primary, sort_order
FROM (VALUES
-- Standard Room
('a1b2c3d4-0001-4000-8000-000000000001',
 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
 'Standard Luxury Room - King Bed Setup', TRUE, 1),
('a1b2c3d4-0001-4000-8000-000000000001',
 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
 'Standard Luxury Room - Ensuite Bathroom & Desk', FALSE, 2),

-- Mini Suite
('a1b2c3d4-0002-4000-8000-000000000002',
 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
 'Mini Suite - Bedroom and Lounge Area', TRUE, 1),
('a1b2c3d4-0002-4000-8000-000000000002',
 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
 'Mini Suite - Warm Lighting and Fixtures', FALSE, 2),

-- Executive Suite
('a1b2c3d4-0003-4000-8000-000000000003',
 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
 'Executive Suite - Detached Private Lounge and Master Bed', TRUE, 1),
('a1b2c3d4-0003-4000-8000-000000000003',
 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
 'Executive Suite - Solarium Views & Living Space', FALSE, 2),

-- Presidential Suite
('a1b2c3d4-0004-4000-8000-000000000004',
 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80',
 'Presidential Suite - Grand Master Bedroom & Chandelier', TRUE, 1),
('a1b2c3d4-0004-4000-8000-000000000004',
 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
 'Presidential Suite - Private Living & Dining Area', FALSE, 2),
('a1b2c3d4-0004-4000-8000-000000000004',
 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80',
 'Presidential Suite - Spa Walk-In Bathroom', FALSE, 3)
) AS seed_image(room_id, image_url, alt_text, is_primary, sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM room_images AS existing_image
    WHERE existing_image.room_id = seed_image.room_id::UUID
      AND existing_image.image_url = seed_image.image_url
);

-- ==============================================================================
-- 4. HOTEL AMENITIES (Verified Tahab Hotel & Suites facilities)
-- ==============================================================================
INSERT INTO amenities (id, name, slug, description, category, image_url, opening_hours, sort_order)
VALUES
(
    'b1c2d3e4-0001-4000-8000-000000000001',
    'The Rooftop Lounge',
    'rooftop-lounge',
    'The signature social destination of Ijebu Ode. Host to weekend get-togethers, birthday celebrations, bachelorette events, and the renowned "Itunu Awe Rooftop Dance Party". Features handcrafted cocktails, ambient lighting, and panoramic city views.',
    'entertainment',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    '5:00 PM – 2:00 AM Daily',
    1
),
(
    'b1c2d3e4-0002-4000-8000-000000000002',
    'Tahab Restaurant & Bar',
    'tahab-restaurant-bar',
    'Culinary experience offering authentic Nigerian cuisine alongside continental delicacies prepared by expert chefs. Full-service bar with curated beverage selection.',
    'dining',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    '6:30 AM – 11:00 PM Daily',
    2
),
(
    'b1c2d3e4-0003-4000-8000-000000000003',
    'VIP & Private Lounges',
    'vip-private-lounges',
    'Secluded, acoustic-treated private rooms designed for high-profile conversations, private dinners, and executive networking.',
    'dining',
    'https://images.unsplash.com/photo-1572177191856-3cde618dee1f?auto=format&fit=crop&w=1200&q=80',
    '24 Hours on Request',
    3
),
(
    'b1c2d3e4-0004-4000-8000-000000000004',
    'Corporate Boardroom',
    'corporate-boardroom',
    'State-of-the-art meeting facility equipped with 4K interactive projection, teleconferencing systems, high-speed fiber internet, and executive leather seating for up to 25 delegates.',
    'business',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    '8:00 AM – 9:00 PM',
    4
),
(
    'b1c2d3e4-0005-4000-8000-000000000005',
    'In-House Fitness Center',
    'in-house-gym',
    'Modern cardio machines, free weights, resistance bands, and functional training equipment.',
    'wellness',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    '6:00 AM – 10:00 PM Daily',
    5
),
(
    'b1c2d3e4-0006-4000-8000-000000000006',
    'Dry Cleaning & Express Laundry',
    'dry-cleaning-laundry',
    'Fast, meticulous garment care service ensuring business attire and casual wear are immaculately returned on schedule.',
    'general',
    'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=80',
    '7:00 AM – 8:00 PM Daily',
    6
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 5. GALLERY
-- ==============================================================================
INSERT INTO gallery (title, image_url, category, alt_text, sort_order)
SELECT title, image_url, category, alt_text, sort_order
FROM (VALUES
('Boutique Architectural Facade',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
 'exterior', 'Tahab Hotel 3-floor boutique exterior facade', 1),
('Presidential Suite Master Living',
 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
 'rooms', 'Presidential Suite master living area', 2),
('The Rooftop Lounge by Night',
 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
 'rooftop', 'Rooftop lounge with mood lighting', 3),
('Executive Boardroom',
 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
 'business', 'Corporate meeting and conference room', 4),
('Restaurant Dining',
 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
 'dining', 'Restaurant dining area', 5),
('Executive Suite Interior',
 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
 'rooms', 'Executive Suite spacious interior', 6)
) AS seed_gallery(title, image_url, category, alt_text, sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM gallery AS existing_gallery
    WHERE existing_gallery.title = seed_gallery.title
      AND existing_gallery.image_url = seed_gallery.image_url
);

-- ==============================================================================
-- 6. SITE SETTINGS (Verified hotel contact information)
-- ==============================================================================
INSERT INTO site_settings (key, value)
VALUES (
    'hotel_info',
    '{
        "name": "Tahab Hotel & Suites Ltd",
        "tagline": "Experience Soft Luxury in the Heart of Ijebu Ode",
        "address": "108, Benin–Ondo Road, By Oludiya Junction, Ijebu Ode, Ogun State, Nigeria",
        "phones": ["+234 704 350 5550", "+234 704 374 1277"],
        "email": "reservations@tahabhotel.com",
        "instagram": "https://instagram.com/tahabhotelandsuites",
        "instagram_handle": "@tahabhotelandsuites",
        "facebook": "https://facebook.com/TahabHotelAndSuites",
        "facebook_handle": "Tahab Hotel & Suites",
        "check_in_time": "2:00 PM",
        "check_out_time": "12:00 PM",
        "front_desk": "24/7 Front Desk & Concierge Service"
    }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==============================================================================
-- NOTE: No users, no bookings, no staff accounts are seeded here.
--
-- To get started with a live Supabase project:
-- 1. Run all migrations in supabase/migrations/ in order.
-- 2. Run this seed file.
-- 3. Register your first admin account via the /register page.
-- 4. Run SELECT generate_setup_token('your-secret-passphrase') in Supabase SQL editor.
-- 5. Set VITE_SETUP_SECRET=<returned_token> in your environment.
-- 6. Navigate to /setup while logged in as your intended admin.
-- 7. Remove VITE_SETUP_SECRET after admin is provisioned.
-- 8. Create staff accounts via /admin/staff.
-- ==============================================================================
