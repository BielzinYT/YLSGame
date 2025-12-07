
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, DollarSign, Zap, Video as VideoIcon, 
  Bot, Mail, TrendingUp, Activity
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

import { 
  GameState, VideoGenre, EquipmentLevel, 
  GamePhase, LogEntry, Video, GameEvent, Perk, Contract, Rival, ChatMessage, FloatingText,
  Tab
} from './types';
import { 
  INITIAL_MONEY, MAX_ENERGY, ENERGY_COST_RECORD, 
  ENERGY_COST_EDIT, ENERGY_COST_WORK, WORK_PAYOUT,
  EQUIPMENT_COSTS, AVAILABLE_PERKS, BASE_XP_TO_LEVEL,
  INITIAL_RIVALS, GENRE_MULTIPLIERS
} from './constants';
import { generateVideoDetails, generateVideoComments, generateGameEvent, resolveEventOutcome } from './services/genAi';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ContentTab } from './components/ContentTab';
import { CommentsTab } from './components/CommentsTab';
import { ShopTab } from './components/ShopTab';
import { AnalyticsStudio } from './components/AnalyticsStudio';
import { EventModal } from './components/EventModal';
import { SkillsModal } from './components/SkillsModal';
import { LiveNumber } from './components/LiveNumber';

const generateId = () => Math.random().toString(36).substring(2, 9);

