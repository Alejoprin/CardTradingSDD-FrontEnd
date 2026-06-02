import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import ChatView from '../../components/features/chats/ChatView/ChatView';
import useChat from '../../hooks/useChat';
import { parseApiError } from '../../utils/errors';
import styles from './ChatPage.module.css';

function ChatPage() {
  const { t } = useTranslation();
  const { chatId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const {
    messages, chat, loading, sending, error,
    input, setInput, sendMessage, listRef, refetch,
  } = useChat(chatId, null);

  const handleProposeTrade = () => {
    if (!chat) return;
    const otherUserId = chat.buyerId === user?.id ? chat.sellerId : chat.buyerId;
    navigate(`/trades/create?targetUserId=${otherUserId}`);
  };

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <Link to="/chats" className={styles.back}>← {t('chats.backToChats')}</Link>

        {error && <p className={styles.error}>{error}</p>}

        <ChatView
          chat={chat}
          messages={messages}
          currentUserId={user?.id}
          input={input}
          onInputChange={setInput}
          onSend={sendMessage}
          sending={sending}
          loading={loading}
          listRef={listRef}
          onProposeTrade={handleProposeTrade}
        />
      </div>
    </MainLayout>
  );
}

export default ChatPage;
