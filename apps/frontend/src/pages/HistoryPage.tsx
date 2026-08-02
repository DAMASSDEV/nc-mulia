import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Activity, MessageSquare, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { bmiApi, consultationApi } from '../lib/api';
import type { User } from '../types';

interface HistoryPageProps {
  user: User | null;
}

interface HistoryItem {
  id: string;
  type: 'bmi' | 'consultation';
  date: string;
  bmi?: number;
  bmiCategory?: string;
  question?: string;
  response?: string;
  status?: string;
}

const categoryBadgeVariant = (cat?: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (cat === 'Normal') return 'success';
  if (cat === 'Kurus') return 'warning';
  if (cat === 'Kelebihan Berat') return 'warning';
  if (cat === 'Obesitas') return 'danger';
  return 'neutral';
};

const statusBadgeVariant = (status?: string): 'success' | 'warning' | 'neutral' => {
  if (status === 'answered') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'closed') return 'neutral';
  return 'neutral';
};

const statusLabel = (status?: string) => {
  if (status === 'answered') return 'Terjawab';
  if (status === 'pending') return 'Menunggu';
  if (status === 'closed') return 'Ditutup';
  return status || '';
};

export default function HistoryPage({ user }: HistoryPageProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'bmi' | 'consultation'>('all');

  useEffect(() => {
    if (!user) return;
    Promise.all([bmiApi.history(), consultationApi.list()])
      .then(([bmiRes, consultRes]) => {
        const historyItems: HistoryItem[] = [];

        if (bmiRes && Array.isArray(bmiRes)) {
          bmiRes.forEach(r => {
            historyItems.push({
              id: r.id,
              type: 'bmi',
              date: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              bmi: r.bmiValue,
              bmiCategory: r.bmiCategory,
            });
          });
        }

        if (consultRes && Array.isArray(consultRes)) {
          consultRes.forEach(c => {
            historyItems.push({
              id: `consultation:${c.id}`,
              type: 'consultation',
              date: new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              question: c.question,
              response: c.response || undefined,
              status: c.status,
            });
          });
        }

        setItems(historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
            description="Riwayat perhitungan BMI dan konsultasi Anda akan muncul di sini setelah Anda login."
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
          <p className="text-foreground-muted">Riwayat perhitungan BMI dan konsultasi Anda.</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-foreground-subtle" />
          <div className="flex gap-2">
            {([
              { key: 'all', label: 'Semua' },
              { key: 'bmi', label: 'BMI', icon: <Activity className="w-3.5 h-3.5" /> },
              { key: 'consultation', label: 'Konsultasi', icon: <MessageSquare className="w-3.5 h-3.5" /> },
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
                ? 'Hitung BMI atau ajukan pertanyaan konsultasi untuk melihat riwayat di sini.'
                : filter === 'bmi'
                ? 'Belum ada record BMI. Gunakan kalkulator BMI untuk memulai.'
                : 'Belum ada konsultasi. Ajukan pertanyaan di halaman Konsultasi.'
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
                    ) : (
                      <MessageSquare className="w-4 h-4 text-information" />
                    )}
                    <span className="text-xs font-medium text-foreground-subtle">
                      {item.type === 'bmi' ? 'BMI' : 'Konsultasi'}
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
