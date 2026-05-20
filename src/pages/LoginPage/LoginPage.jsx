import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/forms/LoginForm/LoginForm';
import styles from './LoginPage.module.css';

function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('auth.signIn')}</h1>
        <p className={styles.subtitle}>{t('auth.welcomeBack')}</p>
        <LoginForm onSuccess={() => navigate('/dashboard', { replace: true })} />
        <div className={styles.links}>
          <Link to="/reset-password">{t('auth.forgotPassword')}</Link>
          <span> · </span>
          <Link to="/register">{t('auth.createAccountLink')}</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
