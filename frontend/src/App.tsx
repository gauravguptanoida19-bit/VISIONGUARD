import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { DemoProvider } from './context/DemoContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CamerasPage } from './pages/CamerasPage';
import { CameraDetailPage } from './pages/CameraDetailPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { AICopilotPage } from './pages/AICopilotPage';
import { SearchPage } from './pages/SearchPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#06090F] text-cyan-400 font-mono text-xs">
        Initializing VisionGuard Security Terminal...
      </div>
    );
  }

  // In demo mode or development, if user hasn't explicitly logged in, allow smooth evaluation or redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <SocketProvider>
          <DemoProvider>
            <Routes>
              {/* Public Landing & Auth Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected App Routes inside Dashboard Shell */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/cameras" element={<CamerasPage />} />
                <Route path="/cameras/:id" element={<CameraDetailPage />} />
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/incidents/:id" element={<IncidentDetailPage />} />
                <Route path="/ai-copilot" element={<AICopilotPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Route>

              {/* Catch-all redirects to Landing Page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DemoProvider>
        </SocketProvider>
      </AuthProvider>
    </HashRouter>
  );
};
