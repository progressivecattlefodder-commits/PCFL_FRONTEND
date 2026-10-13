'use client';

import Link from 'next/link';
import { FaFacebook as Facebook, FaInstagram as Instagram, FaYoutube as Youtube, FaLinkedin as Linkedin } from 'react-icons/fa';
import { Phone, MapPin, Mail, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ContactInfo } from '@/types';
import { IMAGE } from '@/lib/assets';

const defaultContact: ContactInfo = {
  phone: '+977-9714503903',
  phone_cor: '+977-9714503903 / +977-9714503906 / 01 5930425',
  phone_pro: '+977-9855089486',
  email: 'progressive2078cattle@gmail.com',
  address_cor: 'Chapali, Budhanilkantha-03, Kathmandu',
  address_pro: 'Sarlahi, Madhesh, Nepal',
  address: 'Chapali, Budhanilkantha-03, Kathmandu',
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
    <footer className="bg-pcfi-green-800 text-white border-t border-pcfi-green-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                className="cursor-pointer object-contain rounded-md"
                src={IMAGE.logo}
                alt="PCFI Logo"
                width={48}
                height={48}
              />
              <div>
                <p className="font-bold text-base leading-tight">Progressive Cattle Fodder</p>
                <p className="text-pcfi-gold-400 text-xs font-medium">Industries Ltd.</p>
              </div>
            </div>
            
            <p className="text-pcfi-green-200 text-xs italic bg-pcfi-green-900/60 p-3 rounded-lg border border-pcfi-green-700/50">
              "{contact.tagline}"
            </p>

            <div>
              <p className="text-xs text-pcfi-green-300 font-semibold mb-2">Connect With Us</p>
              <div className="flex gap-2">
                {[
                  { icon: Facebook, href: contact.social.facebook },
                  { icon: Instagram, href: contact.social.instagram },
                  { icon: Youtube, href: contact.social.youtube },
                  { icon: Linkedin, href: contact.social.linkedin },
                ].map((item, idx) => 
                  item.href && item.href !== '#' ? (
                    <a 
                      key={idx}
                      href={item.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-pcfi-green-700/80 hover:bg-pcfi-gold-500 hover:text-pcfi-green-900 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm"
                    >
                      <item.icon className="w-4 h-4" />
                    </a>
                  ) : null
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-display font-bold text-pcfi-gold-400 text-sm uppercase tracking-wider mb-4 border-b border-pcfi-green-700 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Home', '/'],
                ['Products & Services', '/products'],
                ['Gallery', '/gallery'],
                ['About Us', '/about'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link 
                    href={href} 
                    className="text-pcfi-green-200 hover:text-pcfi-gold-300 hover:translate-x-1 inline-block transition-all duration-150"
                  >
                    → {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Direct Contact Information */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-pcfi-gold-400 text-sm uppercase tracking-wider mb-4 border-b border-pcfi-green-700 pb-2">
              Contact Details
            </h3>
            
            <div className="space-y-3 text-sm">
              {/* Corporate Office Info */}
              <div>
                <p className="text-xs font-semibold text-pcfi-gold-300 uppercase tracking-wide">Corporate Office</p>
                <div className="flex items-start gap-2.5 mt-1 text-pcfi-green-200">
                  <Phone className="w-4 h-4 text-pcfi-gold-400 shrink-0 mt-0.5" />
                  <a href={`tel:${contact.phone_cor}`} className="hover:text-white transition-colors text-xs">
                    {contact.phone_cor}
                  </a>
                </div>
                <div className="flex items-start gap-2.5 mt-1 text-pcfi-green-200">
                  <MapPin className="w-4 h-4 text-pcfi-gold-400 shrink-0 mt-0.5" />
                  <span className="text-xs">{contact.address_cor}</span>
                </div>
              </div>

              {/* Registered Office Info */}
              <div className="pt-2 border-t border-pcfi-green-700/50">
                <p className="text-xs font-semibold text-pcfi-gold-300 uppercase tracking-wide">Registered Office</p>
                <div className="flex items-start gap-2.5 mt-1 text-pcfi-green-200">
                  <Phone className="w-4 h-4 text-pcfi-gold-400 shrink-0 mt-0.5" />
                  <a href={`tel:${contact.phone_pro}`} className="hover:text-white transition-colors text-xs">
                    {contact.phone_pro}
                  </a>
                </div>
                <div className="flex items-start gap-2.5 mt-1 text-pcfi-green-200">
                  <MapPin className="w-4 h-4 text-pcfi-gold-400 shrink-0 mt-0.5" />
                  <span className="text-xs">{contact.address_pro}</span>
                </div>
              </div>

              {/* Email */}
              <div className="pt-2 border-t border-pcfi-green-700/50 flex items-center gap-2.5 text-pcfi-green-200">
                <Mail className="w-4 h-4 text-pcfi-gold-400 shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:text-white transition-colors text-xs truncate">
                  {contact.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Interactive Location Frame Maps */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-pcfi-gold-400 text-sm uppercase tracking-wider mb-4 border-b border-pcfi-green-700 pb-2">
              Our Locations
            </h3>

            {/* Corporate Office Map Frame (Updated with exact coordinates) */}
            <div className="bg-pcfi-green-900/80 rounded-xl p-2 border border-pcfi-green-700 shadow-md">
              <div className="flex justify-between items-center mb-1.5 px-1">
                <span className="text-xs font-semibold text-pcfi-gold-300">Corporate Office</span>
                <a 
                  href="https://www.google.com/maps/place/Progressive+Cattle+Fodder+Industries+Ltd./@27.7682543,85.3554121,19.05z/data=!4m6!3m5!1s0x39eb1d3e25f1d671:0x5d5ede4aa1c515cb!8m2!3d27.768127!4d85.3561194!16s%2Fg%2F11zhfrwlht?entry=ttu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-pcfi-green-200 hover:text-pcfi-gold-400 flex items-center gap-0.5 transition-colors"
                >
                  Open <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="overflow-hidden rounded-lg h-24 w-full relative border border-pcfi-green-700">
                <iframe
                  title="Corporate Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3530.4!2d85.3561194!3d27.768127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1d3e25f1d671%3A0x5d5ede4aa1c515cb!2sProgressive%20Cattle%20Fodder%20Industries%20Ltd.!5e0!3m2!1sen!2snp!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="filter opacity-90 hover:opacity-100 transition-opacity"
                ></iframe>
              </div>
            </div>

            {/* Registered Office Map Frame */}
            <div className="bg-pcfi-green-900/80 rounded-xl p-2 border border-pcfi-green-700 shadow-md">
              <div className="flex justify-between items-center mb-1.5 px-1">
                <span className="text-xs font-semibold text-pcfi-gold-300">Registered Office</span>
                <a 
                  href="https://www.google.com/maps/place/Progressive+Cattle+Fodder+Industries+Ltd.+(Factory)/@27.0520857,85.454463,20.23z/data=!4m6!3m5!1s0x39ec83001522ada5:0x1e8ebba96481e803!8m2!3d27.0521047!4d85.4547203!16s%2Fg%2F11w4f_gy1h?hl=en-US&entry=ttu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-pcfi-green-200 hover:text-pcfi-gold-400 flex items-center gap-0.5 transition-colors"
                >
                  Open <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="overflow-hidden rounded-lg h-24 w-full relative border border-pcfi-green-700">
                <iframe
                  title="Registered Office Factory Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3568.1!2d85.454463!3d27.0520857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ec83001522ada5%3A0x1e8ebba96481e803!2sProgressive%20Cattle%20Fodder%20Industries%20Ltd.%20(Factory)!5e0!3m2!1sen!2snp!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="filter opacity-90 hover:opacity-100 transition-opacity"
                ></iframe>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-pcfi-green-700/60 flex flex-col sm:flex-row justify-between items-center text-xs text-pcfi-green-300 gap-2">
          <p>© {new Date().getFullYear()} Progressive Cattle Fodder Industries Ltd. All rights reserved.</p>
          <p className="text-[11px] text-pcfi-green-400">Quality Fodder & Agricultural Solutions</p>
        </div>

      </div>
    </footer>
  );
}
