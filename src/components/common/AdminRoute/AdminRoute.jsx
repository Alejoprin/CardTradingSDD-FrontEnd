import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { USER_ROLES } from '../../../utils/constants';
import Spinner from '../Spinner/Spinner';
import styles from './AdminRoute.module.css';

function AdminRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== USER_ROLES.ADMIN) {
    return (
      <div className={styles.forbidden}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return <Outlet />;
}

export default AdminRoute;
