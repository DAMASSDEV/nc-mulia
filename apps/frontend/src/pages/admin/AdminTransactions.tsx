import { useState, useEffect } from 'react';
import { ShoppingCart, Search, ChevronLeft, ChevronRight, Loader2, Package } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { transactionApi, type Transaction } from '../../lib/api';
import { formatPrice } from '../../lib/formatters';
import type { User, PaginationMeta } from '../../types';

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'neutral' | 'danger' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  awaiting_payment: { label: 'Menunggu Bayar', variant: 'info' },
  paid: { label: 'Terbayar', variant: 'success' },
  processing: { label: 'Diproses', variant: 'info' },
  completed: { label: 'Selesai', variant: 'success' },
  cancelled: { label: 'Dibatalkan', variant: 'danger' },
};

const statusOptions = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'awaiting_payment', label: 'Menunggu Bayar' },
  { value: 'paid', label: 'Terbayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

interface AdminTransactionsProps {
  user: User;
  onLogout: () => void;
}

export default function AdminTransactions({ user, onLogout }: AdminTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = (p = 1) => {
    setLoading(true);
    transactionApi.listAll({ page: p, limit: 20, status: statusFilter || undefined }).then(res => {
      if (res.success && res.data) {
        setTransactions(res.data.transactions);
        setPagination(res.data.pagination);
      }
      setPage(p);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [statusFilter]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await transactionApi.updateStatus(id, { status });
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch {}
    setUpdating(null);
  };

  return (
    <AdminLayout user={user} title="Transaksi" onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Transaksi</h1>
          <p className="text-foreground-muted mt-1 text-sm">Kelola semua transaksi</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Select options={statusOptions} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-48" />
        </div>

        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-foreground-muted">
                <Package className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Tidak ada transaksi.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">ID</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden sm:table-cell">Pengguna</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Total</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden md:table-cell">Tanggal</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map(tx => {
                    const cfg = statusConfig[tx.status] ?? { label: tx.status, variant: 'neutral' as const };
                    return (
                      <tr key={tx.id} className="bg-surface hover:bg-surface-secondary/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono text-foreground-muted">{tx.id.slice(0, 12)}...</span>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-sm font-medium">{tx.user?.name ?? '—'}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="text-sm font-semibold text-brand-primary">{formatPrice(tx.finalTotal)}</div>
                          {tx.totalDiscount > 0 && <div className="text-xs text-success">Hemat {formatPrice(tx.totalDiscount)}</div>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-sm text-foreground-muted">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {updating === tx.id ? (
                            <Loader2 className="w-4 h-4 animate-spin inline" />
                          ) : tx.status !== 'completed' && tx.status !== 'cancelled' ? (
                            <select
                              className="text-xs border rounded px-2 py-1"
                              value=""
                              onChange={e => e.target.value && handleStatusUpdate(tx.id, e.target.value)}
                            >
                              <option value="">Ubah...</option>
                              <option value="processing">Diproses</option>
                              <option value="completed">Selesai</option>
                              <option value="cancelled">Batalkan</option>
                            </select>
                          ) : (
                            <span className="text-xs text-foreground-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-surface-secondary/50">
              <span className="text-sm text-foreground-muted">Halaman {pagination.page} dari {pagination.totalPages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => load(page - 1)} disabled={page <= 1}>Prev</Button>
                <Button size="sm" variant="secondary" onClick={() => load(page + 1)} disabled={page >= pagination.totalPages}>Next</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
