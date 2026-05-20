import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styles from './Spinner.module.css';

function Spinner({ size = 'md', label }) {
  const { t } = useTranslation();
  return (
    <span
      className={`${styles.spinner} ${styles[size] || styles.md}`}
      role="status"
      aria-label={label || t('common.loading')}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
};


export default Spinner;
