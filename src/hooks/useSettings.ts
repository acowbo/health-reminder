import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  intervalMinutes: 45,
  enabled: true,
  dndStart: 22,
  dndEnd: 8,
  style: 'gentle',
};

interface UseSettingsReturn {
  settings: Settings;
  loading: boolean;
  saving: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  saveSettings: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

/**
 * Manages settings state: loads from Rust backend on mount,
 * provides optimistic local updates, and persists on demand.
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    invoke<Settings>('get_settings')
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    try {
      await invoke('save_settings', { settings });
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const sendTestNotification = useCallback(async () => {
    await invoke('send_test_notification');
  }, []);

  return { settings, loading, saving, updateSettings, saveSettings, sendTestNotification };
}
