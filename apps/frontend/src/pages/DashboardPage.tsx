import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { consultationApi, bmiApi, transactionApi } from '../lib/api';
import type { User, Consultation, Transaction } from '../types';

interface DashboardStats {
  consultations: number;
  bmiRecords: number;
  transactions: number;
}

export default function DashboardPage({ user }: { user: User }) {
  const [stats, setStats] = useState<DashboardStats>({ consultations: 0, bmiRecords: 0, transactions: 0 });
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      consultationApi.list(),
      bmiApi.history(),
      transactionApi.list({ page: 1, limit: 3 }),
    ]).then(([consults, bmis, txs]) => {
      const cs = (consults.success && Array.isArray(consults.data)) ? consults.data : [];
      setStats(s => ({ ...s, consultations: cs.length }));
      setRecentConsultations(cs.slice(0, 3));
      const bs = (bmis.success && Array.isArray(bmis.data)) ? bmis.data : [];
      setStats(s => ({ ...s, bmiRecords: bs.length }));
      if (txs.success && txs.data) {
        setStats(s => ({ ...s, transactions: txs.data!.pagination?.total ?? 0 }));
        setRecentTransactions(txs.data.transactions ?? []);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const isMember = user.membershipStatus === 'member';
  const memberUntil = user.membershipExpiresAt
    ? new Date(user.membershipExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const userDisplayName = user.name ?? 'Pengguna';

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-emerald-600 text-sm font-medium">Selamat Datang,</p>
        <h1 className="text-4xl font-bold tracking-tight">{user.name}</h1>
        <p className="text-slate-500 text-sm mt-1">{user.email}</p>
      </div>

      {isMember ? (
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-3xl p-8 text-white mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-emerald-100 text-sm font-medium tracking-widest uppercase mb-1">Membership Aktif</div>
              <div className="text-3xl font-bold">Member Herbalife</div>
              {memberUntil && <div className="text-emerald-100 text-sm mt-1">Berlaku sampai {memberUntil}</div>}
              <div className="mt-2 bg-white/20 rounded-full px-3 py-1 text-xs inline-block">Diskon 30% di Semua Produk</div>
            </div>
            <div className="text-6xl opacity-20">NC</div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 rounded-3xl p-8 mb-8 border border-slate-200">
          <div className="text-slate-500 text-sm font-medium tracking-widest uppercase mb-1">Membership</div>
          <div className="text-2xl font-bold text-slate-700 mb-2">Regular Member</div>
          <p className="text-slate-500 text-sm mb-4">Upgrade ke Member Herbalife untuk mendapatkan diskon 30% di semua produk.</p>
          <Link to="/membership">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-2xl text-sm font-medium transition-colors">
              Upgrade ke Member Herbalife
            </button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Konsultasi', value: loading ? '-' : stats.consultations, color: 'text-emerald-600' },
          { label: 'BMI Record', value: loading ? '-' : stats.bmiRecords, color: 'text-blue-600' },
          { label: 'Transaksi', value: loading ? '-' : stats.transactions, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-slate-500 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">Konsultasi Terbaru</h2>
          {recentConsultations.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Belum ada konsultasi.</p>
          ) : (
            recentConsultations.map(c => (
              <div key={c.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <div className="text-sm font-medium">{c.question}</div>
                  <div className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString('id-ID')}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'answered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {c.status === 'answered' ? 'Dibalas' : 'Menunggu'}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">Transaksi Terbaru</h2>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Belum ada transaksi.</p>
          ) : (
            recentTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <div className="text-sm font-medium">#{t.id.slice(-6)}</div>
                  <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString('id-ID')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Rp {(t.finalTotal ?? 0).toLocaleString('id-ID')}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Konsultasi', to: '/konsultasi', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Hitung BMI', to: '/bmi', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Produk', to: '/produk-herbalife', bg: 'bg-green-50', border: 'border-green-200' },
          { label: 'Riwayat', to: '/riwayat', bg: 'bg-amber-50', border: 'border-amber-200' },
        ].map(item => (
          <Link key={item.label} to={item.to} className={`${item.bg} border ${item.border} rounded-2xl p-5 text-center hover:opacity-80 transition-opacity block`}>
            <div className="text-sm font-medium">{item.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
