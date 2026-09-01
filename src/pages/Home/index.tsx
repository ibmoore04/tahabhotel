// ==============================================================================
// TAHAB HOTEL & SUITES LTD — HOMEPAGE
// ==============================================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Crown,
  Sparkles,
  Zap,
  ShieldCheck,
  Coffee,
  PartyPopper,
  Utensils,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getRooms } from '../../services/api';
import { Button } from '../../components/common/Button';
import { SectionHeading } from '../../components/common/Skeleton';
import { RoomCard } from '../../components/rooms/RoomCard';
import { RoomCardSkeleton } from '../../components/common/Skeleton';
import { SEO } from '../../components/common/SEO';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [heroCheckIn, setHeroCheckIn] = useState(todayStr);
  const [heroCheckOut, setHeroCheckOut] = useState(tomorrowStr);
  const [heroGuests, setHeroGuests] = useState('2');

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms(),
  });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/book?checkIn=${heroCheckIn}&checkOut=${heroCheckOut}&guests=${heroGuests}`);
  };

  return (
    <div className="space-y-0">
      <SEO />

      {/* ------------------------------------------------------------------------
           1. HERO SECTION
      ------------------------------------------------------------------------ */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center bg-emerald-950 overflow-hidden pb-20 pt-20 sm:pb-24">
        {/* Hero Background Image with Rich Emerald Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=85"
            alt="Tahab Hotel & Suites Boutique Exterior"
            className="w-full h-full object-cover object-center brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/80 to-emerald-950/40" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6 mt-2 sm:mt-4">
          {/* Soft Luxury Tag */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-900/80 border border-gold-500/40 text-gold-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] font-semibold backdrop-blur-md shadow-gold-sm animate-fade-in">
            <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Soft Luxury Boutique Hotel</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-warm-50 tracking-tight leading-[1.1] drop-shadow-md">
            Experience Soft Luxury in the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600">
              Heart of Ijebu Ode
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-stone-200 leading-relaxed font-light drop-shadow">
            Three floors of contemporary boutique design, premium comfort, 24/7 uninterrupted power, and unparalleled hospitality.
          </p>

          {/* Action CTAs - Mobile optimized stacking */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link to="/book" className="w-full sm:w-auto">
              <Button variant="gold" size="lg" className="w-full sm:w-auto shadow-gold-md min-h-[48px]">
                Book A Room
              </Button>
            </Link>
            <Link to="/rooms" className="w-full sm:w-auto">
              <Button variant="outline-white" size="lg" className="w-full sm:w-auto min-h-[48px]">
                Explore Our Suites
              </Button>
            </Link>
          </div>

          {/* Floating Booking Quick Bar - Mobile Optimized */}
          <div className="mt-6 sm:mt-12 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-xl p-3 sm:p-4 md:p-6 rounded-sm shadow-2xl border border-gold-500/30 text-left max-w-4xl mx-auto">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-500 mb-3 sm:mb-4">Quick Search</p>
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5 sm:mb-2">
                  Check-In
                </label>
                <input
                  type="date"
                  value={heroCheckIn}
                  min={todayStr}
                  onChange={(e) => setHeroCheckIn(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs bg-warm-50 dark:bg-charcoal-800 border border-stone-300 dark:border-stone-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-stone-900 dark:text-warm-100 font-medium min-h-[44px] sm:min-h-0"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5 sm:mb-2">
                  Check-Out
                </label>
                <input
                  type="date"
                  value={heroCheckOut}
                  min={heroCheckIn}
                  onChange={(e) => setHeroCheckOut(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs bg-warm-50 dark:bg-charcoal-800 border border-stone-300 dark:border-stone-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-stone-900 dark:text-warm-100 font-medium min-h-[44px] sm:min-h-0"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5 sm:mb-2">
                  Guests
                </label>
                <select
                  value={heroGuests}
                  onChange={(e) => setHeroGuests(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs bg-warm-50 dark:bg-charcoal-800 border border-stone-300 dark:border-stone-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-stone-900 dark:text-warm-100 font-medium min-h-[44px] sm:min-h-0"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              <div>
                <Button type="submit" variant="gold" size="md" className="w-full justify-center sm:h-auto min-h-[44px]">
                  <span className="hidden sm:inline">Check Availability</span>
                  <span className="sm:hidden">Search</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* WELCOME SECTION */}
      <section className="py-10 sm:py-16 md:py-20 lg:py-28 bg-warm-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 lg:space-y-6">
              <span className="section-tagline">Welcome To Tahab</span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-950 leading-tight">
                Where Modern Luxury Meets Serene Comfort
              </h2>
              <div className="gold-divider !my-3" />
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Nestled on the vibrant Benin–Ondo corridor in Ijebu Ode, Tahab Hotel & Suites Ltd redefines boutique hospitality in Ogun State. Across three architecturally designed floors, every room, suite, and social space is curated to provide a peaceful oasis for travelers, dignitaries, and celebration seekers.
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Whether you are visiting for an executive retreat, a weekend getaway, or our famous rooftop evening events, our team delivers attentive service, uncompromising privacy, and seamless comfort.
              </p>

              <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6">
                <div className="border-l-2 border-gold-500 pl-3 sm:pl-4">
                  <span className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-emerald-950 block">3 Floors</span>
                  <span className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-wider">Boutique Architecture</span>
                </div>
                <div className="border-l-2 border-gold-500 pl-3 sm:pl-4">
                  <span className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-emerald-950 block">24/7</span>
                  <span className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-wider">Uninterrupted Power</span>
                </div>
                <div className="border-l-2 border-gold-500 pl-3 sm:pl-4">
                  <span className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-emerald-950 block">100%</span>
                  <span className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-wider">Bespoke Comfort</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative mt-4 lg:mt-0">
              <div className="relative rounded-sm overflow-hidden shadow-2xl border-2 border-stone-200/80">
                <img
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
                  alt="Tahab Hotel Interior Design"
                  className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[420px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 lg:-bottom-8 -left-2 sm:-left-4 lg:-left-8 w-40 sm:w-48 lg:w-60 bg-emerald-950 text-warm-50 p-3 sm:p-4 lg:p-5 rounded-sm border border-gold-500/40 shadow-xl">
                <div className="flex items-center gap-1 text-gold-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="font-serif text-xs sm:text-sm font-semibold">Premium Hospitality</p>
                <p className="text-[10px] sm:text-[11px] text-stone-300 mt-1">Ijebu Ode, Ogun State</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          3. WHY CHOOSE TAHAB
      ------------------------------------------------------------------------ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-warm-200/80 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            tagline="The Tahab Advantage"
            title="Why Choose Tahab Hotel & Suites"
            subtitle="Built from the ground up to ensure every guest enjoys peace of mind, immaculate service, and luxury amenities."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-sm border border-stone-200/90 hover:border-gold-500/60 hover:shadow-luxury transition-all space-y-3 sm:space-y-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-emerald-950 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-emerald-950">
                24/7 Uninterrupted Power
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Guaranteed continuous power with dual industrial backup generators. Never worry about outages or climate discomfort.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-sm border border-stone-200/90 hover:border-gold-500/60 hover:shadow-luxury transition-all space-y-3 sm:space-y-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-emerald-950 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-emerald-950">
                Premium Security & Service
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Round-the-clock trained security personnel, electronic keycard locks, CCTV coverage, and 24/7 front desk assistance.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-sm border border-stone-200/90 hover:border-gold-500/60 hover:shadow-luxury transition-all space-y-3 sm:space-y-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-emerald-950 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-emerald-950">
                Exquisite Social Spaces
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Home to the renowned Rooftop Lounge, VIP chambers, private solarium, and culinary dining spaces for celebrations.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-sm border border-stone-200/90 hover:border-gold-500/60 hover:shadow-luxury transition-all space-y-3 sm:space-y-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-emerald-950 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-emerald-950">
                Complimentary Breakfast
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Awaken every morning to freshly prepared Nigerian delicacies and continental breakfast favorites included in your stay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          4. FEATURED ROOMS & SUITES
      ------------------------------------------------------------------------ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-warm-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 lg:mb-12 gap-4">
            <div>
              <span className="section-tagline">Accommodations</span>
              <h2 className="section-heading">Featured Rooms & Suites</h2>
              <div className="gold-divider !mr-auto" />
            </div>
            <Link to="/rooms" className="sm:self-end">
              <Button variant="outline-gold" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Categories
              </Button>
            </Link>
          </div>

          {roomsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <RoomCardSkeleton />
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {rooms?.slice(0, 3).map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          5. ROOFTOP EXPERIENCE SHOWCASE
      ------------------------------------------------------------------------ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-emerald-950 text-warm-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
            alt="Rooftop party ambiance"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 lg:space-y-6">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] sm:tracking-[0.25em] text-gold-400 block font-sans">
                Nightlife & Celebrations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-warm-50 leading-tight">
                The Rooftop Lounge
              </h2>
              <div className="gold-divider" />
              <p className="text-stone-300 leading-relaxed text-sm sm:text-base md:text-lg">
                Perched high above Ijebu Ode, The Rooftop Lounge at Tahab Hotel is the premier social destination for weekend get-togethers, birthday celebrations, bachelorette events, and vibrant girls' nights out.
              </p>
              <p className="text-stone-300 leading-relaxed text-xs sm:text-sm md:text-base">
                Join us for the renowned <strong className="text-gold-400">"Itunu Awe Rooftop Dance Party"</strong> and special holiday events featuring top DJs, craft signature cocktails, and unmatched panoramic views.
              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 text-[10px] sm:text-xs text-stone-200">
                <div className="bg-emerald-900/80 p-2 sm:p-3 rounded-sm border border-emerald-800 flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
                  <span>Birthday Parties</span>
                </div>
                <div className="bg-emerald-900/80 p-2 sm:p-3 rounded-sm border border-emerald-800 flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
                  <span>Bachelorettes</span>
                </div>
                <div className="bg-emerald-900/80 p-2 sm:p-3 rounded-sm border border-emerald-800 flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
                  <span>Girls' Nights</span>
                </div>
              </div>

              <div className="pt-3 sm:pt-4">
                <Link to="/amenities">
                  <Button variant="gold" size="md">
                    Explore Rooftop & Amenities
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 mt-6 lg:mt-0">
              <div className="rounded-sm overflow-hidden border-2 border-gold-500/40 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                  alt="Rooftop lounge experience"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          6. RESTAURANT & CUISINE
      ------------------------------------------------------------------------ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-warm-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-sm overflow-hidden shadow-2xl border border-stone-200">
                <img
                  src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Tahab Restaurant Fine Dining"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4 sm:space-y-5 lg:space-y-6">
              <span className="section-tagline">Gastronomy</span>
              <h2 className="section-heading">Tahab Restaurant & Bar</h2>
              <div className="gold-divider !mr-auto" />
              <p className="text-stone-600 leading-relaxed text-sm sm:text-base md:text-lg">
                Indulge in a rich culinary journey crafted by expert chefs. We blend beloved local Ijebu delicacies and Nigerian classics with exquisite continental cuisine in an elegant, ambient dining room.
              </p>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-stone-700">
                <li className="flex items-center gap-2 sm:gap-3">
                  <Utensils className="w-4 h-4 text-gold-600 shrink-0" />
                  <span>Freshly prepared local specialties & continental grills</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <Utensils className="w-4 h-4 text-gold-600 shrink-0" />
                  <span>Curated wine list, artisanal cocktails & fresh juices</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <Utensils className="w-4 h-4 text-gold-600 shrink-0" />
                  <span>In-room private dining service available 24/7</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link to="/contact">
                  <Button variant="outline-gold" size="md">
                    Reserve A Table
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          7. CORPORATE & BUSINESS EXPERIENCE
      ------------------------------------------------------------------------ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-warm-200/80 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            tagline="Business & Events"
            title="Corporate Boardroom & Private Lounges"
            subtitle="Equipped for executive board meetings, corporate retreats, strategic planning sessions, and private diplomatic discussions."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-sm border border-stone-200 space-y-2 sm:space-y-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-emerald-950">Executive Boardroom</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Interactive 4K projection screens, teleconferencing microphones, high-speed fiber internet, and executive leather seating for 25 delegates.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-sm border border-stone-200 space-y-2 sm:space-y-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-emerald-950">VIP & Private Lounges</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Acoustic-treated private suites tailored for confidential conversations, private dining, and high-level negotiations.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-sm border border-stone-200 space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
              <h3 className="font-serif text-base sm:text-lg font-bold text-emerald-950">Executive Butler Service</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Dedicated corporate concierge staff handling refreshments, itinerary coordination, and printing needs during your session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          8. FINAL CTA BANNER
      ------------------------------------------------------------------------ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-emerald-950 text-warm-50 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-dark-overlay pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 space-y-5 sm:space-y-6">
          <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-gold-400 mx-auto" />
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Your Stay Deserves More Than A Room
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-stone-300 leading-relaxed font-light">
            Book directly with Tahab Hotel & Suites Ltd to receive our best rate guarantee, complimentary breakfast, and seamless boutique hospitality in Ijebu Ode.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
            <Link to="/book" className="w-full sm:w-auto">
              <Button variant="gold" size="lg" className="w-full sm:w-auto shadow-gold-md min-h-[48px]">
                Book Your Stay
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button variant="outline-white" size="lg" className="w-full sm:w-auto min-h-[48px]">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
