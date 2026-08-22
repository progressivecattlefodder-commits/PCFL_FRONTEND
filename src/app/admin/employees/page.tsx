'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  KeyRound,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  UserCog2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { User, UserRole } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';

interface CreateForm {
  [key: string]: unknown;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

interface EditForm {
  [key: string]: unknown;
  full_name: string;
  email: string;
  is_active: boolean;
}

const emptyCreateForm: CreateForm = { email: '', password: '', full_name: '', role: 'editor' };

const roleBadge: Record<UserRole, 'purple' | 'green' | 'blue' | 'gray'> = {
  superadmin: 'purple',
  admin: 'green',
  editor: 'blue',
  viewer: 'gray',
};

const roleIcon: Record<UserRole, typeof Shield> = {
  superadmin: ShieldAlert,
  admin: ShieldCheck,
  editor: UserCog,
  viewer: Shield,
};

const permissionLabels: Record<string, string> = {
  can_manage_products: 'Manage Products',
  can_manage_gallery: 'Manage Gallery',
  can_manage_content: 'Manage Content',
  can_manage_users: 'Manage Employees',
};

export default function AdminEmployeesPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm);
  const [editForm, setEditForm] = useState<EditForm>({ full_name: '', email: '', is_active: true });
  const [roleForm, setRoleForm] = useState<{ role: UserRole; permissions: Record<string, boolean> }>({
    role: 'editor',
    permissions: {},
  });
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const hasAdminAccess = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getEmployees();
      if (res.success && res.data) setEmployees(res.data);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Create
  const handleCreate = async () => {
    if (!createForm.email.trim() || !createForm.password.trim() || !createForm.full_name.trim()) {
      toast.error('All fields are required');
      return;
    }
    if (createForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await api.createEmployee(createForm);
      if (res.success) {
        toast.success('Employee created');
        setCreateOpen(false);
        setCreateForm(emptyCreateForm);
        fetchEmployees();
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create employee';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Edit details
  const openEdit = (emp: User) => {
    setEditingId(emp.id);
    setEditForm({ full_name: emp.full_name, email: emp.email, is_active: emp.is_active });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingId || !editForm.full_name.trim() || !editForm.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      const res = await api.updateEmployee(editingId, editForm);
      if (res.success) {
        toast.success('Employee updated');
        setEditOpen(false);
        fetchEmployees();
      }
    } catch {
      toast.error('Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  // Role & Permissions
  const openRole = (emp: User) => {
    setEditingId(emp.id);
    const perms = (emp.permissions || {}) as Record<string, boolean>;
    setRoleForm({
      role: emp.role,
      permissions: {
        can_manage_products: Boolean(perms.can_manage_products),
        can_manage_gallery: Boolean(perms.can_manage_gallery),
        can_manage_content: Boolean(perms.can_manage_content),
        can_manage_users: Boolean(perms.can_manage_users),
      },
    });
    setRoleOpen(true);
  };

  const handleRoleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await api.updateEmployeeRole(editingId, roleForm);
      if (res.success) {
        toast.success('Role & permissions updated');
        setRoleOpen(false);
        fetchEmployees();
      }
    } catch {
      toast.error('Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  // Password reset
  const openPw = (emp: User) => {
    setEditingId(emp.id);
    setNewPassword('');
    setPwOpen(true);
  };

  const handlePasswordReset = async () => {
    if (!editingId || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await api.resetEmployeePassword(editingId, newPassword);
      toast.success('Password reset');
      setPwOpen(false);
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteEmployee(deleteId);
      toast.success('Employee removed');
      setDeleteId(null);
      fetchEmployees();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete';
      toast.error(msg);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="admin-card text-center py-16">
          <div className="w-8 h-8 border-4 border-pcfi-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm mt-4">Loading…</p>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="admin-card text-center py-16">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 text-sm mt-0.5">{employees.length} team members</p>
        </div>
        <button
          onClick={() => {
            setCreateForm(emptyCreateForm);
            setCreateOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Employee
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
            placeholder="Search by name or email…"
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
                {['Employee', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
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
                    No employees found.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const RoleIcon = roleIcon[emp.role] || Shield;
                  const isSelf = emp.id === currentUser?.id;
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      {/* Name + email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-pcfi-green-100 rounded-full flex items-center justify-center text-pcfi-green-700 text-xs font-bold shrink-0">
                            {emp.full_name ? emp.full_name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {emp.full_name}
                              {isSelf && <span className="text-xs text-gray-400 ml-1">(You)</span>}
                            </p>
                            <p className="text-gray-400 text-xs">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="px-5 py-4">
                        <Badge variant={roleBadge[emp.role] || 'gray'}>
                          <RoleIcon className="w-3 h-3 mr-1 inline" />
                          {emp.role}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge variant={emp.is_active ? 'green' : 'red'}>
                          {emp.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>

                      {/* Last login */}
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {emp.last_login ? new Date(emp.last_login).toLocaleDateString() : 'Never'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {/* Edit details — admin + superadmin */}
                          {hasAdminAccess && (
                            <button
                              onClick={() => openEdit(emp)}
                              title="Edit name, email, status"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-pcfi-green-600 hover:bg-pcfi-green-50 transition-colors"
                            >
                              <UserCog2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Role & permissions — superadmin only */}
                          {isSuperAdmin && (
                            <button
                              onClick={() => openRole(emp)}
                              title="Manage role & permissions"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reset password — admin + superadmin */}
                          {hasAdminAccess && (
                            <button
                              onClick={() => openPw(emp)}
                              title="Reset password"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete — superadmin only, not self */}
                          {isSuperAdmin && !isSelf && (
                            <button
                              onClick={() => setDeleteId(emp.id)}
                              title="Delete employee"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE Employee Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Employee" size="md">
        <div className="space-y-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              value={createForm.full_name}
              onChange={(e) => setCreateForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="e.g. Sita Sharma"
            />
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input
              className="form-input"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="employee@pcfi.com.np"
            />
          </div>
          <div>
            <label className="form-label">Temporary Password *</label>
            <input
              className="form-input"
              type="text"
              value={createForm.password}
              onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="form-label">Role *</label>
            <select
              className="form-input"
              value={createForm.role}
              onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            >
              <option value="viewer">Viewer — read only</option>
              <option value="editor">Editor — manage content</option>
              {isSuperAdmin && <option value="admin">Admin — full access except role mgmt</option>}
            </select>
            <p className="text-xs text-gray-400 mt-1.5">
              Only the super admin can assign Admin roles or customize permissions.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving} className="btn-primary py-2 disabled:opacity-60">
              {saving ? 'Creating…' : 'Create Employee'}
            </button>
          </div>
        </div>
      </Modal>

      {/* EDIT Employee Details Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Employee Details" size="md">
        <div className="space-y-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              value={editForm.full_name}
              onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input
              className="form-input"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Email address"
            />
          </div>
          <div>
            <label className="form-label">Account Status</label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_active"
                  checked={editForm.is_active}
                  onChange={() => setEditForm((f) => ({ ...f, is_active: true }))}
                />
                <span className="text-sm font-medium text-green-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_active"
                  checked={!editForm.is_active}
                  onChange={() => setEditForm((f) => ({ ...f, is_active: false }))}
                />
                <span className="text-sm font-medium text-red-700">Inactive</span>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Inactive accounts cannot log in.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button onClick={handleEdit} disabled={saving} className="btn-primary py-2 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ROLE & PERMISSIONS Modal */}
      <Modal open={roleOpen} onClose={() => setRoleOpen(false)} title="Role & Permissions" size="md">
        <div className="space-y-5">
          <div>
            <label className="form-label">Role</label>
            <select
              className="form-input"
              value={roleForm.role}
              onChange={(e) => setRoleForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            >
              <option value="viewer">Viewer — read only</option>
              <option value="editor">Editor — manage content</option>
              <option value="admin">Admin — full access except role mgmt</option>
              <option value="superadmin">Super Admin — full access</option>
            </select>
          </div>
          <div>
            <p className="form-label mb-1">Custom Permission Overrides</p>
            <p className="text-xs text-gray-400 mb-3">
              These fine-tune access beyond what the role provides. Admins and Super Admins always have full access
              regardless.
            </p>
            <div className="space-y-2.5">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <span className="text-sm text-gray-700">{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(roleForm.permissions[key])}
                    onChange={(e) =>
                      setRoleForm((f) => ({
                        ...f,
                        permissions: { ...f.permissions, [key]: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded text-pcfi-green-600 border-gray-300 focus:ring-pcfi-green-500"
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRoleOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button onClick={handleRoleSave} disabled={saving} className="btn-primary py-2 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Role & Permissions'}
            </button>
          </div>
        </div>
      </Modal>

      {/* RESET PASSWORD Modal */}
      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Reset Password" size="sm">
        <div className="space-y-4">
          <div>
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setPwOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button onClick={handlePasswordReset} disabled={saving} className="btn-primary py-2 disabled:opacity-60">
              {saving ? 'Resetting…' : 'Reset Password'}
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE Confirm */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Remove Employee"
        message="This will permanently delete the employee account. This action cannot be undone."
        confirmLabel="Remove"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}