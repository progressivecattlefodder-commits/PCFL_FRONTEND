'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Save, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { ContentBlock } from '@/types';
import Badge from '@/components/ui/Badge';

export default function AdminContentPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPublished, setEditPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  // Contact info specific fields
  const [contactFields, setContactFields] = useState({
    phone: '',
    email: '',
    address: '',
    facebook: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    tiktok: '',
    twitter: '',
    tagline: '',
  });

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminContent();
      if (res?.success && res?.data) {
        setBlocks(res.data);
      }
    } catch {
      toast.error('Failed to load content blocks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const openEditor = (block: ContentBlock) => {
    setActiveKey(block.key);
    setEditTitle(block.title || '');
    setEditContent(block.content || '');
    setEditPublished(!!block.is_published);

    if (block.key === 'contact_info') {
      const meta = (block.metadata as Record<string, unknown>) || {};
      const social = (meta.social as Record<string, string>) || {};

      setContactFields({
        phone: (meta.phone as string) || '',
        email: (meta.email as string) || '',
        address: (meta.address as string) || '',
        facebook: social.facebook || '',
        instagram: social.instagram || '',
        youtube: social.youtube || '',
        linkedin: social.linkedin || '',
        tiktok: social.tiktok || '',
        twitter: social.twitter || '',
        tagline: (meta.tagline as string) || '',
      });
    }
  };

  const handleSave = async () => {
    if (!activeKey) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: editTitle,
        content: editContent,
        is_published: editPublished,
      };

      if (activeKey === 'contact_info') {
        payload.metadata = {
          phone: contactFields.phone,
          email: contactFields.email,
          address: contactFields.address,
          tagline: contactFields.tagline,
          social: {
            facebook: contactFields.facebook,
            instagram: contactFields.instagram,
            youtube: contactFields.youtube,
            linkedin: contactFields.linkedin,
            tiktok: contactFields.tiktok,
            twitter: contactFields.twitter,
          },
        };
      }

      const res = await api.updateContent(activeKey, payload);
      if (res?.success) {
        toast.success('Content updated');
        setActiveKey(null);
        fetchBlocks();
      }
    } catch {
      toast.error('Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  const friendlyLabel = (key: string) =>
    key
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-500 text-sm mt-0.5">Edit static page content shown across the website.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="admin-card h-20 animate-pulse bg-gray-100 rounded-lg" />)
          ) : blocks.length === 0 ? (
            <div className="admin-card text-center py-8 text-gray-400 text-sm">No content blocks found.</div>
          ) : (
            blocks.map((block) => (
              <button
                key={block.key}
                onClick={() => openEditor(block)}
                className={`w-full text-left admin-card hover:border-pcfi-green-300 transition-all ${
                  activeKey === block.key ? 'border-pcfi-green-500 ring-1 ring-pcfi-green-200' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-pcfi-green-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-pcfi-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{block.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{friendlyLabel(block.key)}</p>
                    </div>
                  </div>
                  <Badge variant={block.is_published ? 'green' : 'gray'}>
                    {block.is_published ? 'Live' : 'Hidden'}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {!activeKey ? (
            <div className="admin-card h-full min-h-[300px] flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText className="w-10 h-10 mb-3" />
              <p className="text-sm">Select a content block to edit</p>
            </div>
          ) : (
            <div className="admin-card">
              <h2 className="font-display text-base font-bold text-gray-900 mb-5">
                Editing: {friendlyLabel(activeKey)}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Title</label>
                  <input className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>

                <div>
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-input h-32 resize-none"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                </div>

                {activeKey === 'contact_info' && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">Contact Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> Phone
                        </label>
                        <input
                          className="form-input"
                          value={contactFields.phone}
                          onChange={(e) => setContactFields((f) => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </label>
                        <input
                          className="form-input"
                          value={contactFields.email}
                          onChange={(e) => setContactFields((f) => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Address
                      </label>
                      <input
                        className="form-input"
                        value={contactFields.address}
                        onChange={(e) => setContactFields((f) => ({ ...f, address: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="form-label">Tagline</label>
                      <input
                        className="form-input"
                        value={contactFields.tagline}
                        onChange={(e) => setContactFields((f) => ({ ...f, tagline: e.target.value }))}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 pt-2">Social Links</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(['facebook', 'instagram', 'youtube', 'linkedin', 'tiktok', 'twitter'] as const).map((key) => (
                        <div key={key}>
                          <label className="form-label capitalize">{key}</label>
                          <input
                            className="form-input"
                            value={contactFields[key]}
                            onChange={(e) => setContactFields((f) => ({ ...f, [key]: e.target.value }))}
                            placeholder={`https://${key}.com/...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="content_published"
                    checked={editPublished}
                    onChange={(e) => setEditPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-pcfi-green-600 border-gray-300 focus:ring-pcfi-green-500"
                  />
                  <label htmlFor="content_published" className="text-sm font-medium text-gray-700">
                    Published (visible on site)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setActiveKey(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary py-2 disabled:opacity-60">
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}