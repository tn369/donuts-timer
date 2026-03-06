export const COLOR_VALUES: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#f59e0b',
  green: '#10b981',
  pink: '#ec4899',
  purple: '#8b5cf6',
  orange: '#f97316',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  lime: '#84cc16',
};

export const COLOR_NAMES: Record<string, string> = {
  red: 'あか',
  blue: 'あお',
  yellow: 'きいろ',
  green: 'みどり',
  pink: 'ももいろ',
  purple: 'むらさき',
  orange: 'オレンジ',
  indigo: 'あい',
  cyan: 'シアン',
  lime: 'ライム',
};

export const SHAPE_NAMES: Record<string, string> = {
  circle: 'まる',
  square: 'しかく',
  triangle: 'さんかく',
  diamond: 'ダイヤ',
  pentagon: 'ごかく',
  hexagon: 'ろっかく',
  star: 'ほし',
  heart: 'ハート',
};

export const SHAPES = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'pentagon',
  'hexagon',
  'star',
  'heart',
] as const;

export const COLORS = [
  'red',
  'blue',
  'yellow',
  'green',
  'pink',
  'purple',
  'orange',
  'indigo',
  'cyan',
  'lime',
] as const;

export const TITLE_SUFFIX = 'のやることリスト';
export const MAX_TITLE_LENGTH = 10;
export const PRESET_TITLES = ['あさ', 'おひる', 'ゆうがた', 'よる', 'しゅくだい', 'おけいこ'];
