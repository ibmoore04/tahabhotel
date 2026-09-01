// ==============================================================================
// TAHAB HOTEL & SUITES LTD — CONSTANTS & INITIAL DATA
// ==============================================================================

import type { Room, Amenity, GalleryItem, Booking, ContactMessage, SiteSettings } from '../types';

export const HOTEL_DETAILS = {
  name: 'Tahab Hotel & Suites Ltd',
  shortName: 'Tahab Hotel',
  tagline: 'Experience Soft Luxury in the Heart of Ijebu Ode',
  subheadline: 'The Sweet Spot of Comfort in Ijebu Ode, Ogun State',
  city: 'Ijebu Ode',
  state: 'Ogun State',
  country: 'Nigeria',
  address: '108, Benin–Ondo Road, By Oludiya Junction, Ijebu Ode, Ogun State, Nigeria',
  phones: ['+234 704 350 5550', '+234 704 374 1277'],
  email: 'reservations@tahabhotel.com',
  instagram: 'https://instagram.com/tahabhotelandsuites',
  instagramHandle: '@tahabhotelandsuites',
  facebook: 'https://facebook.com/TahabHotelAndSuites',
  facebookHandle: 'Tahab Hotel & Suites',
  checkInTime: '2:00 PM',
  checkOutTime: '12:00 PM',
  frontDeskHours: '24 Hours / 7 Days a Week',
  floorsCount: 3,
  powerStatus: '24/7 Guaranteed Power (Dual Industrial Generators)',
  securityStatus: '24/7 Uniformed Security & CCTV Surveillance',
};

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Rooms & Suites', href: '/rooms' },
  { label: 'Amenities', href: '/amenities' },
  { label: 'Policies', href: '/policies' },
  { label: 'Contact', href: '/contact' },
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    name: 'Standard Luxury Room',
    slug: 'standard-luxury-room',
    category: 'standard',
    tagline: 'The Sweet Spot of Comfort',
    description:
      'Experience the sweet spot of comfort and contemporary elegance. Thoughtfully appointed with a plush king-sized bed, individual room-number door indicators, climate-controlled split AC, smart entertainment system, and an ergonomic workspace for the discerning business or leisure traveler.',
    price_per_night: 35000,
    capacity: 2,
    bed_type: 'King Bed',
    floor: 1,
    size_sqm: 28,
    status: 'available',
    is_listed: true,
    images: [
      {
        id: 'img-1-1',
        room_id: 'a1b2c3d4-0001-4000-8000-000000000001',
        image_url:
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Standard Luxury Room - King Bed Setup',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'img-1-2',
        room_id: 'a1b2c3d4-0001-4000-8000-000000000001',
        image_url:
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Standard Luxury Room - Ensuite Bathroom & Desk',
        is_primary: false,
        sort_order: 2,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
    amenities: [
      'King-sized Bed',
      'Split Air Conditioning',
      'Smart TV with Satellite',
      'Modern Private Bathroom',
      'Ergonomic Study Desk',
      'High-speed Wi-Fi',
      'Complimentary Breakfast',
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    name: 'Mini Suite',
    slug: 'mini-suite',
    category: 'standard',
    tagline: 'Intimate Elegance & Quiet Sophistication',
    description:
      'A harmonious blend of space and intimacy. Featuring distinct relaxation zones, smart ambient lighting, ultra-fast water heating, premium bathroom amenities, and soft boutique styling that guarantees restful nights in Ijebu Ode.',
    price_per_night: 45000,
    capacity: 2,
    bed_type: 'King Bed',
    floor: 1,
    size_sqm: 35,
    status: 'available',
    is_listed: true,
    images: [
      {
        id: 'img-2-1',
        room_id: 'a1b2c3d4-0002-4000-8000-000000000002',
        image_url:
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Mini Suite - Bedroom and Lounge Area',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'img-2-2',
        room_id: 'a1b2c3d4-0002-4000-8000-000000000002',
        image_url:
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Mini Suite - Warm Lighting and Fixtures',
        is_primary: false,
        sort_order: 2,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
    amenities: [
      'King-sized Bed',
      'Lounge Seating Corner',
      'Rapid Water Heater',
      'Smart TV with Streaming',
      'Mini Bar & Refrigerator',
      'Complimentary Breakfast',
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    name: 'Executive Suite',
    slug: 'executive-suite',
    category: 'executive',
    tagline: 'Elevated Space, Refined Luxury',
    description:
      'Elevated space with refined luxury. Enjoy an expansive detached private lounge for entertaining guests, a private solarium offering scenic vistas of Ijebu Ode, rapid water heaters, smart high-definition TV with premium channels, and an artisanal vanity/amenities kit.',
    price_per_night: 75000,
    capacity: 3,
    bed_type: 'Super King Bed',
    floor: 2,
    size_sqm: 54,
    status: 'available',
    is_listed: true,
    images: [
      {
        id: 'img-3-1',
        room_id: 'a1b2c3d4-0003-4000-8000-000000000003',
        image_url:
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Executive Suite - Detached Private Lounge and Master Bed',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'img-3-2',
        room_id: 'a1b2c3d4-0003-4000-8000-000000000003',
        image_url:
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Executive Suite - Solarium Views & Living Space',
        is_primary: false,
        sort_order: 2,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
    amenities: [
      'Detached Private Lounge',
      'Private Solarium / Balcony',
      'Scenic Ijebu Ode Views',
      'Rapid Water Heaters',
      'Smart Entertainment System',
      'Vanity & Luxury Amenities Kit',
      'Coffee & Tea Maker',
      'Complimentary Breakfast',
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000004',
    name: 'Presidential Suite',
    slug: 'presidential-suite',
    category: 'presidential',
    tagline: 'The Ultimate Luxury Experience',
    description:
      'The crown jewel of Tahab Hotel & Suites. Designed for VIP dignitaries and luxury connoisseurs, this grandiose suite boasts an expansive master bedroom, separate lavish living room, dedicated private dining area, high-security smart access, executive workspace, and a spa-inspired walk-in bathroom with premium European fixtures.',
    price_per_night: 150000,
    capacity: 4,
    bed_type: 'Grand Emperor Bed',
    floor: 3,
    size_sqm: 95,
    status: 'available',
    is_listed: true,
    images: [
      {
        id: 'img-4-1',
        room_id: 'a1b2c3d4-0004-4000-8000-000000000004',
        image_url:
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80',
        alt_text: 'Presidential Suite - Grand Master Bedroom & Chandelier',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'img-4-2',
        room_id: 'a1b2c3d4-0004-4000-8000-000000000004',
        image_url:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
        alt_text: 'Presidential Suite - Private Living & Dining Area',
        is_primary: false,
        sort_order: 2,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'img-4-3',
        room_id: 'a1b2c3d4-0004-4000-8000-000000000004',
        image_url:
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80',
        alt_text: 'Presidential Suite - Spa Walk-In Bathroom',
        is_primary: false,
        sort_order: 3,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
    amenities: [
      'Expansive Master Bedroom',
      'Separate Palatial Living Room',
      'Private Dining Area',
      'Spa-Grade Walk-In Bathroom',
      'High-End European Fixtures',
      'Maximum Security & Keycard Access',
      'Executive Workspace & High-Speed Fiber',
      'VIP Butler & Concierge Support',
      'Complimentary Champagne & Breakfast',
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_AMENITIES: Amenity[] = [
  {
    id: 'b1c2d3e4-0001-4000-8000-000000000001',
    name: 'The Rooftop Lounge',
    slug: 'rooftop-lounge',
    description:
      'The signature nightlife and relaxation destination of Ijebu Ode. Host to weekend get-togethers, birthday celebrations, bachelorette events, girls’ nights, and the renowned "Itunu Awe Rooftop Dance Party". Features handcrafted cocktails, ambient lighting, and panoramic city night views.',
    category: 'entertainment',
    image_url:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    opening_hours: '5:00 PM – 2:00 AM Daily',
    status: 'active',
    sort_order: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'b1c2d3e4-0002-4000-8000-000000000002',
    name: 'Tahab Restaurant & Bar',
    slug: 'tahab-restaurant-bar',
    description:
      'Exquisite culinary experience offering the best of authentic Nigerian cuisine (including Ijebu specialties) alongside rich continental delicacies prepared by master chefs.',
    category: 'dining',
    image_url:
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    opening_hours: '6:30 AM – 11:00 PM Daily',
    status: 'active',
    sort_order: 2,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'b1c2d3e4-0003-4000-8000-000000000003',
    name: 'VIP & Private Lounges',
    slug: 'vip-private-lounges',
    description:
      'Secluded, acoustic-treated private rooms designed for high-profile conversations, private dinners, and executive networking with bespoke butler service.',
    category: 'dining',
    image_url:
      'https://images.unsplash.com/photo-1572177191856-3cde618dee1f?auto=format&fit=crop&w=1200&q=80',
    opening_hours: '24 Hours on Request',
    status: 'active',
    sort_order: 3,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'b1c2d3e4-0004-4000-8000-000000000004',
    name: 'Corporate Boardroom',
    slug: 'corporate-boardroom',
    description:
      'State-of-the-art meeting facility equipped with 4K interactive projection, teleconferencing systems, high-speed fiber internet, and executive leather seating for up to 25 delegates.',
    category: 'business',
    image_url:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    opening_hours: '8:00 AM – 9:00 PM',
    status: 'active',
    sort_order: 4,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'b1c2d3e4-0005-4000-8000-000000000005',
    name: 'In-House Fitness Center',
    slug: 'in-house-gym',
    description:
      'Modern cardio machines, free weights, resistance bands, and functional training gear to keep you energized and healthy throughout your stay.',
    category: 'wellness',
    image_url:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    opening_hours: '6:00 AM – 10:00 PM Daily',
    status: 'active',
    sort_order: 5,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'b1c2d3e4-0006-4000-8000-000000000006',
    name: 'Dry Cleaning & Express Laundry',
    slug: 'dry-cleaning-laundry',
    description:
      'Fast, meticulous garment care service ensuring your business suits and casual attire are immaculately pressed and returned on schedule.',
    category: 'general',
    image_url:
      'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=80',
    opening_hours: '7:00 AM – 8:00 PM Daily',
    status: 'active',
    sort_order: 6,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Boutique Architectural Facade',
    image_url:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    category: 'exterior',
    alt_text: 'Tahab Hotel 3-floor boutique exterior facade',
    sort_order: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'gal-2',
    title: 'Presidential Suite Master Living',
    image_url:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    category: 'rooms',
    alt_text: 'Presidential Suite Master Living area with chandelier',
    sort_order: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'gal-3',
    title: 'The Rooftop Lounge by Night',
    image_url:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    category: 'rooftop',
    alt_text: 'Rooftop party lounge with mood lighting',
    sort_order: 3,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'gal-4',
    title: 'Executive Boardroom',
    image_url:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    category: 'business',
    alt_text: 'Corporate meeting and conference room',
    sort_order: 4,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'gal-5',
    title: 'Culinary Delights at Tahab Restaurant',
    image_url:
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    category: 'dining',
    alt_text: 'Gourmet meal and wine service',
    sort_order: 5,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'gal-6',
    title: 'Executive Suite Solarium',
    image_url:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
    category: 'rooms',
    alt_text: 'Executive Suite spacious interior',
    sort_order: 6,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_MESSAGES: ContactMessage[] = [];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  name: HOTEL_DETAILS.name,
  tagline: HOTEL_DETAILS.tagline,
  address: HOTEL_DETAILS.address,
  phones: HOTEL_DETAILS.phones,
  email: HOTEL_DETAILS.email,
  instagram: HOTEL_DETAILS.instagram,
  instagram_handle: HOTEL_DETAILS.instagramHandle,
  facebook: HOTEL_DETAILS.facebook,
  facebook_handle: HOTEL_DETAILS.facebookHandle,
  check_in_time: HOTEL_DETAILS.checkInTime,
  check_out_time: HOTEL_DETAILS.checkOutTime,
  front_desk: HOTEL_DETAILS.frontDeskHours,
};
