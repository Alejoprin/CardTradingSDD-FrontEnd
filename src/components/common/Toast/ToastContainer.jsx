import React from 'react';
import { useNotification } from '../../../context/NotificationContext';
import Toast from './Toast';
import styles from './Toast.module.css';

function ToastContainer() {
  const { toasts, removeToast } = useNotification();

  if (!toasts.length) return null;

  return (
    <div className={styles.container} aria-label="Notifications">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
