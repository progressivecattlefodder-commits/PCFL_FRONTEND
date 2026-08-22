'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';

// FIX 1: Added index signature `[key: string]: unknown;` to make BoardMember compatible with Record<string, unknown>
interface BoardMember {
  [key: string]: unknown;
  id: string;
  full_name: string;
  title: string;
  bio?: string;
  image_url?: string;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

const emptyForm: BoardMember = {
  id: '',
  full_name: '',
  title: '',
  bio: '',
  image_url: '',
  sort_order: 0,
  is_published: false,
};

export default function AdminBoardMembersPage() {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BoardMember>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBoardMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminBoardMembers();
      if (res.success) setBoardMembers(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load board members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoardMembers();
  }, [fetchBoardMembers]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (member: BoardMember) => {
    setForm({
      id: member.id,
      full_name: member.full_name,
      title: member.title,
      bio: member.bio || '',
      image_url: member.image_url || '',
      sort_order: member.sort_order,
      is_published: member.is_published,
    });
    setEditingId(member.id);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.uploadImage(formData);

      if (res.success && (res.data?.url || res.url)) {
        const imageUrl = res.data?.url || res.url;
        setForm((f) => ({ ...f, image_url: imageUrl }));
        toast.success('Image uploaded successfully');
      } else {
        // FIX 2: Safely access error property to satisfy TypeScript
        const errorMsg = (res as { error?: string })?.error || 'Failed to upload image';
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('Upload error details:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to upload image';
      toast.error(errorMsg);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.title.trim()) {
      toast.error('Name and title are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.updateBoardMember(editingId, form);
        if (res.success) {
          toast.success('Board member updated');
          setModalOpen(false);
          fetchBoardMembers();
        }
      } else {
        const res = await api.createBoardMember(form);
        if (res.success) {
          toast.success('Board member created');
          setModalOpen(false);
          fetchBoardMembers();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save board member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteBoardMember(deleteId);
      toast.success('Board member deleted');
      setDeleteId(null);
      fetchBoardMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete board member');
    }
  };

  const handleTogglePublish = async (member: BoardMember) => {
    try {
      const payload: BoardMember = {
        ...member,
        is_published: !member.is_published,
      };
      const res = await api.updateBoardMember(member.id, payload);
      if (res.success) {
        toast.success(member.is_published ? 'Unpublished' : 'Published');
        fetchBoardMembers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const filtered = boardMembers.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Board Members</h1>
          <p className="text-gray-500 text-sm mt-0.5">{boardMembers.length} total members</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Board Member
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
            placeholder="Search members by name or title…"
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
                {['Member', 'Title', 'Status', 'Order', 'Actions'].map((h) => (
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
                    No board members found.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          {m.image_url ? (
                            <Image src={m.image_url} alt={m.full_name} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-pcfi-green-100 flex items-center justify-center text-pcfi-green-600 font-bold text-xs">
                              {m.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{m.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{m.title}</td>
                    <td className="px-5 py-4">
                      <Badge variant={m.is_published ? 'green' : 'gray'}>
                        {m.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{m.sort_order}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(m)}
                          title={m.is_published ? 'Unpublish' : 'Publish'}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          {m.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(m)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-pcfi-green-600 hover:bg-pcfi-green-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(m.id)}
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Board Member' : 'Add Board Member'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div>
              <label className="form-label">Title / Role *</label>
              <input
                className="form-input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Chairperson"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Profile Image</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {form.image_url && (
                <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={form.image_url} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                className="form-input"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Bio</label>
            <textarea
              className="form-input h-28 resize-none"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Short bio or background information…"
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
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary py-2 disabled:opacity-60">
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Member'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Board Member"
        message="This will permanently remove the board member. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}