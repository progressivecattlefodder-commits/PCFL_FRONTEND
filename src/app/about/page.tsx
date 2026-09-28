'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Eye as EyeIcon, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { api } from '@/lib/api';
import { ContentBlock, ContactInfo } from '@/types';
import { IMAGE } from '@/lib/assets';

interface BoardMember {
  id: string | number;
  full_name: string;
  title: string;
  status?: string;
  bio?: string;
  image_url?: string;
  sort_order?: number;
  is_published?: boolean;
}

interface EmployeeUser {
  id: string | number;
  email?: string;
  full_name: string;
  role?: string;
  title: string;
  status?: string;
  is_active?: boolean;
  avatar_url?: string;
}

// Fallback Board Members Data
const FALLBACK_BOARD_MEMBERS: BoardMember[] = [
  {
    id: 5,
    status: 'Mr.',
    full_name: 'Gopal Thapa',
    title: 'Chairman',
    image_url: '/images/branding/Chairman.webp',
    bio: "Gopal Thapa is an agribusiness entrepreneur with over 12 years of experience in Nepal's agriculture and livestock sectors. Through sustained engagement with livestock farmers and rural communities, he has focused on raising agricultural productivity, lowering production costs, and advancing the commercialization of farming practices. As Chairman of Progressive Cattle Fodder Industries Ltd., he leads the company's strategy for strengthening Nepal's livestock value chain and modernizing fodder production.",
  },
  {
    id: 1,
    status: 'Dr.',
    full_name: 'Keshav Bhasyal, PhD',
    title: 'Director',
    image_url: '/images/Personalities/Per_4.png',
    bio: 'Dr. Keshav Bhasyal is an international relations and labour policy expert with over 15 years of experience in policy development, labour migration, employment, and social protection. He holds a PhD in International Relations from Jawaharlal Nehru University and has worked with the ILO, World Bank, Asian Development Bank, the Government of Nepal, and Tribhuvan University on policy reform and institutional development.',
  },
  {
    id: 2,
    status: 'Mr.',
    full_name: 'Surya Prasad Sedhai',
    title: 'Director',
    image_url: '/images/Personalities/Per_2.jpeg',
    bio: 'Surya Prasad Sedhai is a public administration and governance professional with over 30 years of service in the Government of Nepal, including as Joint Secretary at the Ministry of Home Affairs and National Director of the Nepal National Single Window Project. He led the integration of 47 government agencies to modernize trade facilitation in line with WTO and WCO standards.',
  },
  {
    id: 3,
    status: 'Dr.',
    full_name: 'Bidur Prasad Pandit',
    title: 'Director',
    image_url: '/images/Personalities/Per_1.jpeg',
    bio: 'Dr. Bidur Prasad Pandit is a medical professional and investor with over eight years of experience in investment management across renewable energy, tourism, agriculture, and capital markets. His work spans project financing, investment analysis, and corporate governance, supporting the growth of infrastructure and manufacturing ventures.',
  },
  {
    id: 4,
    status: 'Mr.',
    full_name: 'Dhiraj Koirala',
    title: 'Director',
    image_url: '/images/Personalities/Per_3.jpeg',
    bio: 'Dhiraj Koirala is an international development professional with over 15 years of experience with the United Nations, the International Organization for Migration, and government institutions across Nepal, the United States, Qatar, and Central Africa. He holds a master\'s degree in political science and a certificate in peace and conflict management.',
  },
];

// Fallback Employees Data
const FALLBACK_EMPLOYEES: EmployeeUser[] = [
  {
    id: 2,
    status: 'Mr.',
    full_name: 'Sunil Pandey',
    title: 'Production Manager',
    avatar_url: '/images/Personalities/emp_1.webp',
  },
  {
    id: 6,
    status: 'Mrs.',
    full_name: 'Subhadra Pandey Thapa',
    title: 'Company Secretary',
    avatar_url: '/images/Personalities/emp_2.webp',
  },
  {
    id: 7,
    status: 'Mr.',
    full_name: 'Krishna Thapa',
    title: 'Technical Head',
    avatar_url: '/images/Personalities/emp_3.webp',
  },
  {
    id: 3,
    status: 'Mr.',
    full_name: 'Gokarna Budhathoki',
    title: 'Plant Assistant',
    avatar_url: '/images/Personalities/emp_4.webp',
  },
];

// Helper to resolve absolute image URLs
const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/images/')) return url; // Static asset paths
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

// Animation Configurations
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

