import { MessageCircle, Globe, Hash, Users, Shield, Zap, School, Code, DollarSign, Music, Coffee, Star } from "lucide-react";

import { DISPLAY_CATEGORIES } from "./category-mapper";

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
  isPinned?: boolean;
  bumpedAt?: string | null;
  category: string;
  imageUrl?: string;
  inviteLink: string;
  visibility: CommunityVisibility;
  adminTagId?: string;
}

export const CATEGORIES = DISPLAY_CATEGORIES;

export const PLATFORMS: Platform[] = ["WhatsApp", "Telegram", "Discord", "Instagram", "Other"];

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
