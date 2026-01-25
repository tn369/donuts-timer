import type { Task } from './types';

/**
 * 時間を MM:SS 形式にフォーマットする
 */
export const formatTime = (seconds: number): string => {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  return `${isNegative ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 「ごほうび」の時間を計算する
 */

export const calculateRewardSeconds = (tasks: Task[], baseRewardSeconds: number): number => {
  let totalDelta = 0;
  tasks.forEach((t) => {
    if (t.kind === 'todo') {
      if (t.status === 'done') {
        totalDelta += t.plannedSeconds - t.actualSeconds;
      } else if (t.status === 'running' || t.status === 'paused') {
        // 固定タスクが予定時間を超過している場合、超過分を減らす
        if (t.elapsedSeconds > t.plannedSeconds) {
          totalDelta += t.plannedSeconds - t.elapsedSeconds;
        }
      }
    }
  });
  return Math.max(0, baseRewardSeconds + totalDelta);
};

/**
 * 全体の進捗（%）を計算する
 */
export const calculateOverallProgress = (tasks: Task[]): number => {
  const totalPlanned = tasks.reduce((sum, task) => sum + task.plannedSeconds, 0);
  let completedSeconds = 0;
  tasks.forEach((task) => {
    if (task.status === 'done') {
      completedSeconds += task.actualSeconds;
    } else if (task.status === 'running' || task.status === 'paused') {
      completedSeconds += task.elapsedSeconds;
    }
  });

  return totalPlanned > 0 ? (completedSeconds / totalPlanned) * 100 : 0;
};

/**
 * 目標時刻から必要な「ごほうび」の時間を逆算する
 * @param targetHour 目標時刻（時）
 * @param targetMinute 目標時刻（分）
 * @param currentTime 現在時刻
 * @param todoTasksSeconds 「やること」の合計時間（秒）
 * @returns ごほうびの時間（秒）
 */
export const calculateRewardSecondsFromTargetTime = (
  targetHour: number,
  targetMinute: number,
  currentTime: Date,
  todoTasksSeconds: number
): number => {
  // 目標時刻のDateオブジェクトを作成
  const target = new Date(currentTime);
  target.setHours(targetHour, targetMinute, 0, 0);

  // 目標時刻が現在時刻より前の場合は翌日とみなす
  if (target <= currentTime) {
    target.setDate(target.getDate() + 1);
    // ただし、12時間以上先になる場合は、おそらくすでに目標時刻を過ぎている（当日）と判断する
    // 例：目標 8:00 で現在 8:01 の場合、翌日 8:00 になると 23時間後になってしまう。
    // ここでは単純化のため、目標時刻の前後12時間は当日のものとして扱う、といったロジックも検討できるが
    // 現状は単純に「目標時刻を過ぎたら負の値になる」ようにしたいので、
    // 「今から12時間以上前」なら翌日、「12時間以内」なら当日（＝負の値）とする。
    const diff = target.getTime() - currentTime.getTime();
    if (diff < -12 * 60 * 60 * 1000) {
      target.setDate(target.getDate() + 1);
    } else {
      // 当日の目標時刻を過ぎた状態（負の値になる）
    }
  }

  // 利用可能な時間（秒）
  const availableSeconds = (target.getTime() - currentTime.getTime()) / 1000;

  // ごほうびの時間 = 利用可能時間 - やることの時間
  return Math.floor(availableSeconds - todoTasksSeconds);
};
/**
 * 画像をリサイズする
 */
export const resizeImage = (dataUrl: string, maxWidth = 200, maxHeight = 200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
};

/**
 * 優しいチャイム音を再生する（Web Audio API）
 */
export const playGentleAlarm = () => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const now = ctx.currentTime;

  const playNote = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // 「さんぽ」のイントロ風メロディ（ドレミファソソララソ）
  const tempo = 0.25; // 1拍の長さ
  playNote(523.25, now, tempo * 0.8); // ド (C5)
  playNote(587.33, now + tempo, tempo * 0.8); // レ (D5)
  playNote(659.25, now + tempo * 2, tempo * 0.8); // ミ (E5)
  playNote(698.46, now + tempo * 3, tempo * 0.8); // ファ (F5)
  playNote(783.99, now + tempo * 4, tempo * 1.5); // ソ (G5)
  playNote(783.99, now + tempo * 6, tempo * 1.5); // ソ (G5)
  playNote(880.0, now + tempo * 8, tempo * 1.5); // ラ (A5)
  playNote(880.0, now + tempo * 10, tempo * 1.5); // ラ (A5)
  playNote(783.99, now + tempo * 12, tempo * 3); // ソ (G5)
};
