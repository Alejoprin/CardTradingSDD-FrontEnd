import { useState, useCallback } from 'react';
import adService from '../services/adService';
import { useNotification } from '../context/NotificationContext';
import { parseApiError } from '../utils/errors';

function useCreateAd() {
  const [type, setType] = useState('SELL');
  const [cardId, setCardId] = useState(null);
  const [cardName, setCardName] = useState('');
  const [cardImageUrl, setCardImageUrl] = useState(null);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useNotification();

  const reset = useCallback(() => {
    setType('SELL');
    setCardId(null);
    setCardName('');
    setCardImageUrl(null);
    setPrice('');
    setDescription('');
    setError(null);
  }, []);

  const submit = useCallback(async (onSuccess) => {
    if (!cardId) {
      setError('Please select a card');
      return;
    }
    if (type === 'SELL' && (!price || isNaN(price) || Number(price) <= 0)) {
      setError('Please enter a valid price');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body = { type, cardId, description };
      if (type === 'SELL') body.price = Number(price);
      const ad = await adService.createAd(body);
      addToast('success', type === 'SELL' ? 'Ad published!' : 'Trade ad published!');
      if (onSuccess) onSuccess(ad);
    } catch (err) {
      const appErr = parseApiError(err);
      setError(appErr.message);
      addToast('error', appErr.message);
    } finally {
      setLoading(false);
    }
  }, [type, cardId, price, description, addToast]);

  return {
    type, setType, cardId, setCardId, cardName, setCardName,
    cardImageUrl, setCardImageUrl, price, setPrice,
    description, setDescription, loading, error, reset, submit,
  };
}

export default useCreateAd;
