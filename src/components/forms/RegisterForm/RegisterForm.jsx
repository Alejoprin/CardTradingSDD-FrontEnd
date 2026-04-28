import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../context/AuthContext';
import authService from '../../../services/authService';
import useForm from '../../../hooks/useForm';
import { validateEmail, validatePassword, validatePasswordConfirm, validateUsername } from '../../../utils/validators';
import { parseApiError } from '../../../utils/errors';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import styles from './RegisterForm.module.css';

function validate(values) {
  return {
    email: validateEmail(values.email),
    username: validateUsername(values.username),
    password: validatePassword(values.password),
    confirmPassword: validatePasswordConfirm(values.confirmPassword, values.password),
  };
}

function RegisterForm({ onSuccess }) {
  const { login } = useAuth();
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    { email: '', username: '', password: '', confirmPassword: '' },
    validate
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
        label="Email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email && errors.email}
        placeholder="you@example.com"
      />
      <Input
        name="username"
        label="Username"
        type="text"
        value={values.username}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.username && errors.username}
        placeholder="trader42"
      />
      <Input
        name="password"
        label="Password"
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.password && errors.password}
        placeholder="At least 8 characters"
      />
      <Input
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.confirmPassword && errors.confirmPassword}
        placeholder="Repeat password"
      />
      <Button
        label="Create Account"
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
