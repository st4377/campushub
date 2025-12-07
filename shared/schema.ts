import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  fullName: true,
  email: true,
  password: true,
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  userId: varchar("user_id"),
  imageUrl: text("image_url"),
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
  userId: varchar("user_id"),
  imageUrl: text("image_url"),
  approvedAt: timestamp("approved_at").notNull().defaultNow(),
});

export const rejectedCommunities = pgTable("rejected_communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  description: text("description").notNull(),
  tags: json("tags").$type<string[]>().notNull().default([]),
  category: text("category").notNull(),
  inviteLink: text("invite_link").notNull(),
  visibility: text("visibility").notNull().default("public"),
  userId: varchar("user_id"),
  imageUrl: text("image_url"),
  rejectionReason: text("rejection_reason"),
  rejectedAt: timestamp("rejected_at").notNull().defaultNow(),
});

export const insertPendingCommunitySchema = createInsertSchema(pendingCommunities).omit({
  id: true,
  submittedAt: true,
});

export const insertApprovedCommunitySchema = createInsertSchema(approvedCommunities).omit({
  id: true,
  approvedAt: true,
});

export const insertRejectedCommunitySchema = createInsertSchema(rejectedCommunities).omit({
  id: true,
  rejectedAt: true,
});

export type InsertPendingCommunity = z.infer<typeof insertPendingCommunitySchema>;
export type PendingCommunity = typeof pendingCommunities.$inferSelect;
export type InsertApprovedCommunity = z.infer<typeof insertApprovedCommunitySchema>;
export type ApprovedCommunity = typeof approvedCommunities.$inferSelect;
export type InsertRejectedCommunity = z.infer<typeof insertRejectedCommunitySchema>;
export type RejectedCommunity = typeof rejectedCommunities.$inferSelect;
