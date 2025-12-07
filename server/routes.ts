import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPendingCommunitySchema, signupSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return res.status(500).json({ success: false, error: "Server configuration error" });
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/communities/submit", async (req, res) => {
    try {
      const validatedData = insertPendingCommunitySchema.parse(req.body);
      const pendingCommunity = await storage.createPendingCommunity(validatedData);
      res.status(201).json({ success: true, community: pendingCommunity });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Invalid data", details: error.errors });
      } else {
        console.error("Error submitting community:", error);
        res.status(500).json({ success: false, error: "Failed to submit community" });
      }
    }
  });

  app.get("/api/communities/approved", async (req, res) => {
    try {
      const communities = await storage.getAllApprovedCommunities();
      res.json({ success: true, communities });
    } catch (error) {
      console.error("Error fetching approved communities:", error);
      res.status(500).json({ success: false, error: "Failed to fetch communities" });
    }
  });

  app.get("/api/admin/pending", adminAuth, async (req, res) => {
    try {
      const communities = await storage.getAllPendingCommunities();
      res.json({ success: true, communities });
    } catch (error) {
      console.error("Error fetching pending communities:", error);
      res.status(500).json({ success: false, error: "Failed to fetch pending communities" });
    }
  });

  app.post("/api/admin/approve/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const pendingCommunity = await storage.getPendingCommunity(id);
      
      if (!pendingCommunity) {
        return res.status(404).json({ success: false, error: "Community not found" });
      }

      const approvedCommunity = await storage.createApprovedCommunity({
        name: pendingCommunity.name,
        platform: pendingCommunity.platform,
        memberCount: pendingCommunity.memberCount,
        description: pendingCommunity.description,
        tags: pendingCommunity.tags,
        category: pendingCommunity.category,
        inviteLink: pendingCommunity.inviteLink,
        visibility: pendingCommunity.visibility,
        rating: 0,
        reviewCount: 0,
        isActive: true,
      });

      await storage.deletePendingCommunity(id);

      res.json({ success: true, community: approvedCommunity });
    } catch (error) {
      console.error("Error approving community:", error);
      res.status(500).json({ success: false, error: "Failed to approve community" });
    }
  });

  app.post("/api/admin/reject/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const pendingCommunity = await storage.getPendingCommunity(id);
      
      if (!pendingCommunity) {
        return res.status(404).json({ success: false, error: "Community not found" });
      }

      await storage.deletePendingCommunity(id);

      res.json({ success: true, message: "Community rejected and deleted" });
    } catch (error) {
      console.error("Error rejecting community:", error);
      res.status(500).json({ success: false, error: "Failed to reject community" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ success: false, error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const user = await storage.createUser({
        fullName: validatedData.fullName,
        email: validatedData.email,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ success: true, user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Invalid data", details: error.errors });
      } else {
        console.error("Error during signup:", error);
        res.status(500).json({ success: false, error: "Failed to create account" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, error: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: "Invalid email or password" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ success: false, error: "Failed to login" });
    }
  });

  return httpServer;
}
