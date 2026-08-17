import { Package, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

export default function AppHeader() {
  const unreadCount = useUnreadMessages();

  return (
    <header
      className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Errand Buddy</h1>
        </div>
        <Link to="/chats" className="p-2 rounded-full hover:bg-muted transition-colors relative">
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
