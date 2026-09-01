// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ADMIN GALLERY MANAGEMENT
// ==============================================================================

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image, Plus, Trash2, Maximize2 } from 'lucide-react';
import { getGallery } from '../../../services/api';
import { GalleryItem } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { Badge } from '../../../components/common/StatusBadge';

export const AdminGalleryPage: React.FC = () => {
  const { data: gallery, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => getGallery(),
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-emerald-950">
            Hotel Media & Photo Gallery
          </h1>
          <p className="text-xs text-stone-500">
            Showcase images for building facade, suites, rooftop lounge, boardroom, and restaurant.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : gallery && gallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden group"
            >
              <div className="relative h-52 w-full bg-stone-900 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="gold" className="bg-emerald-950/90 text-gold-400 text-[10px]">
                    {item.category.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-emerald-950 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 truncate max-w-[220px]">
                    {item.alt_text || item.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No gallery images available" />
      )}
    </div>
  );
};
