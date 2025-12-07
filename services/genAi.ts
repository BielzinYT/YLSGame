import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VideoGenre, Comment, GameEvent, EventOutcome } from "../types";

// Initialize the API client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

// --- FALLBACK DATA (Offline Mode) ---

const FALLBACK_TITLES_BY_GENRE: Record<VideoGenre, string[]> = {
  [VideoGenre.GAMING]: ["Epic Killstreak!", "Impossible Level Completed", "Speedrun World Record?", "Noob vs Pro", "Glitch Hunter", "Rage Quit Moment", "Best Loadout Guide"],
  [VideoGenre.VLOG]: ["My Morning Routine", "Day in the Life", "Q&A Special", "Travel Vlog: Tokyo", "Room Tour 2024", "Big Announcement!", "Why I was gone"],
  [VideoGenre.TECH]: ["New iPhone Review", "Is this worth $1000?", "PC Build Guide", "The Future of AI", "Unboxing Mystery Tech", "Don't Buy This", "Top 5 Gadgets"],
  [VideoGenre.COOKING]: ["Ultimate Burger Recipe", "Cooking with 1 Ingredient", "Chef Reacts to Frozen Food", "Spicy Noodle Challenge", "Easy Dessert Tutorial", "Kitchen Nightmares", "Vegan for a Day"],
  [VideoGenre.PRANK]: ["Scaring Roommate!", "Fake Lottery Ticket", "Invisible Wall Prank", "Calling Random Numbers", "Elevator Prank", "Public Prank Gone Wrong", "Gold Digger Test"],
  [VideoGenre.EDUCATIONAL]: ["History of the Internet", "How Physics Works", "Learn Coding in 10 Mins", "Space Facts", "Why the Sky is Blue", "Math Tricks", "The Ocean is Scary"]
};

const FALLBACK_COMMENTS: Comment[] = [
  { id: 'c1', user: "SuperFan99", text: "First! Love your content.", sentiment: "positive" },
  { id: 'c2', user: "Hater123", text: "This is boring.", sentiment: "negative" },
  { id: 'c3', user: "RandomUser", text: "Great video quality!", sentiment: "positive" },
  { id: 'c4', user: "TrollFace", text: "L + Ratio", sentiment: "negative" },
  { id: 'c5', user: "Viewer1", text: "Interesting perspective.", sentiment: "neutral" },
  { id: 'c6', user: "Bot_Account", text: "Nice vid!", sentiment: "neutral" },
  { id: 'c7', user: "Mom", text: "So proud of you honey!", sentiment: "positive" }
];

const FALLBACK_EVENTS: GameEvent[] = [
    {
        id: 'fb_1',
        title: 'Trending Topic',
        description: 'A new viral challenge is taking over the internet. Everyone is doing it.',
        choices: [{ label: 'Join the Trend', id: 'A' }, { label: 'Ignore it', id: 'B' }]
    },
    {
        id: 'fb_2',
        title: 'Technical Difficulties',
        description: 'Your editing software crashed and you lost an hour of work.',
        choices: [{ label: 'Stay up late to fix it', id: 'A' }, { label: 'Upload what you have', id: 'B' }]
    },
    {
        id: 'fb_3',
        title: 'Collab Opportunity',
        description: 'A slightly larger channel wants to collaborate, but they have a bad reputation.',
        choices: [{ label: 'Accept for the views', id: 'A' }, { label: 'Decline to stay safe', id: 'B' }]
    },
    {
        id: 'fb_4',
        title: 'Sponsorship Offer',
        description: 'A mobile game wants to sponsor your next video for quick cash.',
        choices: [{ label: 'Sell out', id: 'A' }, { label: 'Keep integrity', id: 'B' }]
    }
];

// --- HELPER FUNCTIONS ---

