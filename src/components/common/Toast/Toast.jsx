import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styles from './Toast.module.css';

function Toast({ id, type, message, onClose }) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.toast} ${styles[type] || styles.info}`} role="alert" aria-live="polite">
      <span className={styles.message}>{message}</span>
      <button className={styles.closeBtn} onClick={() => onClose(id)} aria-label={t('common.dismiss')}>
        &#x2715;
      </button>
    </div>
  );
}

Toast.propTypes = {
  id: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Toast;
