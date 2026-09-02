import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../api/config';
import { getAccessToken } from '../api/tokenStorage';
import type { StockUpdate } from '../types';

interface UseStockHubOptions {
  onStockChanged: (update: StockUpdate) => void;
  enabled?: boolean;
}

export function useStockHub({ onStockChanged, enabled = true }: UseStockHubOptions) {
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');
  const callbackRef = useRef(onStockChanged);
  callbackRef.current = onStockChanged;

  useEffect(() => {
    if (!enabled || !getAccessToken()) {
      setConnectionState('disconnected');
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/stock`, {
        accessTokenFactory: () => getAccessToken() ?? '',
      })
      .withAutomaticReconnect()
      .build();

    connection.on('StockChanged', (update: StockUpdate) => {
      callbackRef.current(update);
    });

    connection.onreconnecting(() => setConnectionState('connecting'));
    connection.onreconnected(() => setConnectionState('connected'));
    connection.onclose(() => setConnectionState('disconnected'));

    let cancelled = false;

    async function start() {
      setConnectionState('connecting');
      try {
        await connection.start();
        if (!cancelled) {
          setConnectionState('connected');
        }
      } catch {
        if (!cancelled) {
          setConnectionState('disconnected');
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      void connection.stop();
    };
  }, [enabled]);

  return { connectionState };
}
