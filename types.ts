
export enum VideoGenre {
  GAMING = 'Gaming',
  VLOG = 'Vlog',
  TECH = 'Tech Review',
  COOKING = 'Cooking',
  PRANK = 'Prank',
  EDUCATIONAL = 'Educational'
}

export enum EquipmentLevel {
  SMARTPHONE = 'Smartphone',
  WEBCAM = 'HD Webcam',
  DSLR = 'DSLR Camera',
  CINEMA = 'Cinema Camera'
}

export enum GamePhase {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  EVENT = 'EVENT'
}

export type Tab = 'DASHBOARD' | 'CONTENT' | 'COMMENTS' | 'SHOP' | 'ANALYTICS';

export interface Video {
  id: string;
  title: string;
  description: string;
  genre: VideoGenre;
  quality: number; // 1-100
  views: number;
  likes: number;
  dislikes: number;
  comments: Comment[];
  earnings: number;
  dayPublished: number;
  thumbnailGradient: string;
  // Real-time fields
  timestamp: number; // Creation time for decay calculation
  currentVelocity: number; // Views per tick (visual only)
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  isHearted?: boolean;
  videoTitle?: string; // Helper for aggregate view
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  color: string;
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: 'energy_record' | 'energy_edit' | 'money_mult' | 'view_mult' | 'quality_bonus';
  value: number;
  unlocked: boolean;
}

export interface Contract {
  id: string;
  sponsorName: string;
  description: string;
  requiredGenre: VideoGenre;
  minQuality: number;
  payout: number;
  deadlineDay: number; // The game day by which it must be completed
  completed: boolean;
}

export interface Rival {
  id: string;
  name: string;
  subscribers: number;
  growthRate: number; // 1.0 = normal, 1.5 = fast
  color: string;
  isPlayer?: boolean; // Helper flag for sorting
}

export interface GameState {
  playerName: string;
  channelName: string;
  day: number;
  energy: number; // Max 100
  money: number;
  subscribers: number;
  totalViews: number;
  
  // Progression
  level: number;
  xp: number;
  xpToNextLevel: number;
  skillPoints: number;
  perks: Perk[];
  
  reputation: number; // 0-100
  equipment: EquipmentLevel;
  editingSkill: number;
  videos: Video[];
  
  // Contracts
  activeContract: Contract | null;
  
  inventory: {
    hasMicrophone: boolean;
    hasLighting: boolean;
    hasEditor: boolean;
  };
  subHistory: { day: number; count: number }[];
  currentTrend: VideoGenre;
  
  // Visuals
  studioLevel: number; // 1-3
  hype: number; // 0-100 (Combo meter)
  
  // Competitors
  rivals: Rival[];
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: {
    label: string;
    id: 'A' | 'B';
  }[];
}

export interface EventOutcome {
  message: string;
  moneyChange: number;
  subChange: number;
  repChange: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  icon?: any;
}
