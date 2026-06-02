import { useEffect, useRef, useCallback } from 'react';

function useWebSocket({ url, onMessage, onOpen, onClose, onError, enabled = true }) {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!url || !enabled) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (onOpen) onOpen();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch {
          if (onMessage) onMessage(event.data);
        }
      };

      ws.onclose = () => {
        if (onClose) onClose();
        wsRef.current = null;
        if (mountedRef.current && enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) connect();
          }, 3000);
        }
      };

      ws.onerror = (err) => {
        if (onError) onError(err);
      };
    } catch (err) {
      if (onError) onError(err);
    }
  }, [url, enabled, onMessage, onOpen, onClose, onError]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  return { send, isConnected: wsRef.current?.readyState === WebSocket.OPEN };
}

export default useWebSocket;
