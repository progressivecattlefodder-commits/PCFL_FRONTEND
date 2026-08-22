'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, Phone, ArrowRight } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { api } from '@/lib/api';
import { Product } from '@/types';
import IMAGE from '@/lib/assets';

const getProductImage = (product: Product, index: number = 0) => {
  if (product.image_url) return product.image_url;

  const identifier = `${product.slug || ''} ${product.name || ''}`.toLowerCase();

  if (identifier.includes('silage') || identifier.includes('bale')) {
    return IMAGE.product[1];
  }
  if (identifier.includes('mash') || identifier.includes('cow') || identifier.includes('feed')) {
    return IMAGE.product[2];
  }

  const imageKey = (index % 2) + 1;
  return IMAGE.product[imageKey as 1 | 2] || IMAGE.product[1];
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setNotFound(false);
    Promise.all([
      api.getPublicProduct(slug),
      api.getPublicProducts().catch(() => ({ success: false, data: [] })),
    ])
      .then(([prodRes, allRes]) => {
        if (prodRes.success) {
          setProduct(prodRes.data);
          if (allRes.success) {
            setRelated(
              allRes.data.filter((p: Product) => p.slug !== slug).slice(0, 3)
            );
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-80 bg-gray-200 rounded-2xl" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (notFound || !product) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-32 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">Product Not Found</h1>
          <p className="text-gray-500 mb-8">
            The product you're looking for doesn't exist or is no longer available.
          </p>
          <Link href="/products" className="btn-primary inline-flex">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Header */}
      <div className="bg-pcfi-green-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-pcfi-green-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <span className="bg-pcfi-gold-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {product.category}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">
            {product.name}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative h-80 lg:h-[28rem] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={getProductImage(product)}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            {product.short_description && (
              <p className="text-lg text-gray-600 font-medium mb-6 leading-relaxed">
                {product.short_description}
              </p>
            )}
            <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-8">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display font-bold text-gray-900 mb-4">Key Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-pcfi-green-600 mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <a href="tel:+9779802012000" className="btn-primary">
                <Phone className="w-4 h-4" /> Contact Us Now
              </a>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-pcfi-green-700 font-semibold hover:text-pcfi-green-800 transition-colors"
              >
                View Gallery <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p, idx) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="card group">
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={getProductImage(p, idx)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-pcfi-gold-600 font-semibold uppercase tracking-wide mb-1">
                      {p.category}
                    </p>
                    <h3 className="font-display font-bold text-gray-900 group-hover:text-pcfi-green-700 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}