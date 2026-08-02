import { useState, useEffect } from 'react';
import { CreditCard, ChevronLeft, ChevronRight, Loader2, Package } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { paymentApi, type Payment } from '../../lib/api';
import { formatPrice } from '../../lib/formatters';
import type { User, PaginationMeta } from '../../types';

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'neutral' | 'danger' }> = {
  pending: { label: 'Menunggu', variant: 'warning' },
  processing: { label: 'Diproses', variant: 'info' },
  completed: { label: 'Berhasil', variant: 'success' },
  failed: { label: 'Gagal', variant: 'danger' },
  expired: { label: 'Kadaluarsa', variant: 'neutral' },
};

const methodLabel: Record<string, string> = {
  qris: 'QRIS', bca: 'BCA VA', bri: 'BRI VA', bni: 'BNI VA', mandiri: 'Mandiri VA',
  ovo: 'OVO', gopay: 'GoPay', dana: 'DANA', shopeepay: 'ShopeePay',
};

interface AdminPaymentsProps {
  user: User;
  onLogout: () => void;
}

export default function AdminPayments({ user, onLogout }: AdminPaymentsProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const load = (p = 1) => {
    setLoading(true);
    paymentApi.listAll({ page: p, limit: 20, status: statusFilter || undefined }).then(res => {
      if (res.success && res.data) {
        setPayments(res.data.payments);
        setPagination(res.data.pagination);
      }
      setPage(p);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [statusFilter]);

  return (
    <AdminLayout user={user} title="Pembayaran" onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Pembayaran</h1>
          <p className="text-foreground-muted mt-1 text-sm">Kelola semua pembayaran</p>
        </div>

        <div className="mb-6">
          <Select
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'pending', label: 'Menunggu' },
              { value: 'completed', label: 'Berhasil' },
              { value: 'failed', label: 'Gagal' },
              { value: 'expired', label: 'Kadaluarsa' },
            ]}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-48"
          />
        </div>

        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-foreground-muted">
                <CreditCard className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Tidak ada pembayaran.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Ref</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Metode</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Jumlah</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden sm:table-cell">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map(p => {
                    const cfg = statusConfig[p.status] ?? { label: p.status, variant: 'neutral' as const };
                    return (
                      <tr key={p.id} className="bg-surface hover:bg-surface-secondary/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono text-foreground-muted">{p.referenceNumber.slice(0, 16)}...</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm">{methodLabel[p.method] ?? p.method}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-semibold text-brand-primary">{formatPrice(p.amount)}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-sm text-foreground-muted">{new Date(p.createdAt).toLocaleDateString('id-ID')}</span>
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
