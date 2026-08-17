import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LocationProvider } from '@/lib/LocationContext';
import { base44 } from '@/api/base44Client';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// App pages
import Home from '@/pages/Home';
import AddOrder from '@/pages/AddOrder';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import Profile from '@/pages/Profile';
import PublicProfile from '@/pages/PublicProfile';
import Settings from '@/pages/Settings';
import Verification from '@/pages/Verification';
import Support from '@/pages/Support';
import Terms from '@/pages/Terms';
import Chat from '@/pages/Chat';
import ChatList from '@/pages/ChatList';

// Admin pages
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminVerifications from '@/pages/admin/AdminVerifications';
import AdminSupport from '@/pages/admin/AdminSupport';

// Layout
import AppLayout from '@/components/AppLayout';
import AdminLayout from '@/components/admin/AdminLayout';
import SplashScreen from '@/components/SplashScreen';
import Tutorial from '@/components/Tutorial';
import NotificationListener from '@/components/NotificationListener';
import InstallPrompt from '@/components/InstallPrompt';

const ADMIN_EMAIL = 'ajayihammed356@gmail.com';

function AppShell() {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && !user.tutorial_completed) {
      setShowTutorial(true);
    }
  }, [user]);

  const completeTutorial = async () => {
    setShowTutorial(false);
    await base44.auth.updateMe({ tutorial_completed: true });
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <LocationProvider>
      <NotificationListener />
      <SplashScreen show={showSplash} />
      {showTutorial && !showSplash && <Tutorial onComplete={completeTutorial} />}
      <Routes>
        {isAdmin ? (
          <Route element={<AdminLayout />}>
            <Route path="/" element={<AdminUsers />} />
            <Route path="/admin" element={<AdminUsers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/verifications" element={<AdminVerifications />} />
            <Route path="/admin/support" element={<AdminSupport />} />
          </Route>
        ) : (
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/public-profile" element={<PublicProfile />} />
            <Route path="/terms" element={<Terms />} />
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route path="/add-order" element={<AddOrder />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/support" element={<Support />} />
            </Route>
          </Route>
        )}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/chat/:orderId" element={<Chat />} />
          <Route path="/chats" element={<ChatList />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </LocationProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*" element={<AppShell />} />
          </Routes>
        </Router>
        <Toaster />
        <InstallPrompt />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;