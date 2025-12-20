import { 
  type User, 
  type InsertUser,
  type PendingCommunity,
  type InsertPendingCommunity,
  type UpdatePendingCommunity,
  type ApprovedCommunity,
  type InsertApprovedCommunity,
  type RejectedCommunity,
  type InsertRejectedCommunity,
  type UpdateUserCommunity,
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: { fullName: string }): Promise<User | undefined>;
  getUserBumpStatus(userId: string): Promise<any>;
  
  createPendingCommunity(community: InsertPendingCommunity): Promise<PendingCommunity>;
  getAllPendingCommunities(): Promise<PendingCommunity[]>;
  getPendingCommunity(id: string): Promise<PendingCommunity | undefined>;
  getPendingCommunitiesByUserId(userId: string): Promise<PendingCommunity[]>;
  updatePendingCommunity(id: string, updates: UpdatePendingCommunity): Promise<PendingCommunity | undefined>;
  deletePendingCommunity(id: string): Promise<void>;
  
  createApprovedCommunity(community: InsertApprovedCommunity): Promise<ApprovedCommunity>;
  getAllApprovedCommunities(): Promise<ApprovedCommunity[]>;
  getActiveApprovedCommunities(): Promise<ApprovedCommunity[]>;
  getApprovedCommunity(id: string): Promise<ApprovedCommunity | undefined>;
  getApprovedCommunitiesByUserId(userId: string): Promise<ApprovedCommunity[]>;
  getActiveApprovedCommunitiesByUserId(userId: string): Promise<ApprovedCommunity[]>;
  getDeletedCommunitiesByUserId(userId: string): Promise<ApprovedCommunity[]>;
  updateUserCommunity(id: string, userId: string, updates: UpdateUserCommunity): Promise<ApprovedCommunity | undefined>;
  softDeleteApprovedCommunity(id: string, userId: string): Promise<ApprovedCommunity | undefined>;
  deleteApprovedCommunity(id: string): Promise<void>;
  togglePinCommunity(id: string, isPinned: boolean): Promise<ApprovedCommunity | undefined>;
  bumpCommunity(userId: string, communityId: string): Promise<any>;
  
  createRejectedCommunity(community: InsertRejectedCommunity): Promise<RejectedCommunity>;
  getRejectedCommunitiesByUserId(userId: string): Promise<RejectedCommunity[]>;
}

