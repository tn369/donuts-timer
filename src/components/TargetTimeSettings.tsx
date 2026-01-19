import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ArrowLeft, Check } from 'lucide-react';
import type { TargetTimeSettings } from '../types';
import { loadSettings, saveSettings } from '../storage';

interface TargetTimeSettingsProps {
    onBack: () => void;
    onSettingsChange: (settings: TargetTimeSettings) => void;
}

export const TargetTimeSettingsComponent: React.FC<TargetTimeSettingsProps> = ({
    onBack,
    onSettingsChange,
}) => {
    // 初期表示時に保存された設定を読み込む
    const [settings, setSettings] = useState<TargetTimeSettings>(() => loadSettings());
    const [hasChanges, setHasChanges] = useState(false);

    const handleModeChange = (mode: 'duration' | 'target-time') => {
      setSettings({ ...settings, mode });
      setHasChanges(true);
  };

    const handleHourChange = (hour: number) => {
      setSettings({ ...settings, targetHour: hour });
      setHasChanges(true);
  };

    const handleMinuteChange = (minute: number) => {
        setSettings({ ...settings, targetMinute: minute });
        setHasChanges(true);
    };

    const handleConfirm = () => {
        // 確定ボタン押下時に設定を保存
        saveSettings(settings);
        onSettingsChange(settings);
        setHasChanges(false);
        onBack();
    };

    const handleCancel = () => {
        // キャンセル時は保存せずに戻る
        onBack();
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
              <button onClick={handleCancel} className="back-button">
                  <ArrowLeft size={24} />
              </button>
              <h1 className="settings-title">
                  <Settings size={28} />
                  せってい
              </h1>
          </div>

          <div className="settings-content">
              <section className="settings-section">
                  <h2 className="section-title">あそぶじかんのせってい</h2>

                  <div className="mode-selection">
                      <button
                          className={`mode-button ${settings.mode === 'duration' ? 'active' : ''}`}
                          onClick={() => handleModeChange('duration')}
                      >
                          <div className="mode-icon">⏱️</div>
                          <div className="mode-label">じかんをきめる</div>
                          <div className="mode-description">いつものやりかた</div>
                      </button>

                      <button
                          className={`mode-button ${settings.mode === 'target-time' ? 'active' : ''}`}
                          onClick={() => handleModeChange('target-time')}
                      >
                          <div className="mode-icon">🕐</div>
                          <div className="mode-label">おわるじこくをきめる</div>
                          <div className="mode-description">でかけるじかんにあわせる</div>
                      </button>
                  </div>
              </section>

              {settings.mode === 'target-time' && (
                  <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="settings-section target-time-section"
                  >
                      <h2 className="section-title">でかけるじかん</h2>

                      <div className="time-inputs">
                          <div className="time-input-group">
                              <label htmlFor="hour-input">じ</label>
                              <select
                                  id="hour-input"
                                  value={settings.targetHour}
                                  onChange={(e) => handleHourChange(Number(e.target.value))}
                                  className="time-select"
                              >
                                  {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={i}>
                                          {i}
                                      </option>
                                  ))}
                              </select>
                          </div>

                          <div className="time-separator">:</div>

                          <div className="time-input-group">
                              <label htmlFor="minute-input">ふん</label>
                              <select
                                  id="minute-input"
                                  value={settings.targetMinute}
                                  onChange={(e) => handleMinuteChange(Number(e.target.value))}
                                  className="time-select"
                              >
                                  {Array.from({ length: 60 }, (_, i) => (
                                      <option key={i} value={i}>
                                          {i.toString().padStart(2, '0')}
                                      </option>
                                  ))}
                              </select>
                          </div>
                      </div>

                      <div className="time-preview">
                          {settings.targetHour}:{settings.targetMinute.toString().padStart(2, '0')} までにしゅっぱつします
                      </div>
                  </motion.section>
              )}
          </div>

          <div className="settings-footer">
              <button onClick={handleCancel} className="cancel-button">
                  キャンセル
              </button>
              <button
                  onClick={handleConfirm}
                  className={`confirm-button ${hasChanges ? 'has-changes' : ''}`}
              >
                  <Check size={20} />
                  かくてい
              </button>
          </div>
      </div>
  );
};
