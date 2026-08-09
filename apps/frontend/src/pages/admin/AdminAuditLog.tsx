import { useState, useEffect } from 'react';
import { Search, Filter, Clock, User, Package, Settings, MapPin, CreditCard, Shield, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { User as UserType } from '../../types';

interface AuditRecord {
  id: string;
  action: string;
  module: string;
  entityType: string | null;
  entityId: string | null;
  beforeData: unknown;
  afterData: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string } | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const moduleIcons: Record<string, typeof Settings> = {
  products: Package,
  users: User,
  roles: Shield,
  locations: MapPin,
  payments: CreditCard,
  discounts: Settings,
  settings: Settings,
  audit: FileText,
};

const actionColors: Record<string, { bg: string; text: string }> = {
  create: { bg: 'bg-success-soft', text: 'text-success' },
  update: { bg: 'bg-information-soft', text: 'text-information' },
  delete: { bg: 'bg-danger-soft', text: 'text-danger' },
  login: { bg: 'bg-brand-primary-soft', text: 'text-brand-primary' },
};

interface AuditPageProps {
  user: UserType;
  onLogout: () => void;
}

export default function AdminAuditLog({ user, onLogout }: AuditPageProps) {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (moduleFilter) params.set('module', moduleFilter);
      if (search) params.set('action', search);
      const res = await fetch(`/api/admin/audit?${params}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setRecords(json.records || json.data?.records || []);
        setPagination(json.pagination || json.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(1); }, [moduleFilter, search]);

  const filteredRecords = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.action.toLowerCase().includes(q) ||
      r.module.toLowerCase().includes(q) ||
      r.actor?.name.toLowerCase().includes(q) ||
      r.entityId?.toLowerCase().includes(q);
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const modules = ['products', 'users', 'roles', 'locations', 'payments', 'discounts', 'settings', 'audit'];

  return (
    <AdminLayout user={user} title="Audit Log" onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
          <p className="text-foreground-muted mt-1 text-sm">Riwayat aktivitas seluruh admin di sistem</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Cari aksi, module, user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setModuleFilter('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${!moduleFilter ? 'bg-brand-primary text-white border-brand-primary' : 'bg-surface text-foreground-muted border-border hover:border-brand-primary/40'}`}
            >
              Semua
            </button>
            {modules.map(mod => {
              const Icon = moduleIcons[mod] ?? FileText;
              return (
                <button
                  key={mod}
                  onClick={() => setModuleFilter(mod)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${moduleFilter === mod ? 'bg-brand-primary text-white border-brand-primary' : 'bg-surface text-foreground-muted border-border hover:border-brand-primary/40'}`}
                >
                  <Icon className="w-3 h-3" />
                  {mod.charAt(0).toUpperCase() + mod.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="text-foreground-muted text-sm py-8">Tidak ada record ditemukan.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredRecords.map(record => {
              const Icon = moduleIcons[record.module] ?? FileText;
              const actionStyle = actionColors[record.action.toLowerCase()] ?? { bg: 'bg-surface-secondary', text: 'text-foreground-muted' };
              return (
                <Card key={record.id} padding="sm" className="hover:bg-surface transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-foreground-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionStyle.bg} ${actionStyle.text}`}>
                          {record.action}
                        </span>
                        <span className="text-xs font-medium text-foreground">{record.module}</span>
                        {record.entityType && (
                          <span className="text-xs text-foreground-subtle">({record.entityType})</span>
                        )}
                        {record.entityId && (
                          <code className="text-xs text-foreground-subtle bg-surface-secondary px-1.5 py-0.5 rounded font-mono">
                            {record.entityId.slice(0, 12)}...
                          </code>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {record.actor && (
                          <span className="text-xs text-foreground-muted flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {record.actor.name} ({record.actor.email})
                          </span>
                        )}
                        {record.ipAddress && (
                          <span className="text-xs text-foreground-subtle font-mono">{record.ipAddress}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-foreground-subtle flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDate(record.createdAt)}
                    </div>
                  </div>
                </Card>
              );
            })}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs text-foreground-muted">
                  Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => fetchRecords(pagination.page - 1)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-30 hover:bg-surface transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchRecords(pagination.page + 1)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-30 hover:bg-surface transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
