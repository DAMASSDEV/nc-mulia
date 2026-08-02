import { useState, useEffect } from 'react';
import { MessageSquare, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { consultationApi, type Consultation } from '../../lib/api';
import type { User } from '../../types';

type ConsultationStatus = 'pending' | 'answered' | 'closed';
type StatusFilter = 'ALL' | ConsultationStatus;

const statusConfig: Record<ConsultationStatus, { label: string; variant: 'warning' | 'info' | 'neutral' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  answered: { label: 'Terjawab', variant: 'info' },
  closed: { label: 'Ditutup', variant: 'neutral' },
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'answered', label: 'Terjawab' },
  { value: 'closed', label: 'Ditutup' },
];

function getInitials(name: string): string {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

 
export default function AdminConsultations({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [responseText, setResponseText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ConsultationStatus>('pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    consultationApi.adminList().then(res => {
      if (res.success && res.data) setConsultations(res.data.records ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = consultations
    .filter(c => statusFilter === 'ALL' || c.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusTabs: { label: string; value: StatusFilter; count: number }[] = [
    { label: 'Semua', value: 'ALL', count: consultations.length },
    { label: 'Pending', value: 'pending', count: consultations.filter(c => c.status === 'pending').length },
    { label: 'Terjawab', value: 'answered', count: consultations.filter(c => c.status === 'answered').length },
    { label: 'Ditutup', value: 'closed', count: consultations.filter(c => c.status === 'closed').length },
  ];

  const openDetail = (c: Consultation) => {
    setSelected(c);
    setResponseText(c.response || '');
    setSelectedStatus(c.status as ConsultationStatus);
    setDetailOpen(true);
  };

  const handleSave = () => {
    if (!selected) return;
    setSaving(true);
    consultationApi.adminUpdate(selected.id, {
      response: responseText,
      status: selectedStatus,
    }).then(res => {
      if (res.success && res.data) {
        setConsultations(prev => prev.map(c => c.id === selected.id ? { ...c, ...res.data! } : c));
        setDetailOpen(false);
      }
    }).catch(() => {}).finally(() => setSaving(false));
  };

  return (
    <AdminLayout user={user} title="Manajemen Konsultasi" onLogout={onLogout}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manajemen Konsultasi</h1>
          <p className="text-foreground-muted mt-1 text-sm">Kelola dan tanggapi pertanyaan dari pelanggan NC Mulia</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-6">
          {statusTabs.map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${statusFilter === tab.value ? 'bg-brand-primary text-white border-brand-primary' : 'bg-surface text-foreground-muted border-border hover:border-brand-primary/40'}`}>
              {tab.label}
              <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-semibold ${statusFilter === tab.value ? 'bg-white/20' : 'bg-surface-secondary text-foreground-subtle'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(c => {
              const cfg = statusConfig[c.status as ConsultationStatus];
              const userName = c.user?.name || 'Unknown';
              const userEmail = c.user?.email || '';
              return (
                <Card key={c.id} padding="none" hover className="overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-brand-primary-soft text-brand-primary`}>
                        {getInitials(userName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-semibold text-foreground text-sm">{userName}</span>
                          <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                        </div>
                        <span className="text-xs text-foreground-subtle">{userEmail}</span>
                        <div className="text-xs text-foreground-subtle mt-0.5 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {formatDate(c.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 pl-14">
                      <p className="text-sm text-foreground leading-relaxed line-clamp-2">{c.question}</p>
                    </div>
                    {c.response && (
                      <div className="pl-14 mb-4">
                        <div className="bg-brand-primary-soft rounded-xl p-3 border-l-2 border-brand-primary">
                          <p className="text-xs font-medium text-brand-primary mb-1">Respons:</p>
                          <p className="text-xs text-foreground leading-relaxed line-clamp-2">{c.response}</p>
                        </div>
                      </div>
                    )}
                    <div className="pl-14 flex items-center justify-end">
                      <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />} iconPosition="right" onClick={() => openDetail(c)}>
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card padding="lg" className="text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center text-foreground-subtle mb-4">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Tidak ada konsultasi ditemukan</h3>
              <p className="text-sm text-foreground-muted max-w-sm">
                {statusFilter === 'ALL' ? 'Belum ada konsultasi dari pelanggan.' : `Tidak ada konsultasi dengan status "${statusTabs.find(t => t.value === statusFilter)?.label}".`}
              </p>
            </div>
          </Card>
        )}

        {detailOpen && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setDetailOpen(false)} />
            <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Detail Konsultasi</h2>
                <button onClick={() => setDetailOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-muted hover:bg-surface-secondary">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-brand-primary-soft text-brand-primary">
                    {getInitials(selected.user?.name || 'U')}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{selected.user?.name}</div>
                    <div className="text-xs text-foreground-subtle">{selected.user?.email} · {formatDate(selected.createdAt)}</div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-1.5 block">Pertanyaan</label>
                  <div className="bg-surface-secondary rounded-xl p-4 border border-border">
                    <p className="text-sm text-foreground leading-relaxed">{selected.question}</p>
                  </div>
                </div>
                <Textarea
                  label="Respons"
                  placeholder="Tulis respons untuk pertanyaan ini..."
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  rows={4}
                />
                <Select label="Status" options={statusOptions} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as ConsultationStatus)} />
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => setDetailOpen(false)}>Batal</Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Kirim Respons'}</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
