import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink, Navigation, Loader2, MessageCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { locationsApi, type Location } from '../lib/api';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

function MapView({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ weight: '2.00' }],
          },
          {
            featureType: 'all',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#9c9c9c' }],
          },
          {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [{ color: '#f2f2f2' }],
          },
          {
            featureType: 'water',
            elementType: 'all',
            stylers: [{ color: '#c9d8d1' }],
          },
          {
            featureType: 'poi',
            elementType: 'all',
            stylers: [{ visibility: 'simplified' }],
          },
        ],
      });
    }

    const map = mapInstanceRef.current;
    map.setCenter({ lat, lng });

    // Clear existing markers
    map.data.forEach((f: google.maps.Data.Feature) => map.data.remove(f));

    // Add marker
    new google.maps.Marker({
      position: { lat, lng },
      map,
      title: name,
      animation: google.maps.Animation.DROP,
    });
  }, [lat, lng, name]);

  if (!window.google) {
    return (
      <div className="h-[340px] md:h-[420px] bg-surface-secondary rounded-2xl overflow-hidden">
        <iframe
          src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Lokasi ${name}`}
        />
      </div>
    );
  }

  return (
    <div ref={mapRef} className="h-[340px] md:h-[420px] rounded-2xl overflow-hidden" />
  );
}

function MapsFallback({ lat, lng, name, mapsUrl }: { lat: number; lng: number; name: string; mapsUrl: string }) {
  return (
    <div className="h-[340px] md:h-[420px] bg-surface-secondary rounded-2xl overflow-hidden relative">
      <iframe
        src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Lokasi ${name}`}
      />
    </div>
  );
}

function WhatsAppLink({ phone, message }: { phone: string; message?: string }) {
  const clean = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message || 'Halo, saya ingin bertanya tentang NC MULIA');
  return `https://wa.me/${clean}?text=${encoded}`;
}

const DAY_NAMES: Record<string, string> = {
  Senin: 'Mon', Selasa: 'Tue', Rabu: 'Wed', Kamis: 'Thu',
  Jumat: 'Fri', Sabtu: 'Sat', Minggu: 'Sun',
};

function getCurrentDay印尼() {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[new Date().getDay()];
}

function isOpenNow(loc: Location): boolean | null {
  if (!loc.schedules?.length) return null;
  const today印尼 = getCurrentDay印尼();
  const sched = loc.schedules.find(s => s.day === today印尼);
  if (!sched || sched.isClosed) return false;
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = sched.openTime.split(':').map(Number);
  const [ch, cm] = sched.closeTime.split(':').map(Number);
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;
  return currentTime >= openMin && currentTime <= closeMin;
}

