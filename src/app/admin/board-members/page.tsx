'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Eye, EyeOff, Edit, Trash2, X, Upload } from 'lucide-react';
import { api } from '@/lib/api';

interface BoardMember {
  id: string | number;
  full_name: string;
  title: string;
  status?: string;
  bio?: string;
  image_url?: string;
  sort_order?: number;
  is_published?: boolean;
}

// Helper to resolve absolute image paths dynamically
const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/images/')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

function MemberAvatar({ url, name }: { url?: string; name: string }) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = resolveImageUrl(url);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  if (!resolvedUrl || hasError) {
    return (
      <div className="w-10 h-10 rounded-full bg-pcfi-green-100 text-pcfi-green-800 font-bold flex items-center justify-center text-sm border border-pcfi-green-200 shrink-0">
        {name ? name.charAt(0).toUpperCase() : 'B'}
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
      <img
        src={resolvedUrl}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function AdminBoardMembersPage() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    status: 'Mr.',
    full_name: '',
    title: 'Director',
    bio: '',
    image_url: '',
    sort_order: 1,
    is_published: true,
  });

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminBoardMembers();
      const data = Array.isArray(res) ? res : res?.data || [];
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch board members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenModal = (member?: BoardMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        status: member.status || 'Mr.',
        full_name: member.full_name || '',
        title: member.title || 'Director',
        bio: member.bio || '',
        image_url: member.image_url || '',
        sort_order: member.sort_order || 1,
        is_published: member.is_published ?? true,
      });
    } else {
      setEditingMember(null);
      setFormData({
        status: 'Mr.',
        full_name: '',
        title: 'Director',
        bio: '',
        image_url: '',
        sort_order: members.length + 1,
        is_published: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await api.uploadImage(file);
      const uploadedUrl = res?.url || res?.data?.url;
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image_url: uploadedUrl }));
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await api.updateBoardMember(editingMember.id, formData);
      } else {
        await api.createBoardMember(formData);
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (err) {
      console.error('Failed to save board member:', err);
      alert('Error saving board member');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this board member?')) return;
    try {
      await api.deleteBoardMember(id);
      fetchMembers();
    } catch (err) {
      console.error('Failed to delete board member:', err);
    }
  };

  const handleTogglePublish = async (member: BoardMember) => {
    try {
      await api.updateBoardMember(member.id, {
        is_published: !member.is_published,
      });
      fetchMembers();
    } catch (err) {
      console.error('Failed to toggle publish state:', err);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Board Members</h1>
          <p className="text-sm text-gray-500 mt-1">{members.length} total members</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-pcfi-green-700 hover:bg-pcfi-green-800 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Board Member
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search members by name or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pcfi-green-600"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading members...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase font-semibold text-gray-500 tracking-wider">
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <MemberAvatar url={member.image_url} name={member.full_name} />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {member.status ? `${member.status} ` : ''}{member.full_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">{member.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          member.is_published ?? true
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {member.is_published ?? true ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{member.sort_order || 1}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(member)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Toggle Visibility"
                        >
                          {member.is_published ?? true ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenModal(member)}
                          className="p-1.5 text-gray-400 hover:text-pcfi-green-700 transition-colors"
                          title="Edit Member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-gray-900">
                {editingMember ? 'Edit Board Member' : 'Add Board Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    placeholder="Mr. / Dr."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pcfi-green-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Gopal Thapa"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pcfi-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title / Designation</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chairman / Director"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pcfi-green-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Board Member Photo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="/images/Personalities/Per_1.jpeg or relative upload path"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pcfi-green-600"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-xs transition-colors shrink-0">
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {/* Avatar Live Preview */}
              {formData.image_url && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <MemberAvatar url={formData.image_url} name={formData.full_name || 'Preview'} />
                  <span className="text-xs text-gray-500 truncate">Image Preview</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Biography</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Enter board member bio..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pcfi-green-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded border-gray-300 text-pcfi-green-700 focus:ring-pcfi-green-600"
                  />
                  Publish on Website
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 text-sm font-medium bg-pcfi-green-700 hover:bg-pcfi-green-800 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}