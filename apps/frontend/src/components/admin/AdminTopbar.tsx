import { Bell, User } from 'lucide-react';
import type { User as UserType } from '../../types';

interface AdminTopbarProps {
  user: UserType;
  title?: string;
}

export function AdminTopbar({ user, title }: AdminTopbarProps) {
  return (
    <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        {title && <h1 className="text-xl font-semibold text-foreground">{title}</h1>}
        {!title && <div className="h-6" />}
      </div>
      <div className="flex items-center gap-4">
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface-secondary transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-9 h-9 rounded-xl bg-brand-primary-soft flex items-center justify-center text-brand-primary">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-foreground">{user.name}</div>
            <div className="text-xs text-foreground-subtle">{user.role === 'admin' ? 'Administrator' : 'User'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
