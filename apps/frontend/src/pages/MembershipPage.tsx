import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Shield, Percent, Users, ArrowLeft, Loader2, Crown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { membershipApi } from '../lib/api';

function formatPrice(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

interface MemberStatus {
  status: string;
  expiresAt: string | null;
  isActive: boolean;
}

export default function MembershipPage({ user }: { user: { id: string; name: string } | null }) {
  const [memberStatus, setMemberStatus] = useState<MemberStatus | null>(null);
  const [membershipFee, setMembershipFee] = useState<number>(546000);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [purchasing, setPurchasing] = useState(false);
  const [purchasingError, setPurchasingError] = useState('');

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

  const handleProcessPayment = async () => {
    setPurchasing(true);
    setPurchasingError('');
    try {
      const res = await membershipApi.purchase();
      if (res.success && res.data) {
        setMemberStatus({
          status: 'member',
          expiresAt: res.data.membershipExpiresAt,
          isActive: true,
        });
        setPaymentModalOpen(false);
        window.location.reload();
      } else {
        setPurchasingError(res.message || 'Pembayaran gagal.');
      }
    } catch (e) {
      setPurchasingError(e instanceof Error ? e.message : 'Pembayaran gagal.');
    } finally {
      setPurchasing(false);
    }
  };

  const isMember = (memberStatus?.status === 'member' || memberStatus?.status === 'MEMBER') && memberStatus?.isActive;

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
              a: 'Beli langsung di website ini dengan mengklik tombol "Bayar Membership Langsung" di bawah.',
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
            <Button
              onClick={() => {
                if (!user) {
                  alert('Silakan masuk ke akun Anda terlebih dahulu untuk membeli membership.');
                  return;
                }
                setPaymentModalOpen(true);
              }}
              size="lg"
              className="bg-white text-brand-primary hover:bg-white/90 font-bold px-8 py-3.5 rounded-2xl shadow-md"
            >
              💳 Bayar Membership Langsung (Rp {membershipFee.toLocaleString('id-ID')})
            </Button>
            <Link to="/dashboard">
              <Button variant="secondary" className="border-white/40 text-white hover:bg-white/10 w-full md:w-auto">
                Kembali
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Online Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setPaymentModalOpen(false)} />
          <div className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden z-10">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Pembayaran Membership</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-foreground-muted hover:text-foreground">✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-brand-primary-soft p-4 rounded-2xl">
                <div className="text-xs text-brand-primary font-medium uppercase tracking-wider">Paket Langganan</div>
                <div className="text-xl font-bold text-foreground mt-0.5">Member Herbalife 1 Tahun</div>
                <div className="text-2xl font-bold text-brand-primary mt-2">{formatPrice(membershipFee)}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'qris', name: 'QRIS Instant' },
                    { id: 'bca', name: 'Virtual Account BCA' },
                    { id: 'mandiri', name: 'Mandiri VA' },
                    { id: 'gopay', name: 'GoPay / OVO' },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-xl text-left border text-xs font-medium transition-all ${paymentMethod === method.id ? 'border-brand-primary bg-brand-primary-soft text-brand-primary font-bold' : 'border-border hover:border-brand-primary/40'}`}
                    >
                      {method.name}
                    </button>
                  ))}
                </div>
              </div>

              {purchasingError && (
                <div className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger">
                  {purchasingError}
                </div>
              )}

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <Button variant="ghost" size="sm" onClick={() => setPaymentModalOpen(false)} disabled={purchasing}>Batal</Button>
                <Button
                  size="sm"
                  onClick={handleProcessPayment}
                  loading={purchasing}
                  className="bg-brand-primary text-white font-bold"
                >
                  Konfirmasi Pembayaran
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
