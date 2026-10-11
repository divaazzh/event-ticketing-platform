import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Pages
import { HomePage } from '@/pages/HomePage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { MyTicketsPage } from '@/pages/MyTicketsPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

export const App: React.FC = () => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:identifier" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-tickets" element={<MyTicketsPage />} />
          </Route>

          {/* Protected Admin & Organizer Portal */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'organizer']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
