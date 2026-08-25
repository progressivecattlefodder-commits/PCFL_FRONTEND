'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, ArrowRight, Leaf, Award, Users, CheckCircle } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { api } from '@/lib/api';
import { HeroSection, Product, ContentBlock } from '@/types';
import IMAGE from '@/lib/assets';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: any;
  }
}

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

const VIDEO_URL = 'https://youtu.be/22X1PbQf9J4';

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : '22X1PbQf9J4';
}

const getProductImage = (product: Product, index: number) => {
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

function HeroBackgroundVideo({ videoUrl }: { videoUrl: string }) {
  const videoId = getYouTubeId(videoUrl);
  const playerRef = useRef<any>(null);
  const [isApiReady, setIsApiReady] = useState(false);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };
  }, []);

  useEffect(() => {
    if (!isApiReady) return;

    playerRef.current = new window.YT.Player(`yt-bg-player-${videoId}`, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1,
        loop: 1,
        playlist: videoId,
      },
      events: {
        onReady: (event: any) => {
          event.target.playVideo();
        },
      },
    });

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [isApiReady, videoId]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div id={`yt-bg-player-${videoId}`} className="w-full h-full object-cover scale-125" />
    </div>
  );
}

export default function HomePage() {
  const [hero, setHero] = useState<HeroSection>(fallbackHero);
  const [products, setProducts] = useState<Product[]>([]);
  const [aboutContent, setAboutContent] = useState<ContentBlock[]>([]);
  const [chairmanMsg, setChairmanMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    Promise.all([
      api.getHero().catch(() => ({ success: false })),
      api.getPublicProducts().catch(() => ({ success: false, data: [] })),
      api.getAbout().catch(() => ({ success: false, data: [] })),
    ])
      .then(([heroRes, productsRes, aboutRes]) => {
        if (heroRes.success && heroRes.data) setHero(heroRes.data);
        if (productsRes.success) setProducts(productsRes.data);
        if (aboutRes.success) {
          setAboutContent(aboutRes.data);
          const chairman = aboutRes.data.find((b: ContentBlock) => b.key === 'chairman_message');
          if (chairman) setChairmanMsg(chairman.content);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <PublicLayout>
      {/* Full-Screen Hero Section with Undimmed Background Video */}
      <section className="relative min-h-[90vh] flex items-center bg-pcfi-green-900 overflow-hidden py-16 lg:py-24">
        {/* Full Hero Background Video */}
        <HeroBackgroundVideo videoUrl={VIDEO_URL} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-none">
          <div className="max-w-3xl pointer-events-auto">
            <div className="inline-flex items-center gap-2 bg-pcfi-gold-500/30 border border-pcfi-gold-400/50 rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
              <Leaf className="w-3.5 h-3.5 text-pcfi-gold-400" />
              <span className="text-pcfi-gold-300 text-xs font-medium">Healthy Cow, Happy Farmer!</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              {hero.heading}
            </h1>
            <p className="text-white text-lg md:text-xl mb-8 leading-relaxed max-w-2xl drop-shadow-md">
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

        {/* Floating Stats Bar */}
        <div className="absolute bottom-6 right-8 hidden xl:flex gap-4 z-10 pointer-events-none">
          {[
            { val: '6+', label: 'Years Experience' },
            { val: '100%', label: 'Natural Feed' },
            { val: '500+', label: 'Happy Farmers' },
          ].map((stat) => (
            <div key={stat.label} className="bg-black/50 backdrop-blur-md rounded-xl px-5 py-3 text-center border border-white/20">
              <p className="text-pcfi-gold-300 text-xl font-bold font-display">{stat.val}</p>
              <p className="text-white text-[10px] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="section-subheading">Our Premium Feed Solutions</p>
              <h2 className="section-heading text-3xl md:text-4xl">Featured Products</h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-pcfi-green-700 font-semibold hover:text-pcfi-green-900 transition-colors"
            >
              View Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Filters */}
          {categories.length > 1 && (
            <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-pcfi-green-700 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3" />
                    <div className="h-3 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-gray-100">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, idx) => (
                <div
                  key={product.id || idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  <div className="relative h-56 w-full bg-gray-100">
                    <Image
                      src={getProductImage(product, idx)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-pcfi-green-700/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {product.short_description || product.description}
                      </p>

                      {product.features && product.features.length > 0 && (
                        <ul className="space-y-1.5 mb-6">
                          {product.features.slice(0, 2).map((feat, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                              <CheckCircle className="w-3.5 h-3.5 text-pcfi-green-600 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="btn-primary w-full text-center justify-center mt-2 text-sm"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Chairman Message */}
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
                To provide farmers with innovative, reliable, and sustainable silage solutions that enhance livestock health, increase productivity, and secure a brighter agricultural future.
              </p>
            </div>
            <div className="bg-pcfi-green-700/50 border border-pcfi-green-600 rounded-2xl p-8">
              <div className="w-12 h-12 bg-pcfi-gold-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-pcfi-gold-300 mb-3">Our Vision</h3>
              <p className="text-pcfi-green-100 leading-relaxed text-sm">
                To be recognized as Nepal’s most trusted provider of cattle feed solutions — setting new standards for quality, sustainability, and customer satisfaction across the agricultural sector.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
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
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}