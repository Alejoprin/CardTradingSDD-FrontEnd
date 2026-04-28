import React from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/forms/LoginForm/LoginForm';
import styles from './LoginPage.module.css';

function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Welcome back to CardTrading</p>
        <LoginForm onSuccess={() => navigate('/dashboard', { replace: true })} />
        <div className={styles.links}>
          <Link to="/reset-password">Forgot password?</Link>
          <span> · </span>
          <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