export class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private pendingCommunities = new Map<string, PendingCommunity>();
  private approvedCommunities = new Map<string, ApprovedCommunity>();
  private rejectedCommunities = new Map<string, RejectedCommunity>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = nanoid();
    const newUser: User = { 
      ...user, 
      id,
      lastBumpAt: null,
      lastBumpCommunityId: null
    } as User;
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserProfile(userId: string, updates: { fullName: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(userId, updated);
    return updated;
  }

  async getUserBumpStatus(userId: string): Promise<any> {
    const user = this.users.get(userId);
    return {
      lastBumpAt: user?.lastBumpAt || null,
      lastBumpCommunityId: user?.lastBumpCommunityId || null,
      canBump: true,
      nextAvailableAt: null,
      hoursRemaining: null,
    };
  }

  async createPendingCommunity(community: InsertPendingCommunity): Promise<PendingCommunity> {
    const id = nanoid();
    const newCommunity: PendingCommunity = { 
      ...community, 
      id,
      tags: community.tags as string[],
      createdAt: new Date(),
    } as PendingCommunity;
    this.pendingCommunities.set(id, newCommunity);
    return newCommunity;
  }

  async getAllPendingCommunities(): Promise<PendingCommunity[]> {
    return Array.from(this.pendingCommunities.values());
  }

  async getPendingCommunity(id: string): Promise<PendingCommunity | undefined> {
    return this.pendingCommunities.get(id);
  }

  async getPendingCommunitiesByUserId(userId: string): Promise<PendingCommunity[]> {
    return Array.from(this.pendingCommunities.values()).filter(c => c.userId === userId);
  }

  async updatePendingCommunity(id: string, updates: UpdatePendingCommunity): Promise<PendingCommunity | undefined> {
    const community = this.pendingCommunities.get(id);
    if (!community) return undefined;
    const updated = { ...community, ...updates };
    this.pendingCommunities.set(id, updated);
    return updated;
  }

  async deletePendingCommunity(id: string): Promise<void> {
    this.pendingCommunities.delete(id);
  }

  async createApprovedCommunity(community: InsertApprovedCommunity): Promise<ApprovedCommunity> {
    const id = nanoid();
    const newCommunity: ApprovedCommunity = { 
      ...community, 
      id,
      tags: community.tags as string[],
      createdAt: new Date(),
      deletedAt: null,
      bumpedAt: null,
    } as ApprovedCommunity;
    this.approvedCommunities.set(id, newCommunity);
    return newCommunity;
  }

  async getAllApprovedCommunities(): Promise<ApprovedCommunity[]> {
    return Array.from(this.approvedCommunities.values());
  }

  async getActiveApprovedCommunities(): Promise<ApprovedCommunity[]> {
    return Array.from(this.approvedCommunities.values()).filter(c => !c.deletedAt);
  }

  async getApprovedCommunity(id: string): Promise<ApprovedCommunity | undefined> {
    return this.approvedCommunities.get(id);
  }

  async getApprovedCommunitiesByUserId(userId: string): Promise<ApprovedCommunity[]> {
    return Array.from(this.approvedCommunities.values()).filter(c => c.userId === userId);
  }

  async getActiveApprovedCommunitiesByUserId(userId: string): Promise<ApprovedCommunity[]> {
    return Array.from(this.approvedCommunities.values()).filter(c => c.userId === userId && !c.deletedAt);
  }

  async getDeletedCommunitiesByUserId(userId: string): Promise<ApprovedCommunity[]> {
    return Array.from(this.approvedCommunities.values()).filter(c => c.userId === userId && c.deletedAt);
  }

  async updateUserCommunity(id: string, userId: string, updates: UpdateUserCommunity): Promise<ApprovedCommunity | undefined> {
    const community = this.approvedCommunities.get(id);
    if (!community || community.userId !== userId) return undefined;
    const updated = { ...community, ...updates };
    this.approvedCommunities.set(id, updated);
    return updated;
  }

  async softDeleteApprovedCommunity(id: string, userId: string): Promise<ApprovedCommunity | undefined> {
    const community = this.approvedCommunities.get(id);
    if (!community || community.userId !== userId) return undefined;
    const updated = { ...community, deletedAt: new Date() };
    this.approvedCommunities.set(id, updated);
    return updated;
  }

  async deleteApprovedCommunity(id: string): Promise<void> {
    this.approvedCommunities.delete(id);
  }

  async togglePinCommunity(id: string, isPinned: boolean): Promise<ApprovedCommunity | undefined> {
    const community = this.approvedCommunities.get(id);
    if (!community) return undefined;
    const updated = { ...community, isPinned };
    this.approvedCommunities.set(id, updated);
    return updated;
  }

  async bumpCommunity(userId: string, communityId: string): Promise<any> {
    const user = this.users.get(userId);
    const community = this.approvedCommunities.get(communityId);
    if (!user || !community) {
      return { success: false, error: "User or community not found" };
    }
    
    const now = new Date();
    const updated = { ...community, bumpedAt: now };
    this.approvedCommunities.set(communityId, updated);
    
    const updatedUser = { ...user, lastBumpAt: now, lastBumpCommunityId: communityId };
    this.users.set(userId, updatedUser);
    
    return {
      success: true,
      community: updated,
      nextAvailableAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  async createRejectedCommunity(community: InsertRejectedCommunity): Promise<RejectedCommunity> {
    const id = nanoid();
    const newCommunity: RejectedCommunity = { 
      ...community, 
      id,
      tags: community.tags as string[],
      createdAt: new Date(),
    } as RejectedCommunity;
    this.rejectedCommunities.set(id, newCommunity);
    return newCommunity;
  }

  async getRejectedCommunitiesByUserId(userId: string): Promise<RejectedCommunity[]> {
    return Array.from(this.rejectedCommunities.values()).filter(c => c.userId === userId);
  }
}
