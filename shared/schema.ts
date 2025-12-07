import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const pendingCommunities = pgTable("pending_communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  description: text("description").notNull(),
  tags: json("tags").$type<string[]>().notNull().default([]),
  category: text("category").notNull(),
  inviteLink: text("invite_link").notNull(),
  visibility: text("visibility").notNull().default("public"),
  submittedBy: text("submitted_by"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const approvedCommunities = pgTable("approved_communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  description: text("description").notNull(),
  tags: json("tags").$type<string[]>().notNull().default([]),
  rating: integer("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  category: text("category").notNull(),
  inviteLink: text("invite_link").notNull(),
  visibility: text("visibility").notNull().default("public"),
  approvedAt: timestamp("approved_at").notNull().defaultNow(),
});

export const insertPendingCommunitySchema = createInsertSchema(pendingCommunities).omit({
  id: true,
  submittedAt: true,
});

export const insertApprovedCommunitySchema = createInsertSchema(approvedCommunities).omit({
  id: true,
  approvedAt: true,
});

export type InsertPendingCommunity = z.infer<typeof insertPendingCommunitySchema>;
export type PendingCommunity = typeof pendingCommunities.$inferSelect;
export type InsertApprovedCommunity = z.infer<typeof insertApprovedCommunitySchema>;
export type ApprovedCommunity = typeof approvedCommunities.$inferSelect;
