import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, MessageSquare, HelpCircle, UserCheck, CheckCircle2, ShoppingBag } from 'lucide-react';
import type { User as UserType } from '../../types';
import { statsApi } from '../../lib/api';

interface AdminTopbarProps {
  user: UserType;
  title?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  link: string;
  icon: typeof MessageSquare;
  type: 'consultation' | 'chat' | 'membership' | 'transaction';
}

export function AdminTopbar({ user, title }: AdminTopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    statsApi.dashboard()
      .then(res => {
        if (!isMounted || !res.data) return;
        const stats = res.data;
        const items: NotificationItem[] = [];

        if (stats.pendingConsultations > 0) {
          items.push({
            id: 'notif-consult',
            title: 'Konsultasi Belum Terjawab',
            desc: `Ada ${stats.pendingConsultations} pertanyaan konsultasi baru yang membutuhkan respons kesehatan.`,
            time: 'Baru saja',
            link: '/admin/consultations',
            icon: HelpCircle,
            type: 'consultation',
          });
        }

        if ((stats.pendingTransactions ?? 0) > 0) {
          items.push({
            id: 'notif-tx',
            title: 'Transaksi Menunggu Bayar',
            desc: `Ada ${stats.pendingTransactions} transaksi baru yang perlu ditinjau/diproses.`,
            time: 'Baru saja',
            link: '/admin/transactions',
            icon: ShoppingBag,
            type: 'transaction',
          });
        }

        items.push({
          id: 'notif-chat',
          title: 'Support Live Chat Desk',
          desc: 'Periksa obrolan aktif dari pelanggan di ruang Live Chat Support.',
          time: 'Hari ini',
          link: '/admin/chat',
          icon: MessageSquare,
          type: 'chat',
        });

        items.push({
          id: 'notif-member',
          title: 'Pemantauan Akun & Membership',
          desc: `Sistem monitoring aktivitas ${stats.totalUsers ?? 0} pengguna & membership.`,
          time: 'Hari ini',
          link: '/admin/users',
          icon: UserCheck,
          type: 'membership',
        });

        setNotifications(items);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const unreadCount = notifications.filter(n => n.type === 'consultation' || n.type === 'transaction').length;

  return (
    <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between relative z-40">
      <div>
        {title && <h1 className="text-xl font-semibold text-foreground">{title}</h1>}
        {!title && <div className="h-6" />}
      </div>
      <div className="flex items-center gap-4 relative">
        {/* Notification Bell Button */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface-secondary transition-all relative border border-border/50"
          title="Notifikasi Admin"
        >
          <Bell className="w-5 h-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown Popover */}
        {showNotifications && (
          <div className="absolute right-12 top-12 w-80 md:w-96 bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-border bg-surface-secondary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-primary" />
                <h3 className="font-bold text-sm text-foreground">Notifikasi Admin</h3>
              </div>
              <span className="text-xs bg-brand-primary-soft text-brand-primary font-bold px-2 py-0.5 rounded-full">
                {notifications.length} Info
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {loading ? (
                <div className="p-6 text-center text-xs text-foreground-muted">Memuat notifikasi...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-foreground-muted flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                  Tidak ada notifikasi baru.
                </div>
              ) : (
                notifications.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.link}
                      onClick={() => setShowNotifications(false)}
                      className="p-3.5 flex items-start gap-3 hover:bg-surface-secondary transition-colors block group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-brand-primary-soft text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground group-hover:text-brand-primary transition-colors">{item.title}</span>
                          <span className="text-[10px] text-foreground-subtle">{item.time}</span>
                        </div>
                        <p className="text-xs text-foreground-muted mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            <div className="p-2 border-t border-border bg-surface-secondary text-center">
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs font-semibold text-foreground-muted hover:text-foreground py-1"
              >
                Tutup Notifikasi
              </button>
            </div>
          </div>
        )}

        {/* User Badge Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-9 h-9 rounded-xl bg-brand-primary-soft flex items-center justify-center text-brand-primary">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-foreground">{user.name}</div>
            <div className="text-xs text-foreground-subtle">{user.role === 'super_admin' ? 'Super Administrator' : user.role === 'admin' ? 'Administrator' : 'User'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
