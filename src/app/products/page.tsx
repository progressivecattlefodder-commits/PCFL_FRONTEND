'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { api } from '@/lib/api';
import { Product } from '@/types';
import IMAGE from '@/lib/assets';

// Differentiates products based on slug or name, not just generic category
const getProductImage = (product: Product, index: number) => {
  if (product.image_url) return product.image_url;

  const identifier = `${product.slug || ''} ${product.name || ''}`.toLowerCase();

  if (identifier.includes('silage') || identifier.includes('bale')) {
    return IMAGE.product[1];
  }
  if (identifier.includes('mash') || identifier.includes('cow') || identifier.includes('feed')) {
    return IMAGE.product[2];
  }

  // Fallback indexing
  const imageKey = (index % 2) + 1;
  return IMAGE.product[imageKey as 1 | 2] || IMAGE.product[1];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    api
      .getPublicProducts()
      .then((res) => {
        if (res.success) setProducts(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <PublicLayout>
      {/* Page Header */}
      <div className="bg-pcfi-green-800 py-16 text-center">
        <p className="text-pcfi-gold-400 font-semibold text-sm uppercase tracking-widest mb-2">
          What We Offer
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
          Products & Services
        </h1>
        <p className="text-pcfi-green-200 mt-3 max-w-xl mx-auto text-sm">
          Scientifically formulated feed solutions designed to maximize your livestock's health and productivity.
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white sticky top-16 z-30 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-pcfi-green-700 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3" />
                    <div className="h-3 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No products found.</div>
          ) : (
            <div className="space-y-12">
              {filtered.map((product, idx) => (
                <div
                  key={product.id}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${
                    idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="relative h-72 rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src={getProductImage(product, idx)}
                        alt={product.name}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-pcfi-green-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                    <p className="section-subheading">{product.category}</p>
                    <h2 className="section-heading">{product.name}</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {product.short_description || product.description.slice(0, 200) + '...'}
                    </p>
                    {product.features && product.features.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {product.features.slice(0, 4).map((feat, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-pcfi-green-600 shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link href={`/products/${product.slug}`} className="btn-primary">
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}