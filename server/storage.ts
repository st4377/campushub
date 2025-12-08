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
  users,
  pendingCommunities,
  approvedCommunities,
  rejectedCommunities
} from "@shared/schema";
import { db } from "./db";
import { eq, isNull, isNotNull, and, sql } from "drizzle-orm";

const categoryPrefixes: Record<string, string> = {
  "Study Groups": "SG",
  "Coding & Tech": "CT",
  "Trading & Finance": "TF",
  "Entertainment & Memes": "EM",
  "Sports & Fitness": "SF",
  "Gaming": "GM",
  "Hostel Life": "HL",
  "Career & Internships": "CI",
  "Events & Fests": "EF",
  "General": "GN",
};

async function generateAdminTagId(category: string): Promise<string> {
  const prefix = categoryPrefixes[category] || "GN";
  
  const allPending = await db.select({ adminTagId: pendingCommunities.adminTagId }).from(pendingCommunities);
  const allApproved = await db.select({ adminTagId: approvedCommunities.adminTagId }).from(approvedCommunities);
  const allRejected = await db.select({ adminTagId: rejectedCommunities.adminTagId }).from(rejectedCommunities);
  
  const existingIds = [
    ...allPending.map(c => c.adminTagId),
    ...allApproved.map(c => c.adminTagId),
    ...allRejected.map(c => c.adminTagId)
  ].filter(Boolean) as string[];
  
  const prefixIds = existingIds.filter(id => id.startsWith(prefix + "CM"));
  const maxNumber = prefixIds.reduce((max, id) => {
    const numStr = id.substring(4);
    const num = parseInt(numStr, 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  
  const nextNumber = maxNumber + 1;
  const paddedNumber = String(nextNumber).padStart(4, "0");
  
  return `${prefix}CM${paddedNumber}`;
}

export interface BumpResult {
  success: boolean;
  error?: string;
  community?: ApprovedCommunity;
  nextAvailableAt?: Date;
}

export interface UserBumpStatus {
  lastBumpAt: Date | null;
  lastBumpCommunityId: string | null;
  canBump: boolean;
  nextAvailableAt: Date | null;
  hoursRemaining: number | null;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: { fullName: string }): Promise<User | undefined>;
  getUserBumpStatus(userId: string): Promise<UserBumpStatus>;
  
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
  bumpCommunity(userId: string, communityId: string): Promise<BumpResult>;
  
  createRejectedCommunity(community: InsertRejectedCommunity): Promise<RejectedCommunity>;
  getRejectedCommunitiesByUserId(userId: string): Promise<RejectedCommunity[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserProfile(userId: string, updates: { fullName: string }): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ fullName: updates.fullName })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getUserBumpStatus(userId: string): Promise<UserBumpStatus> {
    const user = await this.getUser(userId);
    if (!user) {
      return {
        lastBumpAt: null,
        lastBumpCommunityId: null,
        canBump: false,
        nextAvailableAt: null,
        hoursRemaining: null,
      };
    }

    const lastBumpAt = user.lastBumpAt;
    const lastBumpCommunityId = user.lastBumpCommunityId;
    
    if (!lastBumpAt) {
      return {
        lastBumpAt: null,
        lastBumpCommunityId: null,
        canBump: true,
        nextAvailableAt: null,
        hoursRemaining: null,
      };
    }

    const now = new Date();
    const cooldownMs = 24 * 60 * 60 * 1000;
    const timeSinceBump = now.getTime() - lastBumpAt.getTime();
    const canBump = timeSinceBump >= cooldownMs;
    
    if (canBump) {
      return {
        lastBumpAt,
        lastBumpCommunityId,
        canBump: true,
        nextAvailableAt: null,
        hoursRemaining: null,
      };
    }

    const nextAvailableAt = new Date(lastBumpAt.getTime() + cooldownMs);
    const msRemaining = nextAvailableAt.getTime() - now.getTime();
    const hoursRemaining = Math.ceil(msRemaining / (60 * 60 * 1000));

    return {
      lastBumpAt,
      lastBumpCommunityId,
      canBump: false,
      nextAvailableAt,
      hoursRemaining,
    };
  }

  async createPendingCommunity(community: InsertPendingCommunity): Promise<PendingCommunity> {
    const adminTagId = await generateAdminTagId(community.category);
    const [pendingCommunity] = await db.insert(pendingCommunities).values([{
      ...community,
      adminTagId,
      tags: community.tags as string[],
    }]).returning();
    return pendingCommunity;
  }

  async getAllPendingCommunities(): Promise<PendingCommunity[]> {
    return db.select().from(pendingCommunities);
  }

  async getPendingCommunity(id: string): Promise<PendingCommunity | undefined> {
    const [community] = await db.select().from(pendingCommunities).where(eq(pendingCommunities.id, id));
    return community;
  }

  async deletePendingCommunity(id: string): Promise<void> {
    await db.delete(pendingCommunities).where(eq(pendingCommunities.id, id));
  }

  async updatePendingCommunity(id: string, updates: UpdatePendingCommunity): Promise<PendingCommunity | undefined> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.platform !== undefined) updateData.platform = updates.platform;
    if (updates.memberCount !== undefined) updateData.memberCount = updates.memberCount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.inviteLink !== undefined) updateData.inviteLink = updates.inviteLink;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;
    if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
    
    if (Object.keys(updateData).length === 0) {
      return this.getPendingCommunity(id);
    }
    
    const [updated] = await db
      .update(pendingCommunities)
      .set(updateData)
      .where(eq(pendingCommunities.id, id))
      .returning();
    
    return updated;
  }

  async createApprovedCommunity(community: InsertApprovedCommunity): Promise<ApprovedCommunity> {
    const [approvedCommunity] = await db.insert(approvedCommunities).values([{
      ...community,
      tags: community.tags as string[],
    }]).returning();
    return approvedCommunity;
  }

  async getAllApprovedCommunities(): Promise<ApprovedCommunity[]> {
    return db.select().from(approvedCommunities);
  }

  async getActiveApprovedCommunities(): Promise<ApprovedCommunity[]> {
    return db.select().from(approvedCommunities).where(isNull(approvedCommunities.deletedAt));
  }

  async getApprovedCommunity(id: string): Promise<ApprovedCommunity | undefined> {
    const [community] = await db.select().from(approvedCommunities).where(eq(approvedCommunities.id, id));
    return community;
  }

  async getPendingCommunitiesByUserId(userId: string): Promise<PendingCommunity[]> {
    return db.select().from(pendingCommunities).where(eq(pendingCommunities.userId, userId));
  }

  async getApprovedCommunitiesByUserId(userId: string): Promise<ApprovedCommunity[]> {
    return db.select().from(approvedCommunities).where(eq(approvedCommunities.userId, userId));
  }

  async getActiveApprovedCommunitiesByUserId(userId: string): Promise<ApprovedCommunity[]> {
    return db.select().from(approvedCommunities).where(
      and(
        eq(approvedCommunities.userId, userId),
        isNull(approvedCommunities.deletedAt)
      )
    );
  }

  async getDeletedCommunitiesByUserId(userId: string): Promise<ApprovedCommunity[]> {
    return db.select().from(approvedCommunities).where(
      and(
        eq(approvedCommunities.userId, userId),
        isNotNull(approvedCommunities.deletedAt)
      )
    );
  }

  async updateUserCommunity(id: string, userId: string, updates: UpdateUserCommunity): Promise<ApprovedCommunity | undefined> {
    const [existing] = await db.select().from(approvedCommunities).where(
      and(
        eq(approvedCommunities.id, id),
        eq(approvedCommunities.userId, userId),
        isNull(approvedCommunities.deletedAt)
      )
    );
    
    if (!existing) return undefined;
    
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.inviteLink !== undefined) updateData.inviteLink = updates.inviteLink;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
    
    if (Object.keys(updateData).length === 0) {
      return existing;
    }
    
    const [updated] = await db
      .update(approvedCommunities)
      .set(updateData)
      .where(eq(approvedCommunities.id, id))
      .returning();
    
    return updated;
  }

  async softDeleteApprovedCommunity(id: string, userId: string): Promise<ApprovedCommunity | undefined> {
    const [existing] = await db.select().from(approvedCommunities).where(
      and(
        eq(approvedCommunities.id, id),
        eq(approvedCommunities.userId, userId),
        isNull(approvedCommunities.deletedAt)
      )
    );
    
    if (!existing) return undefined;
    
    const [updated] = await db
      .update(approvedCommunities)
      .set({ deletedAt: new Date() })
      .where(eq(approvedCommunities.id, id))
      .returning();
    
    return updated;
  }

  async deleteApprovedCommunity(id: string): Promise<void> {
    await db.delete(approvedCommunities).where(eq(approvedCommunities.id, id));
  }

  async togglePinCommunity(id: string, isPinned: boolean): Promise<ApprovedCommunity | undefined> {
    const [updated] = await db
      .update(approvedCommunities)
      .set({ isPinned })
      .where(eq(approvedCommunities.id, id))
      .returning();
    return updated;
  }

  async bumpCommunity(userId: string, communityId: string): Promise<BumpResult> {
    const community = await this.getApprovedCommunity(communityId);
    if (!community) {
      return { success: false, error: "Community not found" };
    }

    if (community.userId !== userId) {
      return { success: false, error: "You can only bump your own communities" };
    }

    if (community.deletedAt) {
      return { success: false, error: "Cannot bump a deleted community" };
    }

    const bumpStatus = await this.getUserBumpStatus(userId);
    if (!bumpStatus.canBump) {
      return { 
        success: false, 
        error: `Cooldown active. Next bump available in ${bumpStatus.hoursRemaining} hours`,
        nextAvailableAt: bumpStatus.nextAvailableAt || undefined
      };
    }

    const now = new Date();

    const [updatedCommunity] = await db
      .update(approvedCommunities)
      .set({ bumpedAt: now })
      .where(eq(approvedCommunities.id, communityId))
      .returning();

    await db
      .update(users)
      .set({ 
        lastBumpAt: now,
        lastBumpCommunityId: communityId
      })
      .where(eq(users.id, userId));

    return { 
      success: true, 
      community: updatedCommunity,
      nextAvailableAt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    };
  }

  async createRejectedCommunity(community: InsertRejectedCommunity): Promise<RejectedCommunity> {
    const [rejectedCommunity] = await db.insert(rejectedCommunities).values([{
      ...community,
      tags: community.tags as string[],
    }]).returning();
    return rejectedCommunity;
  }

  async getRejectedCommunitiesByUserId(userId: string): Promise<RejectedCommunity[]> {
    return db.select().from(rejectedCommunities).where(eq(rejectedCommunities.userId, userId));
  }
}

export const storage = new DatabaseStorage();
