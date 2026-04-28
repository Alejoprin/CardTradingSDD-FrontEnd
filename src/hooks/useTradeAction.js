import { useState, useCallback } from 'react';
import tradeService from '../services/tradeService';
import { useNotification } from '../context/NotificationContext';
import { parseApiError } from '../utils/errors';

function useTradeAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useNotification();

  const accept = useCallback(async (tradeId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tradeService.acceptTrade(tradeId);
      addToast('success', 'Trade accepted! Both inventories have been updated.');
      return result;
    } catch (err) {
      const appErr = parseApiError(err);
      setError(appErr.message);
      addToast('error', appErr.message);
      throw appErr;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const reject = useCallback(async (tradeId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tradeService.rejectTrade(tradeId, reason ? { reason } : {});
      addToast('info', 'Trade rejected.');
      return result;
    } catch (err) {
      const appErr = parseApiError(err);
      setError(appErr.message);
      addToast('error', appErr.message);
      throw appErr;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // cancel added here after cancelTrade service method exists (T069)
  const cancel = useCallback(async (tradeId) => {
    setLoading(true);
    setError(null);
    try {
      await tradeService.cancelTrade(tradeId);
      addToast('info', 'Trade cancelled.');
    } catch (err) {
      const appErr = parseApiError(err);
      setError(appErr.message);
      addToast('error', appErr.message);
      throw appErr;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  return { loading, error, accept, reject, cancel };
}

export default useTradeAction;
