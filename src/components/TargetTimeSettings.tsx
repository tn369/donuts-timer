import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ArrowLeft } from 'lucide-react';
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
    const [settings, setSettings] = useState<TargetTimeSettings>(() => loadSettings());

    const handleModeChange = (mode: 'duration' | 'target-time') => {
        const newSettings = { ...settings, mode };
        setSettings(newSettings);
        saveSettings(newSettings);
        onSettingsChange(newSettings);
    };

    const handleHourChange = (hour: number) => {
        const newSettings = { ...settings, targetHour: hour };
        setSettings(newSettings);
        saveSettings(newSettings);
        onSettingsChange(newSettings);
    };

    const handleMinuteChange = (minute: number) => {
        const newSettings = { ...settings, targetMinute: minute };
        setSettings(newSettings);
        saveSettings(newSettings);
        onSettingsChange(newSettings);
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button onClick={onBack} className="back-button">
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
                <button onClick={onBack} className="done-button">
                    もどる
                </button>
            </div>
        </div>
    );
};
