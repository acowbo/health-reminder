import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

interface UseCountdownReturn {
  secondsRemaining: number;
  justFired: boolean;
  snooze: () => Promise<void>;
}

/**
 * Subscribes to `reminder-tick` and `reminder-fired` events from the Rust timer.
 * Restores the current countdown value on mount.
 */
export function useCountdown(): UseCountdownReturn {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [justFired,        setJustFired]        = useState(false);

  useEffect(() => {
    // Restore current countdown so the display is correct immediately.
    invoke<number>('get_seconds_remaining').then(setSecondsRemaining);

    const unlistenTick = listen<number>('reminder-tick', e => {
      setSecondsRemaining(e.payload);
    });

    const unlistenFired = listen('reminder-fired', () => {
      setJustFired(true);
      setTimeout(() => setJustFired(false), 3000);
    });

    return () => {
      unlistenTick.then(f => f());
      unlistenFired.then(f => f());
    };
  }, []);

  const snooze = async () => {
    const remaining = await invoke<number>('snooze');
    setSecondsRemaining(remaining);
  };

  return { secondsRemaining, justFired, snooze };
}
