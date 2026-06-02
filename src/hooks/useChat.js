import { useState, useEffect, useCallback, useRef } from 'react';
import chatService from '../services/chatService';
import useWebSocket from './useWebSocket';
import { parseApiError } from '../utils/errors';

function useChat(chatId, token) {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  const wsUrl = token ? chatService.getWebSocketUrl(token) : null;

  const handleNewMessage = useCallback((data) => {
    if (data.chatId === chatId || data.chatId === chat?.id) {
      setMessages(prev => [...prev, data]);
    }
  }, [chatId, chat?.id]);

  useWebSocket({
    url: wsUrl,
    onMessage: handleNewMessage,
    enabled: !!wsUrl && !!chatId,
  });

  const fetchChat = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    try {
      const [chatData, messagesData] = await Promise.all([
        chatService.getChat(chatId),
        chatService.getMessages(chatId),
      ]);
      setChat(chatData);
      setMessages(messagesData.content || messagesData || []);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !chatId) return;
    setSending(true);
    try {
      await chatService.sendMessage(chatId, { content: trimmed, type: 'TEXT' });
      setInput('');
    } catch (err) {
      const appErr = parseApiError(err);
      setError(appErr.message);
    } finally {
      setSending(false);
    }
  }, [input, chatId]);

  return {
    messages, chat, loading, sending, error,
    input, setInput, sendMessage, listRef, refetch: fetchChat,
  };
}

export default useChat;
