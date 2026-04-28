import React from 'react';
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

function validate(values) {
  return {
    currentPassword: validateRequired(values.currentPassword, 'Current password'),
    newPassword: validatePassword(values.newPassword),
    confirmPassword: validatePasswordConfirm(values.confirmPassword, values.newPassword),
  };
}

function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate
  );

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await authService.changePassword(vals.currentPassword, vals.newPassword);
      addToast('success', 'Password changed successfully!');
      navigate('/profile', { replace: true });
    } catch (err) {
      setFieldError('currentPassword', parseApiError(err).message);
    }
  });

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>Change Password</h1>
        <div className={styles.formWrapper}>
          <form onSubmit={onSubmit} className={styles.form} noValidate>
            <Input
              name="currentPassword"
              label="Current Password"
              type="password"
              value={values.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.currentPassword && errors.currentPassword}
            />
            <Input
              name="newPassword"
              label="New Password"
              type="password"
              value={values.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.newPassword && errors.newPassword}
              placeholder="At least 8 characters"
            />
            <Input
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
            />
            <div className={styles.actions}>
              <Button label="Cancel" onClick={() => navigate('/profile')} variant="secondary" type="button" />
              <Button label="Change Password" type="submit" isLoading={isSubmitting} disabled={isSubmitting} />
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

export default ChangePasswordPage;
