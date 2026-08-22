'use client';

import { useEffect, useState, useCallback, ChangeEvent, useRef } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Upload, Loader2, ImageOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, ApiResponse } from '@/lib/api';
import { GalleryItem } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';

interface GalleryForm {
  title: string;
  description: string;
  image_url: string;
  category: string;
  sort_order: number;
  is_published: boolean;
}

const emptyForm: GalleryForm = {
  title: '',
  description: '',
  image_url: '',
  category: 'Production',
  sort_order: 0,
  is_published: true,
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminGallery();
      if (res?.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else if (Array.isArray(res)) {
        setItems(res as unknown as GalleryItem[]);
      }
    } catch {
      toast.error('Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setForm({
      title: item.title || '',
      description: item.description || '',
      image_url: item.image_url || '',
      category: item.category || 'Production',
      sort_order: typeof item.sort_order === 'number' ? item.sort_order : 0,
      is_published: !!item.is_published,
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadMedia(file);
      if (res?.url) {
        setForm((f) => ({ ...f, image_url: res.url }));
        toast.success('Image uploaded');
      } else {
        toast.error('Invalid response from upload server');
      }
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image_url.trim()) {
      toast.error('Title and image URL are required');
      return;
    }

    setSaving(true);
    try {
      let res: ApiResponse<GalleryItem>;

      if (editingId) {
        res = await api.updateGalleryItem(editingId, form);
      } else {
        res = await api.createGalleryItem(form);
      }

      if (res?.success || res?.data) {
        toast.success(editingId ? 'Gallery item updated' : 'Gallery item added');
        setModalOpen(false);
        fetchItems();
      } else {
        toast.error('Failed to save gallery item');
      }
    } catch {
      toast.error('Failed to save gallery item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteGalleryItem(deleteId);
      toast.success('Gallery item deleted');
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleTogglePublish = async (item: GalleryItem) => {
    try {
      await api.updateGalleryItem(item.id, { is_published: !item.is_published });
      toast.success(item.is_published ? 'Unpublished' : 'Published');
      fetchItems();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = items.filter(
    (i) =>
      (i.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} total images</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      <div className="admin-card mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gallery…"
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card text-center py-16 text-gray-400">No gallery items found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-gray-100">
                {item.image_url && !imageError[item.id] ? (
                  <Image
                    src={item.image_url}
                    alt={item.title || 'Gallery image'}
                    fill
                    unoptimized
                    className="object-cover"
                    onError={() => setImageError((prev) => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                    <ImageOff className="w-6 h-6" />
                    <span>No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className="p-2 bg-white rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                    title={item.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {item.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 bg-white rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                    title="Edit item"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-2 bg-white rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 bg-white border-t border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{item.title || 'Untitled'}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-400">{item.category || 'Uncategorized'}</span>
                  <Badge variant={item.is_published ? 'green' : 'gray'}>
                    {item.is_published ? 'Live' : 'Hidden'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Image' : 'Add Image'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="form-label block text-sm font-medium mb-1">Title *</label>
            <input
              className="form-input w-full"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Corn Silage Process"
            />
          </div>

          <div>
            <label className="form-label block text-sm font-medium mb-1">Image *</label>
            <div className="flex items-center gap-3">
              <input
                className="form-input flex-1"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://... or upload a file"
              />
              <label className="btn-secondary flex items-center gap-2 cursor-pointer py-2 px-3 text-sm shrink-0 border rounded-lg hover:bg-gray-50">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {form.image_url && (
            <div className="relative h-40 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <Image src={form.image_url} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          )}

          <div>
            <label className="form-label block text-sm font-medium mb-1">Description</label>
            <textarea
              className="form-input w-full h-20 resize-none"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label block text-sm font-medium mb-1">Category</label>
              <select
                className="form-input w-full"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="Production">Production</option>
                <option value="Farm">Farm</option>
                <option value="Team">Team</option>
                <option value="Events">Events</option>
              </select>
            </div>
            <div>
              <label className="form-label block text-sm font-medium mb-1">Sort Order</label>
              <input
                type="number"
                className="form-input w-full"
                value={form.sort_order}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setForm((f) => ({ ...f, sort_order: Number.isNaN(val) ? 0 : val }));
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="gallery_published"
              checked={form.is_published}
              onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500"
            />
            <label htmlFor="gallery_published" className="text-sm font-medium text-gray-700 cursor-pointer">
              Publish immediately
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploadingImage}
              className="btn-primary py-2 px-4 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Image'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Image"
        message="This will permanently remove the image from the gallery."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}