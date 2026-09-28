import {
  ApiResponse,
  User,
  BoardMember,
  Product,
  GalleryItem,
  ContentBlock,
  HeroSection,
  DashboardStats,
  LoginResponse,
  ContactInfo,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Token and LocalStorage Management
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

/**
 * Base Headers Builder
 */
const getHeaders = (isFormData: boolean = false): Record<string, string> => {
  const headers: Record<string, string> = {};
  const token = getToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
  }

  return headers;
};

/**
 * Core Request Fetcher Handler
 */
async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...getHeaders(isFormData),
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle Unauthorized Session Expiration
    if (response.status === 401) {
      removeToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return {
        success: false,
        error: 'Unauthorized access. Please log in again.',
      };
    }

    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (data as Record<string, string>)?.message ||
        (data as Record<string, string>)?.error ||
        `HTTP Error: ${response.status} ${response.statusText}`;
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Normalize response structure
    if (typeof data === 'object' && data !== null && 'success' in data) {
      return data as ApiResponse<T>;
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network failure or server un-reachable';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * API Client Interface Methods
 */
export const api = {
  // -----------------------------
  // Authentication & Session
  // -----------------------------
  login: async (credentials: Record<string, string>): Promise<ApiResponse<LoginResponse>> => {
    const res = await fetcher<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.success && res.data?.token) {
      setToken(res.data.token);
    }
    return res;
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const res = await fetcher<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
    removeToken();
    return res;
  },

  getCurrentUser: (): Promise<ApiResponse<User>> => {
    return fetcher<User>('/auth/me');
  },

  updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> => {
    return fetcher<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // -----------------------------
  // Media & File Uploads
  // -----------------------------
  uploadMedia: async (file: File): Promise<ApiResponse<{ id: string; url: string }>> => {
    const formData = new FormData();
    formData.append('file', file);

    return fetcher<{ id: string; url: string }>('/upload', {
      method: 'POST',
      body: formData,
    });
  },

  deleteMedia: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return fetcher<{ success: boolean }>(`/upload/${id}`, {
      method: 'DELETE',
    });
  },

  // -----------------------------
  // Dashboard & Metrics
  // -----------------------------
  getDashboardStats: (): Promise<ApiResponse<DashboardStats>> => {
    return fetcher<DashboardStats>('/admin/stats');
  },

  // -----------------------------
  // Gallery Management
  // -----------------------------
  getGallery: (): Promise<ApiResponse<GalleryItem[]>> => {
    return fetcher<GalleryItem[]>('/gallery');
  },

  getAdminGallery: (): Promise<ApiResponse<GalleryItem[]>> => {
    return fetcher<GalleryItem[]>('/admin/gallery');
  },

  getGalleryItemById: (id: string): Promise<ApiResponse<GalleryItem>> => {
    return fetcher<GalleryItem>(`/gallery/${id}`);
  },

  createGalleryItem: (data: Partial<GalleryItem>): Promise<ApiResponse<GalleryItem>> => {
    return fetcher<GalleryItem>('/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGalleryItem: (id: string, data: Partial<GalleryItem>): Promise<ApiResponse<GalleryItem>> => {
    return fetcher<GalleryItem>(`/admin/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteGalleryItem: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return fetcher<{ success: boolean }>(`/admin/gallery/${id}`, {
      method: 'DELETE',
    });
  },

  // -----------------------------
  // Product Catalog Management
  // -----------------------------
  getProducts: (): Promise<ApiResponse<Product[]>> => {
    return fetcher<Product[]>('/products');
  },

  getAdminProducts: (): Promise<ApiResponse<Product[]>> => {
    return fetcher<Product[]>('/admin/products');
  },

  getProductBySlug: (slug: string): Promise<ApiResponse<Product>> => {
    return fetcher<Product>(`/products/${slug}`);
  },

  createProduct: (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    return fetcher<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProduct: (id: string, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    return fetcher<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProduct: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return fetcher<{ success: boolean }>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  // -----------------------------
  // Board Members Management
  // -----------------------------
  getBoardMembers: (): Promise<ApiResponse<BoardMember[]>> => {
    return fetcher<BoardMember[]>('/board-members');
  },

  getAdminBoardMembers: (): Promise<ApiResponse<BoardMember[]>> => {
    return fetcher<BoardMember[]>('/admin/board-members');
  },

  getBoardMemberById: (id: string): Promise<ApiResponse<BoardMember>> => {
    return fetcher<BoardMember>(`/board-members/${id}`);
  },

  createBoardMember: (data: Partial<BoardMember>): Promise<ApiResponse<BoardMember>> => {
    return fetcher<BoardMember>('/admin/board-members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBoardMember: (id: string, data: Partial<BoardMember>): Promise<ApiResponse<BoardMember>> => {
    return fetcher<BoardMember>(`/admin/board-members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBoardMember: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return fetcher<{ success: boolean }>(`/admin/board-members/${id}`, {
      method: 'DELETE',
    });
  },

  // -----------------------------
  // Hero Section & CMS Content
  // -----------------------------
  getHeroSection: (): Promise<ApiResponse<HeroSection>> => {
    return fetcher<HeroSection>('/hero');
  },

  updateHeroSection: (data: Partial<HeroSection>): Promise<ApiResponse<HeroSection>> => {
    return fetcher<HeroSection>('/admin/hero', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getContentBlocks: (): Promise<ApiResponse<ContentBlock[]>> => {
    return fetcher<ContentBlock[]>('/content-blocks');
  },

  getContentBlockByKey: (key: string): Promise<ApiResponse<ContentBlock>> => {
    return fetcher<ContentBlock>(`/content-blocks/${key}`);
  },

  updateContentBlock: (id: string, data: Partial<ContentBlock>): Promise<ApiResponse<ContentBlock>> => {
    return fetcher<ContentBlock>(`/admin/content-blocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // -----------------------------
  // Contact & General Site Settings
  // -----------------------------
  getContactInfo: (): Promise<ApiResponse<ContactInfo>> => {
    return fetcher<ContactInfo>('/contact-info');
  },

  updateContactInfo: (data: Partial<ContactInfo>): Promise<ApiResponse<ContactInfo>> => {
    return fetcher<ContactInfo>('/admin/contact-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export default api;