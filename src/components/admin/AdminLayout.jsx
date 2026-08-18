import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, Users, ClipboardList, Star, Shield, HelpCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

const adminTabs = [
  { path: '/admin', icon: Users, label: 'Users' },
  { path: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/admin/reviews', icon: Star, label: 'Reviews' },
  { path: '/admin/verifications', icon: Shield, label: 'Verify' },
  { path: '/admin/support', icon: HelpCircle, label: 'Support' },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center gap-2 px-4 h-14">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold">Errand Buddy <span className="text-xs text-muted-foreground font-normal">Admin</span></h1>
          <button onClick={() => base44.auth.logout()} className="ml-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto flex">
          {adminTabs.map(tab => {
            const active = location.pathname === tab.path;
            return (
              <Link key={tab.path} to={tab.path} className={cn('flex-1 flex flex-col items-center py-2 pt-3 gap-0.5', active ? 'text-primary' : 'text-muted-foreground')}>
                <tab.icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
