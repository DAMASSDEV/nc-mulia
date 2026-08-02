import { useState, useEffect } from 'react';
import { Settings, Percent, Loader2, Save, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { User } from '../../types';

interface Discount { id: string; key: string; label: string; rate: number; isActive: boolean; isSystem: boolean; }

export default function AdminSettings({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/rbac/discounts', { credentials: 'include' })
      .then(r => r.json())
      .then(json => { if (json.success) setDiscounts(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateDiscount = async (key: string, rate: number) => {
    setSaving(key);
    try {
      const res = await fetch(`/api/admin/rbac/discounts/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate }),
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setDiscounts(prev => prev.map(d => d.key === key ? { ...d, rate } : d));
        setSaved(key);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally { setSaving(null); }
  };

  const toggleActive = async (key: string, isActive: boolean) => {
    setSaving(key);
    try {
      const res = await fetch(`/api/admin/rbac/discounts/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setDiscounts(prev => prev.map(d => d.key === key ? { ...d, isActive } : d));
        setSaved(key);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally { setSaving(null); }
  };

  if (loading) return (
    <AdminLayout user={user} title="Pengaturan" onLogout={onLogout}>
      <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout user={user} title="Pengaturan" onLogout={onLogout}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
          <p className="text-foreground-muted mt-1 text-sm">Konfigurasi diskon dan parameter sistem</p>
        </div>

        <div className="space-y-6">
          {/* Member Discount */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-primary-soft flex items-center justify-center">
                <Percent className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Diskon Member</h2>
                <p className="text-xs text-foreground-muted">Rate diskon untuk member aktif</p>
              </div>
            </div>

            <div className="space-y-4">
              {discounts.map(disc => (
                <div key={disc.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-xl">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{disc.label}</span>
                      {disc.isSystem && <Badge variant="neutral">System</Badge>}
                    </div>
                    <p className="text-xs text-foreground-muted mt-0.5">Key: <code className="font-mono">{disc.key}</code></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={disc.rate * 100}
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (val >= 0 && val <= 100) {
                            setDiscounts(prev => prev.map(d => d.key === disc.key ? { ...d, rate: val / 100 } : d));
                          }
                        }}
                        className="w-20 text-center"
                        disabled={saving === disc.key}
                        min={0}
                        max={100}
                      />
                      <span className="text-foreground-muted font-medium">%</span>
                    </div>
                    <Button
                      size="sm"
                      variant={saved === disc.key ? 'secondary' : 'primary'}
                      onClick={() => updateDiscount(disc.key, disc.rate)}
                      disabled={saving === disc.key}
                    >
                      {saving === disc.key ? <Loader2 className="w-4 h-4 animate-spin" /> : saved === disc.key ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Info */}
          <Card padding="md">
            <h3 className="font-medium text-foreground mb-2 text-sm">Informasi</h3>
            <ul className="space-y-1.5 text-xs text-foreground-muted">
              <li>• Rate diskon diterapkan secara otomatis pada checkout untuk member aktif.</li>
              <li>• Diskon hanya berlaku untuk produk yang eligible (tidak semua produk).</li>
              <li>• Perubahan rate berlaku langsung tanpa perlu restart server.</li>
              <li>• Setiap perubahan tercatat di audit log.</li>
            </ul>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
