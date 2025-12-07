
import { EquipmentLevel, VideoGenre, Perk, Rival } from './types';

export const INITIAL_MONEY = 100;
export const MAX_ENERGY = 100;
export const ENERGY_COST_RECORD = 30;
export const ENERGY_COST_EDIT = 25;
export const ENERGY_COST_WORK = 40;
export const WORK_PAYOUT = 45;

export const XP_PER_VIEW_DIVISOR = 100; // 1 XP per 100 views
export const BASE_XP_TO_LEVEL = 500;

export const EQUIPMENT_COSTS = {
  [EquipmentLevel.WEBCAM]: 200,
  [EquipmentLevel.DSLR]: 800,
  [EquipmentLevel.CINEMA]: 2500,
};

export const UPGRADE_COSTS = {
  MICROPHONE: 150,
  LIGHTING: 100,
  EDITOR_SOFTWARE: 300,
};

export const GENRE_MULTIPLIERS: Record<VideoGenre, number> = {
  [VideoGenre.GAMING]: 1.0,
  [VideoGenre.VLOG]: 0.8,
  [VideoGenre.TECH]: 1.2,
  [VideoGenre.COOKING]: 1.1,
  [VideoGenre.PRANK]: 1.5, // High risk high reward
  [VideoGenre.EDUCATIONAL]: 0.9,
};

export const AVAILABLE_PERKS: Perk[] = [
  { 
    id: 'energy_saver_1', 
    name: 'Iron Lungs', 
    description: '-5 Energy cost for Recording', 
    cost: 1, 
    effect: 'energy_record', 
    value: 5, 
    unlocked: false 
  },
  { 
    id: 'fast_editor_1', 
    name: 'Shortcut Master', 
    description: '-5 Energy cost for Editing', 
    cost: 1, 
    effect: 'energy_edit', 
    value: 5, 
    unlocked: false 
  },
  { 
    id: 'negotiator', 
    name: 'Sponsor Friendly', 
    description: '+20% Money from videos', 
    cost: 2, 
    effect: 'money_mult', 
    value: 0.2, 
    unlocked: false 
  },
  { 
    id: 'viral_god', 
    name: 'Algorithm God', 
    description: '+15% Total Views', 
    cost: 3, 
    effect: 'view_mult', 
    value: 0.15, 
    unlocked: false 
  },
  { 
    id: 'quality_control', 
    name: 'Perfectionist', 
    description: '+10 Base Quality on recordings', 
    cost: 2, 
    effect: 'quality_bonus', 
    value: 10, 
    unlocked: false 
  }
];

export const INITIAL_RIVALS: Rival[] = [
  { id: 'r1', name: "DailyVlogger", subscribers: 500, growthRate: 1.1, color: "bg-orange-500" },
  { id: 'r2', name: "TechGuru", subscribers: 2500, growthRate: 1.2, color: "bg-blue-500" },
  { id: 'r3', name: "GameMaster", subscribers: 10000, growthRate: 1.3, color: "bg-green-500" },
  { id: 'r4', name: "PrankKing", subscribers: 50000, growthRate: 1.4, color: "bg-purple-500" },
  { id: 'r5', name: "The Legend", subscribers: 1000000, growthRate: 1.5, color: "bg-red-500" },
];

// Fallback data if API fails
export const FALLBACK_TITLES = [
  "My First Video!",
  "You Won't Believe This...",
  "Standard Review #1",
  "Just chilling",
  "Why I started YouTube"
];

export const FALLBACK_COMMENTS = [
  { user: "User1", text: "First!", sentiment: "neutral" },
  { user: "Hater123", text: "Boring.", sentiment: "negative" },
  { user: "Fan99", text: "Great content keep it up!", sentiment: "positive" }
];
