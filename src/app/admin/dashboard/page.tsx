'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, Image, Users, FileText,
  TrendingUp, Eye, PlusCircle, Edit3
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DashboardStats } from '@/types';

const statCards = (stats: DashboardStats) => [
  {
    label: 'Total Products',
    value: stats.total_products,
    sub: `${stats.published_products} published`,
    icon: Package,
    color: 'bg-pcfi-green-50 text-pcfi-green-600',
    iconBg: 'bg-pcfi-green-100',
    href: '/admin/products',
  },
  {
    label: 'Gallery Items',
    value: stats.total_gallery_items,
    sub: 'All published',
    icon: Image,
    color: 'bg-blue-50 text-blue-600',
    iconBg: 'bg-blue-100',
    href: '/admin/gallery',
  },
  {
    label: 'Team Members',
    value: stats.total_employees,
    sub: `${stats.active_employees} active`,
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
    iconBg: 'bg-purple-100',
    href: '/admin/employees',
  },
  {
    label: 'Content Blocks',
    value: 5,
    sub: 'All managed',
    icon: FileText,
    color: 'bg-amber-50 text-amber-600',
    iconBg: 'bg-amber-100',
    href: '/admin/content',
  },
];

const quickActions = [
  { label: 'Add Product',      href: '/admin/products?new=1',   icon: PlusCircle, color: 'text-pcfi-green-600' },
  { label: 'Upload to Gallery',href: '/admin/gallery?new=1',    icon: Image,      color: 'text-blue-600' },
  { label: 'Edit Hero Section',href: '/admin/settings',         icon: Edit3,      color: 'text-amber-600' },
  { label: 'Add Employee',     href: '/admin/employees?new=1',  icon: Users,      color: 'text-purple-600' },
  { label: 'Edit Content',     href: '/admin/content',          icon: FileText,   color: 'text-rose-600' },
  { label: 'View Website',     href: '/',                       icon: Eye,        color: 'text-gray-600' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then((res) => { if (res.success) setStats(res.data); })
      .finally(() => setIsLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {greeting()}, {user?.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here's what's happening with your website today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="admin-card animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-1/2" />
                <div className="h-8 bg-gray-200 rounded mb-2 w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))
          : stats
          ? statCards(stats).map(({ label, value, sub, icon: Icon, color, iconBg, href }) => (
              <Link key={label} href={href} className="admin-card hover:border-pcfi-green-300 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color.split(' ')[1]}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-300 group-hover:text-pcfi-green-400 transition-colors" />
                </div>
                <p className="text-3xl font-bold text-gray-900 font-display">{value}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </Link>
            ))
          : null}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="admin-card">
            <h2 className="font-display text-base font-bold text-gray-900 mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map(({ label, href, icon: Icon, color }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-gray-200 hover:border-pcfi-green-300 hover:bg-pcfi-green-50 transition-all group text-center"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-xl flex items-center justify-center transition-colors shadow-sm">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-pcfi-green-700">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="admin-card bg-gradient-to-br from-pcfi-green-800 to-pcfi-green-700 text-white border-0">
          <div className="mb-4">
            <div className="w-10 h-10 bg-pcfi-gold-500 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-display font-bold text-lg">System Status</h3>
            <p className="text-pcfi-green-200 text-sm mt-1">Everything is running smoothly</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Frontend',  status: 'Online' },
              { label: 'Backend',   status: 'Online' },
              { label: 'Database',  status: 'Online' },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-pcfi-green-200 text-sm">{label}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-pcfi-gold-300">
                  <span className="w-2 h-2 bg-pcfi-gold-400 rounded-full inline-block animate-pulse" />
                  {status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-pcfi-green-600">
            <p className="text-pcfi-green-300 text-xs">
              Logged in as <span className="text-white font-semibold">{user?.role}</span>
            </p>
            <p className="text-pcfi-green-300 text-xs mt-0.5 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}