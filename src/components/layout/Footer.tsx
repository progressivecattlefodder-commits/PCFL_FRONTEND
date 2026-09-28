'use client';

import Link from 'next/link';
import { FaFacebook as Facebook,FaInstagram as Instagram, FaYoutube as Youtube, FaLinkedin as Linkedin } from 'react-icons/fa'
import { Phone, MapPin, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ContactInfo } from '@/types';
import { IMAGE } from '@/lib/assets';

const defaultContact: ContactInfo = {
  phone: '+977-9714503903 / +977-9714503906',
  email: 'info@pcfl.com',
  address: 'Chapali, Budhanilkantha, Kathmandu',
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61592841761281',
    instagram: '#',
    youtube: 'https://www.youtube.com/channel/UC5D_l5dmyWjbXjwULrkKl7A',
    linkedin: 'https://www.linkedin.com/company/143695943',
  },
  tagline: "Healthy Cow, Happy Farmer",
};

export default function Footer() {
  const [contact, setContact] = useState<ContactInfo>(defaultContact);

  useEffect(() => {
    api.getContactInfo().then((res) => {
      if (res.success && res.data?.metadata) {
        setContact(res.data.metadata as ContactInfo);
      }
    }).catch(() => {});
  }, []);

  return (
    <footer className="bg-pcfi-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img className="cursor-pointer"
                src={IMAGE.logo}
                alt="Logo"
                width={50}
                height={50}
              />
              <div>
                <p className="font-semibold text-sm">Progressive Cattle Fodder </p>
                <p className="text-pcfi-green-300 text-xs">Industries Ltd.</p>
              </div>
            </div>
            <p className="text-pcfi-green-200 text-sm italic mb-4">"{contact.tagline}"</p>
            <div className="flex gap-3">
              {contact.social.facebook && (
                <a href={contact.social.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-pcfi-green-700 hover:bg-pcfi-gold-500 rounded-full flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {contact.social.instagram && (
                <a href={contact.social.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-pcfi-green-700 hover:bg-pcfi-gold-500 rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {contact.social.youtube && (
                <a href={contact.social.youtube} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-pcfi-green-700 hover:bg-pcfi-gold-500 rounded-full flex items-center justify-center transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {contact.social.linkedin && (
                <a href={contact.social.linkedin} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-pcfi-green-700 hover:bg-pcfi-gold-500 rounded-full flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-pcfi-gold-400 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                ['Home', '/'],
                ['Products & Services', '/products'],
                ['Gallery', '/gallery'],
                ['About Us', '/about'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-pcfi-green-200 hover:text-pcfi-gold-300 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display font-bold text-pcfi-gold-400 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 text-pcfi-gold-400 shrink-0" />
                <a href={`tel:${contact.phone}`} className="text-pcfi-green-200 hover:text-white text-sm transition-colors">
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-pcfi-gold-400 shrink-0" />
                <span className="text-pcfi-green-200 text-sm">{contact.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 text-pcfi-gold-400 shrink-0" />
                <a href={`mailto:${contact.email}`} className="text-pcfi-green-200 hover:text-white text-sm transition-colors">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-pcfi-green-700 text-center">
          <p className="text-pcfi-green-300 text-xs">
            All rights reserved © {new Date().getFullYear()} Progressive Cattle Fodder Industries Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}