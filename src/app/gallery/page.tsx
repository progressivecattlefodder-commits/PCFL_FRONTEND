'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ImageOff } from 'lucide-react';

import PublicLayout from '@/components/layout/PublicLayout';
import { api } from '@/lib/api';
import type { GalleryItem } from '@/types';

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api
      .getPublicGallery()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setItems(res.data);
        } else if (Array.isArray(res)) {
          setItems(res as unknown as GalleryItem[]);
        } else {
          setItems([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load gallery items:', err);
        setItems([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const categories = [
    'All',
    ...Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
  ];

  const filtered =
    activeCategory === 'All'
      ? items
      : items.filter((i) => i.category === activeCategory);

  return (
    <PublicLayout>
      {/* Header Banner */}
      <div className="bg-pcfi-green-800 py-16 text-center">
        <p className="text-pcfi-gold-400 font-semibold text-sm uppercase tracking-widest mb-2">
          Visual Stories
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
          Our Gallery
        </h1>
        <p className="text-pcfi-green-200 mt-3 max-w-xl mx-auto text-sm px-4">
          A glimpse into our production facility, farm visits, and the happy farmers we serve.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="bg-white sticky top-16 z-30 border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 py-3 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat || 'All'}
                  onClick={() => setActiveCategory(cat || 'All')}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === (cat || 'All')
                      ? 'bg-pcfi-green-700 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="py-16 bg-gray-50 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
              No gallery items available in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item) => {
                const hasValidImage = item.image_url && !failedImages[item.id];

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gray-100 text-left"
                  >
                    {hasValidImage ? (
                      <Image
                        src={item.image_url}
                        alt={item.title || 'Gallery Item'}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1 bg-gray-100">
                        <ImageOff className="w-8 h-8 text-gray-300" />
                        <span>No image available</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <p className="text-white text-sm font-semibold truncate">
                        {item.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-pcfi-gold-300 z-10 transition-colors"
            onClick={() => setSelected(null)}
            aria-label="Close modal"
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-96 md:h-[70vh] rounded-xl overflow-hidden bg-black/40">
              {selected.image_url && !failedImages[selected.id] ? (
                <Image
                  src={selected.image_url}
                  alt={selected.title || 'Gallery Preview'}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                  <ImageOff className="w-12 h-12 text-gray-500" />
                  <span>Image preview unavailable</span>
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-semibold">
                {selected.title}
              </h3>

              {selected.description && (
                <p className="text-gray-300 mt-1 text-sm max-w-2xl mx-auto">
                  {selected.description}
                </p>
              )}

              {selected.category && (
                <span className="inline-block mt-3 bg-pcfi-green-700 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {selected.category}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
