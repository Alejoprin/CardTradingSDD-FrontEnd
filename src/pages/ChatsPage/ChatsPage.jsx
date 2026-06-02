import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import ChatList from '../../components/features/chats/ChatList/ChatList';
import useChatsList from '../../hooks/useChatsList';
import styles from './ChatsPage.module.css';

function ChatsPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { chats, loading, error } = useChatsList();

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>{t('chats.title')}</h1>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.listWrap}>
          <ChatList
            chats={chats}
            loading={loading}
            currentUserId={user?.id}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default ChatsPage;
