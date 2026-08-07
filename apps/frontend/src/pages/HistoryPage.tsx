import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Activity, MessageSquare, ShoppingBag, Filter, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { bmiApi, consultationApi, transactionApi } from '../lib/api';
import { formatPrice } from '../lib/formatters';
import { getProductImage } from '../lib/productImages';
import type { User, Transaction } from '../types';

interface HistoryPageProps {
  user: User | null;
}

interface HistoryItem {
  id: string;
  type: 'bmi' | 'consultation' | 'transaction';
  date: string;
  rawDate: Date;
  bmi?: number;
  bmiCategory?: string;
  question?: string;
  response?: string;
  status?: string;
  transaction?: Transaction;
}

const categoryBadgeVariant = (cat?: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (cat === 'Normal') return 'success';
  if (cat === 'Kurus') return 'warning';
  if (cat === 'Kelebihan Berat') return 'warning';
  if (cat === 'Obesitas') return 'danger';
  return 'neutral';
};

const statusBadgeVariant = (status?: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === 'answered' || status === 'PAID' || status === 'COMPLETED') return 'success';
  if (status === 'pending' || status === 'PENDING') return 'warning';
  if (status === 'CANCELLED' || status === 'FAILED') return 'danger';
  return 'neutral';
};

const statusLabel = (status?: string) => {
  if (status === 'answered') return 'Terjawab';
  if (status === 'pending') return 'Menunggu';
  if (status === 'closed') return 'Ditutup';
  if (status === 'PAID') return 'Lunas';
  if (status === 'COMPLETED') return 'Selesai';
  if (status === 'PENDING') return 'Menunggu Pembayaran';
  if (status === 'CANCELLED') return 'Dibatalkan';
  return status || '';
};

