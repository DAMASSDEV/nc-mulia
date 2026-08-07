import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Clock, CheckCircle, Info, Lock, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { consultationApi } from '../lib/api';
import type { User, Consultation } from '../types';

interface ConsultationPageProps {
  user: User | null;
}

const tips = [
  'Tuliskan keluhan atau pertanyaan Anda sejelas mungkin untuk mendapatkan saran yang lebih tepat.',
  'Cantumkan usia, jenis kelamin, dan aktivitas fisik sehari-hari jika relevan.',
  'Untuk hasil terbaik, pastikan Anda sudah menghitung BMI terlebih dahulu.',
  'Konsultasi ini bukan pengganti diagnosis medis dari dokter.',
];

const statusBadge = (status: string): { label: string; variant: 'warning' | 'success' | 'neutral' } => {
  if (status === 'pending') return { label: 'Menunggu Respons', variant: 'warning' };
  if (status === 'answered') return { label: 'Terjawab', variant: 'success' };
  return { label: 'Ditutup', variant: 'neutral' };
};

export default function ConsultationPage({ user }: ConsultationPageProps) {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Consultation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = () => {
    if (!user) return;
    setLoadingHistory(true);
    consultationApi.list()
      .then(res => {
        if (res.success && res.data) {
          setHistory(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    if (!user) {
      setError('Silakan login terlebih dahulu untuk mengirim pertanyaan.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const res = await consultationApi.create({ question });
      if (res.success) {
        setSubmitted(true);
        setQuestion('');
        loadHistory();
      } else {
        setError(res.message || 'Gagal mengirim pertanyaan. Silakan coba lagi.');
      }
    } catch {
      setError('Terjadi kesalahan. Pastikan koneksi internet Anda stabil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary-soft flex items-center justify-center text-brand-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Konsultasi Nutrisi</h1>
            </div>
          </div>
          <p className="text-foreground-muted leading-relaxed max-w-xl">
            Ceritakan keluhan atau pertanyaan Anda tentang nutrisi dan pola makan. Tim NC MULIA akan merespons dalam waktu dekat.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Main Form */}
          <div className="md:col-span-3 space-y-5">
            <Card>
              <h2 className="text-base font-semibold text-foreground mb-4">Ajukan Pertanyaan</h2>

              {!user && (
                <div className="flex items-start gap-3 p-4 bg-surface-secondary rounded-xl mb-5 border border-border">
                  <Lock className="w-4 h-4 text-foreground-muted mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground-muted">
                    Anda perlu{' '}
                    <span className="font-medium text-foreground">login</span> terlebih dahulu untuk bisa mengirim pertanyaan.
                  </p>
                </div>
              )}

              <Textarea
                label="Pertanyaan Anda"
                placeholder="Ceritakan masalah atau pertanyaan Anda. Contoh: Saya sering merasa lelah meski sudah tidur cukup, apa yang perlu saya ubah dari pola makan saya?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="min-h-[140px]"
                hint="Jelaskan gejala atau masalah Anda selengkap mungkin agar kami bisa memberikan saran yang lebih akurat."
              />

              {error && (
                <div className="mt-4 p-3.5 bg-danger-soft border border-danger/20 rounded-xl text-sm text-danger">
                  {error}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-xs text-foreground-subtle">
                  {question.length} karakter
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!question.trim() || isSubmitting}
                  loading={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                  className="w-full md:w-auto md:min-w-[180px] justify-center"
                >
                  Kirim
                </Button>
              </div>
            </Card>

            {/* Success State */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-success-soft border-success/20">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-success mb-1">Pertanyaan Terkirim</h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          Tim kami sedang meninjau pertanyaan Anda. Respons biasanya membutuhkan waktu 1-2 hari kerja. Pantau status di bawah ini.
                        </p>
                        <button
                          onClick={() => setSubmitted(false)}
                          className="mt-3 text-sm font-medium text-success hover:underline"
                        >
                          Kirim pertanyaan lain
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Consultation History */}
            {user && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Riwayat Konsultasi</h2>
                  <button
                    onClick={loadHistory}
                    disabled={loadingHistory}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:text-brand-primary-hover transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                  </div>
                ) : history.length === 0 ? (
                  <Card className="text-center py-10">
                    <MessageSquare className="w-8 h-8 text-foreground-subtle mx-auto mb-3 opacity-40" />
                    <p className="text-sm text-foreground-muted">Belum ada riwayat konsultasi. Ajukan pertanyaan pertama Anda!</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {history.map(c => {
                      const badge = statusBadge(c.status);
                      return (
                        <Card key={c.id} className="hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <Badge variant={badge.variant} dot>{badge.label}</Badge>
                            <span className="text-xs text-foreground-subtle flex-shrink-0">
                              {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="mb-3">
                            <div className="text-xs text-foreground-subtle mb-1 font-medium">Pertanyaan Anda:</div>
                            <p className="text-sm text-foreground leading-relaxed">{c.question}</p>
                          </div>

                          {c.response ? (
                            <div className="p-4 bg-success-soft rounded-xl border border-success/20">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-3.5 h-3.5 text-success" />
                                <span className="text-xs font-semibold text-success">Respons dari Tim NC MULIA:</span>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed">{c.response}</p>
                            </div>
                          ) : (
                            <div className="p-3 bg-warning-soft rounded-xl border border-warning/20">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-warning" />
                                <span className="text-xs text-warning font-medium">Menunggu respons dari tim kami (1-2 hari kerja)</span>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Tips */}
          <div className="md:col-span-2 space-y-5">
            <Card>
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-primary" />
                Tips Mengajukan Pertanyaan
              </h2>
              <ul className="space-y-3">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground-muted">
                    <span className="w-5 h-5 rounded-full bg-brand-primary-soft text-brand-primary text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-surface-secondary border-border">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-4 h-4 text-foreground-muted" />
                <span className="text-sm font-medium text-foreground">Waktu Respons</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">Hari kerja</span>
                  <span className="font-medium text-foreground">1-2 hari</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">Jam operasional</span>
                  <span className="font-medium text-foreground">08.00 - 21.00 WIB</span>
                </div>
              </div>
            </Card>

            {/* Disclaimer */}
            <div className="p-4 bg-information-soft rounded-xl border border-information/20">
              <p className="text-xs text-information leading-relaxed">
                <strong>Catatan:</strong> Konsultasi ini bersifat umum dan bukan pengganti konsultasi dengan ahli gizi atau tenaga kesehatan berlisensi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

