// ==============================================================================
// TAHAB HOTEL & SUITES LTD — CONTACT & LOCATION PAGE
// ==============================================================================

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Clock,
  Send,
} from 'lucide-react';
import { HOTEL_DETAILS } from '../../constants';
import { contactFormSchema, type ContactFormValues } from '../../schemas';
import { sendContactMessage } from '../../services/api';
import { Button } from '../../components/common/Button';
import { useToast } from '../../contexts/ToastContext';
import { SEO } from '../../components/common/SEO';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await sendContactMessage({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        subject: data.subject,
        message: data.message,
      });
      showToast({
        type: 'success',
        title: 'Message Sent Successfully',
        message: 'Thank you for reaching out. Our front desk management team will get in touch shortly.',
      });
      reset();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Send',
        message: err?.message || 'Could not deliver your message. Please call our direct line.',
      });
    }
  };

  return (
    <div>
      <SEO
        title="Contact Us & Directions"
        description="Reach Tahab Hotel & Suites Ltd at 108, Benin–Ondo Road, Ijebu Ode, Ogun State. Phone: +234 704 350 5550."
      />

      {/* Hero Banner */}
      <section className="bg-emerald-950 text-warm-50 py-16 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold-400 block font-sans">
            Concierge & Inquiries
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Contact & Directions
          </h1>
          <div className="gold-divider mx-auto" />
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-300 leading-relaxed font-light">
            We are always here to assist with reservations, event bookings, boardroom reservations, and general inquiries in Ijebu Ode.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="section-tagline">Get In Touch</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-emerald-950">
                Tahab Hotel & Suites Ltd
              </h2>
              <div className="gold-divider !my-3" />
              <p className="text-sm text-stone-600 leading-relaxed">
                Experience soft luxury and premium hospitality. Reach us directly via phone, email, or visit our front desk.
              </p>
            </div>

            {/* Address Card */}
            <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-950 text-gold-400 rounded-sm shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Hotel Address
                  </h3>
                  <p className="text-sm font-semibold text-emerald-950 mt-1 leading-snug">
                    {HOTEL_DETAILS.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Phones Card */}
            <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-950 text-gold-400 rounded-sm shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Direct Phone Lines (24/7)
                  </h3>
                  <div className="flex flex-col mt-1 space-y-1">
                    {HOTEL_DETAILS.phones.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/\s/g, '')}`}
                        className="text-sm font-bold text-emerald-950 hover:text-gold-700 transition-colors"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Email & Front Desk */}
            <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-950 text-gold-400 rounded-sm shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Email Reservations
                  </h3>
                  <a
                    href={`mailto:${HOTEL_DETAILS.email}`}
                    className="text-sm font-semibold text-emerald-950 hover:text-gold-700 transition-colors mt-1 block"
                  >
                    {HOTEL_DETAILS.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-3 border-t border-stone-100">
                <div className="p-3 bg-emerald-950 text-gold-400 rounded-sm shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Front Desk Operations
                  </h3>
                  <p className="text-sm font-semibold text-emerald-950 mt-1">
                    {HOTEL_DETAILS.frontDeskHours}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Channels */}
            <div className="bg-emerald-950 text-warm-100 p-6 rounded-sm space-y-3 border border-emerald-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gold-400">
                Follow Us On Social Media
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href={HOTEL_DETAILS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-900 rounded-sm text-xs font-medium text-warm-50 hover:bg-gold-500 hover:text-emerald-950 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-gold-400" />
                  <span>{HOTEL_DETAILS.instagramHandle}</span>
                </a>
                <a
                  href={HOTEL_DETAILS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-900 rounded-sm text-xs font-medium text-warm-50 hover:bg-gold-500 hover:text-emerald-950 transition-colors"
                >
                  <Facebook className="w-4 h-4 text-gold-400" />
                  <span>{HOTEL_DETAILS.facebookHandle}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-10 rounded-sm border border-stone-200 shadow-md space-y-6">
              <div>
                <span className="section-tagline">Send A Message</span>
                <h3 className="font-serif text-2xl font-bold text-emerald-950">
                  We'd Love To Hear From You
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Fill out this form for general inquiries, event bookings, and corporate boardroom reservations.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      {...register('name')}
                      className="w-full px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      {...register('email')}
                      className="w-full px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+234 ..."
                      {...register('phone')}
                      className="w-full px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Subject *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rooftop Event Booking"
                      {...register('subject')}
                      className="w-full px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                    />
                    {errors.subject && (
                      <p className="text-xs text-rose-600">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Message Details *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your requirements, dates, or specific questions..."
                    {...register('message')}
                    className="w-full px-3.5 py-2.5 bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-stone-900"
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-600">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="md"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="w-full justify-center shadow-gold-sm py-3.5"
                >
                  Send Inquiry
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Google Maps Interactive Integration */}
        <div className="mt-16 bg-white p-4 rounded-sm border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="font-serif text-lg font-bold text-emerald-950">
                Hotel Location Map
              </h3>
              <p className="text-xs text-stone-500">
                108, Benin–Ondo Road, By Oludiya Junction, Ijebu Ode, Ogun State
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Ijebu+Ode+Benin+Ondo+Road+Nigeria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-gold-700 hover:text-emerald-950 uppercase tracking-wider"
            >
              Open in Google Maps ↗
            </a>
          </div>

          <div className="w-full h-80 rounded-sm overflow-hidden bg-stone-100 border border-stone-300">
            <iframe
              title="Tahab Hotel Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src="https://maps.google.com/maps?q=Ijebu%20Ode%20Benin%20Ondo%20Road&t=&z=14&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
