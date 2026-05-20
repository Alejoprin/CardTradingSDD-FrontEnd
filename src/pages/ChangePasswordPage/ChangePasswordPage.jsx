import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import authService from '../../services/authService';
import useForm from '../../hooks/useForm';
import { validateRequired, validatePassword, validatePasswordConfirm } from '../../utils/validators';
import { parseApiError } from '../../utils/errors';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import styles from './ChangePasswordPage.module.css';

function validate(values, t) {
  return {
    currentPassword: validateRequired(values.currentPassword, t('auth.currentPassword')),
    newPassword: validatePassword(values.newPassword),
    confirmPassword: validatePasswordConfirm(values.confirmPassword, values.newPassword),
  };
}

function ChangePasswordPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    (vals) => validate(vals, t)
  );

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await authService.changePassword(vals.currentPassword, vals.newPassword);
      addToast('success', t('auth.passwordChanged'));
      navigate('/profile', { replace: true });
    } catch (err) {
      setFieldError('currentPassword', parseApiError(err).message);
    }
  });

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>{t('auth.changePassword')}</h1>
        <div className={styles.formWrapper}>
          <form onSubmit={onSubmit} className={styles.form} noValidate>
            <Input
              name="currentPassword"
              label={t('auth.currentPasswordLabel')}
              type="password"
              value={values.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.currentPassword && errors.currentPassword}
            />
            <Input
              name="newPassword"
              label={t('auth.newPassword')}
              type="password"
              value={values.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.newPassword && errors.newPassword}
              placeholder={t('auth.passwordMinChars')}
            />
            <Input
              name="confirmPassword"
              label={t('auth.confirmNewPassword')}
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
            />
            <div className={styles.actions}>
              <Button label={t('common.cancel')} onClick={() => navigate('/profile')} variant="secondary" type="button" />
              <Button label={t('auth.changePassword')} type="submit" isLoading={isSubmitting} disabled={isSubmitting} />
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

export default ChangePasswordPage;
