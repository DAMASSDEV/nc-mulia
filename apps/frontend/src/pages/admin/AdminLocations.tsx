import { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Pencil, Trash2, Loader2, X, ExternalLink, Star, ToggleRight, ToggleLeft } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PlacesAutocomplete } from '../../components/ui/PlacesAutocomplete';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminLocationsApi, type Location } from '../../lib/api';
import type { User } from '../../types';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function ScheduleRow({ day, value, onChange }: { day: string; value: { openTime: string; closeTime: string; isClosed: boolean }; onChange: (d: string, field: string, val: string | boolean) => void }) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-foreground-muted w-16">{day}</span>
      {value.isClosed ? (
        <span className="text-xs text-foreground-subtle">Tutup</span>
      ) : (
        <div className="flex items-center gap-2">
          <input type="time" value={value.openTime} onChange={e => onChange(day, 'openTime', e.target.value)}
            className="border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/30 w-20" />
          <span className="text-xs text-foreground-subtle">-</span>
          <input type="time" value={value.closeTime} onChange={e => onChange(day, 'closeTime', e.target.value)}
            className="border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/30 w-20" />
        </div>
      )}
      <button onClick={() => onChange(day, 'isClosed', !value.isClosed)}
        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${value.isClosed ? 'border-success/30 text-success bg-success-soft/50' : 'border-danger/30 text-danger bg-danger-soft/50 hover:bg-danger-soft'}`}>
        {value.isClosed ? 'Buka' : 'Tutup'}
      </button>
    </div>
  );
}

interface LocationFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  whatsapp: string;
  mapsUrl: string;
  latitude: string;
  longitude: string;
  placeId: string;
  isPrimary: boolean;
  isActive: boolean;
  schedules: Record<string, { openTime: string; closeTime: string; isClosed: boolean }>;
}

function buildDefaultSchedules(sundayClosed = false) {
  return DAYS.reduce((acc, day) => {
    acc[day] = { openTime: '08:00', closeTime: '17:00', isClosed: sundayClosed && day === 'Minggu' };
    return acc;
  }, {} as Record<string, { openTime: string; closeTime: string; isClosed: boolean }>);
}

function buildFormPayload(form: LocationFormData) {
  const mapsUrl = form.mapsUrl.trim() || `https://maps.google.com/?q=${encodeURIComponent(form.address + ', ' + form.city)}`;
  return {
    name: form.name.trim(),
    description: form.description?.trim() || null,
    placeId: form.placeId?.trim() || null,
    address: form.address.trim(),
    city: form.city.trim(),
    province: form.province?.trim() || 'DKI Jakarta',
    phone: form.phone?.trim() || null,
    email: form.email?.trim() || null,
    whatsapp: form.whatsapp?.trim() || null,
    mapsUrl: mapsUrl,
    latitude: form.latitude ? parseFloat(form.latitude) : null,
    longitude: form.longitude ? parseFloat(form.longitude) : null,
    isPrimary: form.isPrimary,
    isActive: form.isActive,
    schedules: DAYS.map((day, i) => ({
      day,
      openTime: form.schedules[day]?.openTime || '08:00',
      closeTime: form.schedules[day]?.closeTime || '17:00',
      isClosed: form.schedules[day]?.isClosed ?? false,
      sortOrder: i,
    })),
  };
}

function buildFormFromLocation(loc: Location): LocationFormData {
  const schedMap: Record<string, { openTime: string; closeTime: string; isClosed: boolean }> = {};
  DAYS.forEach(day => {
    const existing = loc.schedules.find(s => s.day === day);
    schedMap[day] = existing
      ? { openTime: existing.openTime, closeTime: existing.closeTime, isClosed: existing.isClosed }
      : { openTime: '08:00', closeTime: '17:00', isClosed: false };
  });
  return {
    name: loc.name,
    description: loc.description || '',
    address: loc.address,
    city: loc.city,
    province: loc.province,
    phone: loc.phone || '',
    email: loc.email || '',
    whatsapp: loc.whatsapp || '',
    mapsUrl: loc.mapsUrl,
    latitude: loc.latitude?.toString() || '',
    longitude: loc.longitude?.toString() || '',
    placeId: (loc as any).placeId || '',
    isPrimary: loc.isPrimary,
    isActive: loc.isActive,
    schedules: schedMap,
  };
}

function MapPreview({ lat, lng, name }: { lat?: string; lng?: string; name?: string }) {
  if (!lat || !lng) {
    return (
      <div className="h-40 bg-surface-secondary rounded-xl flex items-center justify-center">
        <p className="text-xs text-foreground-subtle">Pilih alamat untuk melihat preview</p>
      </div>
    );
  }
  const zoom = 15;
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed&marker=${lat},${lng}`;
  return (
    <iframe
      src={src}
      width="100%"
      height="160"
      style={{ border: 0, borderRadius: '12px' }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Preview: ${name || 'Lokasi'}`}
      className="w-full h-40 object-cover"
    />
  );
}