const INITIAL_STATE: GameState = {
  playerName: '',
  channelName: '',
  day: 1,
  energy: MAX_ENERGY,
  money: INITIAL_MONEY,
  subscribers: 0,
  totalViews: 0,
  
  level: 1,
  xp: 0,
  xpToNextLevel: BASE_XP_TO_LEVEL,
  skillPoints: 0,
  perks: AVAILABLE_PERKS,

  reputation: 50,
  equipment: EquipmentLevel.SMARTPHONE,
  editingSkill: 1,
  videos: [],
  currentTrend: VideoGenre.GAMING,
  
  activeContract: null,

  inventory: {
    hasMicrophone: false,
    hasLighting: false,
    hasEditor: false,
  },
  subHistory: [{ day: 1, count: 0 }],
  
  studioLevel: 1,
  hype: 0,
  rivals: INITIAL_RIVALS
};

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.SETUP);
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showSkills, setShowSkills] = useState(false);
  
  // Action States
  const [selectedGenre, setSelectedGenre] = useState<VideoGenre>(VideoGenre.GAMING);
  const [editingVibe, setEditingVibe] = useState<string>('Standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [currentFootage, setCurrentFootage] = useState<{genre: VideoGenre, qualityMod: number} | null>(null);
  const [showMinigame, setShowMinigame] = useState(false);
  
  // Event State
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);

  // Auto-Pilot State
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const botIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Visuals & Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Floating Text
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Stuck prevention
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: generateId(),
      message,
      type,
      timestamp: `Day ${gameState.day}`,
    };
    setLogs(prev => [entry, ...prev]);
  };

  const spawnFloatingText = (text: string, color: string, x?: number, y?: number) => {
    const id = generateId();
    // Default to center-ish if coordinates not provided
    const startX = x || (window.innerWidth / 2) + (Math.random() * 100 - 50);
    const startY = y || (window.innerHeight / 2) + (Math.random() * 100 - 50);
    
    setFloatingTexts(prev => [...prev, { id, text, x: startX, y: startY, color }]);
    
    setTimeout(() => {
        setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1500);
  };

  const getPerkValue = (effect: Perk['effect']) => {
    return gameState.perks
      .filter(p => p.unlocked && p.effect === effect)
      .reduce((acc, p) => acc + p.value, 0);
  };

  // --- STUCK PREVENTION ---
  useEffect(() => {
    if (isProcessing) {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
      // If stuck for more than 5s, force reset
      processingTimeoutRef.current = setTimeout(() => {
        console.warn("Watchdog: Resetting stuck state");
        setIsProcessing(false);
        setActionStatus(null);
        setShowMinigame(false);
      }, 5000);
    } else {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    }
    return () => {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    };
  }, [isProcessing]);


  // --- REAL-TIME SIMULATION LOOP ---
  useEffect(() => {
    if (phase !== GamePhase.PLAYING) return;

    tickRef.current = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        let totalNewViews = 0;
        let totalNewMoney = 0;
        let totalNewSubs = 0;

        const updatedVideos = prev.videos.map(video => {
          const ageSeconds = (now - video.timestamp) / 1000;
          let decay = 1;
          if (ageSeconds > 60) decay = 0.5;
          if (ageSeconds > 300) decay = 0.1;
          if (ageSeconds > 600) decay = 0.01;

          const genreMult = GENRE_MULTIPLIERS[video.genre];
          const trendBonus = video.genre === prev.currentTrend ? 2.0 : 1.0;
          const qualityFactor = video.quality / 20; 
          const repFactor = prev.reputation / 50;
          const hypeMult = prev.hype >= 100 ? 2.0 : 1.0;
          const noise = 0.5 + Math.random();

          let viewsThisTick = Math.floor(
            (10 * qualityFactor * genreMult * trendBonus * repFactor * decay * noise * hypeMult)
          );

          if (video.quality > 80 && viewsThisTick === 0 && Math.random() > 0.8) viewsThisTick = 1;

          if (viewsThisTick > 0) {
            totalNewViews += viewsThisTick;
            const moneyPerView = 0.002;
            const moneyThisTick = viewsThisTick * moneyPerView * (1 + getPerkValue('money_mult'));
            totalNewMoney += moneyThisTick;

            if (Math.random() < (video.quality > 70 ? 0.05 : 0.01)) {
              const subsThisTick = Math.ceil(viewsThisTick * 0.01);
              totalNewSubs += subsThisTick;
            }
          }

          return {
            ...video,
            views: video.views + viewsThisTick,
            earnings: video.earnings + (viewsThisTick * 0.002),
            currentVelocity: viewsThisTick 
          };
        });

        const newXP = Math.floor(totalNewViews / 10);

        const updatedRivals = prev.rivals.map(rival => {
           const growth = rival.growthRate * (1 + Math.random() * 0.5) * 5; 
           return {
             ...rival,
             subscribers: rival.subscribers + growth
           };
        });

        const prevSubs = prev.subscribers;
        const newTotalSubs = prev.subscribers + totalNewSubs;
        
        updatedRivals.forEach(rival => {
           if (prevSubs < rival.subscribers && newTotalSubs >= rival.subscribers) {
              spawnFloatingText(`Overtook ${rival.name}!`, "text-yellow-400");
              toast.success(`You overtook ${rival.name}!`, { icon: '👑', duration: 4000 });
           }
        });

        let newState = {
          ...prev,
          videos: updatedVideos,
          totalViews: prev.totalViews + totalNewViews,
          money: prev.money + totalNewMoney,
          subscribers: newTotalSubs,
          xp: prev.xp + newXP,
          rivals: updatedRivals
        };

        if (newState.xp >= newState.xpToNextLevel) {
          newState.level += 1;
          newState.xp = 0;
          newState.xpToNextLevel = Math.floor(newState.xpToNextLevel * 1.5);
          newState.skillPoints += 1;
          spawnFloatingText("LEVEL UP!", "text-purple-400", window.innerWidth/2, window.innerHeight/3);
          toast.success("LEVEL UP! Skill Point Earned.");
        }

        return newState;
      });
    }, 1000); 

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase]);

  // --- Chat Simulation Loop ---
  useEffect(() => {
    // Chat runs if we are processing a video-related task OR if the bot is active (simulating engagement)
    if ((isProcessing && (actionStatus?.includes('Recording') || actionStatus?.includes('Editing'))) || (isAutoPlaying && phase === GamePhase.PLAYING)) {
        chatIntervalRef.current = setInterval(() => {
            const users = ["Fan123", "CoolGuy", "Hater007", "StreamLover", "Mod_Dave", "PogChamp", "Lurker_01"];
            const msgs = ["POG", "LOL", "Hype!", "Nice quality", "First", "Lag?", "Show setup", "Love this game", "Hi chat", "Notice me!"];
            const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#d946ef", "#f97316"];
            
            const randomMsg = {
                id: generateId(),
                user: users[Math.floor(Math.random() * users.length)],
                text: msgs[Math.floor(Math.random() * msgs.length)],
                color: colors[Math.floor(Math.random() * colors.length)]
            };
            setChatMessages(prev => [...prev.slice(-15), randomMsg]);
        }, 800);
    } else {
        if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    }
    return () => {
        if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    }
  }, [isProcessing, actionStatus, isAutoPlaying, phase]);


  // --- Bot Logic ---
  useEffect(() => {
    if (isAutoPlaying) {
      // Extremely fast tick rate for Turbo Mode
      botIntervalRef.current = setInterval(runBotTurn, 500);
    } else {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    }
    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    };
  }, [isAutoPlaying, isProcessing, phase, gameState, currentFootage, currentEvent, activeTab]);

  const runBotTurn = () => {
    if (isProcessing || showMinigame) return; 

    // NOTE: Removed forced Dashboard switch. Bot now works in background.

    // 1. Resolve Events First
    if (phase === GamePhase.EVENT && currentEvent) {
      handleEventChoice(Math.random() > 0.5 ? 'A' : 'B');
      return;
    }

    // 2. Spend Skill Points
    if (gameState.skillPoints > 0) {
      const affordablePerk = gameState.perks.find(p => !p.unlocked && p.cost <= gameState.skillPoints);
      if (affordablePerk) {
        unlockPerk(affordablePerk.id);
        return;
      }
    }

    if (phase === GamePhase.PLAYING) {
      // 3. Needs Sleep?
      if (gameState.energy < 25) {
        sleep();
        return;
      }

      // 4. Pending Footage? Edit immediately
      if (currentFootage) {
        const vibes = ['Fast Paced', 'Cinematic', 'Funny', 'Clean'];
        setEditingVibe(vibes[Math.floor(Math.random() * vibes.length)]);
        editAndUpload();
        return;
      }
      
      const money = gameState.money;
      const currentEq = gameState.equipment;
      
      // 5. Auto-buy Upgrade (Equipment)
      if (currentEq === EquipmentLevel.SMARTPHONE && money > EQUIPMENT_COSTS[EquipmentLevel.WEBCAM] * 1.5) {
        buyUpgrade('equipment', EquipmentLevel.WEBCAM, EQUIPMENT_COSTS[EquipmentLevel.WEBCAM]);
        return;
      }

      // 6. Need Money? Work.
      if (money < 50) {
        performWork();
        return;
      }

      // 7. Make Content
      // Check for active contract to prioritize
      if (gameState.activeContract) {
         startRecording(gameState.activeContract.requiredGenre);
      } else {
         startRecording(gameState.currentTrend);
      }
    }
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameState.playerName || !gameState.channelName) {
      toast.error("Please fill in all fields");
      return;
    }
    setPhase(GamePhase.PLAYING);
    addLog(`Channel "${gameState.channelName}" launch! Trend: ${gameState.currentTrend}`, 'success');
  };

  const checkEnergy = (baseCost: number) => {
    let actualCost = baseCost;
    if (baseCost === ENERGY_COST_RECORD) actualCost -= getPerkValue('energy_record');
    if (baseCost === ENERGY_COST_EDIT) actualCost -= getPerkValue('energy_edit');
    actualCost = Math.max(5, actualCost);

    if (gameState.energy < actualCost) {
      toast.error("Exhausted! You need to Sleep.");
      return false;
    }
    return actualCost;
  };

  const performWork = () => {
    const cost = checkEnergy(ENERGY_COST_WORK);
    if (!cost) return;

    setIsProcessing(true);
    setActionStatus("Freelancing...");
    
    // Turbo delay
    const delay = isAutoPlaying ? 200 : 800;

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        energy: prev.energy - cost,
        money: prev.money + WORK_PAYOUT
      }));
      if (!isAutoPlaying) {
          addLog(`Freelance work completed. +$${WORK_PAYOUT}`, 'info');
          spawnFloatingText(`+$${WORK_PAYOUT}`, "text-green-400");
      }
      setIsProcessing(false);
      setActionStatus(null);
    }, delay); 
  };

  const sleep = async () => {
    setIsProcessing(true);
    setActionStatus("Sleeping...");

    // Turbo delay
    const delay = isAutoPlaying ? 200 : 1500;

    setTimeout(async () => {
      const triggerEvent = Math.random() > 0.7; 
      if (triggerEvent) {
        const evt = await generateGameEvent(gameState.reputation);
        setCurrentEvent(evt);
        setPhase(GamePhase.EVENT);
      } else {
        await finishNewDay();
      }
      setIsProcessing(false);
      setActionStatus(null);
    }, delay); 
  };

  const finishNewDay = async () => {
    setGameState(prev => {
      const newDay = prev.day + 1;
      let contract = prev.activeContract;
      let rep = prev.reputation;

      if (contract && newDay > contract.deadlineDay) {
        addLog(`Contract Expired! -10 Rep`, 'error');
        rep = Math.max(0, rep - 10);
        contract = null;
      }

      let newTrend = prev.currentTrend;
      if (Math.random() > 0.8) {
        const genres = Object.values(VideoGenre);
        newTrend = genres[Math.floor(Math.random() * genres.length)];
      }

      const newHype = Math.max(0, prev.hype - 20);

      return {
        ...prev,
        day: newDay,
        energy: MAX_ENERGY,
        subHistory: [...prev.subHistory, { day: newDay, count: prev.subscribers }],
        currentTrend: newTrend,
        activeContract: contract,
        reputation: rep,
        hype: newHype
      };
    });

    if (!gameState.activeContract && Math.random() > 0.7) {
       generateContractOffer();
    }
    if (phase !== GamePhase.PLAYING) setPhase(GamePhase.PLAYING);
  };

  const generateContractOffer = () => {
     const genres = Object.values(VideoGenre);
     const genre = genres[Math.floor(Math.random() * genres.length)];
     const minQ = 30 + Math.floor(Math.random() * 40); 
     const payout = 150 + (minQ * 5); 
     const days = 3 + Math.floor(Math.random() * 4);

     const newContract: Contract = {
       id: generateId(),
       sponsorName: `Brand ${Math.floor(Math.random() * 99)}`,
       description: `Create a ${genre} video with ${minQ}+ Quality.`,
       requiredGenre: genre,
       minQuality: minQ,
       payout: payout,
       deadlineDay: gameState.day + days,
       completed: false
     };

     if (isAutoPlaying) {
        setGameState(prev => ({...prev, activeContract: newContract}));
     } else {
        toast((t) => (
           <div className="flex flex-col gap-2">
             <span className="font-bold">New Sponsorship Offer!</span>
             <span className="text-xs">{newContract.description}</span>
             <span className="text-green-400 font-bold">${payout}</span>
             <button onClick={() => {
                setGameState(prev => ({...prev, activeContract: newContract}));
                toast.dismiss(t.id);
                toast.success("Contract Accepted!");
             }} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Accept</button>
           </div>
        ), { duration: 5000, icon: '📩' });
     }
  };

  const handleEventChoice = async (choiceId: 'A' | 'B') => {
    if (!currentEvent) return;
    setIsProcessing(true);
    setActionStatus("Resolving Event...");

    const outcome = await resolveEventOutcome(currentEvent, choiceId);
    setGameState(prev => ({
      ...prev,
      money: Math.max(0, prev.money + outcome.moneyChange),
      subscribers: Math.max(0, prev.subscribers + outcome.subChange),
      reputation: Math.min(100, Math.max(0, prev.reputation + outcome.repChange))
    }));
    addLog(outcome.message, outcome.moneyChange >= 0 ? 'success' : 'error');
    if (outcome.moneyChange !== 0) spawnFloatingText(`${outcome.moneyChange > 0 ? '+' : ''}$${outcome.moneyChange}`, outcome.moneyChange > 0 ? "text-green-400" : "text-red-400");
    setCurrentEvent(null);
    await finishNewDay();
  };

  const startRecording = async (genreOverride?: VideoGenre) => {
    const cost = checkEnergy(ENERGY_COST_RECORD);
    if (!cost) return;
    if (currentFootage) {
       if(!isAutoPlaying) toast.error("Footage pending edit.");
       return;
    }
    
    // REMOVED: setActiveTab('DASHBOARD'); -- allows background recording

    const genre = genreOverride || selectedGenre;
    if (genreOverride) setSelectedGenre(genreOverride);

    if (isAutoPlaying) {
        // AUTO BOT RECORDING
        setIsProcessing(true);
        setActionStatus(`Recording ${genre}...`);
        
        let baseQuality = 40; 
        if (gameState.equipment === EquipmentLevel.WEBCAM) baseQuality = 60;
        if (gameState.equipment === EquipmentLevel.DSLR) baseQuality = 80;
        if (gameState.equipment === EquipmentLevel.CINEMA) baseQuality = 95;
        
        const qualityRoll = Math.floor(Math.random() * 20) - 5; // Bot is generally good
        const finalQuality = Math.min(100, Math.max(1, baseQuality + qualityRoll));
        let trendBonus = genre === gameState.currentTrend ? 15 : 0;

        // Turbo delay
        const delay = 200;

        setTimeout(() => {
          setGameState(prev => ({ ...prev, energy: prev.energy - cost }));
          setCurrentFootage({ genre: genre, qualityMod: finalQuality + trendBonus });
          setIsProcessing(false);
          setActionStatus(null);
        }, delay);

    } else {
        // MANUAL MINIGAME RECORDING - Must switch to dashboard to play
        setActiveTab('DASHBOARD');
        setGameState(prev => ({ ...prev, energy: prev.energy - cost }));
        setShowMinigame(true);
    }
  };

  const handleMinigameComplete = (score: number) => {
    setShowMinigame(false);
    
    let baseMultiplier = 0.5;
    if (gameState.equipment === EquipmentLevel.WEBCAM) baseMultiplier = 0.7;
    if (gameState.equipment === EquipmentLevel.DSLR) baseMultiplier = 0.9;
    if (gameState.equipment === EquipmentLevel.CINEMA) baseMultiplier = 1.0;
    
    // Score (0-100) maps to quality based on equipment potential
    const rawQuality = score * baseMultiplier;
    let trendBonus = selectedGenre === gameState.currentTrend ? 15 : 0;
    const finalQuality = Math.min(100, Math.max(10, rawQuality + trendBonus + getPerkValue('quality_bonus')));

    setCurrentFootage({ genre: selectedGenre, qualityMod: Math.floor(finalQuality) });
    spawnFloatingText(`Quality: ${Math.floor(finalQuality)}%`, "text-cyan-400", window.innerWidth/2, window.innerHeight/2);
    toast.success("Footage captured!");
  };

  const editAndUpload = async () => {
    const cost = checkEnergy(ENERGY_COST_EDIT);
    if (!cost) return;
    if (!currentFootage) return;

    setIsProcessing(true);
    setActionStatus("Editing...");

    let quality = currentFootage.qualityMod + (gameState.editingSkill * 3);
    if (gameState.inventory.hasEditor) quality += 10;
    if (gameState.inventory.hasLighting) quality += 5;
    if (gameState.inventory.hasMicrophone) quality += 5;
    quality = Math.min(100, quality);

    // If auto playing, generate details faster (or use fallback silently to speed up)
    const details = await generateVideoDetails(currentFootage.genre, gameState.channelName, editingVibe);
    const comments = await generateVideoComments(details.title, quality, currentFootage.genre);

    const newVideo: Video = {
      id: generateId(),
      title: details.title,
      description: details.description,
      genre: currentFootage.genre,
      quality: Math.floor(quality),
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: comments.map((c, i) => ({...c, id: generateId()})),
      earnings: 0,
      dayPublished: gameState.day,
      thumbnailGradient: details.gradient,
      timestamp: Date.now(),
      currentVelocity: 0
    };

    let contractCompleted = false;
    let contractPayout = 0;
    if (gameState.activeContract) {
       if (currentFootage.genre === gameState.activeContract.requiredGenre && quality >= gameState.activeContract.minQuality) {
          contractCompleted = true;
          contractPayout = gameState.activeContract.payout;
          addLog(`Contract Fulfilled! Earned $${contractPayout}`, 'success');
          spawnFloatingText(`Contract Bonus $${contractPayout}`, "text-yellow-400");
          if (!isAutoPlaying) toast.success(`Sponsorship Paid: $${contractPayout}`);
       }
    }

    setGameState(prev => {
      return {
        ...prev,
        energy: prev.energy - cost,
        money: prev.money + contractPayout,
        videos: [...prev.videos, newVideo],
        editingSkill: Math.min(10, prev.editingSkill + 0.2),
        activeContract: contractCompleted ? null : prev.activeContract,
        hype: Math.min(100, prev.hype + (quality > 70 ? 20 : 5))
      };
    });

    setCurrentFootage(null);
    if (!isAutoPlaying) {
        addLog(`Published: "${details.title}"`, 'success');
        spawnFloatingText("Video Published!", "text-white");
    }
    
    setIsProcessing(false);
    setActionStatus(null);
  };

  const buyUpgrade = (type: 'equipment' | 'item', key: string, cost: number) => {
    if (gameState.money < cost) {
      if (!isAutoPlaying) toast.error("Too expensive!");
      return;
    }
    setGameState(prev => {
      let newState = { ...prev, money: prev.money - cost };
      if (type === 'equipment') {
        newState.equipment = key as EquipmentLevel;
      } else {
        newState.inventory = { ...prev.inventory, [key]: true };
      }
      return newState;
    });
    if (!isAutoPlaying) {
       toast.success(`Upgraded ${type === 'equipment' ? 'Gear' : 'Studio'}!`);
       spawnFloatingText("UPGRADE!", "text-pink-500");
    }
  };

  const unlockPerk = (perkId: string) => {
    setGameState(prev => {
       const perk = prev.perks.find(p => p.id === perkId);
       if (!perk || prev.skillPoints < perk.cost) return prev;
       const updatedPerks = prev.perks.map(p => p.id === perkId ? { ...p, unlocked: true } : p);
       return { ...prev, skillPoints: prev.skillPoints - perk.cost, perks: updatedPerks };
    });
    if (!isAutoPlaying) toast.success("Perk Unlocked!");
  };

  const heartComment = (videoId: string, commentIndex: number) => {
     setGameState(prev => {
         const videos = [...prev.videos];
         const video = videos.find(v => v.id === videoId);
         if (!video) return prev;
         
         const comment = video.comments[commentIndex];
         if (!comment || comment.isHearted) return prev;
         
         comment.isHearted = true;
         return { ...prev, reputation: Math.min(100, prev.reputation + 2), xp: prev.xp + 5, videos };
     });
     spawnFloatingText("+2 Rep", "text-pink-400");
     spawnFloatingText("+5 XP", "text-purple-400", undefined, (window.innerHeight/2) + 30);
  };

  if (phase === GamePhase.SETUP) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#1f1f1f] p-8 rounded-3xl shadow-2xl max-w-md w-full border border-[#282828] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500"></div>
          <div className="flex justify-center mb-6">
             <div className="p-5 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl shadow-lg shadow-red-900/40">
               <VideoIcon size={40} className="text-white" />
             </div>
          </div>
          <h1 className="text-3xl font-extrabold text-center text-white mb-2 tracking-tight">Streamer Sim AI</h1>
          <form onSubmit={handleStartGame} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Creator Name</label>
              <input type="text" value={gameState.playerName} onChange={e => setGameState({...gameState, playerName: e.target.value})} className="w-full bg-[#282828] border border-[#383838] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Kai" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Channel Name</label>
              <input type="text" value={gameState.channelName} onChange={e => setGameState({...gameState, channelName: e.target.value})} className="w-full bg-[#282828] border border-[#383838] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. KaiStreamz" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95">Start Career</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-screen bg-[#0F0F0F] text-slate-200 font-sans overflow-hidden ${isAutoPlaying ? 'border-4 border-emerald-500/20' : ''}`}>
      <Toaster position="bottom-left" toastOptions={{ style: { background: '#1f1f1f', color: '#fff', border: '1px solid #334155' }}} />
      {showSkills && <SkillsModal perks={gameState.perks} skillPoints={gameState.skillPoints} onUnlock={unlockPerk} onClose={() => setShowSkills(false)} />}
      {phase === GamePhase.EVENT && currentEvent && <EventModal event={currentEvent} onChoice={handleEventChoice} isProcessing={isProcessing} />}

      {/* 1. SIDEBAR NAVIGATION */}
      <Sidebar 
         activeTab={activeTab} 
         setActiveTab={setActiveTab} 
         channelName={gameState.channelName} 
         channelInitial={gameState.channelName[0]} 
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
         
         {/* HEADER */}
         <header className="h-16 bg-[#0F0F0F] border-b border-[#282828] flex items-center justify-between px-6 flex-shrink-0 z-20">
            <div className="flex items-center gap-6">
               <h2 className="text-xl font-bold text-white hidden md:block">{activeTab === 'DASHBOARD' ? 'Dashboard' : activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}</h2>
               
               {/* Quick Stats in Header */}
               <div className="flex items-center gap-4 text-xs font-mono bg-[#1f1f1f] px-3 py-1.5 rounded-lg border border-[#282828]">
                  <span className="flex items-center gap-1.5"><Users size={12} className="text-slate-400"/> <LiveNumber value={gameState.subscribers} /></span>
                  <span className="w-px h-3 bg-[#383838]"></span>
                  <span className="flex items-center gap-1.5 text-green-400 font-bold"><DollarSign size={12}/> <LiveNumber value={Math.floor(gameState.money)} /></span>
               </div>
            </div>

            <div className="flex items-center gap-4">
               {/* Trend Ticker */}
               <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-[#1f1f1f] px-3 py-1.5 rounded-full border border-[#282828]">
                  <TrendingUp size={12} className="text-red-500" />
                  <span>Trending: <span className="text-slate-200 font-bold">{gameState.currentTrend}</span></span>
               </div>

               {/* Auto Pilot Toggle */}
               <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs font-bold ${isAutoPlaying ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-[#1f1f1f] border-[#282828] text-slate-400 hover:border-slate-500'}`}>
                  <Bot size={16} className={isAutoPlaying ? "animate-pulse" : ""} />
                  <span className="hidden sm:inline">{isAutoPlaying ? "AUTO ON" : "AUTO OFF"}</span>
               </button>
            </div>
         </header>

         {/* CONTENT RENDERER */}
         <main className="flex-1 overflow-hidden relative bg-[#0F0F0F]">
            {activeTab === 'DASHBOARD' && (
               <Dashboard 
                  gameState={gameState}
                  chatMessages={chatMessages}
                  isProcessing={isProcessing}
                  actionStatus={actionStatus}
                  onStartRecording={startRecording}
                  onEditAndUpload={editAndUpload}
                  onSleep={sleep}
                  onWork={performWork}
                  selectedGenre={selectedGenre}
                  setSelectedGenre={setSelectedGenre}
                  showMinigame={showMinigame}
                  handleMinigameComplete={handleMinigameComplete}
                  currentFootage={currentFootage}
                  editingVibe={editingVibe}
                  setEditingVibe={setEditingVibe}
                  isAutoPlaying={isAutoPlaying}
               />
            )}
            {activeTab === 'CONTENT' && <ContentTab videos={gameState.videos} />}
            {activeTab === 'COMMENTS' && <CommentsTab videos={gameState.videos} onHeartComment={heartComment} />}
            {activeTab === 'ANALYTICS' && <div className="p-6 h-full overflow-y-auto custom-scrollbar"><AnalyticsStudio gameState={gameState} /></div>}
            {activeTab === 'SHOP' && <ShopTab gameState={gameState} onBuyUpgrade={buyUpgrade} onUnlockPerk={unlockPerk} />}
         </main>
         
         {/* GLOBAL STATUS BAR (Bottom) */}
         {isProcessing && !showMinigame && (
             <div className="h-8 bg-[#1f1f1f] border-t border-[#383838] flex items-center px-4 gap-4 animate-slide-up z-50">
                 <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                    <Activity size={12} className="animate-spin" />
                    <span>{actionStatus || "Processing..."}</span>
                 </div>
                 <div className="flex-1 h-1 bg-[#282828] rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 animate-progress"></div>
                 </div>
             </div>
         )}
      </div>

      {/* OVERLAYS */}
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        {floatingTexts.map(ft => (
          <div 
             key={ft.id}
             className={`absolute font-bold text-xl drop-shadow-md animate-float-text ${ft.color}`}
             style={{ left: ft.x, top: ft.y }}
          >
             {ft.text}
          </div>
        ))}
      </div>
    </div>
  );
}
