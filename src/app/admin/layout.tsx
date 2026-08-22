'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Image, FileText, Users,
  Settings, LogOut, Menu, X, Leaf, ChevronRight,
  Bell
} from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { label: 'Dashboard',     href: '/admin/dashboard',     icon: LayoutDashboard },
  { label: 'Products',      href: '/admin/products',      icon: Package },
  { label: 'Gallery',       href: '/admin/gallery',       icon: Image },
  { label: 'Content',       href: '/admin/content',       icon: FileText },
  { label: 'Board Members', href: '/admin/board-members', icon: Users },
  { label: 'Employees',     href: '/admin/employees',     icon: Users },
  { label: 'Settings',      href: '/admin/settings',      icon: Settings },
];

const roleColors: Record<string, string> = {
  superadmin: 'bg-purple-100 text-purple-700',
  admin:      'bg-pcfi-green-100 text-pcfi-green-700',
  editor:     'bg-blue-100 text-blue-700',
  viewer:     'bg-gray-100 text-gray-600',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pcfi-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-pcfi-green-900 text-white w-64">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-pcfi-green-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-pcfi-gold-500 rounded-xl flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">PCFI Admin</p>
            <p className="text-pcfi-green-300 text-xs">Control Panel</p>
          </div>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)} 
          className="lg:hidden p-1 rounded-lg text-pcfi-green-300 hover:text-white"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === '/admin/dashboard' 
            ? pathname === href 
            : pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                active
                  ? 'bg-pcfi-gold-500 text-pcfi-white text-sm translate-x-1'
                  : 'text-pcfi-green-200 font-bold hover:bg-pcfi-green-800 hover:text-white hover:translate-x-0.5'
              )}
            >
              <Icon className={clsx('w-4 h-4 shrink-0 transition-colors', active ? 'text-pcfi-white' : 'text-pcfi-green-400 group-hover:text-pcfi-gold-400')} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-pcfi-gold-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-pcfi-green-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-pcfi-green-800 mb-2">
          <div className="w-8 h-8 bg-pcfi-gold-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.full_name || 'Admin User'}</p>
            <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium', roleColors[user?.role || 'viewer'])}>
              {user?.role || 'viewer'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-pcfi-green-300 hover:text-white hover:bg-red-600/20 text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay with smooth fade */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex transition-opacity duration-200 ease-in-out">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 transition-transform duration-300 ease-out">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-gray-500 flex-1 min-w-0">
            <Link href="/admin/dashboard" className="hover:text-pcfi-green-700 shrink-0">Admin</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-gray-900 font-medium truncate capitalize">
              {pathname.split('/').filter(Boolean).slice(1).join(' › ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 relative" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <Link
              href="/"
              target="_blank"
              className="text-xs bg-pcfi-green-50 text-pcfi-green-700 border border-pcfi-green-200 px-3 py-1.5 rounded-lg hover:bg-pcfi-green-100 transition-colors font-medium"
            >
              View Site ↗
            </Link>
          </div>
        </header>

        {/* Page content with keyed transition container */}
        <main className="flex-1 overflow-y-auto">
          <div key={pathname} className="animate-fade-in-up transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}