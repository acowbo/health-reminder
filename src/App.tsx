import React, { useState } from 'react';
import { CountdownRing }   from './components/CountdownRing';
import { SettingsPanel }   from './components/SettingsPanel';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { useSettings }     from './hooks/useSettings';
import { useCountdown }    from './hooks/useCountdown';
import './App.css';

type Tab = 'home' | 'exercises' | 'settings';

const TAB_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home',      label: '主页',   icon: '⏱' },
  { id: 'exercises', label: '动一动', icon: '🏃' },
  { id: 'settings',  label: '设置',   icon: '⚙️' },
];

/**
 * Root application component.
 * Composes the countdown display, exercise library, and settings panel
 * via a bottom tab navigator.
 */
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const {
    settings,
    loading,
    saving,
    updateSettings,
    saveSettings,
    sendTestNotification,
  } = useSettings();

  const { secondsRemaining, justFired, snooze } = useCountdown();

  if (loading) {
    return (
      <div className="app-loading">
        <span className="loading-leaf">🌿</span>
      </div>
    );
  }

  return (
    <div className="app">
      {/* ── Header ──────────────────────────────────── */}
      <header className="app-header">
        <h1 className="app-title">健康提醒</h1>
        <p className="app-subtitle">久坐伤身，动起来吧</p>
      </header>

      {/* ── Main content ────────────────────────────── */}
      <main className="app-main">
        {activeTab === 'home' && (
          <section className="tab-home">
            <CountdownRing
              secondsRemaining={secondsRemaining}
              intervalMinutes={settings.intervalMinutes}
              enabled={settings.enabled}
              justFired={justFired}
            />

            {justFired && (
              <div className="fired-banner">
                <span className="fired-icon">🎉</span>
                <span>该动一动了！</span>
              </div>
            )}

            <div className="home-actions">
              <button
                className={`toggle-btn ${settings.enabled ? 'toggle-btn--on' : 'toggle-btn--off'}`}
                onClick={() => {
                  updateSettings({ enabled: !settings.enabled });
                  saveSettings();
                }}
              >
                {settings.enabled ? '暂停提醒' : '开启提醒'}
              </button>
              <button className="snooze-btn" onClick={snooze}>
                推迟 10 分钟
              </button>
            </div>

            <div className="current-style-badge">
              {settings.style === 'gentle' && '🌿 温柔模式'}
              {settings.style === 'funny'  && '😄 搞笑模式'}
              {settings.style === 'strict' && '⚡ 严肃模式'}
              &nbsp;· 每 {settings.intervalMinutes} 分钟提醒
            </div>
          </section>
        )}

        {activeTab === 'exercises' && <ExerciseLibrary />}

        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            saving={saving}
            onChange={updateSettings}
            onSave={saveSettings}
            onTest={sendTestNotification}
            onSnooze={snooze}
          />
        )}
      </main>

      {/* ── Bottom tab bar ──────────────────────────── */}
      <nav className="tab-bar">
        {TAB_ITEMS.map(tab => (
          <button
            key={tab.id}
            className={`tab-bar-item ${activeTab === tab.id ? 'tab-bar-item--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-bar-icon">{tab.icon}</span>
            <span className="tab-bar-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
