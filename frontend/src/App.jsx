import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

import FarmerDashboard from "./pages/FarmerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import PredictionPage from "./pages/PredictionPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";

import NotFoundPage from "./pages/NotFoundPage";

import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>

        {/* Farmer Routes */}
        <Route element={<RoleRoute allowedRoles={["farmer"]} />}>

          <Route path="/farmer" element={<FarmerDashboard />} />

          <Route
            path="/farmer/prediction"
            element={<PredictionPage />}
          />

          <Route
            path="/farmer/analytics"
            element={<AnalyticsPage mode="farmer" />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

        </Route>

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>

          <Route path="/admin" element={<AdminDashboard />} />

          <Route
            path="/admin/analytics"
            element={<AnalyticsPage mode="admin" />}
          />

        </Route>

      </Route>

      {/* 404 Page */}
      <Route path="/404" element={<NotFoundPage />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/404" replace />} />

    </Routes>
  );
};

export default App;