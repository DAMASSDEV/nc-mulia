import { useState, useEffect } from 'react';
import {
  Users,
  UserCog,
  MessageSquare,
  Activity,
  Package,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { statsApi, type DashboardStats } from '../../lib/api';
import type { User } from '../../types';

interface ActivityItem {
  id: string;
  type: 'consultation' | 'transaction' | 'bmi';
  text: string;
  time: string;
}

type ActivityType = 'consultation' | 'transaction' | 'bmi';

const activityMeta: Record<ActivityType, { icon: typeof MessageSquare; color: string; bgColor: string }> = {
  consultation: { icon: MessageSquare, color: 'text-information', bgColor: 'bg-information-soft' },
  transaction: { icon: Package, color: 'text-brand-accent', bgColor: 'bg-brand-accent-soft' },
  bmi: { icon: Activity, color: 'text-brand-primary', bgColor: 'bg-brand-primary-soft' },
};

interface AdminOverviewProps {
  user: User;
  onLogout: () => void;
}

export default function AdminOverview({ user, onLogout }: AdminOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    statsApi.dashboard().then(res => {
      if (res.success && res.data) setStats(res.data);
    }).catch(() => {});
  }, []);

  const recentActivity = stats?.recentActivity?.map((item, idx) => ({
    ...item,
    id: item.id || String(idx),
  })) ?? [];

  useEffect(() => {
    statsApi.dashboard().then(res => {
      if (res.success && res.data) setStats(res.data);
    }).catch(() => {});
  }, []);

  const statCards = stats ? [
    { label: 'Total Pengguna', value: String(stats.totalUsers), icon: Users, trend: null },
    { label: 'Staff Aktif', value: '—', icon: UserCog, trend: null },
    { label: 'Konsultasi Pending', value: String(stats.pendingConsultations), icon: MessageSquare, trend: null },
    { label: 'Record BMI', value: String(stats.totalBmiRecords), icon: Activity, trend: null },
    { label: 'Produk Aktif', value: String(stats.totalProducts), icon: Package, accent: true },
    { label: 'Total Konsultasi', value: String(stats.totalConsultations), icon: CheckCircle, trend: null },
  ] : [
    { label: 'Total Pengguna', value: '—', icon: Users, trend: null },
    { label: 'Staff Aktif', value: '—', icon: UserCog, trend: null },
    { label: 'Konsultasi Pending', value: '—', icon: MessageSquare, trend: null },
    { label: 'Record BMI', value: '—', icon: Activity, trend: null },
    { label: 'Produk Aktif', value: '—', icon: Package, accent: true },
    { label: 'Total Konsultasi', value: '—', icon: CheckCircle, trend: null },
  ];

  return (
    <AdminLayout user={user} title="Dashboard Overview" onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-foreground-muted mt-1 text-sm">
            Selamat datang kembali, <span className="font-medium text-foreground">{user.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {statCards.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={<stat.icon className="w-5 h-5" />}
              trend={stat.trend ?? undefined}
              accent={stat.accent}
            />
          ))}
        </div>

        <SectionHeader title="Aktivitas Terbaru" />
        <div className="space-y-3">
          {recentActivity.map((item) => {
            const meta = activityMeta[item.type as ActivityType];
            const Icon = meta.icon;
            return (
              <Card key={item.id} padding="sm" className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${meta.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">{item.text}</p>
                  <p className="text-xs text-foreground-subtle mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-foreground-subtle flex-shrink-0" />
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
