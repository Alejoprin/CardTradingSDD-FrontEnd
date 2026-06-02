import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ChatBubble from '../ChatBubble/ChatBubble';
import Button from '../../../common/Button/Button';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './ChatView.module.css';

function ChatView({
  chat, messages, currentUserId, input, onInputChange,
  onSend, sending, loading, listRef, onProposeTrade,
}) {
  const { t } = useTranslation();

  if (loading) {
    return <div className={styles.center}><Spinner size="lg" /></div>;
  }

  if (!chat) {
    return <p className={styles.center}>{t('chats.noMessages')}</p>;
  }

  const otherUser = chat.buyerId === currentUserId ? chat.sellerUsername : chat.buyerUsername;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.otherName}>{otherUser}</span>
        {onProposeTrade && (
          <Button
            label={t('chats.proposeTrade')}
            onClick={onProposeTrade}
            variant="secondary"
          />
        )}
      </div>

      <div className={styles.messages} ref={listRef}>
        {messages.length === 0 ? (
          <p className={styles.empty}>{t('chats.noMessages')}</p>
        ) : (
          messages.map((msg, i) => (
            <ChatBubble
              key={msg.id || i}
              message={msg}
              isOwn={msg.senderId === currentUserId}
            />
          ))
        )}
      </div>

      <div className={styles.inputBar}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder={t('chats.typeMessage')}
          disabled={sending}
        />
        <Button
          label={t('chats.send')}
          onClick={onSend}
          isLoading={sending}
          disabled={!input.trim()}
        />
      </div>
    </div>
  );
}

ChatView.propTypes = {
  chat: PropTypes.object,
  messages: PropTypes.array,
  currentUserId: PropTypes.string,
  input: PropTypes.string,
  onInputChange: PropTypes.func,
  onSend: PropTypes.func,
  sending: PropTypes.bool,
  loading: PropTypes.bool,
  listRef: PropTypes.object,
  onProposeTrade: PropTypes.func,
};

export default ChatView;
