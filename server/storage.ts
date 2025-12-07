import { 
  type User, 
  type InsertUser,
  type PendingCommunity,
  type InsertPendingCommunity,
  type ApprovedCommunity,
  type InsertApprovedCommunity,
  users,
  pendingCommunities,
  approvedCommunities
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPendingCommunity(community: InsertPendingCommunity): Promise<PendingCommunity>;
  getAllPendingCommunities(): Promise<PendingCommunity[]>;
  getPendingCommunity(id: string): Promise<PendingCommunity | undefined>;
  deletePendingCommunity(id: string): Promise<void>;
  
  createApprovedCommunity(community: InsertApprovedCommunity): Promise<ApprovedCommunity>;
  getAllApprovedCommunities(): Promise<ApprovedCommunity[]>;
  getApprovedCommunity(id: string): Promise<ApprovedCommunity | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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
}

export const storage = new DatabaseStorage();
