export type AppStep = 'ready' | 'shooting' | 'select' | 'customize' | 'result';

export type LayoutMode = 'strip' | 'grid'; // strip: 1x4 vertical, grid: 2x2

export type FilterType = 'normal' | 'warm' | 'cool' | 'vivid' | 'soft' | 'bw' | 'vintage';

export interface FrameTheme {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
  cardBg: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  pattern: 'dots' | 'stars' | 'clouds' | 'chicks' | 'sprouts' | 'stripes' | 'crayons' | 'minimal';
  badge: string;
}

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  svg?: string;
  category: 'cute' | 'face' | 'party' | 'school';
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  xPercent: number; // 0 to 100 relative to frame width
  yPercent: number; // 0 to 100 relative to frame height
  size: number; // in pixels
  rotation: number; // degrees
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  filter: FilterType;
}

export interface PhotoBoothSettings {
  timerSeconds: number; // 3, 5, 7
  soundEnabled: boolean;
  mirrored: boolean;
  selectedFilter: FilterType;
  selectedCameraId?: string;
  layout: LayoutMode;
  selectedFrameId: string;
  className: string;
  dateText: string;
  sloganText: string;
  showDate: boolean;
  showClassName: boolean;
  showSlogan: boolean;
  showLogoBadge: boolean;
  placedStickers: PlacedSticker[];
}
