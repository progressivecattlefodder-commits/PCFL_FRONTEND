import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { GalleryItem } from '@/types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://pcfl-backend.onrender.com';

/**
 * Generic API response.
 *
 * Some backend endpoints return:
 * {
 *   success: true,
 *   data: ...
 * }
 *
 * Others may return a direct object.
 * Therefore data is optional.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Generic record used for flexible API payloads.
 */
type ApiData = Record<string, unknown>;

/**
 * Login response.
 */
export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * API client.
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    /**
     * Attach authentication token to requests.
     */
    this.client.interceptors.request.use((config) => {
      const token = Cookies.get('auth_token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    /**
     * Handle unauthorized responses globally.
     */
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          Cookies.remove('auth_token');

          if (
            typeof window !== 'undefined' &&
            window.location.pathname.startsWith('/admin')
          ) {
            window.location.href = '/auth/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================================
  // MEDIA / FILE UPLOADS
  // ============================================================

  async uploadMedia(
    file: File
  ): Promise<{ id: string; url: string }> {
    const formData = new FormData();

    formData.append('file', file);

    const response = await this.client.post(
      '/api/admin/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Compatibility helper used by older pages.
   */
  async uploadImage(
    fileOrFormData: File | FormData
  ): Promise<{
    success: boolean;
    url: string;
    data: {
      url: string;
    };
  }> {
    let file: File | null = null;

    if (fileOrFormData instanceof FormData) {
      const formFile = fileOrFormData.get('file');

      if (formFile instanceof File) {
        file = formFile;
      }
    } else {
      file = fileOrFormData;
    }

    if (!file) {
      throw new Error('No file provided for upload');
    }

    const response = await this.uploadMedia(file);

    return {
      success: true,
      url: response.url,
      data: {
        url: response.url,
      },
    };
  }

  // ============================================================
  // AUTH
  // ============================================================

  /**
   * Supports both:
   *
   * api.login(email, password)
   *
   * and:
   *
   * api.login({ email, password })
   *
   * This avoids the argument/type mismatch from the previous build.
   */
  async login(
    emailOrCredentials:
      | string
      | Record<string, string>,
    password?: string
  ) {
    let credentials: Record<string, string>;

    if (typeof emailOrCredentials === 'string') {
      credentials = {
        email: emailOrCredentials,
        password: password || '',
      };
    } else {
      credentials = emailOrCredentials;
    }

    const response = await this.client.post(
      '/api/auth/login',
      credentials
    );

    return response.data;
  }

  async logout() {
    const response = await this.client.post('/api/auth/logout');

    Cookies.remove('auth_token');

    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/api/auth/me');

    return response.data;
  }

  // ============================================================
  // PUBLIC - HERO
  // ============================================================

  async getHero() {
    const response = await this.client.get(
      '/api/public/hero'
    );

    return response.data;
  }

  // ============================================================
  // ADMIN - HERO
  // ============================================================

  async updateHero(data: ApiData) {
    const response = await this.client.put(
      '/api/admin/hero',
      data
    );

    return response.data;
  }

  // ============================================================
  // PUBLIC - BOARD MEMBERS
  // ============================================================

  async getBoardMembers() {
    const response = await this.client.get(
      '/api/public/board_members'
    );

    return response.data;
  }

  // ============================================================
  // PUBLIC - EMPLOYEES
  // ============================================================

  async getPublicEmployees() {
    const response = await this.client.get(
      '/api/public/employees'
    );

    return response.data;
  }

  // ============================================================
  // PUBLIC - PRODUCTS
  // ============================================================

  async getPublicProducts() {
    const response = await this.client.get(
      '/api/public/products'
    );

    return response.data;
  }

  async getPublicProduct(slug: string) {
    const response = await this.client.get(
      `/api/public/products/${encodeURIComponent(slug)}`
    );

    return response.data;
  }

  // ============================================================
  // PUBLIC - GALLERY
  // ============================================================

  async getPublicGallery() {
    const response = await this.client.get(
      '/api/public/gallery'
    );

    return response.data;
  }

  // ============================================================
  // PUBLIC - CONTENT
  // ============================================================

  async getContent(key: string) {
    const response = await this.client.get(
      `/api/public/content/${encodeURIComponent(key)}`
    );

    return response.data;
  }

  // ============================================================
  // PUBLIC - ABOUT
  // ============================================================

  async getAbout() {
    const response = await this.client.get(
      '/api/public/about'
    );

    return response.data;
  }

  // ============================================================
  // PUBLIC - CONTACT
  // ============================================================

  async getContactInfo() {
    const response = await this.client.get(
      '/api/public/contact-info'
    );

    return response.data;
  }

  // ============================================================
  // ADMIN - STATS
  // ============================================================

  async getStats() {
    const response = await this.client.get(
      '/api/admin/stats'
    );

    return response.data;
  }

  // ============================================================
  // ADMIN - BOARD MEMBERS
  // ============================================================

  async getAdminBoardMembers() {
    const response = await this.client.get(
      '/api/admin/board_members'
    );

    return response.data;
  }

  async createBoardMember(data: ApiData) {
    const response = await this.client.post(
      '/api/admin/board_members',
      data
    );

    return response.data;
  }

  async updateBoardMember(
    id: string | number,
    data: ApiData
  ) {
    const response = await this.client.put(
      `/api/admin/board_members/${id}`,
      data
    );

    return response.data;
  }

  async deleteBoardMember(id: string | number) {
    const response = await this.client.delete(
      `/api/admin/board_members/${id}`
    );

    return response.data;
  }

  // ============================================================
  // ADMIN - PRODUCTS
  // ============================================================

  async getAdminProducts() {
    const response = await this.client.get(
      '/api/admin/products'
    );

    return response.data;
  }

  async createProduct(data: ApiData) {
    const response = await this.client.post(
      '/api/admin/products',
      data
    );

    return response.data;
  }

  async updateProduct(
    id: string | number,
    data: ApiData
  ) {
    const response = await this.client.put(
      `/api/admin/products/${id}`,
      data
    );

    return response.data;
  }

  async deleteProduct(id: string | number) {
    const response = await this.client.delete(
      `/api/admin/products/${id}`
    );

    return response.data;
  }

  // ============================================================
  // ADMIN - GALLERY
  // ============================================================

  async getAdminGallery(): Promise<
    ApiResponse<GalleryItem[]>
  > {
    const response = await this.client.get(
      '/api/admin/gallery'
    );

    return response.data;
  }

  async createGalleryItem(
    data: Partial<GalleryItem>
  ): Promise<ApiResponse<GalleryItem>> {
    const response = await this.client.post(
      '/api/admin/gallery',
      data
    );

    return response.data;
  }

  async updateGalleryItem(
    id: string | number,
    data: Partial<GalleryItem>
  ): Promise<ApiResponse<GalleryItem>> {
    const response = await this.client.put(
      `/api/admin/gallery/${id}`,
      data
    );

    return response.data;
  }

  async deleteGalleryItem(
    id: string | number
  ): Promise<ApiResponse<null>> {
    const response = await this.client.delete(
      `/api/admin/gallery/${id}`
    );

    return response.data;
  }

  // ============================================================
  // ADMIN - CONTENT
  // ============================================================

  async getAdminContent() {
    const response = await this.client.get(
      '/api/admin/content'
    );

    return response.data;
  }

  async updateContent(
    key: string,
    data: ApiData
  ) {
    const response = await this.client.put(
      `/api/admin/content/${encodeURIComponent(key)}`,
      data
    );

    return response.data;
  }

  // ============================================================
  // ADMIN - EMPLOYEES
  //
  // IMPORTANT:
  // These methods remain available.
  //
  // The TRUE/FALSE switch for whether the Employee UI
  // actually uses these methods should be handled in
  // the Employee page/logic.
  // ============================================================

  async getEmployees() {
    const response = await this.client.get(
      '/api/admin/employees'
    );

    return response.data;
  }

  async createEmployee(
    data: FormData | ApiData
  ) {
    const isFormData = data instanceof FormData;

    const response = await this.client.post(
      '/api/admin/employees',
      data,
      {
        headers: isFormData
          ? {
              'Content-Type': 'multipart/form-data',
            }
          : {},
      }
    );

    return response.data;
  }

  async updateEmployee(
    id: string | number,
    data: FormData | ApiData
  ) {
    const isFormData = data instanceof FormData;

    const response = await this.client.put(
      `/api/admin/employees/${id}`,
      data,
      {
        headers: isFormData
          ? {
              'Content-Type': 'multipart/form-data',
            }
          : {},
      }
    );

    return response.data;
  }

  async deleteEmployee(id: string | number) {
    const response = await this.client.delete(
      `/api/admin/employees/${id}`
    );

    return response.data;
  }

  async updateEmployeeRole(
    id: string | number,
    data: ApiData
  ) {
    const response = await this.client.patch(
      `/api/admin/employees/${id}/role`,
      data
    );

    return response.data;
  }

  async resetEmployeePassword(
    id: string | number,
    newPassword: string
  ) {
    const response = await this.client.post(
      `/api/admin/employees/${id}/reset-password`,
      {
        new_password: newPassword,
      }
    );

    return response.data;
  }
}

// ============================================================
// API INSTANCE
// ============================================================

export const api = new ApiClient();

// ============================================================
// TYPES
// ============================================================

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

  /**
   * Kept optional because Footer.tsx currently
   * expects ContactInfo.metadata.
   */
  metadata?: Record<string, unknown>;
}