import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { insertPendingCommunitySchema, signupSchema, updatePendingCommunitySchema, updateUserCommunitySchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const uploadDir = path.join(process.cwd(), "uploads", "communities");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const communityImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadCommunityImage = multer({
  storage: communityImageStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."));
    }
  },
});

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

// Configure Passport Google Strategy (if credentials are available)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const fullName = profile.displayName || `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim();
          
          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          let user = await storage.getUserByEmail(email);
          
          if (!user) {
            user = await storage.createUser({
              fullName: fullName || email.split("@")[0],
              email,
              password: null as any,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  }, express.static(path.join(process.cwd(), "uploads")));

  app.post("/api/upload/community-image", (req, res) => {
    uploadCommunityImage.single("image")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, error: "File too large. Maximum size is 2MB." });
          }
          return res.status(400).json({ success: false, error: "File upload error." });
        }
        return res.status(400).json({ success: false, error: err.message || "Invalid file type." });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No image file provided" });
      }
      
      const imageUrl = `/uploads/communities/${req.file.filename}`;
      res.json({ success: true, imageUrl });
    });
  });

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
      const communities = await storage.getActiveApprovedCommunities();
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

  app.put("/api/admin/pending/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updatePendingCommunitySchema.parse(req.body);
      
      const existingCommunity = await storage.getPendingCommunity(id);
      if (!existingCommunity) {
        return res.status(404).json({ success: false, error: "Community not found" });
      }
      
      const updatedCommunity = await storage.updatePendingCommunity(id, validatedData);
      res.json({ success: true, community: updatedCommunity });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Invalid data", details: error.errors });
      } else {
        console.error("Error updating pending community:", error);
        res.status(500).json({ success: false, error: "Failed to update community" });
      }
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
        adminTagId: pendingCommunity.adminTagId,
        name: pendingCommunity.name,
        platform: pendingCommunity.platform,
        memberCount: pendingCommunity.memberCount,
        description: pendingCommunity.description,
        tags: pendingCommunity.tags,
        category: pendingCommunity.category,
        inviteLink: pendingCommunity.inviteLink,
        visibility: pendingCommunity.visibility,
        userId: pendingCommunity.userId,
        imageUrl: pendingCommunity.imageUrl,
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
      const { reason } = req.body;
      const pendingCommunity = await storage.getPendingCommunity(id);
      
      if (!pendingCommunity) {
        return res.status(404).json({ success: false, error: "Community not found" });
      }

      await storage.createRejectedCommunity({
        adminTagId: pendingCommunity.adminTagId,
        name: pendingCommunity.name,
        platform: pendingCommunity.platform,
        memberCount: pendingCommunity.memberCount,
        description: pendingCommunity.description,
        tags: pendingCommunity.tags,
        category: pendingCommunity.category,
        inviteLink: pendingCommunity.inviteLink,
        visibility: pendingCommunity.visibility,
        userId: pendingCommunity.userId,
        imageUrl: pendingCommunity.imageUrl,
        rejectionReason: reason || "No reason provided",
      });

      await storage.deletePendingCommunity(id);

      res.json({ success: true, message: "Community rejected" });
    } catch (error) {
      console.error("Error rejecting community:", error);
      res.status(500).json({ success: false, error: "Failed to reject community" });
    }
  });

  app.get("/api/admin/approved", adminAuth, async (req, res) => {
    try {
      const communities = await storage.getAllApprovedCommunities();
      res.json({ success: true, communities });
    } catch (error) {
      console.error("Error fetching approved communities:", error);
      res.status(500).json({ success: false, error: "Failed to fetch approved communities" });
    }
  });

  app.delete("/api/admin/approved/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const community = await storage.getApprovedCommunity(id);
      
      if (!community) {
        return res.status(404).json({ success: false, error: "Community not found" });
      }

      await storage.deleteApprovedCommunity(id);

      res.json({ success: true, message: "Community deleted permanently" });
    } catch (error) {
      console.error("Error deleting approved community:", error);
      res.status(500).json({ success: false, error: "Failed to delete community" });
    }
  });

  app.patch("/api/admin/approved/:id/pin", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { isPinned } = req.body;
      
      if (typeof isPinned !== "boolean") {
        return res.status(400).json({ success: false, error: "isPinned must be a boolean" });
      }

      const community = await storage.getApprovedCommunity(id);
      
      if (!community) {
        return res.status(404).json({ success: false, error: "Community not found" });
      }

      const updated = await storage.togglePinCommunity(id, isPinned);

      res.json({ success: true, community: updated });
    } catch (error) {
      console.error("Error toggling pin status:", error);
      res.status(500).json({ success: false, error: "Failed to update pin status" });
    }
  });

  app.get("/api/user/submissions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [pending, approved, rejected] = await Promise.all([
        storage.getPendingCommunitiesByUserId(userId),
        storage.getApprovedCommunitiesByUserId(userId),
        storage.getRejectedCommunitiesByUserId(userId),
      ]);

      const submissions = [
        ...pending.map(c => ({ ...c, status: "pending" as const })),
        ...approved.map(c => ({ ...c, status: "approved" as const })),
        ...rejected.map(c => ({ ...c, status: "rejected" as const })),
      ];

      res.json({ success: true, submissions });
    } catch (error) {
      console.error("Error fetching user submissions:", error);
      res.status(500).json({ success: false, error: "Failed to fetch submissions" });
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

      if (!user.password) {
        return res.status(401).json({ success: false, error: "Please sign in with Google" });
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

  app.get("/api/auth/google", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ success: false, error: "Google OAuth is not configured" });
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      // Save session explicitly before redirect
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect("/login?error=session_failed");
        }
        res.redirect("/dashboard");
      });
    }
  );

  app.get("/api/auth/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const user = req.user as any;
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  });

  app.patch("/api/user/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { fullName } = req.body;
      
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({ success: false, error: "Name must be at least 2 characters" });
      }
      
      const updatedUser = await storage.updateUserProfile(userId, { fullName: fullName.trim() });
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ success: false, error: "Failed to update profile" });
    }
  });

  app.get("/api/user/communities/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [active, deleted, bumpStatus] = await Promise.all([
        storage.getActiveApprovedCommunitiesByUserId(userId),
        storage.getDeletedCommunitiesByUserId(userId),
        storage.getUserBumpStatus(userId),
      ]);

      res.json({ success: true, active, deleted, bumpStatus });
    } catch (error) {
      console.error("Error fetching user communities:", error);
      res.status(500).json({ success: false, error: "Failed to fetch communities" });
    }
  });

  app.post("/api/user/communities/:id/bump", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: "User ID is required" });
      }
      
      const result = await storage.bumpCommunity(userId, id);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          error: result.error,
          nextAvailableAt: result.nextAvailableAt
        });
      }
      
      res.json({ 
        success: true, 
        community: result.community,
        nextAvailableAt: result.nextAvailableAt
      });
    } catch (error) {
      console.error("Error bumping community:", error);
      res.status(500).json({ success: false, error: "Failed to bump community" });
    }
  });

  app.patch("/api/user/communities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, ...updates } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: "User ID is required" });
      }
      
      const validatedData = updateUserCommunitySchema.parse(updates);
      
      const updatedCommunity = await storage.updateUserCommunity(id, userId, validatedData);
      
      if (!updatedCommunity) {
        return res.status(404).json({ success: false, error: "Community not found or you don't have permission to edit it" });
      }
      
      res.json({ success: true, community: updatedCommunity });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Invalid data", details: error.errors });
      } else {
        console.error("Error updating user community:", error);
        res.status(500).json({ success: false, error: "Failed to update community" });
      }
    }
  });

  app.delete("/api/user/communities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: "User ID is required" });
      }
      
      const deletedCommunity = await storage.softDeleteApprovedCommunity(id, userId);
      
      if (!deletedCommunity) {
        return res.status(404).json({ success: false, error: "Community not found or you don't have permission to delete it" });
      }
      
      res.json({ success: true, message: "Community deleted from public view", community: deletedCommunity });
    } catch (error) {
      console.error("Error deleting user community:", error);
      res.status(500).json({ success: false, error: "Failed to delete community" });
    }
  });

  return httpServer;
}
