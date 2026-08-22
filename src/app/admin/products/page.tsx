'use client';

import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Product } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  image_url: string;
  is_published: boolean;
  sort_order: number;
  features: string;
}

const emptyForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  category: 'Cattle Feed',
  image_url: '',
  is_published: false,
  sort_order: 0,
  features: '',
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminProducts();
      if (res.success && res.data) setProducts(res.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      short_description: p.short_description || '',
      category: p.category,
      image_url: p.image_url || '',
      is_published: p.is_published,
      sort_order: p.sort_order,
      features: Array.isArray(p.features) ? p.features.join('\n') : '',
    });
    setEditingId(p.id);
    setModalOpen(true);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      // Auto-update slug only during creation or if existing slug matches old name conversion
      slug: !editingId ? slugify(name) : prev.slug,
    }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadMedia(file);
      setForm((f) => ({ ...f, image_url: res.url }));
      toast.success('Image uploaded successfully');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.description.trim()) {
      toast.error('Name, slug, and description are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      };

      if (editingId) {
        const res = await api.updateProduct(editingId, payload);
        if (res.success) {
          toast.success('Product updated');
          setModalOpen(false);
          fetchProducts();
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          toast.success('Product created');
          setModalOpen(false);
          fetchProducts();
        }
      }
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteProduct(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleTogglePublish = async (p: Product) => {
    setTogglingId(p.id);
    try {
      await api.updateProduct(p.id, { is_published: !p.is_published });
      toast.success(p.is_published ? 'Unpublished' : 'Published');
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, is_published: !item.is_published } : item))
      );
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="admin-card mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, category, or slug…"
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Product', 'Category', 'Status', 'Order', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                          {p.image_url ? (
                            <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-pcfi-green-100 flex items-center justify-center text-pcfi-green-400 text-xs">
                              IMG
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-gray-400 text-xs">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{p.category}</td>
                    <td className="px-5 py-4">
                      <Badge variant={p.is_published ? 'green' : 'gray'}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{p.sort_order}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          disabled={togglingId === p.id}
                          title={p.is_published ? 'Unpublish' : 'Publish'}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                        >
                          {togglingId === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : p.is_published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-pcfi-green-600 hover:bg-pcfi-green-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Product' : 'Add Product'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Product Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={handleNameChange}
                placeholder="e.g. Bale Silage"
              />
            </div>
            <div>
              <label className="form-label">Slug *</label>
              <input
                className="form-input font-mono text-sm"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="bale-silage"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option>Cattle Feed</option>
                <option>Core Silage</option>
                <option>Supplements</option>
              </select>
            </div>
            <div>
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                className="form-input"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.valueAsNumber || 0 }))}
              />
            </div>
          </div>

          {/* Image File / URL Input */}
          <div>
            <label className="form-label">Product Image</label>
            <div className="flex items-center gap-3">
              <input
                className="form-input flex-1"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://... or upload a file"
              />
              <label className="btn-secondary flex items-center gap-2 cursor-pointer py-2 px-3 text-sm shrink-0">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="form-label">Short Description</label>
            <input
              className="form-input"
              value={form.short_description}
              onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
              placeholder="One-line summary shown in listings"
            />
          </div>

          <div>
            <label className="form-label">Full Description *</label>
            <textarea
              className="form-input h-28 resize-none"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detailed product description…"
            />
          </div>

          <div>
            <label className="form-label">Features (one per line)</label>
            <textarea
              className="form-input h-24 resize-none font-mono text-sm"
              value={form.features}
              onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
              placeholder={'Premium fermentation\nExtended shelf life\nHigh nutritional value'}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_published"
              checked={form.is_published}
              onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              className="w-4 h-4 rounded text-pcfi-green-600 border-gray-300 focus:ring-pcfi-green-500"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
              Publish immediately
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploadingImage}
              className="btn-primary py-2 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Product"
        message="This will permanently remove the product. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}