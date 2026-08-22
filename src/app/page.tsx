'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, ArrowRight, Leaf, Award, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { api } from '@/lib/api';
import { HeroSection, Product, ContentBlock } from '@/types';
import { IMAGE } from '@/lib/assets';

const fallbackHero: HeroSection = {
  id: '',
  heading: 'Welcome to Progressive Cattle Fodder Industries',
  subheading: "Nepal's First Livestock Feed Manufacturer",
  description:
    'We provide premium-quality corn silage and feed solutions for your livestock — fresh, nutritious, and sustainable.',
  primary_cta_text: 'Contact Us Now',
  primary_cta_link: '/contact',
  secondary_cta_text: 'Explore More',
  secondary_cta_link: '/products',
  background_image_url: '',
  is_active: true,
  updated_at: '',
};

export default function HomePage() {
  const [hero, setHero] = useState<HeroSection>(fallbackHero);
  const [products, setProducts] = useState<Product[]>([]);
  const [aboutContent, setAboutContent] = useState<ContentBlock[]>([]);
  const [chairmanMsg, setChairmanMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Slideshow state
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      api.getHero().catch(() => ({ success: false })),
      api.getPublicProducts().catch(() => ({ success: false, data: [] })),
      api.getAbout().catch(() => ({ success: false, data: [] })),
    ]).then(([heroRes, productsRes, aboutRes]) => {
      if (heroRes.success && heroRes.data) setHero(heroRes.data);
      if (productsRes.success) setProducts(productsRes.data);
      if (aboutRes.success) {
        setAboutContent(aboutRes.data);
        const chairman = aboutRes.data.find((b: ContentBlock) => b.key === 'chairman_message');
        if (chairman) setChairmanMsg(chairman.content);
      }
    }).finally(() => setIsLoading(false));
  }, []);

  // Slideshow Interval (6-second hold time)
  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % products.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [products.length]);

  const activeProduct = products[currentProductIndex];
  const heroBgImage = hero.background_image_url || IMAGE.background;

  const handleNextProduct = () => {
    setCurrentProductIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrevProduct = () => {
    setCurrentProductIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-pcfi-green-900 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroBgImage}
            alt={hero.heading || "Cattle farm"}
            fill
            className="object-cover opacity-100"
            priority
            unoptimized={Boolean(hero.background_image_url)}
          />
          <div className="absolute inset-0 bg-hero-gradient" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-pcfi-gold-500/20 border border-pcfi-gold-400/40 rounded-full px-4 py-1.5 mb-6">
              <Leaf className="w-3.5 h-3.5 text-pcfi-gold-400" />
              <span className="text-pcfi-gold-300 text-xs font-medium">Healthy Cow, Happy Farmer!</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {hero.heading}
            </h1>
            <p className="text-pcfi-green-100 text-lg md:text-xl mb-8 leading-relaxed">
              {hero.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={hero.primary_cta_link} className="btn-primary">
                <Phone className="w-4 h-4" />
                {hero.primary_cta_text}
              </Link>
              <Link href={hero.secondary_cta_link} className="btn-secondary">
                {hero.secondary_cta_text}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Floating stats */}
        <div className="absolute bottom-8 right-8 hidden lg:flex gap-4">
          {[
            { val: '6+', label: 'Years Experience' },
            { val: '100%', label: 'Natural Feed' },
            { val: '500+', label: 'Happy Farmers' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 text-center border border-white/20">
              <p className="text-pcfi-gold-300 text-2xl font-bold font-display">{stat.val}</p>
              <p className="text-white text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Product Slideshow Section */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center md:text-left mb-4">
            <p className="section-subheading">Our Featured Products</p>
          </div>

          {activeProduct ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[380px]">
              {/* Product Details (Animated cross-fade key) */}
              <div key={`info-${activeProduct.id || currentProductIndex}`} className="transition-all duration-700 ease-in-out">
                <h2 className="section-heading text-3xl font-bold text-gray-900 mb-4">
                  {activeProduct.name}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {activeProduct.short_description ||
                    'High-quality, balanced nutrition formulated specifically to enhance livestock health and overall yield.'}
                </p>
                <div className="flex items-center gap-4">
                  <Link href={`/products/${activeProduct.slug || ''}`} className="btn-primary">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/products" className="text-sm font-semibold text-pcfi-green-700 hover:text-pcfi-green-900 transition-colors">
                    View All Products
                  </Link>
                </div>
              </div>

              {/* Product Visual Container */}
              <div className="relative">
                <div key={`img-${activeProduct.id || currentProductIndex}`} className="relative h-80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ease-in-out">
                  <Image
                    src={
                      activeProduct.image_url ||
                      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800'
                    }
                    alt={activeProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Manual Navigation Arrows */}
                {products.length > 1 && (
                  <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex justify-between px-4 pointer-events-none">
                    <button
                      onClick={handlePrevProduct}
                      className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-all"
                      aria-label="Previous Product"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextProduct}
                      className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-all"
                      aria-label="Next Product"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Loading products...
            </div>
          )}

          {/* Pagination Indicators / Slide Dots */}
          {products.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentProductIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentProductIndex
                      ? 'w-8 bg-pcfi-green-700'
                      : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Chairman message */}
      <section className="py-16 bg-pcfi-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-subheading">Leadership</p>
              <h2 className="section-heading">Message from our Chairman</h2>
              <blockquote className="text-gray-700 text-lg leading-relaxed italic border-l-4 border-pcfi-gold-500 pl-6 mb-6">
                {chairmanMsg ||
                  '"At PCFL, we are driven by a mission to empower farmers with sustainable, high-quality fodder solutions."'}
              </blockquote>
              <p className="text-pcfi-green-700 font-semibold">— Mr. Gopal Thapa, Chairman</p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-48 h-56 bg-pcfi-green-200 rounded-2xl" />
                <div className="absolute -top-4 -left-4 w-48 h-56 rounded-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-44 h-52 rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src={IMAGE.chairman}
                      alt="Chairman"
                      width={192}
                      height={240}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-pcfi-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-pcfi-gold-400 font-semibold text-sm uppercase tracking-widest mb-2">Who We Are</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Our Mission & Vision</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-pcfi-green-700/50 border border-pcfi-green-600 rounded-2xl p-8">
              <div className="w-12 h-12 bg-pcfi-gold-500 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-pcfi-gold-300 mb-3">Our Mission</h3>
              <p className="text-pcfi-green-100 leading-relaxed text-sm">
                To provide farmers with innovative, reliable, and sustainable silage solutions that enhance livestock health, increase productivity, and secure a brighter agricultural future.              </p>
            </div>
            <div className="bg-pcfi-green-700/50 border border-pcfi-green-600 rounded-2xl p-8">
              <div className="w-12 h-12 bg-pcfi-gold-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-pcfi-gold-300 mb-3">Our Vision</h3>
              <p className="text-pcfi-green-100 leading-relaxed text-sm">
               To be recognized as Nepal’s most trusted provider of cattle feed solutions — setting new standards for quality, sustainability, and customer satisfaction across the agricultural sector.              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-pcfi-gold-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to improve your livestock's nutrition and increase your production?
          </h2>
          <p className="text-white/80 mb-6">
            Contact us today and let our experts help you choose the right feed solution.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-white text-pcfi-gold-600 font-bold px-8 py-3 rounded-lg hover:bg-pcfi-green-50 transition-colors">
            View Our Products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}