export default function LocationPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [primaryLocation, setPrimaryLocation] = useState<Location | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    locationsApi.list().then(res => {
      if (res.success && res.data) {
        const locs = res.data.filter(l => l.isActive);
        setLocations(locs);
        const primary = locs.find(l => l.isPrimary) ?? locs[0] ?? null;
        setPrimaryLocation(primary);
        setSelectedId(primary?.id ?? null);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_KEY) return;
    if (window.google) { setMapsLoaded(true); return; }

    window.initGoogleMaps = () => setMapsLoaded(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const selected = locations.find(l => l.id === selectedId) ?? primaryLocation;

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center text-foreground-subtle mx-auto mb-4">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Informasi Lokasi Belum Tersedia</h3>
          <p className="text-sm text-foreground-muted">Kami sedang memperbarui informasi lokasi. Silakan hubungi kami melalui WhatsApp untuk detail.</p>
        </div>
      </div>
    );
  }

  const openStatus = selected ? isOpenNow(selected) : null;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary-soft flex items-center justify-center text-brand-primary">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Lokasi Klinik</h1>
            </div>
          </div>
          <p className="text-foreground-muted leading-relaxed">
            Kunjungi klinik NC MULIA untuk konsultasi langsung atau melihat produk secara langsung.
          </p>
        </div>

        {/* Branch Selector */}
        {locations.length > 1 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {locations.map(loc => (
              <button
                key={loc.id}
                onClick={() => setSelectedId(loc.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selected?.id === loc.id
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-surface text-foreground-muted border-border hover:border-brand-primary/40'
                }`}
              >
                {loc.name}
                {loc.isPrimary && ' ★'}
              </button>
            ))}
          </div>
        )}

        {selected ? (
          <div className="grid md:grid-cols-5 gap-6">
            {/* Map */}
            <div className="md:col-span-3">
              <Card padding="none" className="overflow-hidden">
                {selected.latitude && selected.longitude ? (
                  mapsLoaded && window.google ? (
                    <MapView lat={selected.latitude} lng={selected.longitude} name={selected.name} />
                  ) : (
                    <MapsFallback lat={selected.latitude} lng={selected.longitude} name={selected.name} mapsUrl={selected.mapsUrl} />
                  )
                ) : (
                  <div className="h-[340px] md:h-[420px] bg-surface-secondary flex items-center justify-center">
                    <div className="text-center px-6">
                      <MapPin className="w-10 h-10 text-foreground-subtle mx-auto mb-3" />
                      <p className="text-sm text-foreground-muted">Map tidak tersedia untuk lokasi ini.</p>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {selected.latitude && selected.longitude && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="primary" icon={<Navigation className="w-4 h-4" />} className="w-full justify-center">
                          Petunjuk Arah
                        </Button>
                      </a>
                    )}
                    <a href={selected.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="secondary" icon={<ExternalLink className="w-4 h-4" />} className="w-full justify-center">
                        Lihat di Maps
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            </div>

            {/* Info */}
            <div className="md:col-span-2 space-y-4">
              {/* Location Card */}
              <Card>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0" />
                    {selected.name}
                    {selected.isPrimary && (
                      <span className="text-[10px] bg-brand-primary-soft text-brand-primary px-1.5 py-0.5 rounded font-medium">Utama</span>
                    )}
                  </h3>
                  {openStatus !== null && (
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${openStatus ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                      {openStatus ? 'Buka Sekarang' : 'Tutup'}
                    </span>
                  )}
                </div>

                {selected.description && (
                  <p className="text-xs text-foreground-muted mb-3">{selected.description}</p>
                )}

                <div className="space-y-2.5">
                  <div className="text-sm text-foreground-muted leading-relaxed">
                    {selected.address},<br />
                    {selected.city}{selected.province ? `, ${selected.province}` : ''}
                  </div>

                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-3 text-sm hover:text-brand-primary transition-colors group">
                      <Phone className="w-4 h-4 text-foreground-subtle group-hover:text-brand-primary flex-shrink-0" />
                      <span className="text-foreground-muted group-hover:text-brand-primary">{selected.phone}</span>
                    </a>
                  )}
                  {selected.whatsapp && (
                    <a href={WhatsAppLink({ phone: selected.whatsapp })} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-success transition-colors group">
                      <MessageCircle className="w-4 h-4 text-foreground-subtle group-hover:text-success flex-shrink-0" />
                      <span className="text-foreground-muted group-hover:text-success">{selected.whatsapp}</span>
                    </a>
                  )}
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className="flex items-center gap-3 text-sm hover:text-brand-primary transition-colors group">
                      <Mail className="w-4 h-4 text-foreground-subtle group-hover:text-brand-primary flex-shrink-0" />
                      <span className="text-foreground-muted group-hover:text-brand-primary">{selected.email}</span>
                    </a>
                  )}
                </div>
              </Card>

              {/* Schedule Card */}
              <Card>
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-primary" />
                  Jam Operasional
                </h3>
                <div className="space-y-1.5">
                  {selected.schedules.length > 0 ? (
                    selected.schedules.map(s => {
                      const isToday = s.day === getCurrentDay印尼();
                      return (
                        <div key={s.id} className={`flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0 ${isToday ? 'bg-brand-primary-soft/50 -mx-3 px-3 rounded-lg' : ''}`}>
                          <span className={`${isToday ? 'font-semibold text-brand-primary' : 'text-foreground-muted'}`}>
                            {s.day}
                          </span>
                          <span className={`font-medium ${s.isClosed ? 'text-danger' : 'text-foreground'}`}>
                            {s.isClosed ? 'Tutup' : `${s.openTime} - ${s.closeTime} WIB`}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-foreground-muted">Jam operasional belum tersedia.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card padding="lg" className="text-center">
            <p className="text-sm text-foreground-muted py-8">Lokasi tidak ditemukan.</p>
          </Card>
        )}

        {/* CTA */}
        <Card className="mt-8 bg-brand-primary-soft border-brand-primary/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground mb-1">Butuh konsultasi langsung?</h3>
              <p className="text-sm text-foreground-muted">
                Kunjungi klinik kami atau ajukan pertanyaan melalui fitur konsultasi online.
              </p>
            </div>
            <div className="flex gap-3">
              <a href="/konsultasi">
                <Button size="sm">Konsultasi Online</Button>
              </a>
              {selected?.whatsapp ? (
                <a href={WhatsAppLink({ phone: selected.whatsapp, message: 'Halo, saya ingin menanyakan tentang NC MULIA' })} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" icon={<MessageCircle className="w-4 h-4" />}>
                    Hubungi
                  </Button>
                </a>
              ) : selected?.phone ? (
                <a href={`tel:${selected.phone}`}>
                  <Button variant="secondary" size="sm" icon={<Phone className="w-4 h-4" />}>
                    Hubungi
                  </Button>
                </a>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
