import { MessageCircle, Globe, Hash, Users, Shield, Zap, School, Code, DollarSign, Music, Coffee, Star } from "lucide-react";

export type Platform = "WhatsApp" | "Telegram" | "Discord" | "Instagram" | "Other";

export type CommunityVisibility = "public" | "boys-only" | "girls-only";

export interface Community {
  id: string;
  name: string;
  platform: Platform;
  memberCount: number;
  description: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  category: string;
  imageUrl?: string;
  inviteLink: string;
  visibility: CommunityVisibility;
  adminTagId?: string;
}

export const CATEGORIES = [
  "Study Groups",
  "Coding & Tech",
  "Trading & Finance",
  "Entertainment & Memes",
  "Dance & Music",
  "Foodies",
  "Sports & Fitness",
  "Events & Fests",
  "Hostel Life",
  "General Chat & Chill",
  "Clubs & Societies"
];

export const PLATFORMS: Platform[] = ["WhatsApp", "Telegram", "Discord", "Instagram", "Other"];

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: "1",
    name: "SRM Coding Wizards",
    platform: "Discord",
    memberCount: 1240,
    description: "The largest coding community in SRM. We host hackathons, daily challenges, and help juniors with DSA and Web Dev. Join us to level up your skills!",
    tags: ["coding", "tech", "web-dev", "dsa", "hackathons"],
    rating: 4.9,
    reviewCount: 156,
    isActive: true,
    category: "Coding & Tech",
    inviteLink: "#",
    visibility: "public"
  },
  {
    id: "2",
    name: "Crypto & Stocks Talk",
    platform: "WhatsApp",
    memberCount: 256,
    description: "Serious discussions about the market. No spam. Daily news analysis and trade setups shared by seniors.",
    tags: ["trading", "finance", "crypto", "stocks"],
    rating: 4.5,
    reviewCount: 42,
    isActive: true,
    category: "Trading & Finance",
    inviteLink: "#",
    visibility: "boys-only"
  },
  {
    id: "3",
    name: "Midnight Maggi Club",
    platform: "Telegram",
    memberCount: 5800,
    description: "For all the night owls. Food delivery coordination, hostel rants, and general chilling after 12 AM.",
    tags: ["food", "hostel", "chill", "night-life"],
    rating: 4.8,
    reviewCount: 312,
    isActive: true,
    category: "Foodies",
    inviteLink: "#",
    visibility: "public"
  },
  {
    id: "4",
    name: "SRM Dance Crew",
    platform: "Instagram",
    memberCount: 8900,
    description: "Official updates from the dance team. Audition alerts, workshop schedules, and performance videos.",
    tags: ["dance", "arts", "events"],
    rating: 4.6,
    reviewCount: 89,
    isActive: false,
    category: "Dance & Music",
    inviteLink: "#",
    visibility: "public"
  },
  {
    id: "5",
    name: "Gamers Unite",
    platform: "Discord",
    memberCount: 450,
    description: "Valorant, CS2, and FIFA tournaments every weekend. Find your squad here.",
    tags: ["gaming", "esports", "tournaments"],
    rating: 4.7,
    reviewCount: 67,
    isActive: true,
    category: "Entertainment & Memes",
    inviteLink: "#",
    visibility: "boys-only"
  },
  {
    id: "6",
    name: "Data Science Enthusiasts",
    platform: "WhatsApp",
    memberCount: 180,
    description: "Discussing AI, ML, and Kaggle competitions. Python resources shared daily.",
    tags: ["ai", "ml", "data-science", "python"],
    rating: 4.4,
    reviewCount: 23,
    isActive: true,
    category: "Coding & Tech",
    inviteLink: "#",
    visibility: "public"
  },
  {
    id: "7",
    name: "Campus Confessions",
    platform: "Telegram",
    memberCount: 12000,
    description: "Anonymous confessions and campus gossip. You know you want to read it.",
    tags: ["gossip", "confessions", "fun"],
    rating: 4.2,
    reviewCount: 560,
    isActive: true,
    category: "Entertainment & Memes",
    inviteLink: "#",
    visibility: "public"
  },
  {
    id: "8",
    name: "Photography Club",
    platform: "Instagram",
    memberCount: 3400,
    description: "Sharing the best clicks from campus. Photo walks and editing workshops.",
    tags: ["photography", "art", "creative"],
    rating: 4.9,
    reviewCount: 112,
    isActive: false,
    category: "Clubs & Societies",
    inviteLink: "#",
    visibility: "girls-only"
  }
];

export const getPlatformIcon = (platform: Platform) => {
  switch (platform) {
    case "WhatsApp": return MessageCircle;
    case "Telegram": return Globe; // Or a paper plane icon if available
    case "Discord": return Users; // Or a gamepad/headset
    case "Instagram": return Hash; // Camera icon
    default: return Users;
  }
};

export const getPlatformColor = (platform: Platform) => {
  switch (platform) {
    case "WhatsApp": return "text-green-500 bg-green-500/10 border-green-500/20";
    case "Telegram": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    case "Discord": return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
    case "Instagram": return "text-pink-500 bg-pink-500/10 border-pink-500/20";
    default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
};
