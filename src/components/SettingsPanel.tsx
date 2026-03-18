import React, { useState } from 'react';
import type { Settings, ReminderStyle } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  saving: boolean;
  onChange: (patch: Partial<Settings>) => void;
  onSave: () => Promise<void>;
  onTest: () => Promise<void>;
  onSnooze: () => Promise<void>;
}

const STYLE_OPTIONS: { value: ReminderStyle; label: string; desc: string }[] = [
  { value: 'gentle', label: '温柔型', desc: '像朋友一样关心你' },
  { value: 'funny',  label: '搞笑型', desc: '用幽默赶走懒惰' },
  { value: 'strict', label: '严肃型', desc: '简洁直接，绝不废话' },
];

const INTERVAL_PRESETS = [20, 30, 45, 60, 90];

/**
 * Settings panel: interval, style selector, DND range, action buttons.
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  saving,
  onChange,
  onSave,
  onTest,
  onSnooze,
}) => {
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-panel">
      {/* ── Toggle ─────────────────────────────────────── */}
      <div className="setting-row setting-row--toggle">
        <div className="setting-info">
          <span className="setting-label">开启提醒</span>
          <span className="setting-desc">关闭后倒计时将暂停</span>
        </div>
        <button
          className={`toggle ${settings.enabled ? 'toggle--on' : ''}`}
          onClick={() => onChange({ enabled: !settings.enabled })}
          aria-label={settings.enabled ? '关闭提醒' : '开启提醒'}
        >
          <span className="toggle-thumb" />
        </button>
      </div>

      {/* ── Interval ───────────────────────────────────── */}
      <div className="setting-section">
        <span className="setting-label">提醒间隔</span>
        <div className="preset-chips">
          {INTERVAL_PRESETS.map(min => (
            <button
              key={min}
              className={`chip ${settings.intervalMinutes === min ? 'chip--active' : ''}`}
              onClick={() => onChange({ intervalMinutes: min })}
            >
              {min} 分钟
            </button>
          ))}
        </div>
        <div className="custom-interval">
          <label className="setting-desc">自定义</label>
          <input
            type="number"
            min={1}
            max={120}
            value={settings.intervalMinutes}
            onChange={e => onChange({ intervalMinutes: Number(e.target.value) })}
            className="number-input"
          />
          <span className="setting-desc">分钟</span>
        </div>
      </div>

      {/* ── Style ──────────────────────────────────────── */}
      <div className="setting-section">
        <span className="setting-label">提醒风格</span>
        <div className="style-options">
          {STYLE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`style-card ${settings.style === opt.value ? 'style-card--active' : ''}`}
              onClick={() => onChange({ style: opt.value })}
            >
              <span className="style-name">{opt.label}</span>
              <span className="style-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── DND ────────────────────────────────────────── */}
      <div className="setting-section">
        <span className="setting-label">免打扰时段</span>
        <div className="dnd-row">
          <input
            type="number" min={0} max={23}
            value={settings.dndStart}
            onChange={e => onChange({ dndStart: Number(e.target.value) })}
            className="number-input"
          />
          <span className="setting-desc">时 至</span>
          <input
            type="number" min={0} max={23}
            value={settings.dndEnd}
            onChange={e => onChange({ dndEnd: Number(e.target.value) })}
            className="number-input"
          />
          <span className="setting-desc">时</span>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────── */}
      <div className="action-row">
        <button className="btn btn--ghost" onClick={onSnooze}>推迟 10 分钟</button>
        <button className="btn btn--ghost" onClick={onTest}>测试通知</button>
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? '保存中…' : saved ? '已保存 ✓' : '保存设置'}
        </button>
      </div>
    </div>
  );
};