export default function HistoryPage({ user }: HistoryPageProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'bmi' | 'consultation' | 'transaction'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      bmiApi.history(),
      consultationApi.list(),
      transactionApi.list().catch(() => ({ success: true, data: [] })),
    ])
      .then(([bmiRes, consultRes, txRes]) => {
        const historyItems: HistoryItem[] = [];

        const bmiData = Array.isArray(bmiRes?.data) ? bmiRes.data : (Array.isArray(bmiRes) ? bmiRes : []);
        bmiData.forEach(r => {
          const d = new Date(r.createdAt);
          historyItems.push({
            id: r.id,
            type: 'bmi',
            rawDate: d,
            date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            bmi: r.bmiValue,
            bmiCategory: r.bmiCategory,
          });
        });

        const consultData = Array.isArray(consultRes?.data) ? consultRes.data : (Array.isArray(consultRes) ? consultRes : []);
        consultData.forEach(c => {
          const d = new Date(c.createdAt);
          historyItems.push({
            id: `consultation:${c.id}`,
            type: 'consultation',
            rawDate: d,
            date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            question: c.question,
            response: c.response || undefined,
            status: c.status,
          });
        });

        const txData = Array.isArray(txRes?.data?.transactions) ? txRes.data.transactions : (Array.isArray(txRes?.data) ? txRes.data : []);
        txData.forEach((t: Transaction) => {
          const d = new Date(t.createdAt);
          historyItems.push({
            id: `tx:${t.id}`,
            type: 'transaction',
            rawDate: d,
            date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: t.status,
            transaction: t,
          });
        });

        setItems(historyItems.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()));
        setLoaded(true);
      })
      .catch(() => {
        setError('Gagal memuat riwayat. Silakan coba lagi.');
        setLoaded(true);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <EmptyState
            icon={<History className="w-8 h-8" />}
            title="Login untuk melihat riwayat"
            description="Riwayat perhitungan BMI, konsultasi, dan transaksi Anda akan muncul di sini setelah Anda login."
          />
        </div>
      </div>
    );
  }

  const filtered = items.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary-soft flex items-center justify-center text-brand-primary">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Riwayat Saya</h1>
            </div>
          </div>
          <p className="text-foreground-muted">Riwayat perhitungan BMI, konsultasi, dan transaksi belanja Anda.</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-foreground-subtle" />
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'all', label: 'Semua' },
              { key: 'bmi', label: 'BMI', icon: <Activity className="w-3.5 h-3.5" /> },
              { key: 'consultation', label: 'Konsultasi', icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { key: 'transaction', label: 'Transaksi', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={[
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  filter === f.key
                    ? 'bg-brand-primary text-white'
                    : 'bg-surface border border-border text-foreground-muted hover:bg-surface-secondary',
                ].join(' ')}
              >
                {'icon' in f && f.icon}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-danger-soft border border-danger/20 rounded-xl text-sm text-danger">{error}</div>
        )}

        {!loaded ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner w-8 h-8" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<History className="w-8 h-8" />}
            title="Belum ada riwayat"
            description={
              filter === 'all'
                ? 'Hitung BMI, ajukan pertanyaan, atau lakukan transaksi untuk melihat riwayat di sini.'
                : filter === 'bmi'
                ? 'Belum ada record BMI. Gunakan kalkulator BMI untuk memulai.'
                : filter === 'consultation'
                ? 'Belum ada konsultasi. Ajukan pertanyaan di halaman Konsultasi.'
                : 'Belum ada transaksi. Silakan belanja produk Herbalife di halaman Produk.'
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {item.type === 'bmi' ? (
                      <Activity className="w-4 h-4 text-brand-primary" />
                    ) : item.type === 'consultation' ? (
                      <MessageSquare className="w-4 h-4 text-information" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-brand-accent" />
                    )}
                    <span className="text-xs font-medium text-foreground-subtle">
                      {item.type === 'bmi' ? 'BMI' : item.type === 'consultation' ? 'Konsultasi' : 'Transaksi'}
                    </span>
                  </div>
                  <span className="text-xs text-foreground-subtle">{item.date}</span>
                </div>

                {item.type === 'bmi' && item.bmi != null && (
                  <div className="flex items-end gap-4">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-foreground tracking-tight">{item.bmi}</span>
                      <span className="text-foreground-muted text-sm pb-1">BMI</span>
                    </div>
                    <Badge variant={categoryBadgeVariant(item.bmiCategory)} dot>{item.bmiCategory}</Badge>
                  </div>
                )}

                {item.type === 'consultation' && (
                  <div>
                    {item.question && (
                      <div className="mb-2">
                        <div className="text-xs text-foreground-subtle mb-1">Pertanyaan:</div>
                        <p className="text-sm text-foreground leading-relaxed line-clamp-2">{item.question}</p>
                      </div>
                    )}
                    {item.response && (
                      <div className="mb-2 p-3 bg-success-soft rounded-xl border border-success/20">
                        <div className="text-xs text-success font-medium mb-1">Respons:</div>
                        <p className="text-sm text-foreground leading-relaxed">{item.response}</p>
                      </div>
                    )}
                    {item.status && (
                      <Badge variant={statusBadgeVariant(item.status)} dot>{statusLabel(item.status)}</Badge>
                    )}
                  </div>
                )}

                {item.type === 'transaction' && item.transaction && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-foreground-subtle mb-1">ID Transaksi: #{item.transaction.id.slice(0, 8)}</div>
                      <div className="text-xl font-bold text-brand-primary">{formatPrice(item.transaction.finalTotal)}</div>
                      <div className="text-xs text-foreground-muted mt-1">
                        {item.transaction.items?.length ?? 0} item produk
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusBadgeVariant(item.transaction.status)} dot>
                        {statusLabel(item.transaction.status)}
                      </Badge>
                      <button
                        onClick={() => setSelectedTx(item.transaction ?? null)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary-soft text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-primary/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Detail Transaksi
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Transaction Detail Modal */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Detail Transaksi</h3>
                  <div className="text-xs text-slate-400">ID: {selectedTx.id}</div>
                </div>
                <button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">Status Pembayaran</span>
                  <Badge variant={statusBadgeVariant(selectedTx.status)} dot>{statusLabel(selectedTx.status)}</Badge>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Item Produk</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(selectedTx.items ?? []).map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(it.productName)}
                            alt={it.productName}
                            className="w-10 h-10 object-contain rounded-xl bg-emerald-50/60 p-1 border border-emerald-100/80 flex-shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-800">{it.productName || 'Produk Herbalife'}</div>
                            <div className="text-slate-400">{it.quantity} x {formatPrice(it.finalUnitPrice)}</div>
                          </div>
                        </div>
                        <div className="font-bold text-slate-700">{formatPrice(it.subtotal)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Produk:</span>
                    <span>{formatPrice(selectedTx.normalTotal)}</span>
                  </div>
                  {selectedTx.totalDiscount > 0 && (
                    <div className="flex justify-between text-red-500 font-medium">
                      <span>Diskon Member:</span>
                      <span>-{formatPrice(selectedTx.totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Pembayaran:</span>
                    <span className="text-emerald-700 text-base">{formatPrice(selectedTx.finalTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
                <button onClick={() => setSelectedTx(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl text-xs font-bold">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

