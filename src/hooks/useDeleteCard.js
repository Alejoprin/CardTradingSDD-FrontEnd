import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cardService from '../services/cardService';
import { useNotification } from '../context/NotificationContext';
import { parseApiError } from '../utils/errors';

function useDeleteCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useNotification();

  async function deleteCard(cardId, cardName) {
    setLoading(true);
    setError(null);
    try {
      await cardService.deleteCard(cardId);
      addToast('success', `"${cardName || 'Card'}" deleted successfully`);
      navigate('/inventory', { replace: true });
    } catch (err) {
      const appErr = parseApiError(err);
      setError(appErr.message);
      addToast('error', appErr.message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, deleteCard };
}

export default useDeleteCard;