function getRandomFallbackTitle(genre: VideoGenre): string {
  const titles = FALLBACK_TITLES_BY_GENRE[genre] || ["My New Video"];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getRandomGradient(): string {
  const gradients = [
    "from-red-500 to-orange-500", 
    "from-blue-500 to-cyan-500", 
    "from-purple-500 to-pink-500", 
    "from-green-500 to-emerald-500",
    "from-indigo-500 to-purple-500",
    "from-yellow-400 to-orange-500"
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

// --- API FUNCTIONS ---

/**
 * Generates Video Title, Description, and Visual Vibe (CSS Gradient)
 */
export const generateVideoDetails = async (
  genre: VideoGenre, 
  channelName: string, 
  vibe: string
): Promise<{ title: string, description: string, gradient: string }> => {
  // If no API key is set, use fallback immediately
  if (!apiKey) {
    return { 
      title: getRandomFallbackTitle(genre), 
      description: `A brand new ${genre} video for you guys!`, 
      gradient: getRandomGradient() 
    };
  }

  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        gradient: { 
          type: Type.STRING, 
          description: "A Tailwind CSS gradient string (e.g. 'from-red-500 to-orange-500') that matches the mood." 
        }
      },
      required: ['title', 'description', 'gradient']
    };

    const prompt = `Generate details for a new ${genre} video by channel "${channelName}". 
    The editing vibe was "${vibe}".
    1. Title: Catchy, clickbaity.
    2. Description: Short (1 sentence).
    3. Gradient: A Tailwind CSS gradient class string representing the thumbnail colors.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 1.1,
      }
    });

    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.warn("GenAI Error (Fallback Mode Active):", error);
    return { 
      title: getRandomFallbackTitle(genre), 
      description: `Check out this new ${genre} video!`, 
      gradient: getRandomGradient() 
    };
  }
};

/**
 * Generates user comments
 */
export const generateVideoComments = async (
  title: string, 
  quality: number, 
  genre: VideoGenre
): Promise<Comment[]> => {
  if (!apiKey) return generateFallbackComments(quality);

  try {
    const isGood = quality > 60;
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          user: { type: Type.STRING },
          text: { type: Type.STRING },
          sentiment: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] }
        },
        required: ['user', 'text', 'sentiment']
      }
    };

    const prompt = `Generate 3 YouTube comments for "${title}" (${genre}). Quality: ${quality}/100.
    ${isGood ? "Mostly fans." : "Mostly haters or trolls."}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const rawComments = JSON.parse(response.text || "[]");
    return rawComments.map((c: any) => ({ ...c, id: Math.random().toString(36).substring(7) }));
  } catch (error) {
    return generateFallbackComments(quality);
  }
};

function generateFallbackComments(quality: number): Comment[] {
  const comments: Comment[] = [];
  const count = 3;
  
  for (let i = 0; i < count; i++) {
    const template = FALLBACK_COMMENTS[Math.floor(Math.random() * FALLBACK_COMMENTS.length)];
    // Adjust sentiment slightly based on quality
    let sentiment = template.sentiment as 'positive' | 'negative' | 'neutral';
    
    if (quality > 80 && sentiment === 'negative' && Math.random() > 0.3) {
      // Turn hater into neutral
      comments.push({ ...template, id: Math.random().toString(), text: "Actually not bad.", sentiment: 'neutral' });
    } else if (quality < 30 && sentiment === 'positive' && Math.random() > 0.3) {
       // Turn fan into disappointed
       comments.push({ ...template, id: Math.random().toString(), text: "Usually I like your stuff but...", sentiment: 'negative' });
    } else {
      comments.push({ ...template, id: Math.random().toString() });
    }
  }
  return comments;
}

/**
 * Generates a random decision-based event
 */
export const generateGameEvent = async (reputation: number): Promise<GameEvent> => {
  if (!apiKey) return getRandomFallbackEvent();

  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        choices: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              id: { type: Type.STRING, enum: ['A', 'B'] }
            },
            required: ['label', 'id']
          }
        }
      },
      required: ['title', 'description', 'choices']
    };

    const prompt = `Create a random scenario for a Youtuber. 
    Current Reputation: ${reputation}/100.
    The scenario should require a choice. 
    Examples: Sponsor offer, Drama with another creator, Copyright strike, Viral opportunity.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 1.0
      }
    });

    const event = JSON.parse(response.text || "{}");
    return { ...event, id: Math.random().toString() };
  } catch (error) {
    console.warn("Using Fallback Event due to API Error");
    return getRandomFallbackEvent();
  }
};

function getRandomFallbackEvent(): GameEvent {
  const event = FALLBACK_EVENTS[Math.floor(Math.random() * FALLBACK_EVENTS.length)];
  return { ...event, id: Math.random().toString() };
}

/**
 * Resolves the outcome of an event choice
 */
export const resolveEventOutcome = async (
  event: GameEvent, 
  choiceId: 'A' | 'B'
): Promise<EventOutcome> => {
  if (!apiKey) return resolveFallbackOutcome(choiceId);

  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        message: { type: Type.STRING },
        moneyChange: { type: Type.NUMBER },
        subChange: { type: Type.NUMBER },
        repChange: { type: Type.NUMBER }
      },
      required: ['message', 'moneyChange', 'subChange', 'repChange']
    };

    const choiceLabel = event.choices.find(c => c.id === choiceId)?.label;
    
    const prompt = `The Youtuber chose to "${choiceLabel}" in response to: "${event.description}".
    Determine the outcome. Be somewhat unpredictable.
    Return JSON with message (narrative result), moneyChange (integer), subChange (integer), repChange (integer, -10 to 10).`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return resolveFallbackOutcome(choiceId);
  }
};

function resolveFallbackOutcome(choiceId: 'A' | 'B'): EventOutcome {
  const isGood = Math.random() > 0.4; // 60% chance of good outcome
  
  if (isGood) {
    return {
      message: "It worked out great! Fans loved your decision.",
      moneyChange: Math.floor(Math.random() * 50) + 10,
      subChange: Math.floor(Math.random() * 100) + 50,
      repChange: 5
    };
  } else {
    return {
      message: "That didn't go as planned. People are confused.",
      moneyChange: -Math.floor(Math.random() * 20),
      subChange: -Math.floor(Math.random() * 20),
      repChange: -5
    };
  }
}