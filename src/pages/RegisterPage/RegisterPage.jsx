import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RegisterForm from '../../components/forms/RegisterForm/RegisterForm';
import styles from './RegisterPage.module.css';

function RegisterPage() {
  const { t } = useTranslation();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('auth.createAccount')}</h1>
        <p className={styles.subtitle}>{t('auth.joinCommunity')}</p>
        <RegisterForm onSuccess={() => navigate('/dashboard', { replace: true })} />
        <div className={styles.links}>
          {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.signIn')}</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
