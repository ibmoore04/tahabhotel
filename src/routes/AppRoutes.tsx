// ==============================================================================
// TAHAB HOTEL & SUITES LTD — APPLICATION ROUTING TABLE
// ==============================================================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { StaffLayout } from '../layouts/StaffLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/Home';
import { RoomsPage } from '../pages/Rooms';
import { RoomDetailsPage } from '../pages/RoomDetails';
import { AmenitiesPage } from '../pages/Amenities';
import { ContactPage } from '../pages/Contact';
import { PoliciesPage } from '../pages/Policies';
import { BookingPage } from '../pages/Booking';
import { BookingSuccessPage } from '../pages/BookingSuccess';
import { NotFoundPage } from '../pages/NotFound';

// Auth Pages
import { LoginPage } from '../pages/Auth/Login';
import { RegisterPage, ForgotPasswordPage } from '../pages/Auth/Register';
import { ResetPasswordPage } from '../pages/Auth/ResetPassword';
import { SetupPage } from '../pages/Auth/Setup';

// Guest Account Portal
import { AccountPage } from '../pages/Account';

// Staff Operations Portal
import { StaffDashboardPage } from '../pages/Staff/Dashboard';
import { StaffBookingsPage } from '../pages/Staff/Bookings';
import { StaffCheckInPage } from '../pages/Staff/CheckIn';

// Admin Management Portal
import { AdminDashboardPage } from '../pages/Admin/Dashboard';
import { AdminRoomsPage } from '../pages/Admin/Rooms';
import { AdminBookingsPage } from '../pages/Admin/Bookings';
import { AdminGuestsPage } from '../pages/Admin/Guests';
import { AdminStaffPage } from '../pages/Admin/Staff';
import { AdminUsersPage } from '../pages/Admin/Users';
import { AdminAuditLogsPage } from '../pages/Admin/AuditLogs';
import { AdminAmenitiesPage } from '../pages/Admin/Amenities';
import { AdminGalleryPage } from '../pages/Admin/Gallery';
import { AdminMessagesPage } from '../pages/Admin/Messages';
import { AdminSettingsPage } from '../pages/Admin/Settings';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ===================================================================
          1. AUTH ROUTES — No header or footer (bare fullscreen pages)
      =================================================================== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/setup" element={<SetupPage />} />

      {/* ===================================================================
          2. Public Facing Website — with Header, Footer & Announcement Bar
      =================================================================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:slug" element={<RoomDetailsPage />} />
        <Route path="/amenities" element={<AmenitiesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/booking/success" element={<BookingSuccessPage />} />
        <Route path="/booking/cancelled" element={<Navigate to="/rooms" replace />} />

        {/* Guest Account Portal (Protected - any authenticated active user) */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ===================================================================
          3. Staff Operations Portal (Protected - staff, admin, super_admin)
      =================================================================== */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute requireStaff>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboardPage />} />
        <Route path="bookings" element={<StaffBookingsPage />} />
        <Route path="check-in" element={<StaffCheckInPage />} />
      </Route>

      {/* ===================================================================
          4. Admin Hotel Management Portal (Protected - admin, super_admin)
      =================================================================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="rooms" element={<AdminRoomsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="guests" element={<AdminGuestsPage />} />
        <Route path="staff" element={<AdminStaffPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="audit" element={<AdminAuditLogsPage />} />
        <Route path="amenities" element={<AdminAmenitiesPage />} />
        <Route path="gallery" element={<AdminGalleryPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
};
