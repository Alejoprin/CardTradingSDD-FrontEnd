import React from 'react';
import PropTypes from 'prop-types';
import styles from './ChatBubble.module.css';

function ChatBubble({ message, isOwn }) {
  return (
    <div className={`${styles.bubble} ${isOwn ? styles.own : styles.other}`}>
      <p className={styles.text}>{message.content}</p>
      <span className={styles.time}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

ChatBubble.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
  }).isRequired,
  isOwn: PropTypes.bool,
};

export default ChatBubble;