function BoardMemberCard({ member }: { member: BoardMember }) {
  const resolvedUrl = resolveImageUrl(member.image_url);
  const [imgSrc, setImgSrc] = useState<string>(resolvedUrl);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(resolveImageUrl(member.image_url));
    setHasError(false);
  }, [member.image_url]);

  const statusPrefix = member.status ? `${member.status.trim()} ` : '';
  const showFullBio = isExpanded || isHovered;

  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7 hover:shadow-xl transition-all duration-300 flex flex-col items-center w-full group"
    >
      {/* Avatar Container */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-pcfi-green-50 mb-5 shrink-0 border-2 border-pcfi-green-100 group-hover:border-pcfi-green-600 transition-colors shadow-sm flex items-center justify-center">
        {imgSrc && !hasError ? (
          <Image
            src={imgSrc}
            alt={member.full_name}
            fill
            sizes="128px"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={() => setHasError(true)}
            unoptimized
          />
        ) : (
          <span className="text-3xl font-bold text-pcfi-green-700 font-display">
            {member.full_name.charAt(0)}
          </span>
        )}
      </div>

      {/* Header Information */}
      <div className="text-center mb-4">
        <h3 className="font-display text-xl font-bold text-pcfi-green-900 leading-snug">
          {statusPrefix && <span className="font-medium">{statusPrefix}</span>}
          {member.full_name}
        </h3>
        <p className="text-xs font-semibold uppercase tracking-wider text-pcfi-gold-600 mt-1">
          {member.title}
        </p>
      </div>

      {/* Bio Paragraph */}
      {member.bio && (
        <div className="w-full pt-4 border-t border-gray-100 text-left">
          <p 
            className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 ${
              showFullBio ? '' : 'line-clamp-4'
            }`}
          >
            {member.bio}
          </p>
          {member.bio.length > 140 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-3 text-xs font-semibold text-pcfi-green-700 hover:text-pcfi-green-900 inline-flex items-center gap-1 focus:outline-none"
            >
              <span>{showFullBio ? 'Read Less' : 'Read Full Bio'}</span>
              <span className="text-base leading-none">{showFullBio ? '↑' : '→'}</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function EmployeeCard({ employee }: { employee: EmployeeUser }) {
  const resolvedUrl = resolveImageUrl(employee.avatar_url);
  const [avatarSrc, setAvatarSrc] = useState<string>(resolvedUrl);
  const [hasError, setHasError] = useState(false);
  const statusPrefix = employee.status ? `${employee.status.trim()} ` : '';

  useEffect(() => {
    setAvatarSrc(resolveImageUrl(employee.avatar_url));
    setHasError(false);
  }, [employee.avatar_url]);

  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex items-center p-5 gap-4 group"
    >
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-pcfi-green-100 shrink-0 border-2 border-pcfi-green-500 shadow-sm group-hover:border-pcfi-gold-500 transition-colors flex items-center justify-center">
        {avatarSrc && !hasError ? (
          <Image
            src={avatarSrc}
            alt={employee.full_name || 'Team Member'}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setHasError(true)}
            unoptimized
          />
        ) : (
          <span className="text-xl font-bold text-pcfi-green-800 font-display">
            {employee.full_name?.charAt(0) || 'E'}
          </span>
        )}
      </div>
      <div className="overflow-hidden">
        <h4 className="font-display text-base font-bold text-gray-900 group-hover:text-pcfi-green-700 transition-colors truncate">
          {statusPrefix && <span className="text-pcfi-green-600 font-normal mr-1">{statusPrefix}</span>}
          {employee.full_name}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-pcfi-green-700 font-medium mt-1">
          <Briefcase className="w-3.5 h-3.5 shrink-0 text-pcfi-gold-600" />
          <span className="font-bold text-md text-pcfi-gold-600 truncate">{employee.title}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const [blocks, setBlocks] = useState<Record<string, ContentBlock>>({});
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [employees, setEmployees] = useState<EmployeeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const fetchEmployeesFn = typeof api.getPublicEmployees === 'function'
          ? api.getPublicEmployees()
          : api.getEmployees();

        const [aboutRes, contactRes, boardRes, employeeRes] = await Promise.all([
          api.getAbout().catch((err) => { console.error('Error fetching About:', err); return null; }),
          api.getContactInfo().catch((err) => { console.error('Error fetching Contact:', err); return null; }),
          api.getBoardMembers().catch((err) => { console.error('Error fetching Board:', err); return null; }),
          fetchEmployeesFn.catch((err) => { console.error('Error fetching Employees:', err); return null; }),
        ]);

        const extractData = (res: any) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (res.success && Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.data)) return res.data;
          return [];
        };

        const aboutData = extractData(aboutRes);
        if (aboutData.length > 0) {
          const map: Record<string, ContentBlock> = {};
          aboutData.forEach((b: ContentBlock) => { map[b.key] = b; });
          setBlocks(map);
        }

        if (contactRes?.data?.metadata) {
          setContact(contactRes.data.metadata as ContactInfo);
        } else if (contactRes?.metadata) {
          setContact(contactRes.metadata as ContactInfo);
        }

        const boardData = extractData(boardRes);
        setBoardMembers(boardData.length > 0 ? boardData : FALLBACK_BOARD_MEMBERS);

        const empData = extractData(employeeRes);
        setEmployees(empData.length > 0 ? empData : FALLBACK_EMPLOYEES);

      } catch (error) {
        console.error('Unhandled error in AboutPage fetch:', error);
        setBoardMembers(FALLBACK_BOARD_MEMBERS);
        setEmployees(FALLBACK_EMPLOYEES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="relative bg-pcfi-green-800 py-16 text-center overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto px-4"
        >
          <motion.p variants={fadeInUp} className="text-pcfi-gold-400 font-semibold text-sm uppercase tracking-widest mb-2">
            Get to Know Us
          </motion.p>
          <motion.h1 variants={fadeInUp} className="font-display text-3xl md:text-5xl font-bold text-white">
            About Us
          </motion.h1>
        </motion.div>
      </section>

      {/* Company Intro Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-16 bg-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-subheading">Who We Are</p>
          <h2 className="section-heading">{blocks.about_company?.title || 'About PCFL'}</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {isLoading
              ? 'Loading…'
              : blocks.about_company?.content ||
                'PCFL Ltd. is a trusted manufacturer of high-quality bale silage, dedicated to improving livestock nutrition and supporting sustainable agricultural practices.'}
          </p>
        </div>
      </motion.section>

      {/* Chairman Message */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-16 bg-pcfi-green-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInUp} className="flex justify-center lg:order-2">
              <div className="relative">
                <div className="w-52 h-64 bg-pcfi-green-200 rounded-2xl" />
                <div className="absolute -top-4 -left-4 w-52 h-64 rounded-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-60 rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src={IMAGE.chairman}
                      alt="Chairman"
                      width={192}
                      height={240}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="lg:order-1">
              <p className="section-subheading">Leadership</p>
              <h2 className="section-heading">Message from our Chairman</h2>
              <blockquote className="text-gray-700 text-lg leading-relaxed italic border-l-4 border-pcfi-gold-500 pl-6">
                {blocks.chairman_message?.content ||
                  '"At PCFL, we are driven by a mission to empower farmers with sustainable, high-quality fodder solutions."'}
              </blockquote>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Mission & Vision */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-subheading">Our Purpose</p>
            <h2 className="section-heading">Mission & Vision</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div variants={fadeInUp} className="bg-pcfi-green-800 text-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-pcfi-gold-500 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-pcfi-gold-300 mb-3">
                {blocks.mission?.title || 'Our Mission'}
              </h3>
              <p className="text-pcfi-green-100 leading-relaxed text-sm">
                {blocks.mission?.content ||
                  'To produce and deliver high-quality, scientifically formulated and sustainable silage and livestock feed that enhance animal health, productivity and farm profitability while establishing Nepal as atrusted source of premium livestock nutrition products in domestic and international markets.'}
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-pcfi-green-800 text-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-pcfi-gold-500 rounded-xl flex items-center justify-center mb-4">
                <EyeIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-pcfi-gold-300 mb-3">
                {blocks.vision?.title || 'Our Vision'}
              </h3>
              <p className="text-pcfi-green-100 leading-relaxed text-sm">
                {blocks.vision?.content ||
                  "To become a leading and trusted livestock nutrition company from Nepal by transforming dairy and livestock farming through superior nutrition, innovation, quality, sustainability and access to international markets."}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Dynamic Board Members Showcase Panel */}
      {boardMembers.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="section-subheading">Governance & Strategy</p>
              <h2 className="section-heading">Board of Directors</h2>
            </div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start"
            >
              {boardMembers.map((member) => (
                <BoardMemberCard key={member.id} member={member} />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Dynamic Employees / Team Showcase Panel */}
      {employees.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="section-subheading">Dedicated Team</p>
              <h2 className="section-heading">Meet Our Team</h2>
            </div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
            >
              {employees.map((emp) => (
                <EmployeeCard key={emp.id} employee={emp} />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Contact Strip */}
      {contact && (
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          className="py-16 bg-gray-50 border-t border-gray-100"
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="section-heading">Get in Touch</h2>
            <p className="text-gray-500 mb-8">We'd love to hear from you.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <a href={`tel:${contact.phone}`} className="card p-6 hover:border-pcfi-green-300 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <Phone className="w-6 h-6 text-pcfi-green-600 mb-2" />
                <span className="text-sm text-gray-700">{contact.phone}</span>
              </a>
              <a href={`mailto:${contact.email}`} className="card p-6 hover:border-pcfi-green-300 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <Mail className="w-6 h-6 text-pcfi-green-600 mb-2" />
                <span className="text-sm text-gray-700">{contact.email}</span>
              </a>
              <div className="card p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <MapPin className="w-6 h-6 text-pcfi-green-600 mb-2" />
                <span className="text-sm text-gray-700">{contact.address}</span>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </PublicLayout>
  );
}