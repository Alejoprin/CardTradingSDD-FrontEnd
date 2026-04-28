import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import CardForm from '../../components/forms/CardForm/CardForm';
import styles from './CreateCardPage.module.css';

function CreateCardPage() {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const { user, logout } = useAuth();

  function handleSuccess() {
    addToast('success', 'Card created successfully!');
    navigate('/inventory', { replace: true });
  }

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>Add New Card</h1>
        <div className={styles.formWrapper}>
          <CardForm mode="create" onSuccess={handleSuccess} />
        </div>
      </div>
    </MainLayout>
  );
}

export default CreateCardPage;
