/**
 * 優しいチャイム音を再生する（Web Audio API）
 */
export const playGentleAlarm = () => {
  const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
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

/**
 * 短い効果音を再生する（タスク完了時など）
 */
export const playTaskCompletionSound = () => {
  const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now); // A5
  osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1); // E6 に向かって少し上げる

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
};
