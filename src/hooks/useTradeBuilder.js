import { useState, useCallback } from 'react';
import tradeService from '../services/tradeService';
import { useNotification } from '../context/NotificationContext';
import { parseApiError } from '../utils/errors';
import { MAX_TRADE_CARDS_PER_SIDE } from '../utils/constants';

function useTradeBuilder(initialTargetUserId, initialCardId) {
  const [step, setStep] = useState(1);
  const [selectedOwnCards, setSelectedOwnCards] = useState([]);
  const [selectedTargetCards, setSelectedTargetCards] = useState(
    initialCardId ? [{ id: initialCardId }] : []
  );
  const [targetUserId, setTargetUserId] = useState(initialTargetUserId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useNotification();

  const toggleOwnCard = useCallback((card) => {
    setSelectedOwnCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) return prev.filter(c => c.id !== card.id);
      if (prev.length >= MAX_TRADE_CARDS_PER_SIDE) return prev;
      return [...prev, card];
    });
  }, []);

  const toggleTargetCard = useCallback((card) => {
    setSelectedTargetCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) return prev.filter(c => c.id !== card.id);
      if (prev.length >= MAX_TRADE_CARDS_PER_SIDE) return prev;
      return [...prev, card];
    });
  }, []);

  const nextStep = useCallback(() => setStep(s => Math.min(s + 1, 3)), []);
  const prevStep = useCallback(() => setStep(s => Math.max(s - 1, 1)), []);

  const submit = useCallback(async (onSuccess) => {
    if (!selectedOwnCards.length || !selectedTargetCards.length || !targetUserId) {
      setError('Please select at least one card from each side');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const trade = await tradeService.createTrade({
        offeredCardIds: selectedOwnCards.map(c => c.id),
        requestedCardIds: selectedTargetCards.map(c => c.id),
        counterpartyUserId: targetUserId,
      });
      addToast('success', 'Trade proposal sent!');
      if (onSuccess) onSuccess(trade);
    } catch (err) {
      const appErr = parseApiError(err);
      setError(appErr.message);
      addToast('error', appErr.message);
    } finally {
      setLoading(false);
    }
  }, [selectedOwnCards, selectedTargetCards, targetUserId, addToast]);

  return {
    step,
    selectedOwnCards,
    selectedTargetCards,
    targetUserId,
    loading,
    error,
    setTargetUserId,
    toggleOwnCard,
    toggleTargetCard,
    nextStep,
    prevStep,
    submit,
  };
}

export default useTradeBuilder;
