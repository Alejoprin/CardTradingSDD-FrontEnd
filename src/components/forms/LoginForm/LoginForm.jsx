import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import useForm from '../../../hooks/useForm';
import { validateEmail, validatePassword } from '../../../utils/validators';
import { parseApiError } from '../../../utils/errors';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import styles from './LoginForm.module.css';

function validate(values, t) {
  return {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
}

function LoginForm({ onSuccess }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    { email: '', password: '' },
    (vals) => validate(vals, t)
  );

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await login(vals.email, vals.password);
      if (onSuccess) onSuccess();
    } catch (err) {
      const appErr = parseApiError(err);
      setFieldError('password', appErr.message);
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
        name="password"
        label={t('auth.password')}
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.password && errors.password}
        placeholder={t('auth.passwordPlaceholder')}
      />
      <Button
        label={t('auth.signIn')}
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      />
      {/* Separador */}
      <div className={styles.divider}>
        <span>{t('common.or')}</span>
      </div>

      {/* Botón Google */}
      <button
        type="button"
        className={styles.googleButton}
        onClick={() => {
          const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');
          window.location.href = `${base}/oauth2/authorization/google`;
        }}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          width={20}
          height={20}
        />
        {t('auth.continueWithGoogle')}
      </button>
    </form>
  );
}

LoginForm.propTypes = {
  onSuccess: PropTypes.func,
};

export default LoginForm;
