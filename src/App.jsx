import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { UIProvider } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import './styles/globals.css';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';

// Route guards
import PrivateRoute from './components/common/PrivateRoute/PrivateRoute';
import AdminRoute from './components/common/AdminRoute/AdminRoute';

// Public pages
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';

// Protected pages
import DashboardPage from './pages/DashboardPage/DashboardPage';
import InventoryPage from './pages/InventoryPage/InventoryPage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import CardDetailPage from './pages/CardDetailPage/CardDetailPage';
import CreateCardPage from './pages/CreateCardPage/CreateCardPage';
import EditCardPage from './pages/EditCardPage/EditCardPage';
import TradesPage from './pages/TradesPage/TradesPage';
import CreateTradePage from './pages/CreateTradePage/CreateTradePage';
import TradeDetailPage from './pages/TradeDetailPage/TradeDetailPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import EditProfilePage from './pages/EditProfilePage/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage/ChangePasswordPage';
import PublicProfilePage from './pages/PublicProfilePage/PublicProfilePage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage/OAuth2CallbackPage';

// Admin pages
import AdminPage from './pages/AdminPage/AdminPage';

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/oauth2/callback', element: <OAuth2CallbackPage /> },

  // Protected routes
  {
    element: <PrivateRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/inventory', element: <InventoryPage /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/cards/:cardId', element: <CardDetailPage /> },
      { path: '/trades', element: <TradesPage /> },
      { path: '/trades/create', element: <CreateTradePage /> },
      { path: '/trades/:tradeId', element: <TradeDetailPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/profile/edit', element: <EditProfilePage /> },
      { path: '/profile/change-password', element: <ChangePasswordPage /> },
      { path: '/users/:userId', element: <PublicProfilePage /> },
    ],
  },

  // Admin routes
  {
    element: <AdminRoute />,
    children: [
      { path: '/admin', element: <AdminPage /> },
      { path: '/cards/create', element: <CreateCardPage /> },
      { path: '/cards/:cardId/edit', element: <EditCardPage /> },
    ],
  },

  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/login" replace /> },
], {
  basename: '/CardTradingSDD-FrontEnd'
});

function App() {
  return (
    <ErrorBoundary>
      <UIProvider>
        <NotificationProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </NotificationProvider>
      </UIProvider>
    </ErrorBoundary>
  );
}

export default App;
