import type { TargetTimeSettings } from './types';
import { DEFAULT_TARGET_TIME } from './constants';

const STORAGE_KEY = 'task-timer-settings';

/**
 * localStorageから目標時刻設定を読み込み
 */
export const loadSettings = (): TargetTimeSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_TARGET_TIME;
    }
    
    const parsed = JSON.parse(stored) as TargetTimeSettings;
    
    // バリデーション
    if (
      parsed.mode !== 'duration' && parsed.mode !== 'target-time'
    ) {
      return DEFAULT_TARGET_TIME;
    }
    
    if (
      typeof parsed.targetHour !== 'number' ||
      parsed.targetHour < 0 ||
      parsed.targetHour > 23 ||
      typeof parsed.targetMinute !== 'number' ||
      parsed.targetMinute < 0 ||
      parsed.targetMinute > 59
    ) {
      return DEFAULT_TARGET_TIME;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_TARGET_TIME;
  }
};

/**
 * localStorageに目標時刻設定を保存
 */
export const saveSettings = (settings: TargetTimeSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};
