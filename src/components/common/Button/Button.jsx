import React from 'react';
import PropTypes from 'prop-types';
import Spinner from '../Spinner/Spinner';
import styles from './Button.module.css';

function Button({ label, onClick, variant, isLoading, disabled, type, className }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${styles.button} ${styles[variant] || ''} ${className || ''}`}
      aria-busy={isLoading}
    >
      {isLoading && <Spinner size="sm" />}
      <span className={isLoading ? styles.hiddenLabel : ''}>{label}</span>
    </button>
  );
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
};

Button.defaultProps = {
  variant: 'primary',
  isLoading: false,
  disabled: false,
  type: 'button',
};

export default Button;
