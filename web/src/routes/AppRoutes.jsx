import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

import { Home } from '../pages/Home';
import { PropertyList } from '../pages/PropertyList';
import { PropertyDetail } from '../pages/PropertyDetail';
import { Favorites } from '../pages/Favorites';
import { Viewings } from '../pages/Viewings';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Profile } from '../pages/Profile';
import { AdminProperties } from '../pages/AdminProperties';
import { NotFound } from '../pages/NotFound';

import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          <Route
            path="/properties"
            element={<PropertyList />}
          />

          <Route
            path="/properties/:id"
            element={<PropertyDetail />}
          />

          {/* Protected Tenant Routes */}
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />

          <Route
            path="/viewings"
            element={
              <ProtectedRoute>
                <Viewings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute>
                <AdminProperties />
              </ProtectedRoute>
            }
          />

          {/* Authentication */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </main>

      <Footer />
    </div>
  );
};