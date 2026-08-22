'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, Images } from 'lucide-react';
import { clsx } from 'clsx';
import { IMAGE } from '@/lib/assets';

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Products and Services',
    href: '/products',
    children: [
      { label: 'Cattle Feed', href: '/products`' },
      { label: 'Mash Cattle Feed', href: '/products' },
    ],
  },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About Us', href: '/about' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-pcfi-green-800 shadow-lg'
          : 'bg-pcfi-green-800/95 backdrop-blur-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 ">
        <div className="flex items-center  h-16">
          <Link href="/" className="flex items-center gap-3">
          <Image className="cursor-pointer"
            src={IMAGE.logo}
            alt="Logo"
            width={50}
            height={50}
          />
            <div className="leading-tight ml-10  ">
              <p className="text-white font-semibold text-sm ">Progressive Cattle Fodder</p>
              <p className="text-pcfi-green-200 text-xs">Industries Ltd.</p>
            </div>
            </Link>
          

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 ml-80">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-white hover:text-pcfi-gold-300 px-3 py-2 text-sm font-medium transition-colors">
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {activeDropdown === link.label && (
                    <div className="absolute top-full left-0 bg-white shadow-xl rounded-lg overflow-hidden min-w-48 py-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-pcfi-green-50 hover:text-pcfi-green-700 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white hover:text-pcfi-gold-300 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-pcfi-gold-300 p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-pcfi-green-900 border-t border-pcfi-green-700">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className="block text-white hover:text-pcfi-gold-300 py-2 text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="pl-4 space-y-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block text-pcfi-green-200 hover:text-white py-1.5 text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}