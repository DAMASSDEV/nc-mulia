import type { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import type { User } from '../../types';

interface AdminLayoutProps {
  children: ReactNode;
  user: User;
  title?: string;
  onLogout: () => void;
}

export function AdminLayout({ children, user, title, onLogout }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar onLogout={onLogout} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopbar user={user} title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
