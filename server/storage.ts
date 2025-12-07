import { 
  type User, 
  type InsertUser,
  type PendingCommunity,
  type InsertPendingCommunity,
  type ApprovedCommunity,
  type InsertApprovedCommunity,
  type RejectedCommunity,
  type InsertRejectedCommunity,
  users,
  pendingCommunities,
  approvedCommunities,
  rejectedCommunities
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPendingCommunity(community: InsertPendingCommunity): Promise<PendingCommunity>;
  getAllPendingCommunities(): Promise<PendingCommunity[]>;
  getPendingCommunity(id: string): Promise<PendingCommunity | undefined>;
  getPendingCommunitiesByUserId(userId: string): Promise<PendingCommunity[]>;
  deletePendingCommunity(id: string): Promise<void>;
  
  createApprovedCommunity(community: InsertApprovedCommunity): Promise<ApprovedCommunity>;
  getAllApprovedCommunities(): Promise<ApprovedCommunity[]>;
  getApprovedCommunity(id: string): Promise<ApprovedCommunity | undefined>;
  getApprovedCommunitiesByUserId(userId: string): Promise<ApprovedCommunity[]>;
  
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

  async createPendingCommunity(community: InsertPendingCommunity): Promise<PendingCommunity> {
    const [pendingCommunity] = await db.insert(pendingCommunities).values([{
      ...community,
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
