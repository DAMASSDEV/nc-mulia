import { useState, useEffect } from 'react';

import {
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { StatCard } from '../../components/ui/StatCard';
import { adminBmiApi, type AdminBmiRecord } from '../../lib/api';
import type { User } from '../../types';
import type { BmiCategory } from '../../types';

const categories: Array<BmiCategory | 'Semua'> = ['Semua', 'Kurus', 'Normal', 'Kelebihan Berat', 'Obesitas'];

const categoryBadgeVariant: Record<BmiCategory, 'warning' | 'success' | 'neutral' | 'danger'> = {
  'Kurus': 'warning', 'Normal': 'success', 'Kelebihan Berat': 'neutral', 'Obesitas': 'danger',
};

const categoryBmiTextClass: Record<BmiCategory, string> = {
  'Kurus': 'text-warning', 'Normal': 'text-success', 'Kelebihan Berat': 'text-brand-accent', 'Obesitas': 'text-danger',
};

const ITEMS_PER_PAGE = 5;

interface AdminBmiRecordsProps {
  user: User;
  onLogout: () => void;
}

export default function AdminBmiRecords({ user, onLogout }: AdminBmiRecordsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<BmiCategory | 'Semua'>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState<AdminBmiRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRecords = (page = 1) => {
    setLoading(true);
    adminBmiApi.list({ page, limit: 50 }).then(res => {
      if (res.success && res.data) {
        setRecords(res.data.records);
        setTotal(res.data.pagination.total);
        setCurrentPage(res.data.pagination.page);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchRecords(1); }, []);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || record.bmiCategory === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length);

  const avgBmi = filteredRecords.length > 0
    ? (filteredRecords.reduce((sum, r) => sum + r.bmiValue, 0) / filteredRecords.length).toFixed(1)
    : '0.0';

  const mostCommon = (() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach(r => { counts[r.bmiCategory] = (counts[r.bmiCategory] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  })();

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <AdminLayout user={user} title="BMI Records" onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Record BMI</h1>
          <p className="text-foreground-muted mt-1 text-sm">Kelola dan lihat semua data BMI pengguna</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Records" value={String(total)} icon={<Users className="w-5 h-5" />} />
          <StatCard label="Rata-rata BMI" value={avgBmi} icon={<TrendingUp className="w-5 h-5" />} />
          <StatCard label="Kategori Tersering" value={mostCommon} icon={<Activity className="w-5 h-5" />} accent />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Cari berdasarkan nama atau email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={['px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border', isActive ? 'bg-brand-primary text-white border-brand-primary shadow-sm' : 'bg-surface text-foreground-muted border-border hover:bg-surface-secondary hover:text-foreground'].join(' ')}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Pengguna</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden sm:table-cell">Ukuran Tubuh</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">BMI</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Kategori</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden md:table-cell">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="bg-surface hover:bg-surface-secondary/50 transition-colors duration-100">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-primary-soft text-brand-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {getInitials(record.user.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{record.user.name}</p>
                            <p className="text-xs text-foreground-muted">{record.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-4 text-sm text-foreground">
                          <span>{record.weightKg} kg</span>
                          <span className="text-foreground-subtle">/</span>
                          <span>{record.heightCm} cm</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-2xl font-bold ${categoryBmiTextClass[record.bmiCategory as BmiCategory]}`}>
                          {record.bmiValue.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Badge variant={categoryBadgeVariant[record.bmiCategory as BmiCategory]} dot>{record.bmiCategory}</Badge>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-foreground-muted">{new Date(record.createdAt).toLocaleDateString('id-ID')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredRecords.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-border bg-surface-secondary/50">
              <span className="text-sm text-foreground-muted">
                Menampilkan {startItem}-{endItem} dari {filteredRecords.length} record
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-surface text-foreground-muted hover:bg-surface-secondary hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-brand-primary bg-brand-primary-soft rounded-lg">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-surface text-foreground-muted hover:bg-surface-secondary hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
