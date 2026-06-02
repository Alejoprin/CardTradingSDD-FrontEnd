import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Spinner from '../../../common/Spinner/Spinner';
import { formatRelativeTime } from '../../../../utils/formatters';
import styles from './ChatList.module.css';

function ChatList({ chats, loading, currentUserId }) {
  const { t } = useTranslation();

  if (loading) {
    return <div className={styles.center}><Spinner size="lg" /></div>;
  }

  if (!chats.length) {
    return <p className={styles.empty}>{t('chats.empty')}</p>;
  }

  return (
    <div className={styles.list}>
      {chats.map(chat => {
        const otherUser = chat.buyerId === currentUserId ? chat.sellerUsername : chat.buyerUsername;
        const lastMsg = chat.lastMessage?.content || t('chats.noMessages');
        return (
          <Link key={chat.id} to={`/chats/${chat.id}`} className={styles.item}>
            <div className={styles.avatar}>
              {otherUser?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className={styles.body}>
              <div className={styles.top}>
                <span className={styles.username}>{otherUser}</span>
                {chat.lastMessage?.createdAt && (
                  <span className={styles.time}>
                    {formatRelativeTime(chat.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <span className={styles.preview}>{lastMsg}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

ChatList.propTypes = {
  chats: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  currentUserId: PropTypes.string,
};

export default ChatList;
