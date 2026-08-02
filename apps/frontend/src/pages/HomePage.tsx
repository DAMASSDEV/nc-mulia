import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Heart,
  MessageSquare,
  Calculator,
  Package,
  History,
  MapPin,
  ArrowRight,
  CheckCircle,
  Users,
  Star,
} from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { locationsApi, type Location } from '../lib/api';
import { fadeUp, staggerContainer, staggerItem, fadeIn } from '../lib/motion';

const features = [
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'Konsultasi Nutrisi',
    description:
      'Ajukan pertanyaan tentang nutrisi dan diet. Tim kami siap membantu memberikan saran yang tepat untuk kebutuhan Anda.',
  },
  {
    icon: <Calculator className="w-5 h-5" />,
    title: 'Hitung BMI',
    description:
      'Ketahui kategori berat badan Anda secara instan. Didukung rekomendasi produk Herbalife yang sesuai.',
  },
  {
    icon: <Package className="w-5 h-5" />,
    title: 'Produk Herbalife',
    description:
      'Jelajahi berbagai produk Herbalife lengkap dengan informasi harga dan manfaat untuk mendukung gaya hidup sehat.',
  },
  {
    icon: <History className="w-5 h-5" />,
    title: 'Riwayat Pribadi',
    description:
      'Pantau riwayat perhitungan BMI dan konsultasi Anda kapan saja. Semua data tersimpan dengan aman.',
  },
];

const stats = [
  { icon: <Package className="w-5 h-5" />, value: '50+', label: 'Produk Herbalife' },
  { icon: <CheckCircle className="w-5 h-5" />, value: '100%', label: 'Produk Original' },
  { icon: <Users className="w-5 h-5" />, value: 'Ribuan', label: 'Pelanggan Puas' },
  { icon: <Star className="w-5 h-5" />, value: '2014', label: 'Beroperasi Sejak' },
];

const benefits = [
  'Konsultasi dari tim yang berpengalaman di bidang nutrisi',
  'Perhitungan BMI yang akurat dan terpercaya',
  'Rekomendasi produk sesuai kebutuhan tubuh Anda',
  'Data riwayat yang tersimpan dan mudah diakses',
  'Informasi lengkap tentang setiap produk Herbalife',
];

export default function HomePage() {
  const [primaryLocation, setPrimaryLocation] = useState<Location | null>(null);

  useEffect(() => {
    locationsApi.getPrimary().then(res => {
      if (res.success && res.data) setPrimaryLocation(res.data);
    }).catch(() => {});
  }, []);
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-primary text-white">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6"
            >
              <Heart className="w-4 h-4 text-brand-accent" />
              NC MULIA - Konsultasi Nutrisi &amp; Kesehatan
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6"
            >
              Solusi Nutrisi Cerdas untuk{' '}
              <span className="text-brand-accent">Hidup Lebih Sehat</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-xl"
            >
              Hitung BMI, konsultasi masalah nutrisi, dan temukan produk Herbalife terbaik untuk kebutuhan tubuh Anda  semua dalam satu platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/bmi">
                <Button
                  size="lg"
                  icon={<Calculator className="w-5 h-5" />}
                  iconPosition="left"
                  className="border border-white/80 text-white hover:bg-white/10 active:bg-white/20 shadow-lg w-full sm:w-auto justify-center"
                >
                  Hitung BMI Sekarang
                </Button>
              </Link>
              <Link to="/konsultasi">
                <Button
                  size="lg"
                  variant="secondary"
                  icon={<MessageSquare className="w-5 h-5" />}
                  iconPosition="left"
                  className="border-white/30 text-white hover:bg-white/10 active:bg-white/20 shadow-lg w-full sm:w-auto justify-center"
                >
                  Mulai Konsultasi
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 md:h-16">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 30C840 40 960 50 1080 52C1200 54 1320 50 1380 48L1440 46V60H0Z" fill="#F6F8F6" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-background py-6 -mt-1">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-primary-soft flex items-center justify-center text-brand-primary flex-shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-foreground-muted">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="FITUR"
            title="Semua yang Anda butuhkan untuk hidup sehat"
            description="Fitur lengkap untuk mendukung perjalanan nutrisi dan kesehatan Anda, dari perhitungan BMI hingga konsultasi langsung."
            centered
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={staggerItem}>
                <Card className="h-full" hover>
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-soft flex items-center justify-center text-brand-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-surface py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                badge="MENGAPA KAMI"
                title="Kenapa memilih NC MULIA?"
                description="Kami hadir untuk memberikan layanan konsultasi nutrisi yang terpercaya dan berbasis kebutuhan Anda."
              />
              <ul className="space-y-3 mt-2">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground-muted">
                    <CheckCircle className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/konsultasi">
                  <Button icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                    Konsultasi Sekarang
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <Card padding="lg" className="bg-brand-primary-soft border-brand-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-lg">NC MULIA</div>
                    <div className="text-sm text-brand-primary font-medium">Klinik Nutrisi &amp; Kesehatan</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Konsultasi', count: 'Tersedia setiap hari' },
                    { label: 'Produk', count: '50+ item original' },
                    { label: 'BMI Kalkulator', count: 'Akurat & mudah' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-brand-primary/10 last:border-0">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-brand-primary font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-accent-soft rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-background py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-brand-primary rounded-3xl p-10 md:p-14 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap memulai perjalanan sehat Anda?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Hitung BMI Anda sekarang dan temukan langkah pertama menuju gaya hidup yang lebih sehat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/bmi">
                <Button
                  size="lg"
                  className="border border-white/80 text-white hover:bg-white/10 shadow-lg w-full sm:w-auto"
                >
                  Hitung BMI Sekarang
                </Button>
              </Link>
              <Link to="/produk-herbalife">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
                >
                  Lihat Produk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Location Teaser */}
      <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-surface-secondary rounded-3xl p-8 border border-border">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center flex-shrink-0">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-foreground mb-1">Kunjungi Klinik Kami</h3>
              {primaryLocation ? (
                <p className="text-sm text-foreground-muted">
                  {primaryLocation.address}, {primaryLocation.city} — Buka setiap hari 08.00 — 21.00 WIB
                </p>
              ) : (
                <p className="text-sm text-foreground-muted">
                  Temukan lokasi klinik NC MULIA terdekat dari Anda
                </p>
              )}
            </div>
            <Link to="/lokasi">
              <Button variant="secondary" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                Lihat Lokasi
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
