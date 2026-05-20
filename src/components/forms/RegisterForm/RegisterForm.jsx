import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import authService from '../../../services/authService';
import useForm from '../../../hooks/useForm';
import { validateEmail, validatePassword, validatePasswordConfirm, validateUsername } from '../../../utils/validators';
import { parseApiError } from '../../../utils/errors';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import styles from './RegisterForm.module.css';

function validate(values, t) {
  return {
    email: validateEmail(values.email),
    username: validateUsername(values.username),
    password: validatePassword(values.password),
    confirmPassword: validatePasswordConfirm(values.confirmPassword, values.password),
  };
}

function RegisterForm({ onSuccess }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    { email: '', username: '', password: '', confirmPassword: '' },
    (vals) => validate(vals, t)
  );

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await authService.register(vals.email, vals.username, vals.password);
      await login(vals.email, vals.password);
      if (onSuccess) onSuccess();
    } catch (err) {
      const appErr = parseApiError(err);
      setFieldError('email', appErr.message);
    }
  });

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <Input
        name="email"
        label={t('auth.email')}
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email && errors.email}
        placeholder={t('auth.emailPlaceholder')}
      />
      <Input
        name="username"
        label={t('auth.username')}
        type="text"
        value={values.username}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.username && errors.username}
        placeholder={t('auth.usernamePlaceholder')}
      />
      <Input
        name="password"
        label={t('auth.password')}
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.password && errors.password}
        placeholder={t('auth.passwordMinChars')}
      />
      <Input
        name="confirmPassword"
        label={t('auth.confirmPassword')}
        type="password"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.confirmPassword && errors.confirmPassword}
        placeholder={t('auth.repeatPassword')}
      />
      <Button
        label={t('auth.createAccount')}
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      />
    </form>
  );
}

RegisterForm.propTypes = {
  onSuccess: PropTypes.func,
};

export default RegisterForm;
