import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, Award } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Toggle } from '../../components/ui/Toggle';
import { Card } from '../../components/ui/Card';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminUsersApi, type User } from '../../lib/api';
import type { User as UserType } from '../../types';

const avatarColors = [
  'bg-brand-primary-soft text-brand-primary',
  'bg-brand-accent-soft text-brand-accent',
  'bg-success-soft text-success',
  'bg-information-soft text-information',
  'bg-warning-soft text-warning',
];

function getInitials(name: string): string {
  return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
}

function getAvatarColor(name: string): string {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

 
export default function AdminUsers({ user, onLogout }: { user: UserType; onLogout: () => void }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [membershipModal, setMembershipModal] = useState<{ user: User; status: 'regular' | 'member'; expiresAt: string } | null>(null);
  const [membershipSaving, setMembershipSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    adminUsersApi.list({ search: search || undefined, page: 1, limit: 20 }).then(res => {
      if (!ignore && res.success && res.data) {
        setUsers(res.data.users);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
        setPage(res.data.pagination.page);
      }
    }).catch(() => {}).finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [search]);

  const fetchPage = (pageNum: number) => {
    setLoading(true);
    adminUsersApi.list({ search: search || undefined, page: pageNum, limit: 20 }).then(res => {
      if (res.success && res.data) {
        setUsers(res.data.users);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
        setPage(res.data.pagination.page);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const handleToggleActive = (u: User) => {
    adminUsersApi.updateStatus(u.id, { isActive: !u.isActive }).then(res => {
      if (res.success && res.data) {
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: res.data!.isActive } : x));
      }
    });
  };

  const openMembershipModal = (u: User) => {
    setMembershipModal({
      user: u,
      status: u.membershipStatus as 'regular' | 'member',
      expiresAt: u.membershipExpiresAt ? u.membershipExpiresAt.split('T')[0] : '',
    });
  };

  const saveMembership = () => {
    if (!membershipModal) return;
    setMembershipSaving(true);
    adminUsersApi.updateMembership(membershipModal.user.id, {
      membershipStatus: membershipModal.status,
      membershipExpiresAt: membershipModal.expiresAt || null,
    }).then(res => {
      if (res.success) {
        setUsers(prev => prev.map(x => x.id === membershipModal.user.id ? {
          ...x,
          membershipStatus: membershipModal.status,
          membershipExpiresAt: membershipModal.expiresAt || null,
          membershipActive: membershipModal.status === 'member' && !!membershipModal.expiresAt,
        } : x));
        setMembershipModal(null);
      }
    }).catch(() => {}).finally(() => setMembershipSaving(false));
  };

  return (
    <AdminLayout user={user} title="Pengguna" onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Pengguna</h1>
          <p className="text-foreground-muted mt-1 text-sm">Kelola pengguna dan membership di platform NC Mulia</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide">Pengguna</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide">Membership</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide hidden lg:table-cell">Berlaku</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide hidden lg:table-cell">Bergabung</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-foreground-muted text-sm">Tidak ada pengguna ditemukan</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="bg-surface hover:bg-surface-secondary/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(u.name)}`}>
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate max-w-[140px]">{u.name}</div>
                          <div className="text-xs text-foreground-subtle md:hidden truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-foreground-muted">{u.email}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openMembershipModal(u)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                          u.membershipStatus === 'member'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        {u.membershipStatus === 'member' ? 'Member' : 'Regular'}
                      </button>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-xs text-foreground-muted">
                      {u.membershipExpiresAt ? formatDate(u.membershipExpiresAt) : '-'}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-xs text-foreground-muted">{u.createdAt ? formatDate(u.createdAt) : '-'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Toggle
                          checked={u.isActive}
                          onChange={() => handleToggleActive(u)}
                          aria-label={`Toggle ${u.name}`}
                        />
                        <Badge variant={u.isActive ? 'success' : 'neutral'} dot>{u.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openMembershipModal(u)}
                        className="text-xs text-brand-primary hover:text-brand-primary-hover font-medium px-2.5 py-1.5 rounded-lg hover:bg-brand-primary-soft transition-colors"
                      >
                        Edit Membership
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-border flex items-center justify-between bg-surface-secondary/30">
            <span className="text-xs text-foreground-muted">Menampilkan {users.length} dari {total} pengguna</span>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchPage(Math.max(1, page - 1))} disabled={page <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface-secondary transition-colors disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = startPage + i;
                return (
                  <button key={p} onClick={() => fetchPage(p)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${page === p ? 'bg-brand-primary text-white' : 'text-foreground-muted hover:bg-surface-secondary'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => fetchPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface-secondary transition-colors disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {membershipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMembershipModal(null)} />
          <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Membership: {membershipModal.user.name}</h2>
              <button onClick={() => setMembershipModal(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-muted hover:bg-surface-secondary">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Status Membership</label>
                <select
                  value={membershipModal.status}
                  onChange={e => setMembershipModal(p => p ? { ...p, status: e.target.value as 'regular' | 'member' } : null)}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                >
                  <option value="regular">Regular</option>
                  <option value="member">Member (Diskon 30%)</option>
                </select>
              </div>
              {membershipModal.status === 'member' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tanggal Berakhir (opsional)</label>
                  <input
                    type="date"
                    value={membershipModal.expiresAt}
                    onChange={e => setMembershipModal(p => p ? { ...p, expiresAt: e.target.value } : null)}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                  />
                  <p className="text-xs text-foreground-muted mt-1">Kosongkan jika tidak ada batas waktu.</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button onClick={() => setMembershipModal(null)} className="px-4 py-2 text-sm rounded-xl border border-border text-foreground-muted hover:bg-surface-secondary transition-colors">Batal</button>
                <button onClick={saveMembership} disabled={membershipSaving}
                  className="px-4 py-2 text-sm rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors disabled:opacity-50">
                  {membershipSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
