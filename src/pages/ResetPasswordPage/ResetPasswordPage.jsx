import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { validateEmail, validateRequired, validatePassword, validatePasswordConfirm } from '../../utils/validators';
import { parseApiError } from '../../utils/errors';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import styles from './ResetPasswordPage.module.css';

function ResetPasswordPage() {
  const [mode, setMode] = useState('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  async function handleRequest(e) {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) { setErrors({ email: emailError }); return; }
    setErrors({});
    setIsSubmitting(true);
    try {
      await authService.requestPasswordReset(email);
      setSuccessMessage('If that email exists, a reset link has been sent. Check your inbox.');
      setMode('confirm');
    } catch (err) {
      setErrors({ email: parseApiError(err).message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    const tokenError = validateRequired(token, 'Reset token');
    const passwordError = validatePassword(newPassword);
    const confirmError = validatePasswordConfirm(confirmPassword, newPassword);
    if (tokenError || passwordError || confirmError) {
      setErrors({ token: tokenError, newPassword: passwordError, confirmPassword: confirmError });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await authService.confirmPasswordReset(token, newPassword);
      navigate('/login', { replace: true, state: { message: 'Password reset successful. Please sign in.' } });
    } catch (err) {
      setErrors({ token: parseApiError(err).message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>

        {mode === 'request' && (
          <form onSubmit={handleRequest} className={styles.form} noValidate>
            <p className={styles.hint}>Enter your email address to receive a reset link.</p>
            <Input
              name="email"
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Button label="Send Reset Link" type="submit" isLoading={isSubmitting} disabled={isSubmitting} />
          </form>
        )}

        {mode === 'confirm' && (
          <>
            {successMessage && <p className={styles.success}>{successMessage}</p>}
            <form onSubmit={handleConfirm} className={styles.form} noValidate>
              <Input
                name="token"
                label="Reset Token"
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                error={errors.token}
                placeholder="Paste your reset token"
              />
              <Input
                name="newPassword"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                error={errors.newPassword}
                placeholder="At least 8 characters"
              />
              <Input
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                placeholder="Repeat new password"
              />
              <Button label="Set New Password" type="submit" isLoading={isSubmitting} disabled={isSubmitting} />
            </form>
          </>
        )}

        <div className={styles.links}>
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
