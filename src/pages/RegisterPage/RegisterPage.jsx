import React from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RegisterForm from '../../components/forms/RegisterForm/RegisterForm';
import styles from './RegisterPage.module.css';

function RegisterPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join the CardTrading community</p>
        <RegisterForm onSuccess={() => navigate('/dashboard', { replace: true })} />
        <div className={styles.links}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
