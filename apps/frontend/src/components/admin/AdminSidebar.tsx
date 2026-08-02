import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  MessageSquare,
  Activity,
  ArrowLeft,
  LogOut,
  CreditCard,
  ShoppingCart,
  MessageCircle,
  MapPin,
  Settings,
  Shield,
  FileText,
  Receipt,
  Loader2,
} from 'lucide-react';
import { rbacApi, type NavigationItem } from '../../lib/api';

const iconMap: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  Users,
  Package,
  MessageSquare,
  Activity,
  CreditCard,
  ShoppingCart,
  MessageCircle,
  MapPin,
  Settings,
  Shield,
  FileText,
  Receipt,
};

interface AdminSidebarProps {
  onLogout: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const location = useLocation();
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rbacApi.getNavigation()
      .then(res => {
        if (res.success && res.data) setNavItems(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isActive = (item: NavigationItem) => {
    if (!item.route) return false;
    if (item.key === 'admin_overview') return location.pathname === '/admin';
    return location.pathname.startsWith(item.route);
  };

  return (
    <aside className="admin-sidebar flex flex-col h-full w-64 flex-shrink-0">
      <div className="px-5 py-6 border-b admin-sidebar-divider">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sidebar-active/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">NC</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm">NC MULIA</div>
            <div className="text-[10px] text-sidebar-muted tracking-wider">ADMIN PANEL</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-sidebar-muted" />
          </div>
        ) : navItems.length === 0 ? (
          <p className="text-sidebar-muted text-xs px-2 py-4 text-center">Tidak ada menu.</p>
        ) : (
          navItems.map(item => {
            const Icon = item.iconKey ? (iconMap[item.iconKey] ?? LayoutDashboard) : LayoutDashboard;
            return (
              <NavLink
                key={item.id}
                to={item.route ?? '/admin'}
                end={item.key === 'admin_overview'}
                className={['admin-sidebar-item', isActive(item) && 'active'].filter(Boolean).join(' ')}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })
        )}
      </nav>

      <div className="px-3 py-4 border-t admin-sidebar-divider space-y-1">
        <NavLink to="/" className="admin-sidebar-item text-sidebar-muted hover:text-sidebar-text">
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          <span>Kembali ke App</span>
        </NavLink>
        <button onClick={onLogout} className="admin-sidebar-item w-full text-sidebar-muted hover:text-danger">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
