import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { USER_ROLES } from '../../../utils/constants';
import Spinner from '../Spinner/Spinner';
import styles from './AdminRoute.module.css';

function AdminRoute() {
  const { t } = useTranslation();
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== USER_ROLES.ADMIN) {
    return (
      <div className={styles.forbidden}>
        <h2>{t('common.accessDenied')}</h2>
        <p>{t('common.accessDeniedMessage')}</p>
      </div>
    );
  }

  return <Outlet />;
}

export default AdminRoute;
