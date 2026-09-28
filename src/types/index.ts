export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'editor'
  | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  title: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  permissions: Record<string, boolean>;
  created_at: string;
  last_login?: string;
}

export interface BoardMember {
  id: string;
  full_name: string;
  title: string;
  bio?: string;
  image_url?: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  category: string;
  image_url?: string;
  is_published: boolean;
  sort_order: number;
  features: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category?: string;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ContentBlock {
  id: string;
  key: string;
  title: string;
  content: string;
  content_type: string;
  metadata: Record<string, unknown>;
  is_published: boolean;
  updated_at: string;
  updated_by?: string;
}

export interface HeroSection {
  id: string;
  heading: string;
  subheading: string;
  description: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  background_image_url?: string;
  is_active: boolean;
  updated_at: string;
}

export interface DashboardStats {
  total_products: number;
  published_products: number;
  total_gallery_items: number;
  total_employees: number;
  active_employees: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  social: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
    twitter?: string;
  };
  tagline: string;
}