export default function AdminLocations({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState<LocationFormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    province: 'DKI Jakarta',
    phone: '',
    email: '',
    whatsapp: '',
    mapsUrl: '',
    latitude: '',
    longitude: '',
    placeId: '',
    isPrimary: false,
    isActive: true,
    schedules: buildDefaultSchedules(true),
  });

  const mapRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => { loadLocations(); }, []);

  const loadLocations = () => {
    setLoading(true);
    fetch('/api/locations')
      .then(r => r.json())
      .then(d => { if (d.success) setLocations(d.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      address: '',
      city: '',
      province: 'DKI Jakarta',
      phone: '',
      email: '',
      whatsapp: '',
      mapsUrl: '',
      latitude: '',
      longitude: '',
      placeId: '',
      isPrimary: locations.length === 0,
      isActive: true,
      schedules: buildDefaultSchedules(true),
    });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (loc: Location) => {
    setEditing(loc);
    setForm(buildFormFromLocation(loc));
    setError('');
    setModalOpen(true);
  };

  const handlePlaceSelect = (place: { address: string; city: string; province: string; lat: number; lng: number; mapsUrl: string }) => {
    setForm(p => ({
      ...p,
      address: place.address,
      city: place.city,
      province: place.province,
      mapsUrl: place.mapsUrl,
      latitude: place.lat.toString(),
      longitude: place.lng.toString(),
      placeId: '',
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Nama, alamat, dan kota wajib diisi.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = buildFormPayload(form);
      const url = editing
        ? `/api/admin/locations/${editing.id}`
        : '/api/admin/locations';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
      const d = await res.json();
      if (d.success) {
        if (editing) {
          setLocations(prev => prev.map(l => l.id === editing.id ? d.data : l));
        } else {
          setLocations(prev => [...prev, d.data]);
        }
        setModalOpen(false);
      } else {
        const errorDetail = d.errors ? Object.values(d.errors).flat().join(', ') : '';
        setError(errorDetail ? `${d.message}: ${errorDetail}` : (d.message || 'Gagal menyimpan.'));
      }
    } catch {
      setError('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setDeleting(deleteConfirmId);
    setError('');
    try {
      const res = await fetch(`/api/admin/locations/${deleteConfirmId}`, { method: 'DELETE', credentials: 'include' });
      const d = await res.json();
      if (d.success) {
        setLocations(prev => prev.filter(l => l.id !== deleteConfirmId));
        loadLocations();
        setDeleteConfirmId(null);
      } else {
        setError(d.message || 'Gagal menghapus lokasi.');
      }
    } catch {
      setError('Terjadi kesalahan saat menghapus lokasi.');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (loc: Location) => {
    const res = await fetch(`/api/admin/locations/${loc.id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ isActive: !loc.isActive }),
    });
    const d = await res.json();
    if (d.success) {
      setLocations(prev => prev.map(l => l.id === loc.id ? d.data : l));
    }
  };

  const handleSetPrimary = async (loc: Location) => {
    const res = await fetch(`/api/admin/locations/${loc.id}/primary`, { method: 'PATCH', credentials: 'include' });
    const d = await res.json();
    if (d.success) {
      setLocations(prev => prev.map(l => ({ ...l, isPrimary: l.id === loc.id })));
    }
  };

  const updateSchedule = (day: string, field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, schedules: { ...prev.schedules, [day]: { ...prev.schedules[day], [field]: value } } }));
  };

  const updateForm = (key: keyof LocationFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  return (
    <AdminLayout user={user} title="Manajemen Lokasi" onLogout={onLogout}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manajemen Lokasi</h1>
            <p className="text-foreground-muted mt-1 text-sm">Kelola lokasi klinik, jam operasional, dan informasi kontak</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>
            Tambah Lokasi
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
        ) : locations.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center text-foreground-subtle mb-4">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Belum ada lokasi</h3>
              <p className="text-sm text-foreground-muted mb-4">Tambahkan lokasi klinik NC MULIA untuk ditampilkan ke pelanggan.</p>
              <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Tambah Lokasi</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {locations.map(loc => (
              <Card key={loc.id} padding="none" hover className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-base font-semibold text-foreground">{loc.name}</h3>
                        {loc.isPrimary && (
                          <Badge variant="success" className="text-[10px]">
                            <Star className="w-3 h-3 mr-0.5" /> Utama
                          </Badge>
                        )}
                        <Badge variant={loc.isActive ? 'success' : 'neutral'} dot>{loc.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                      </div>
                      <p className="text-sm text-foreground-muted mb-2">{loc.address}, {loc.city}</p>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-foreground-subtle">
                        {loc.phone && <span className="flex items-center gap-1"><span className="font-medium">T:</span> {loc.phone}</span>}
                        {loc.email && <span className="flex items-center gap-1"><span className="font-medium">E:</span> {loc.email}</span>}
                        {loc.whatsapp && <span className="flex items-center gap-1"><span className="font-medium">WA:</span> {loc.whatsapp}</span>}
                        {loc.description && <span className="text-foreground-muted italic line-clamp-1">{loc.description}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!loc.isPrimary && (
                        <Button variant="ghost" size="sm" title="Jadikan Utama" onClick={() => handleSetPrimary(loc)}>
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        title={loc.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        onClick={() => handleToggleActive(loc)}
                        className={loc.isActive ? 'text-foreground-muted hover:text-warning' : 'text-foreground-muted hover:text-success'}
                      >
                        {loc.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </Button>
                      <Button variant="ghost" size="sm" icon={<Pencil className="w-4 h-4" />} onClick={() => openEdit(loc)}>Edit</Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={deleting === loc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        onClick={() => { setError(''); setDeleteConfirmId(loc.id); }}
                        className="text-danger hover:text-danger"
                        disabled={deleting === loc.id}
                      />
                    </div>
                  </div>

                  {/* Quick schedule preview */}
                  {loc.schedules.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-[10px] font-semibold text-foreground-subtle uppercase tracking-wider mb-2">Jam Operasional:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {DAYS.map(day => {
                          const sched = loc.schedules.find(s => s.day === day);
                          return (
                            <div key={day} className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${sched?.isClosed ? 'bg-danger-soft text-danger' : 'bg-surface-secondary text-foreground-muted'}`}>
                              <span className="font-semibold">{day.slice(0, 3)}</span>
                              {' '}{sched?.isClosed ? 'Tutup' : sched?.openTime ? `${sched.openTime}-${sched.closeTime}` : '—'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
              <h2 className="text-lg font-semibold text-foreground">{editing ? 'Edit Lokasi' : 'Tambah Lokasi'}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-muted hover:bg-surface-secondary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Name */}
              <Input
                label="Nama Lokasi *"
                placeholder="Contoh: Klinik NC MULIA Jakarta Pusat"
                value={form.name}
                onChange={e => updateForm('name', e.target.value)}
              />

              {/* Google Places Search */}
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-1.5 block">Alamat *</label>
                <PlacesAutocomplete
                  value={form.address}
                  onChange={val => updateForm('address', val)}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Ketik alamat untuk cari di Google..."
                />
                <p className="text-[10px] text-foreground-subtle mt-1">Pilih alamat dari Google Places untuk otomatis mengisi koordinat.</p>
              </div>

              {/* Map Preview */}
              <MapPreview lat={form.latitude} lng={form.longitude} name={form.name} />

              {/* Manual coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Latitude" placeholder="-6.2087634" value={form.latitude}
                  onChange={e => updateForm('latitude', e.target.value)} />
                <Input label="Longitude" placeholder="106.8215603" value={form.longitude}
                  onChange={e => updateForm('longitude', e.target.value)} />
              </div>

              {/* City & Province */}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Kota *" placeholder="Jakarta Pusat" value={form.city}
                  onChange={e => updateForm('city', e.target.value)} />
                <Input label="Provinsi" placeholder="DKI Jakarta" value={form.province}
                  onChange={e => updateForm('province', e.target.value)} />
              </div>

              {/* Maps URL */}
              <Input label="Google Maps URL *" placeholder="https://maps.google.com/..." value={form.mapsUrl}
                onChange={e => updateForm('mapsUrl', e.target.value)} />
              <p className="text-[10px] text-foreground-subtle -mt-3">
                Dapatkan dari Google Maps → Share → Copy Link
              </p>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-1.5 block">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  placeholder="Deskripsi singkat lokasi..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary resize-none"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Telepon" placeholder="(021) 555-8899" value={form.phone}
                  onChange={e => updateForm('phone', e.target.value)} />
                <Input label="WhatsApp" placeholder="6281234567890" value={form.whatsapp}
                  onChange={e => updateForm('whatsapp', e.target.value)} />
              </div>
              <div>
                <Input label="Email" type="email" placeholder="info@nc-mulia.com" value={form.email}
                  onChange={e => updateForm('email', e.target.value)} />
              </div>

              {/* Flags */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPrimary}
                    onChange={e => updateForm('isPrimary', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Jadikan Lokasi Utama</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => updateForm('isActive', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Aktif</span>
                </label>
              </div>

              {/* Schedules */}
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3 block">Jam Operasional</label>
                <div className="bg-surface-secondary rounded-xl p-3 space-y-0.5">
                  {DAYS.map(day => (
                    <ScheduleRow key={day} day={day} value={form.schedules[day]} onChange={updateSchedule} />
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-danger bg-danger-soft px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.address || !form.city || !form.mapsUrl}
                >
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : editing ? 'Simpan Perubahan' : 'Tambah Lokasi'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => { setError(''); setDeleteConfirmId(null); }} title="Konfirmasi Hapus" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-foreground-muted leading-relaxed">
            Apakah Anda yakin ingin menghapus lokasi <span className="font-semibold text-foreground">
              {locations.find(l => l.id === deleteConfirmId)?.name}
            </span>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          {error && (
            <p className="text-xs text-danger bg-danger-soft px-3 py-2 rounded-lg">{error}</p>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setError(''); setDeleteConfirmId(null); }}>Batal</Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm} disabled={!!deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
