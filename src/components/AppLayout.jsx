import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <AppHeader />
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}