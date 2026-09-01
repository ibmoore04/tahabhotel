// ==============================================================================
// TAHAB HOTEL & SUITES LTD — SEO & STRUCTURED DATA HEAD COMPONENT
// ==============================================================================

import React, { useEffect } from 'react';
import { HOTEL_DETAILS } from '../../constants';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  roomDetails?: {
    name: string;
    description: string;
    price: number;
    currency?: string;
    image: string;
  };
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = HOTEL_DETAILS.tagline + ' — ' + HOTEL_DETAILS.subheadline,
  image = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  canonical,
  roomDetails,
}) => {
  const fullTitle = title
    ? `${title} | ${HOTEL_DETAILS.name}`
    : `${HOTEL_DETAILS.name} — Luxury Boutique Hotel & Suites in Ijebu Ode`;

  useEffect(() => {
    document.title = fullTitle;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // OpenGraph
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('og:title', fullTitle);
    setMeta('og:description', description);
    setMeta('og:image', image);
    setMeta('og:type', 'website');
    setMeta('og:site_name', HOTEL_DETAILS.name);

    // Hotel Schema JSON-LD
    const hotelSchema = {
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      name: HOTEL_DETAILS.name,
      description: description,
      image: image,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '108, Benin–Ondo Road, By Oludiya Junction',
        addressLocality: 'Ijebu Ode',
        addressRegion: 'Ogun State',
        addressCountry: 'NG',
      },
      telephone: HOTEL_DETAILS.phones[0],
      priceRange: '₦35,000 - ₦150,000',
      starRating: {
        '@type': 'Rating',
        ratingValue: '4.9',
      },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: '24/7 Power Supply', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Rooftop Lounge', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Restaurant & Bar', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Corporate Boardroom', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Free Wi-Fi', value: true },
      ],
    };

    let scriptTag = document.getElementById('schema-hotel-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-hotel-jsonld';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(hotelSchema);
  }, [fullTitle, description, image, canonical, roomDetails]);

  return null;
};
