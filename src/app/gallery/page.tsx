'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { api } from '@/lib/api';
import { GalleryItem } from '@/types';

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    api.getPublicGallery()
      .then((res) => { if (res.success) setItems(res.data); })
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];
  const filtered = activeCategory === 'All'
    ? items
    : items.filter((i) => i.category === activeCategory);

  return (
    <PublicLayout>
      <div className="bg-pcfi-green-800 py-16 text-center">
        <p className="text-pcfi-gold-400 font-semibold text-sm uppercase tracking-widest mb-2">Visual Stories</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Our Gallery</h1>
        <p className="text-pcfi-green-200 mt-3 max-w-xl mx-auto text-sm">
          A glimpse into our production facility, farm visits, and the happy farmers we serve.
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white sticky top-16 z-30 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat || 'All')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === (cat || 'All')
                    ? 'bg-pcfi-green-700 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-3">
                    <p className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-pcfi-gold-300 z-10"
            onClick={() => setSelected(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-96 md:h-[70vh] rounded-xl overflow-hidden">
              <Image
                src={selected.image_url}
                alt={selected.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-semibold">{selected.title}</h3>
              {selected.description && (
                <p className="text-gray-300 mt-1 text-sm">{selected.description}</p>
              )}
              {selected.category && (
                <span className="inline-block mt-2 bg-pcfi-green-700 text-white text-xs px-3 py-1 rounded-full">
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