'use client';

import { useEffect, useState } from 'react';
import { Save, Layout, User as UserIcon, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { HeroSection } from '@/types';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [hero, setHero] = useState<Partial<HeroSection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<'hero' | 'account'>('hero');

  useEffect(() => {
    api.getHero()
      .then((res) => {
        if (res?.success && res?.data) {
          setHero(res.data);
        }
      })
      .catch(() => {
        toast.error('Failed to load hero section');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.uploadMedia(file);
      const imageUrl = res?.url || (res?.id ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/media/${res.id}` : '');
      
      setHero((h) => ({ ...h, background_image_url: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

const handleSaveHero = async () => {
  setSaving(true);
  try {
    const res = await api.updateHero({
      heading: hero.heading ?? '',
      subheading: hero.subheading ?? '',
      description: hero.description ?? '',
      primary_cta_text: hero.primary_cta_text ?? '',
      primary_cta_link: hero.primary_cta_link ?? '',
      secondary_cta_text: hero.secondary_cta_text ?? '',
      secondary_cta_link: hero.secondary_cta_link ?? '',
      background_image_url: hero.background_image_url ?? '',
      is_active: hero.is_active ?? true,
    });

    if (res?.success) {
      toast.success('Hero section updated');
    } else {
      const msg = typeof res?.message === 'string' ? res.message : 'Failed to update hero section';
      toast.error(msg);
    }
  } catch (error: any) {
    console.error('Update Hero Error:', error);
    
    const errPayload = error?.response?.data?.message;
    const errorMessage = Array.isArray(errPayload)
      ? errPayload.join(', ')
      : typeof errPayload === 'string'
      ? errPayload
      : 'Failed to update hero section';

    toast.error(errorMessage);
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your homepage hero and account details.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: 'hero', label: 'Hero Section', icon: Layout },
          { key: 'account', label: 'My Account', icon: UserIcon },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'hero' | 'account')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-pcfi-green-600 text-pcfi-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'hero' && (
        <div className="admin-card">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="form-label">Heading</label>
                <input
                  className="form-input"
                  value={hero.heading || ''}
                  onChange={(e) => setHero((h) => ({ ...h, heading: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">Subheading</label>
                <input
                  className="form-input"
                  value={hero.subheading || ''}
                  onChange={(e) => setHero((h) => ({ ...h, subheading: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input h-24 resize-none"
                  value={hero.description || ''}
                  onChange={(e) => setHero((h) => ({ ...h, description: e.target.value }))}
                />
              </div>

              {/* Background Image with File Upload */}
              <div>
                <label className="form-label">Background Image</label>
                <div className="flex gap-2 items-center">
                  <input
                    className="form-input flex-1"
                    value={hero.background_image_url || ''}
                    onChange={(e) => setHero((h) => ({ ...h, background_image_url: e.target.value }))}
                    placeholder="https://... or upload image"
                  />
                  <label className="btn-secondary py-2 px-4 cursor-pointer flex items-center gap-2 shrink-0">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    ) : (
                      <Upload className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm font-medium">
                      {uploading ? 'Uploading…' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {hero.background_image_url && (
                  <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={hero.background_image_url}
                      alt="Hero background preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="form-label">Primary Button Text</label>
                  <input
                    className="form-input"
                    value={hero.primary_cta_text || ''}
                    onChange={(e) => setHero((h) => ({ ...h, primary_cta_text: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Primary Button Link</label>
                  <input
                    className="form-input"
                    value={hero.primary_cta_link || ''}
                    onChange={(e) => setHero((h) => ({ ...h, primary_cta_link: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Secondary Button Text</label>
                  <input
                    className="form-input"
                    value={hero.secondary_cta_text || ''}
                    onChange={(e) => setHero((h) => ({ ...h, secondary_cta_text: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Secondary Button Link</label>
                  <input
                    className="form-input"
                    value={hero.secondary_cta_link || ''}
                    onChange={(e) => setHero((h) => ({ ...h, secondary_cta_link: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button onClick={handleSaveHero} disabled={saving} className="btn-primary py-2 disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save Hero Section'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'account' && (
        <div className="admin-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-pcfi-gold-500 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <p className="font-display text-lg font-bold text-gray-900">{user?.full_name || 'N/A'}</p>
              <p className="text-gray-500 text-sm">{user?.email || 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-400 text-xs mb-1">Role</p>
              <p className="font-medium text-gray-900 capitalize">{user?.role || '—'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-400 text-xs mb-1">Account Status</p>
              <p className="font-medium text-green-700">{user?.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-400 text-xs mb-1">Member Since</p>
              <p className="font-medium text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-400 text-xs mb-1">Last Login</p>
              <p className="font-medium text-gray-900">
                {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            To change your password, ask a super admin to reset it from the Employees page.
          </p>
        </div>
      )}
    </div>
  );
}