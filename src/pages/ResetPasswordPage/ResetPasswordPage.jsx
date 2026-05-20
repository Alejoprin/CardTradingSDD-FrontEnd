import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { validateEmail, validateRequired, validatePassword, validatePasswordConfirm } from '../../utils/validators';
import { parseApiError } from '../../utils/errors';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import styles from './ResetPasswordPage.module.css';

function ResetPasswordPage() {
  const { t } = useTranslation();
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
      setSuccessMessage(t('resetPassword.successMessage'));
      setMode('confirm');
    } catch (err) {
      setErrors({ email: parseApiError(err).message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    const tokenError = validateRequired(token, t('resetPassword.resetToken'));
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
      navigate('/login', { replace: true, state: { message: t('resetPassword.successMessage') } });
    } catch (err) {
      setErrors({ token: parseApiError(err).message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('resetPassword.title')}</h1>

        {mode === 'request' && (
          <form onSubmit={handleRequest} className={styles.form} noValidate>
            <p className={styles.hint}>{t('resetPassword.hint')}</p>
            <Input
              name="email"
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              placeholder={t('auth.emailPlaceholder')}
            />
            <Button label={t('resetPassword.sendLink')} type="submit" isLoading={isSubmitting} disabled={isSubmitting} />
          </form>
        )}

        {mode === 'confirm' && (
          <>
            {successMessage && <p className={styles.success}>{successMessage}</p>}
            <form onSubmit={handleConfirm} className={styles.form} noValidate>
              <Input
                name="token"
                label={t('resetPassword.token')}
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                error={errors.token}
                placeholder={t('resetPassword.tokenPlaceholder')}
              />
              <Input
                name="newPassword"
                label={t('auth.newPassword')}
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                error={errors.newPassword}
                placeholder={t('auth.passwordMinChars')}
              />
              <Input
                name="confirmPassword"
                label={t('resetPassword.confirmNewPassword')}
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                placeholder={t('resetPassword.confirmNewPasswordPlaceholder')}
              />
              <Button label={t('resetPassword.setNewPassword')} type="submit" isLoading={isSubmitting} disabled={isSubmitting} />
            </form>
          </>
        )}

        <div className={styles.links}>
          <Link to="/login">{t('auth.backToSignIn')}</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
