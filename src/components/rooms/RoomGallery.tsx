// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ROOM GALLERY COMPONENT
// ==============================================================================

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { RoomImage } from '../../types';

interface RoomGalleryProps {
  images: RoomImage[];
  roomName: string;
}

export const RoomGallery: React.FC<RoomGalleryProps> = ({ images, roomName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-stone-900 flex items-center justify-center text-stone-500 rounded-sm">
        No images available
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Showcase Image */}
      <div className="relative h-80 sm:h-96 md:h-[480px] w-full rounded-sm overflow-hidden bg-stone-950 group">
        <img
          src={currentImage.image_url}
          alt={currentImage.alt_text || `${roomName} - View ${selectedIndex + 1}`}
          className="w-full h-full object-cover object-center transition-all duration-500"
        />

        {/* Top Badges & Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setLightboxOpen(true)}
            className="p-2 rounded-sm bg-black/60 text-warm-100 hover:text-gold-400 hover:bg-black/80 backdrop-blur-sm transition-all"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-sm bg-black/50 text-warm-100 hover:bg-gold-500 hover:text-emerald-950 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-sm bg-black/50 text-warm-100 hover:bg-gold-500 hover:text-emerald-950 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 text-xs text-warm-100 rounded-sm font-medium">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-sm overflow-hidden border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-gold-500 ring-2 ring-gold-400/40 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.image_url}
                alt={img.alt_text || 'Room thumbnail'}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 animate-fade-in">
          <div className="flex items-center justify-between text-warm-100 mb-4">
            <h4 className="font-serif text-lg text-gold-400 font-bold">{roomName}</h4>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 text-stone-400 hover:text-warm-100 transition-colors"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center max-h-[80vh]">
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || roomName}
              className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 p-3 rounded-full bg-black/60 text-warm-100 hover:bg-gold-500 hover:text-emerald-950 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 p-3 rounded-full bg-black/60 text-warm-100 hover:bg-gold-500 hover:text-emerald-950 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="text-center text-xs text-stone-400 mt-4">
            Image {selectedIndex + 1} of {images.length}
          </div>
        </div>
      )}
    </div>
  );
};
