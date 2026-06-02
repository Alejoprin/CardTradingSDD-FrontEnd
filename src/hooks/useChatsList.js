import { useState, useEffect, useCallback } from 'react';
import chatService from '../services/chatService';
import { parseApiError } from '../utils/errors';

function useChatsList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await chatService.listChats();
      setChats(data.content || data || []);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return { chats, loading, error, refetch: fetchChats };
}

export default useChatsList;
