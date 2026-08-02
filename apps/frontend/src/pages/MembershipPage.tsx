import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Shield, Percent, Users, ArrowLeft, Loader2, Crown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { membershipApi } from '../lib/api';

const WHATSAPP_NUMBER = '6285157279448';

function formatPrice(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

interface MemberStatus {
  status: string;
  expiresAt: string | null;
  isActive: boolean;
}

interface MembershipFee {
  fee: number;
}

export default function MembershipPage({ user }: { user: { id: string; name: string } | null }) {
  const [memberStatus, setMemberStatus] = useState<MemberStatus | null>(null);
  const [membershipFee, setMembershipFee] = useState<number>(546000);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setCheckingStatus(true);
    Promise.all([
      fetch('/api/membership/status', { credentials: 'include' }).then(r => r.json()),
      membershipApi.getFee(),
    ]).then(([statusJson, feeRes]) => {
      if (statusJson.success) setMemberStatus(statusJson.data);
      if (feeRes.success && feeRes.data) setMembershipFee(feeRes.data.fee);
    }).catch(() => {}).finally(() => { setLoading(false); setCheckingStatus(false); });
  }, [user]);

  const isMember = memberStatus?.status === 'member' && memberStatus?.isActive;

  if (loading || checkingStatus) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  const memberUntil = memberStatus?.expiresAt
    ? new Date(memberStatus.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const benefits = [
    'Diskon 30% untuk semua produk Herbalife',
    'Akses ke program nutrisi eksklusif',
    'Konsultasi prioritas dengan tim nutrisi',
    'Update info produk dan promo terbaru',
    'Program loyalitas dan reward',
    'Biaya pendaftaran HANYA satu kali',
  ];

  const requirements = [
    'Minimal usia 18 tahun',
    'Membeli Paket Herbalife Member (HMP)',
    'Biaya pendaftaran Rp 546.000 (satu kali)',
    'Isi formulir pendaftaran anggota',
  ];

  if (isMember && memberStatus) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-brand-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-brand-primary-soft flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-brand-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Anda adalah Member Herbalife</h1>
          <p className="text-foreground-muted mt-2">
            Terima kasih sudah bergabung bersama NC MULIA dan Herbalife.
          </p>
        </div>

        <Card padding="lg" className="bg-brand-primary-soft border-brand-primary/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-brand-primary font-semibold tracking-widest uppercase mb-1">Status Membership</div>
              <div className="text-2xl font-bold text-foreground">Member Herbalife Aktif</div>
              {memberUntil && (
                <div className="text-sm text-foreground-muted mt-1">Berlaku sampai {memberUntil}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-brand-primary font-semibold tracking-widest uppercase mb-1">Diskon</div>
              <div className="text-3xl font-bold text-brand-primary">30%</div>
              <div className="text-xs text-foreground-muted">di semua produk</div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-brand-accent" />
            Manfaat Member
          </h3>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-foreground-muted">
                <Check className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/produk-herbalife">
            <Button>Lihat Produk dengan Diskon</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-brand-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </Link>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary-soft rounded-full text-sm font-medium text-brand-primary mb-4">
          <Star className="w-4 h-4" />
          Membership Herbalife
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Jadilah Member Herbalife dan Dapatkan Diskon 30%
        </h1>
        <p className="text-foreground-muted max-w-xl mx-auto">
          Bergabunglah sebagai member resmi Herbalife melalui NC MULIA dan nikmati berbagai keuntungan eksklusif.
        </p>
      </div>

      {/* Harga Paket */}
      <Card padding="lg" className="mb-6 text-center">
        <div className="text-xs text-foreground-subtle tracking-widest uppercase mb-2">Biaya Pendaftaran</div>
        <div className="text-5xl font-bold text-foreground mb-1">{formatPrice(membershipFee)}</div>
        <div className="text-sm text-foreground-muted mb-4">Pembayaran satu kali · Tidak ada biaya tersembunyi</div>
        <div className="inline-flex items-center gap-2 bg-warning-soft text-warning text-xs font-medium px-3 py-1.5 rounded-full">
          <Shield className="w-3.5 h-3.5" />
          Termasuk Paket HMP (Herbalife Member Pack)
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Manfaat */}
        <Card padding="md">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4 text-brand-primary" />
            Manfaat Menjadi Member
          </h3>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-foreground-muted">
                <Check className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </Card>

        {/* Syarat */}
        <Card padding="md">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-primary" />
            Syarat Pendaftaran
          </h3>
          <div className="space-y-3">
            {requirements.map((r, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-foreground-muted">
                <div className="w-5 h-5 rounded-full bg-surface-secondary flex items-center justify-center text-xs font-semibold text-foreground-muted flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                {r}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* FAQ mini */}
      <Card padding="md" className="mb-8">
        <h3 className="font-semibold text-foreground mb-4">Pertanyaan Umum</h3>
        <div className="space-y-4">
          {[
            {
              q: 'Apakah biaya Rp 546.000 harus dibayar setiap bulan?',
              a: 'Tidak. Biaya pendaftaran Rp 546.000 adalah pembayaran satu kali di awal, tanpa biaya perpanjangan.',
            },
            {
              q: 'Produk apa saja yang mendapat diskon 30%?',
              a: 'Hampir semua produk Herbalife mendapat diskon member. Produk dengan label "Eligible" di halaman produk yang menampilkan harga setelah diskon.',
            },
            {
              q: 'Bagaimana cara mendaftar?',
              a: 'Hubungi admin NC MULIA melalui WhatsApp. Tim kami akan membantu proses pendaftaran secara lengkap.',
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
              <div className="font-medium text-sm text-foreground mb-1">{faq.q}</div>
              <div className="text-sm text-foreground-muted">{faq.a}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <Card className="bg-brand-primary text-white text-center">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <div className="text-sm text-white/70 font-medium mb-1">Total Biaya Pendaftaran</div>
            <div className="text-3xl font-bold">{formatPrice(membershipFee)}</div>
            <div className="text-sm text-white/70 mt-1">Sekali bayar · Diskon 30% selamanya</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Halo, saya ingin mendaftar menjadi Member Herbalife melalui NC MULIA. Biaya pendaftaran Rp ${membershipFee.toLocaleString('id-ID')}.`) }`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary px-8 py-3.5 rounded-2xl font-semibold hover:bg-white/90 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Hubungi via WhatsApp
            </a>
            <Link to="/dashboard">
              <Button variant="secondary" className="border-white/40 text-white hover:bg-white/10 w-full md:w-auto">
                Kembali
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
