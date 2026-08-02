import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, CreditCard, Smartphone, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { paymentApi, transactionApi } from '../lib/api';
import { formatPrice } from '../lib/formatters';
import type { Transaction, Payment } from '../types/index.js';

const PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS', icon: QrCode, desc: 'Scan kode QR dengan aplikasi apapun' },
  { id: 'bca', label: 'BCA Virtual Account', icon: CreditCard, desc: 'Bayar via ATM atau mobile banking BCA' },
  { id: 'bri', label: 'BRI Virtual Account', icon: CreditCard, desc: 'Bayar via ATM atau mobile banking BRI' },
  { id: 'bni', label: 'BNI Virtual Account', icon: CreditCard, desc: 'Bayar via ATM atau mobile banking BNI' },
  { id: 'mandiri', label: 'Mandiri Virtual Account', icon: CreditCard, desc: 'Bayar via ATM atau Livin\' Mandiri' },
  { id: 'ovo', label: 'OVO', icon: Smartphone, desc: 'Bayar dengan aplikasi OVO' },
  { id: 'gopay', label: 'GoPay', icon: Smartphone, desc: 'Bayar dengan GoPay' },
  { id: 'dana', label: 'DANA', icon: Smartphone, desc: 'Bayar dengan DANA' },
  { id: 'shopeepay', label: 'ShopeePay', icon: Smartphone, desc: 'Bayar dengan ShopeePay' },
];

type Step = 'select' | 'waiting' | 'done';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('pendingTransaction');
    if (!stored) {
      navigate('/keranjang');
      return;
    }
    setTransaction(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    if (step !== 'waiting' || !payment) return;
    if (payment.status === 'completed') { setStep('done'); return; }
    if (pollCount > 60) return;

    const timer = setTimeout(async () => {
      try {
        const payments = await paymentApi.list();
        const list = payments.data ?? [];
        const current = list.find((p: Payment) => p.id === payment.id);
        if (current) setPayment(current);
        if (current?.status === 'completed') { setStep('done'); return; }
        if (current?.status === 'failed' || current?.status === 'expired') { setStep('done'); return; }
      } catch {}
      setPollCount(c => c + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [step, payment, pollCount]);

  const handleSelectMethod = async (methodId: string) => {
    if (!transaction) return;
    setError('');
    setIsLoading(true);
    try {
      const pay = await paymentApi.create({ transactionId: transaction.id, method: methodId });
      if (pay.data) setPayment(pay.data);
      setSelectedMethod(methodId);
      setStep('waiting');
      sessionStorage.removeItem('pendingTransaction');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membuat pembayaran.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulate = async (action: 'success' | 'failure' | 'expire') => {
    if (!payment) return;
    setIsLoading(true);
    try {
      const updated = await paymentApi.simulate(payment.id, action);
      if (updated.data) setPayment(updated.data);
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulasi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!transaction) return null;

  const statusIcon = (status: string) => {
    if (status === 'completed' || status === 'completed') return <CheckCircle className="w-10 h-10 text-success" />;
    if (status === 'failed') return <XCircle className="w-10 h-10 text-danger" />;
    if (status === 'expired') return <Clock className="w-10 h-10 text-amber-500" />;
    return <Clock className="w-10 h-10 text-brand-primary animate-pulse" />;
  };

  const statusText = (status: string) => {
    if (status === 'completed') return 'Pembayaran Berhasil';
    if (status === 'failed') return 'Pembayaran Gagal';
    if (status === 'expired') return 'Pembayaran Kadaluarsa';
    return 'Menunggu Pembayaran';
  };

  const methodName = PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label ?? '';

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <button onClick={() => navigate('/keranjang')} className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Keranjang
        </button>

        <h1 className="text-4xl font-bold tracking-tight mb-2">Metode Pembayaran</h1>
        <p className="text-foreground-muted mb-6">Total yang harus dibayar: <span className="font-semibold text-brand-primary">{formatPrice(transaction.finalTotal)}</span></p>

        {/* Simulation Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Mode Simulasi — pembayaran ini tidak memproses dana sungguhan.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-danger-soft border border-danger/20 rounded-xl text-sm text-danger">{error}</div>
        )}

        {/* Select Method */}
        {step === 'select' && (
          <>
            <div className="grid grid-cols-1 gap-3 mb-8">
              {PAYMENT_METHODS.map(method => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method.id)}
                    disabled={isLoading}
                    className="flex items-center gap-4 p-4 bg-white border border-border rounded-xl hover:border-brand-primary hover:bg-brand-primary-soft transition disabled:opacity-50 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground-muted" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{method.label}</div>
                      <div className="text-xs text-foreground-muted">{method.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Waiting for Payment */}
        {step === 'waiting' && payment && (
          <Card className="text-center py-8">
            <div className="flex justify-center mb-4">{statusIcon(payment.status)}</div>
            <h2 className="text-2xl font-bold mb-2">{statusText(payment.status)}</h2>
            <p className="text-foreground-muted text-sm mb-6">
              {selectedMethod === 'qris' ? 'Scan kode QR di bawah ini.' : `No. Virtual Account: ${payment.paymentCode}`}
            </p>

            {selectedMethod === 'qris' && payment.qrPayload && (
              <div className="bg-white border rounded-xl p-4 inline-block mb-6">
                <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <QrCode className="w-32 h-32 text-foreground" />
                </div>
                <p className="text-xs text-foreground-muted">Scan dengan aplikasi QRIS</p>
              </div>
            )}

            <div className="text-sm text-foreground-muted mb-1">Total Bayar</div>
            <div className="text-3xl font-bold text-brand-primary mb-6">{formatPrice(payment.amount)}</div>
            <div className="text-xs text-foreground-muted mb-6">Ref: {payment.referenceNumber}</div>

            <div className="space-y-3 max-w-xs mx-auto">
              <p className="text-xs text-foreground-muted mb-2">Simulasi Status Pembayaran:</p>
              <Button onClick={() => handleSimulate('success')} loading={isLoading} size="sm" className="w-full bg-success hover:bg-success/90">
                <CheckCircle className="w-4 h-4" /> Simulasi Berhasil
              </Button>
              <Button onClick={() => handleSimulate('failure')} loading={isLoading} size="sm" variant="secondary" className="w-full">
                <XCircle className="w-4 h-4" /> Simulasi Gagal
              </Button>
              <Button onClick={() => handleSimulate('expire')} loading={isLoading} size="sm" variant="secondary" className="w-full">
                <Clock className="w-4 h-4" /> Simulasi Kadaluarsa
              </Button>
            </div>
          </Card>
        )}

        {/* Done */}
        {step === 'done' && payment && (
          <Card className="text-center py-8">
            <div className="flex justify-center mb-4">{statusIcon(payment.status)}</div>
            <h2 className="text-2xl font-bold mb-2">{statusText(payment.status)}</h2>
            <p className="text-foreground-muted text-sm mb-4">
              {payment.status === 'completed'
                ? 'Pembayaran Anda telah diterima. Tim NC MULIA akan segera menghubungi Anda.'
                : payment.status === 'failed'
                ? 'Pembayaran gagal. Silakan coba lagi.'
                : 'Pembayaran kadaluarsa. Silakan buat pembayaran baru.'}
            </p>
            <div className="text-sm text-foreground-muted mb-6">Ref: {payment.referenceNumber}</div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/riwayat')} size="sm">
                Lihat Riwayat Pesanan
              </Button>
              <Button onClick={() => navigate('/produk-herbalife')} variant="secondary" size="sm">
                Lanjut Belanja
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
