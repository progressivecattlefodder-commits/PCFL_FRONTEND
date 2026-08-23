import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { GalleryItem } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pcfl-backend.onrender.com';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = Cookies.get('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          Cookies.remove('auth_token');
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(err);
      }
    );
  }

  // Media & File Uploads
  async uploadMedia(file: File): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await this.client.post('/api/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async uploadImage(fileOrFormData: File | FormData): Promise<{ success: boolean; url: string; data: { url: string } }> {
    let file: File;

    if (fileOrFormData instanceof FormData) {
      file = fileOrFormData.get('file') as File;
    } else {
      file = fileOrFormData;
    }

    const res = await this.uploadMedia(file);

    return {
      success: true,
      url: res.url,
      data: { url: res.url },
    };
  }

  // Auth
  async login(email: string, password: string) {
    const res = await this.client.post('/api/auth/login', { email, password });
    return res.data;
  }

  async logout() {
    const res = await this.client.post('/api/auth/logout');
    Cookies.remove('auth_token');
    return res.data;
  }

  async getMe() {
    const res = await this.client.get('/api/auth/me');
    return res.data;
  }

  // Public
  async getHero() {
    const res = await this.client.get('/api/public/hero');
    return res.data;
  }

  async updateHero(data: Record<string, unknown>) {
    const res = await this.client.put('/api/admin/hero', data);
    return res.data;
  }

  async getBoardMembers() {
    const res = await this.client.get('/api/public/board_members');
    return res.data;
  }

  async getPublicEmployees() {
    const res = await this.client.get('/api/public/employees');
    return res.data;
  }

  async getPublicProducts() {
    const res = await this.client.get('/api/public/products');
    return res.data;
  }

  async getPublicProduct(slug: string) {
    const res = await this.client.get(`/api/public/products/${slug}`);
    return res.data;
  }

  async getPublicGallery() {
    const res = await this.client.get('/api/public/gallery');
    return res.data;
  }

  async getContent(key: string) {
    const res = await this.client.get(`/api/public/content/${key}`);
    return res.data;
  }

  async getAbout() {
    const res = await this.client.get('/api/public/about');
    return res.data;
  }

  async getContactInfo() {
    const res = await this.client.get('/api/public/contact-info');
    return res.data;
  }

  // Admin - Stats
  async getStats() {
    const res = await this.client.get('/api/admin/stats');
    return res.data;
  }

  // Admin - Board Members
  async getAdminBoardMembers() {
    const res = await this.client.get('/api/admin/board_members');
    return res.data;
  }

  async createBoardMember(data: Record<string, unknown>) {
    const res = await this.client.post('/api/admin/board_members', data);
    return res.data;
  }

  async updateBoardMember(id: string, data: Record<string, unknown>) {
    const res = await this.client.put(`/api/admin/board_members/${id}`, data);
    return res.data;
  }

  async deleteBoardMember(id: string) {
    const res = await this.client.delete(`/api/admin/board_members/${id}`);
    return res.data;
  }

  // Admin - Products
  async getAdminProducts() {
    const res = await this.client.get('/api/admin/products');
    return res.data;
  }

  async createProduct(data: Record<string, unknown>) {
    const res = await this.client.post('/api/admin/products', data);
    return res.data;
  }

  async updateProduct(id: string, data: Record<string, unknown>) {
    const res = await this.client.put(`/api/admin/products/${id}`, data);
    return res.data;
  }

  async deleteProduct(id: string) {
    const res = await this.client.delete(`/api/admin/products/${id}`);
    return res.data;
  }

  // Admin - Gallery
  async getAdminGallery(): Promise<ApiResponse<GalleryItem[]>> {
    const res = await this.client.get('/api/admin/gallery');
    return res.data;
  }

  async createGalleryItem(data: Partial<GalleryItem>): Promise<ApiResponse<GalleryItem>> {
    const res = await this.client.post('/api/admin/gallery', data);
    return res.data;
  }

  async updateGalleryItem(id: string, data: Partial<GalleryItem>): Promise<ApiResponse<GalleryItem>> {
    const res = await this.client.put(`/api/admin/gallery/${id}`, data);
    return res.data;
  }

  async deleteGalleryItem(id: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/api/admin/gallery/${id}`);
    return res.data;
  }

  // Admin - Content
  async getAdminContent() {
    const res = await this.client.get('/api/admin/content');
    return res.data;
  }

  async updateContent(key: string, data: Record<string, unknown>) {
    const res = await this.client.put(`/api/admin/content/${key}`, data);
    return res.data;
  }

  // Admin - Employees
  async getEmployees() {
    const res = await this.client.get('/api/admin/employees');
    return res.data;
  }

  async createEmployee(data: FormData | Record<string, unknown>) {
    const isFormData = data instanceof FormData;
    const res = await this.client.post('/api/admin/employees', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  }

  async updateEmployee(id: string, data: FormData | Record<string, unknown>) {
    const isFormData = data instanceof FormData;
    const res = await this.client.put(`/api/admin/employees/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  }

  async deleteEmployee(id: string) {
    const res = await this.client.delete(`/api/admin/employees/${id}`);
    return res.data;
  }

  async updateEmployeeRole(id: string, data: Record<string, unknown>) {
    const res = await this.client.patch(`/api/admin/employees/${id}/role`, data);
    return res.data;
  }

  async resetEmployeePassword(id: string, newPassword: string) {
    const res = await this.client.post(`/api/admin/employees/${id}/reset-password`, {
      new_password: newPassword,
    });
    return res.data;
  }
}

export const api = new ApiClient();