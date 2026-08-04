import { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Loader2, Users, Check, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Toggle } from '../../components/ui/Toggle';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { User } from '../../types';

interface Permission { id: string; key: string; module: string; action: string; description: string | null; }
interface Role { id: string; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; permissions: { permission: Permission }[]; _count: { userRoles: number }; }

const MODULES = ['products', 'users', 'transactions', 'payments', 'consultations', 'bmi', 'chat', 'locations', 'roles', 'audit', 'settings'];

export default function AdminRoles({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<Partial<Role>>({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const fetchRoles = async () => {
    const res = await fetch('/api/admin/rbac/roles', { credentials: 'include' });
    const json = await res.json();
    if (json.success) setRoles(json.data);
  };

  const fetchPermissions = async () => {
    const res = await fetch('/api/admin/rbac/permissions', { credentials: 'include' });
    const json = await res.json();
    if (json.success) setPermissions(json.data);
  };

  useEffect(() => {
    Promise.all([fetchRoles(), fetchPermissions()]).finally(() => setLoading(false));
  }, []);

  const openPermModal = (role: Role) => {
    setSelectedRole(role);
    setSelectedPerms(role.permissions.map(p => p.permission.key));
    setIsSuperAdmin(role.slug === 'super_admin');
    setEditModalOpen(true);
  };

  const togglePerm = (key: string) => {
    setSelectedPerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const savePermissions = async () => {
    if (!selectedRole || isSuperAdmin) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/rbac/roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionKeys: selectedPerms }),
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setEditModalOpen(false);
        fetchRoles();
      }
    } finally { setSaving(false); }
  };

  const saveRoleEdit = async () => {
    if (!editRole.name?.trim()) return;
    setSaving(true);
    try {
      if ((editRole as any).id) {
        await fetch(`/api/admin/rbac/roles/${(editRole as any).id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editRole.name, description: editRole.description, isActive: editRole.isActive }),
          credentials: 'include',
        });
      } else {
        const slug = editRole.name!.toLowerCase().replace(/\s+/g, '_');
        await fetch('/api/admin/rbac/roles', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editRole.name, slug, description: editRole.description }),
          credentials: 'include',
        });
      }
      setEditModalOpen(false);
      fetchRoles();
    } finally { setSaving(false); }
  };

  const deleteRole = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/admin/rbac/roles/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' });
    setDeleteTarget(null);
    fetchRoles();
  };

  if (loading) return (
    <AdminLayout user={user} title="Role & Akses" onLogout={onLogout}>
      <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout user={user} title="Role & Akses" onLogout={onLogout}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Role & Akses</h1>
            <p className="text-foreground-muted mt-1 text-sm">Kelola role dan permission untuk admin panel</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} size="md" onClick={() => { setEditRole({}); setEditModalOpen(true); }}>
            Tambah Role
          </Button>
        </div>

        <div className="grid gap-4">
          {roles.map(role => (
            <Card key={role.id} padding="md" className="hover:border-brand-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-soft flex items-center justify-center">
                    <Shield className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{role.name}</h3>
                      {role.isSystem && <Badge variant="neutral">System</Badge>}
                      {!role.isActive && <Badge variant="danger">Inactive</Badge>}
                    </div>
                    <p className="text-xs text-foreground-muted mt-0.5">{role.description || '—'}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Users className="w-3 h-3 text-foreground-subtle" />
                      <span className="text-xs text-foreground-subtle">{role._count.userRoles} user{role._count.userRoles !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => { setEditRole(role); setEditModalOpen(true); }}>
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" icon={<Shield className="w-3.5 h-3.5" />} onClick={() => openPermModal(role)}>
                    Permission
                  </Button>
                  {!role.isSystem && (
                    <Button variant="ghost" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeleteTarget(role)} className="text-danger hover:text-danger" />
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {role.permissions.map(p => (
                  <span key={p.permission.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-surface-secondary text-foreground-muted">
                    {p.permission.key}
                  </span>
                ))}
                {role.permissions.length === 0 && <span className="text-xs text-foreground-subtle">No permissions</span>}
              </div>
            </Card>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Role" size="sm">
          <p className="text-sm text-foreground-muted mb-6">
            Apakah Anda yakin ingin menghapus role <strong>"{deleteTarget?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button size="sm" variant="danger" onClick={deleteRole}>Hapus</Button>
          </div>
        </Modal>

        {/* Permission Edit Modal */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={editRole?.id ? `Edit Role: ${editRole.name}` : 'Tambah Role'} size="md">
          {selectedRole ? (
            <div className="space-y-4">
              {isSuperAdmin ? (
                <p className="text-sm text-foreground-muted py-4 text-center">Super Admin memiliki semua permission dan tidak dapat diubah.</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground mb-2">Modul Permission</p>
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                    {MODULES.map(mod => {
                      const modPerms = permissions.filter(p => p.module === mod);
                      if (!modPerms.length) return null;
                      return (
                        <div key={mod}>
                          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">{mod}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {modPerms.map(perm => {
                              const checked = selectedPerms.includes(perm.key);
                              return (
                                <label key={perm.id} className="flex items-start gap-2 cursor-pointer group">
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${checked ? 'bg-brand-primary border-brand-primary' : 'border-border group-hover:border-brand-primary/50'}`}
                                    onClick={() => togglePerm(perm.key)}>
                                    {checked && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <div>
                                    <span className="text-sm text-foreground">{perm.action}</span>
                                    <span className="text-xs text-foreground-muted block">{perm.description || perm.key}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setEditModalOpen(false)}>Batal</Button>
                <Button size="sm" onClick={savePermissions} disabled={saving || isSuperAdmin}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Simpan
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nama Role</label>
                <Input value={editRole.name ?? ''} onChange={e => setEditRole(r => ({ ...r, name: e.target.value }))} placeholder="Contoh: Content Admin" className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Deskripsi</label>
                <Input value={editRole.description ?? ''} onChange={e => setEditRole(r => ({ ...r, description: e.target.value }))} placeholder="Opsional" className="w-full" />
              </div>
              {editRole.id && (
                <div className="flex items-center justify-between py-3 border-t border-border">
                  <div>
                    <span className="text-sm font-medium text-foreground">Status Aktif</span>
                    <p className="text-xs text-foreground-muted mt-0.5">Role nonaktif tidak dapat digunakan</p>
                  </div>
                  <Toggle checked={editRole.isActive ?? true} onChange={e => setEditRole(r => ({ ...r, isActive: e.currentTarget.checked }))} />
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setEditModalOpen(false)}>Batal</Button>
                <Button size="sm" onClick={saveRoleEdit} disabled={saving || !editRole.name?.trim()}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Simpan
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
