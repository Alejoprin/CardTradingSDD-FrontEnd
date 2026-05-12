import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import Button from '../../../common/Button/Button';
import styles from './QuickActions.module.css';

function QuickActions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Quick Actions</h2>
      <div className={styles.buttons}>
        {isAdmin && (
          <Button label="Add Card" onClick={() => navigate('/cards/create')} />
        )}
        <Button label="Explore Catalog" onClick={() => navigate('/catalog')} variant="secondary" />
        <Button label="My Trades" onClick={() => navigate('/trades')} variant="secondary" />
      </div>
    </div>
  );
}

export default QuickActions;