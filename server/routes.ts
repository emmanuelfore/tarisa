import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { sendPushNotification } from "./lib/push";

// Setup multer for photo uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'issue-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: photoStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
import { z } from "zod";
// Removed: import { scrypt, randomBytes } from "crypto";
// Removed: import { promisify } from "util";

// Removed: const scryptAsync = promisify(scrypt);

// Removed: async function hashPassword(password: string) {
// Removed:   const salt = randomBytes(16).toString("hex");
// Removed:   const buf = (await scryptAsync(password, salt, 64)) as Buffer;
// Removed:   return `${buf.toString("hex")}.${salt}`;
// Removed: }
import {
  insertCitizenSchema,
  insertDepartmentSchema,
  insertStaffSchema,
  insertIssueSchema,
  insertCommentSchema,
  insertBroadcastSchema,
  insertUserSchema,
  ROLE_HIERARCHY,
  ESCALATION_HIERARCHY,
  type User,
  type EscalationLevel,
  type Issue,
  type Department,
  type Staff,
  type Citizen,
  type Broadcast,
  type Comment,
  insertRoleSchema,
  ROLE_PERMISSIONS,
  type UserRole,
} from "@shared/schema";
import { resolveCoordinates } from "./services/location";
import { z } from "zod";

const SALT_ROUNDS = 10;

declare module "express-session" {
  interface SessionData {
    userId?: number;
    citizenId?: number; // Added for citizen auth
    userRole?: string;
    escalationLevel?: string;
    departmentId?: number | null;
    jurisdictionId?: number | null;
    permissions?: string[];
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!allowedRoles.includes(req.session.userRole || '')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session.permissions?.includes(permission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  /**
   * @swagger
   * /reports/export:
   *   get:
   *     summary: Export issues to CSV
   *     tags: [Reports]
   *     parameters:
   *       - in: query
   *         name: status
   *         schema: { type: string }
   *       - in: query
   *         name: start
   *         schema: { type: string, format: date }
   *       - in: query
   *         name: end
   *         schema: { type: string, format: date }
   *     responses:
   *       200:
   *         description: CSV file download
   */
  app.get("/api/reports/export", requireRole("super_admin", "admin", "manager"), async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        startDate: req.query.start ? new Date(req.query.start as string) : undefined,
        endDate: req.query.end ? new Date(req.query.end as string) : undefined,
      };

      const issues = await storage.listIssues(filters);

      // CSV Header
      let csv = "ID,Tracking ID,Title,Category,Status,Priority,Location,Created At,Citizen ID\n";

      // CSV Rows
      csv += issues.map(issue => {
        return [
          issue.id,
          issue.trackingId,
          `"${issue.title.replace(/"/g, '""')}"`, // Escape quotes
          issue.category,
          issue.status,
          issue.priority,
          `"${issue.location.replace(/"/g, '""')}"`,
          issue.createdAt.toISOString(),
          issue.citizenId
        ].join(",");
      }).join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="reports-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);

    } catch (error) {
      res.status(500).send("Failed to generate report");
    }
  });

  // ============ NOTIFICATIONS ROUTES ============
  /**
   * @swagger
   * /notifications:
   *   get:
   *     summary: List user notifications
   *     tags: [Notifications]
   *     responses:
   *       200:
   *         description: List of notifications
   */
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      // For citizens, we use citizenId (if linked) or just userId if we unify
      // Currently issues use citizenId, but notifications use userId in schema
      // Let's assume userId is consistent across session
      const userId = req.session.userId!;
      const notifications = await storage.listNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  /**
   * @swagger
   * /notifications/{id}/read:
   *   patch:
   *     summary: Mark notification as read
   *     tags: [Notifications]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Notification updated
   */
  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "tarisa-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      },
    })
  );




  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("[LOGIN] Request received:", { username: req.body.username, hasPassword: !!req.body.password });

      const { username, password } = req.body;
      if (!username || !password) {
        console.log("[LOGIN] Missing credentials");
        return res.status(400).json({ error: "Username and password required" });
      }

      console.log("[LOGIN] Looking up user:", username);
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log(`[LOGIN] User not found: ${username}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("[LOGIN] User found, verifying password...");
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log(`[LOGIN] Password mismatch for user: ${username}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("[LOGIN] Password valid, checking account status...");
      if (!user.active) {
        console.log("[LOGIN] Account disabled");
        return res.status(403).json({ error: "Account is disabled" });
      }

      console.log("[LOGIN] Loading permissions...");
      // Calculate permissions: Role Defaults (from DB) + Custom User Permissions
      let roleDefaults: string[] = [];
      const roleDef = await storage.getRoleBySlug(user.role);
      if (roleDef) {
        roleDefaults = roleDef.permissions as string[];
      } else {
        // Fallback or legacy support if role not found in DB
        roleDefaults = ROLE_PERMISSIONS[user.role as UserRole] || [];
      }

      const userCustom = (user.permissions as string[]) || [];
      // Combine unique permissions
      const allPermissions = Array.from(new Set([...roleDefaults, ...userCustom]));

      console.log("[LOGIN] Fetching officer details...");
      // Fetch officer details to get jurisdictionId if applicable
      const officer = await storage.getOfficerByUserId(user.id);

      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.escalationLevel = user.escalationLevel;
      req.session.departmentId = user.departmentId;
      req.session.jurisdictionId = officer?.jurisdictionId || null;
      req.session.permissions = allPermissions;

      const { password: _, ...safeUser } = user;
      console.log("[LOGIN] Success! User logged in:", { id: user.id, username: user.username, role: user.role });
      res.json({ user: safeUser, message: "Logged in successfully" });
    } catch (error) {
      console.error("[LOGIN] Error:", error);
      res.status(500).json({ error: "Internal login error" });
    }
  });

  // ============ CITIZEN AUTH ROUTES ============

  app.post("/api/auth/citizen/register", async (req, res) => {
    try {
      const parsed = insertCitizenSchema.extend({
        password: z.string().min(6), // Enforce min length
        confirmPassword: z.string().optional(),
        ward: z.string().optional(), // Match database schema
      }).safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }

      const { confirmPassword, ...citizenData } = parsed.data;

      // Check for existing citizen by email
      const existingEmail = await storage.getCitizenByEmail(citizenData.email);
      if (existingEmail) {
        return res.status(409).json({ error: "Email already exists" });
      }

      // Check for existing citizen by NID (if provided)
      if (citizenData.nid) {
        const existingNid = await storage.getCitizenByNid(citizenData.nid);
        if (existingNid) {
          return res.status(409).json({ error: "National ID already registered" });
        }
      }

      const hashedPassword = await bcrypt.hash(citizenData.password, SALT_ROUNDS);

      const citizen = await storage.createCitizen({
        ...citizenData,
        password: hashedPassword,
        status: 'pending', // Default status
        emailVerified: false,
      });

      // Auto-login
      req.session.userId = citizen.id; // Use same session ID field or separate? 
      // Re-using userId might be confusing if user and citizen IDs overlap.
      // Better to use specific citizenId field we added to session.
      req.session.citizenId = citizen.id;
      req.session.userRole = 'citizen';

      const { password: _, ...safeCitizen } = citizen;
      res.status(201).json({ user: safeCitizen, message: "Registration successful" });

    } catch (error: any) {
      console.error("Registration error full details:", {
        message: error.message,
        stack: error.stack,
        details: error
      });
      res.status(500).json({ error: "Registration failed. Please ensure all unique fields (Email/NID) are not already registered." });
    }
  });

  app.post("/api/auth/citizen/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const citizen = await storage.getCitizenByEmail(email);
      if (!citizen) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, citizen.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (citizen.status === "suspended") {
        return res.status(403).json({ error: "Account is suspended" });
      }

      req.session.citizenId = citizen.id;
      req.session.userRole = 'citizen';

      const { password: _, ...safeCitizen } = citizen;
      res.json({ user: safeCitizen, message: "Logged in successfully" });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/user", async (req, res) => {
    if (req.session.citizenId) {
      const citizen = await storage.getCitizen(req.session.citizenId);
      if (!citizen) return res.status(404).json({ error: "Citizen not found" });
      const { password, ...safeCitizen } = citizen;
      return res.json(safeCitizen);
    }

    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });


  // ============ AUTH ROUTES ============

  /**
   * @swagger
   * components:
   *   schemas:
   *     User:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *         username:
   *           type: string
   *         role:
   *           type: string
   *           enum: [citizen, officer, manager, admin, super_admin]
   *     LoginCredentials:
   *       type: object
   *       required:
   *         - username
   *         - password
   *       properties:
   *         username:
   *           type: string
   *         password:
   *           type: string
   * /auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginCredentials'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Invalid credentials
   */
  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Logout successful
   */
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).send("Failed to logout");
      res.sendStatus(200);
    });
  });

  // Password Reset Routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const citizen = await storage.getCitizenByEmail(email);
      if (!citizen) {
        // Return 200 even if not found to prevent enumeration
        return res.json({ message: "If account exists, reset instructions sent." });
      }

      // Generate simple 6-digit token for MVP
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 3600000); // 1 hour

      await storage.setResetToken(email, token, expiry);

      // In production, send email here. For MVP, log it.
      console.log(`[AUTH] Reset Token for ${email}: ${token}`);

      res.json({ message: "If account exists, reset instructions sent." });
    } catch (error) {
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;
      const citizen = await storage.getCitizenByEmail(email);

      if (!citizen || citizen.resetToken !== token || !citizen.resetTokenExpiry || new Date() > citizen.resetTokenExpiry) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await storage.updatePassword(email, hashedPassword);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Profile Update
  app.patch("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      // Allow citizen to update their own profile

      // If citizen
      if (req.session.userId) {
        // Re-fetch to ensure they exist
        const user = await storage.getUser(req.session.userId);
        if (user && user.email) {
          const citizen = await storage.getCitizenByEmail(user.email);
          if (citizen) {
            const updated = await storage.updateCitizen(citizen.id, req.body);
            return res.json(updated);
          }
        }
      }

      // Fallback if not mapped correctly or other user types
      res.status(400).json({ error: "Profile update not available for this user type" });

    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/user/push-token", requireAuth, async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: "Token required" });

      if (req.session.userId) {
        // Assuming citizen for now as main mobile user
        const user = await storage.getUser(req.session.userId);
        if (user && user.email) {
          const citizen = await storage.getCitizenByEmail(user.email);
          if (citizen) {
            await storage.savePushToken(citizen.id, token);
            return res.json({ success: true });
          }
        }
      }
      res.status(400).json({ error: "Could not associate token with user" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save push token" });
    }
  });

  // ============ ROLES API ============

  app.get("/api/roles", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.post("/api/roles", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const parsed = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(parsed);
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create role" });
    }
  });

  app.patch("/api/roles/:slug", requireAuth, requireRole("super_admin"), async (req, res) => {
    try {
      const role = await storage.updateRole(req.params.slug, req.body);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  app.delete("/api/roles/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRole(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete role" });
    }
  });

  // ============ JURISDICTIONS API ============

  app.post("/api/staff", requireAuth, async (req, res) => {
    try {
      const data = insertStaffSchema.parse(req.body);

      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: or(
          eq(users.email, data.email || ""),
          eq(users.username, data.email?.split('@')[0] || data.name.toLowerCase().replace(/\s+/g, '.'))
        )
      });

      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      // Create User
      const hashedPassword = await bcrypt.hash("officer123", SALT_ROUNDS);
      const [newUser] = await db.insert(users).values({
        name: data.name,
        email: data.email,
        username: data.email?.split('@')[0] || data.name.toLowerCase().replace(/\s+/g, '.'),
        password: hashedPassword,
        role: (data.role as any) || "officer",
        departmentId: data.departmentId,
        active: true,
        permissions: ["view_reports", "update_status"]
      }).returning();

      // Create Officer Record
      await db.insert(officers).values({
        userId: newUser.id,
        fullName: data.name,
        departmentId: data.departmentId,
        role: data.role || "officer",
        workEmail: data.email,
        isActive: true,
        employeeNumber: `EMP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      });

      res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        departmentId: newUser.departmentId,
        active: newUser.active
      });

    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.patch("/api/staff/:id", requireAuth, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { active, role, departmentId } = req.body;

    try {
      const [updatedUser] = await db.update(users)
        .set({ active, role, departmentId })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      // Update officer record if exists
      await db.update(officers)
        .set({ isActive: active, role, departmentId })
        .where(eq(officers.userId, userId));

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update staff" });
    }
  });

  app.get("/api/jurisdictions", async (req, res) => {
    try {
      const level = req.query.level as string || undefined;
      const results = await storage.listJurisdictions(level);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jurisdictions" });
    }
  });

  app.get("/api/jurisdictions/:id", async (req, res) => {
    try {
      const result = await storage.getJurisdiction(parseInt(req.params.id));
      if (!result) return res.status(404).json({ error: "Jurisdiction not found" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jurisdiction" });
    }
  });

  app.post("/api/jurisdictions", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const result = await storage.createJurisdiction(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create jurisdiction" });
    }
  });

  // ============ ISSUE CATEGORIES API ============

  app.get("/api/issue-categories", async (req, res) => {
    try {
      const results = await storage.listIssueCategories();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Alias for frontend compatibility
  app.get("/api/categories", async (req, res) => {
    try {
      const results = await storage.listIssueCategories();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.put("/api/categories/:code", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const result = await storage.updateIssueCategoryByCode(req.params.code, req.body);
      if (!result) return res.status(404).json({ error: "Category not found" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.post("/api/issue-categories", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const result = await storage.createIssueCategory(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // ============ OFFICERS API ============

  app.get("/api/officers", requireRole("super_admin", "admin", "manager"), async (req, res) => {
    try {
      const results = await storage.listOfficers();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch officers" });
    }
  });

  app.post("/api/officers", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const result = await storage.createOfficer(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create officer" });
    }
  });

  app.patch("/api/officers/:id", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const result = await storage.updateOfficer(parseInt(req.params.id), req.body);
      if (!result) return res.status(404).json({ error: "Officer not found" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update officer" });
    }
  });

  // Legacy compatibility /api/regions (optional redirect or same logic)
  app.get("/api/regions/provinces", async (req, res) => {
    const results = await storage.listJurisdictions('province');
    res.json(results);
  });

  app.get("/api/regions/authorities", async (req, res) => {
    const results = await storage.listJurisdictions('local_authority');
    res.json(results);
  });

  app.get("/api/regions/wards", async (req, res) => {
    const results = await storage.listJurisdictions('ward');
    res.json(results);
  });

  // ============ USERS/ADMIN ROUTES ============
  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Get current authenticated user
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Current user authenticated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Not authenticated
   */
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  app.get("/api/user/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.userId!);
      res.json(stats);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });


  // ============ USERS/ADMIN ROUTES ============
  /**
   * @swagger
   * /users:
   *   get:
   *     summary: List all users (Admin only)
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   */
  app.get("/api/users", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const users = await storage.listUsers();
      const safeUsers = users.map(({ password: _, ...u }) => u);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user (Admin only)
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [username, password, role]
   *             properties:
   *               username: { type: string }
   *               password: { type: string }
   *               role: { type: string }
   *               departmentId: { type: integer }
   *     responses:
   *       201:
   *         description: User created
   */
  app.post("/api/users", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }

      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(parsed.data.password, SALT_ROUNDS);
      const user = await storage.createUser({ ...parsed.data, password: hashedPassword });
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  /**
   * @swagger
   * /users/{id}:
   *   patch:
   *     summary: Update a user (Admin only)
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       200:
   *         description: User updated
   */
  app.patch("/api/users/:id", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // ============ DEPARTMENTS ROUTES ============
  /**
   * @swagger
   * /departments:
   *   get:
   *     summary: Get all departments
   *     tags: [Departments]
   *     responses:
   *       200:
   *         description: List of departments
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                   name:
   *                     type: string
   *                   type:
   *                     type: string
   */
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.listDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  });

  /**
   * @swagger
   * /departments:
   *   post:
   *     summary: Create a new department
   *     tags: [Departments]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, type]
   *             properties:
   *               name: { type: string }
   *               type: { type: string, enum: [ward, district, hq, ministry] }
   *     responses:
   *       201:
   *         description: Department created
   */
  app.post("/api/departments", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const parsed = insertDepartmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const department = await storage.createDepartment(parsed.data);
      res.status(201).json(department);
    } catch (error) {
      res.status(500).json({ error: "Failed to create department" });
    }
  });

  /**
   * @swagger
   * /departments/{id}:
   *   get:
   *     summary: Get department by ID
   *     tags: [Departments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Department details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Department'
   *       404:
   *         description: Department not found
   */
  app.get("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ error: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch department" });
    }
  });

  /**
   * @swagger
   * /departments/{id}/staff:
   *   get:
   *     summary: Get staff in a department
   *     tags: [Departments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of staff in department
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Staff'
   */
  app.get("/api/departments/:id/staff", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staffList = await storage.listStaffByDepartment(id);
      res.json(staffList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  // ============ STAFF ROUTES ============
  app.get("/api/staff", async (req, res) => {
    try {
      const staffList = await storage.listStaff();
      res.json(staffList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  /**
   * @swagger
   * /staff:
   *   post:
   *     summary: Create a new staff member
   *     tags: [Staff]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, role, departmentId]
   *             properties:
   *               name: { type: string }
   *               role: { type: string }
   *               departmentId: { type: integer }
   *               email: { type: string }
   *     responses:
   *       201:
   *         description: Staff member created
   */
  app.post("/api/staff", requireRole("super_admin", "admin", "manager"), async (req, res) => {
    try {
      const parsed = insertStaffSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const staffMember = await storage.createStaff(parsed.data);
      res.status(201).json(staffMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to create staff member" });
    }
  });

  /**
   * @swagger
   * /staff/{id}:
   *   get:
   *     summary: Get staff member by ID
   *     tags: [Staff]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Staff member details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Staff'
   *       404:
   *         description: Staff member not found
   */
  app.get("/api/staff/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staffMember = await storage.getStaff(id);
      if (!staffMember) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff member" });
    }
  });

  app.patch("/api/staff/:id", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateStaff(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update staff member" });
    }
  });

  app.delete("/api/staff/:id", requireRole("super_admin"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStaff(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete staff member" });
    }
  });

  /**
   * @swagger
   * /staff/{id}:
   *   patch:
   *     summary: Update a staff member
   *     tags: [Staff]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Staff'
   *     responses:
   *       200:
   *         description: Staff member updated
   */
  app.patch("/api/staff/:id", requireRole("super_admin", "admin", "manager"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staffMember = await storage.updateStaff(id, req.body);
      if (!staffMember) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to update staff member" });
    }
  });

  // ============ CITIZENS ROUTES ============
  /**
   * @swagger
   * /citizens:
   *   get:
   *     summary: List all citizens
   *     tags: [Citizens]
   *     responses:
   *       200:
   *         description: List of citizens
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Citizen'
   */
  app.get("/api/citizens", requireAuth, async (req, res) => {
    try {
      const citizens = await storage.listCitizens();
      res.json(citizens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch citizens" });
    }
  });

  /**
   * @swagger
   * /citizens:
   *   post:
   *     summary: Register a new citizen
   *     tags: [Citizens]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [userId, name, nationalId]
   *             properties:
   *               userId: { type: integer }
   *               name: { type: string }
   *               nationalId: { type: string }
   *               email: { type: string }
   *     responses:
   *       201:
   *         description: Citizen registered
   */
  app.post("/api/citizens", async (req, res) => {
    try {
      const parsed = insertCitizenSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }

      const existing = await storage.getCitizenByEmail(parsed.data.email);
      if (existing) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const citizen = await storage.createCitizen(parsed.data);
      res.status(201).json(citizen);
    } catch (error) {
      res.status(500).json({ error: "Failed to register citizen" });
    }
  });

  /**
   * @swagger
   * /citizens/{id}:
   *   get:
   *     summary: Get citizen by ID
   *     tags: [Citizens]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Citizen details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Citizen'
   *       404:
   *         description: Citizen not found
   */
  app.get("/api/citizens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const citizen = await storage.getCitizen(id);
      if (!citizen) {
        return res.status(404).json({ error: "Citizen not found" });
      }
      res.json(citizen);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch citizen" });
    }
  });

  /**
   * @swagger
   * /citizens/{id}/verify:
   *   post:
   *     summary: Verify a citizen's email
   *     tags: [Citizens]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Citizen verified
   */
  app.post("/api/citizens/:id/verify", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const citizen = await storage.verifyCitizenEmail(id);
      if (!citizen) {
        return res.status(404).json({ error: "Citizen not found" });
      }
      res.json(citizen);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify citizen" });
    }
  });

  app.patch("/api/citizens/:id", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Validate status if provided
      if (req.body.status && !['pending', 'verified', 'suspended'].includes(req.body.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updated = await storage.updateCitizen(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Citizen not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update citizen" });
    }
  });

  // ============ ISSUES ROUTES ============
  /**
   * @swagger
   * /issues:
   *   get:
   *     summary: List issues
   *     tags: [Issues]
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [submitted, in_progress, resolved, closed]
   *         description: Filter by status
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *     responses:
   *       200:
   *         description: List of filtered issues
   */
  /**
   * @swagger
   * /issues/my:
   *   get:
   *     summary: Get current user's issues
   *     tags: [Issues]
   *     responses:
   *       200:
   *         description: List of user's issues
   */
  app.get("/api/issues/my", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.email) {
        return res.json([]);
      }

      const citizen = await storage.getCitizenByEmail(user.email);
      if (!citizen) {
        return res.json([]);
      }

      const issues = await storage.listIssues({ citizenId: citizen.id });
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch your issues" });
    }
  });

  // STAFF MANAGEMENT (Migrated to use Users/Officers)
  app.get("/api/staff", requireAuth, async (req, res) => {
    // Return users who have roles that are considered "staff"
    const staffUsers = await db.query.users.findMany({
      where: inArray(users.role, ["admin", "manager", "officer", "super_admin"]),
      with: {
        department: true,
      },
      orderBy: desc(users.createdAt),
    });

    // Map to match the interface expected by the frontend
    const mappedStaff = staffUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      departmentId: u.departmentId,
      active: u.active
    }));

    res.json(mappedStaff);
  });

  app.get("/api/issues", requireAuth, async (req, res) => {
    try {
      const { status, category, citizenId, departmentId, startDate, endDate } = req.query;

      console.log("GET /api/issues request:", {
        session: req.session,
        query: req.query
      });

      // Super admin sees all issues, bypass escalation filtering
      if (req.session.userRole !== 'super_admin' && req.session.escalationLevel) {
        const issues = await storage.listIssuesByEscalationLevel(
          req.session.escalationLevel as EscalationLevel,
          req.session.departmentId || undefined,
          req.session.jurisdictionId || undefined,
          startDate ? new Date(startDate as string) : undefined,
          endDate ? new Date(endDate as string) : undefined
        );
        return res.json(issues);
      }

      const filters: any = {};
      if (status) filters.status = status as string;
      if (category) filters.category = category as string;
      if (citizenId) filters.citizenId = parseInt(citizenId as string);
      if (departmentId) filters.departmentId = parseInt(departmentId as string);
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const issues = await storage.listIssues(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch issues" });
    }
  });

  /**
   * @swagger
   * /issues:
   *   post:
   *     summary: Create a new issue report
   *     tags: [Issues]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, category, location, priority]
   *             properties:
   *               title: { type: string }
   *               description: { type: string }
   *               category: { type: string }
   *               location: { type: string }
   *               priority: { type: string }
   *               coordinates: { type: object, properties: { lat: { type: number }, lng: { type: number } } }
   *     responses:
   *       201:
   *         description: Issue created
   */
  app.post("/api/issues", async (req, res) => {
    try {
      let citizenId: number;

      // Check if user is logged in
      if (req.session.userId) {
        // Bridge User -> Citizen
        const user = await storage.getUser(req.session.userId);
        if (user && user.email) {
          const citizen = await storage.getCitizenByEmail(user.email);
          if (citizen) {
            citizenId = citizen.id;
          } else {
            // Link by creating a citizen record for this user
            const newCitizen = await storage.createCitizen({
              name: user.name,
              email: user.email,
              phone: "Verified User",
              address: "Verified User",
              ward: "Unknown",
              emailVerified: true,
              status: 'verified'
            });
            citizenId = newCitizen.id;
          }
        } else {
          // Fallback if user found but no email (unlikely)
          const anonymous = await storage.getOrCreateAnonymousCitizen();
          citizenId = anonymous.id;
        }
      } else {
        // Guest / Anonymous User
        if (req.body.citizenId) {
          citizenId = req.body.citizenId;
        } else {
          const anonymous = await storage.getOrCreateAnonymousCitizen();
          citizenId = anonymous.id;
        }
      }

      const parsed = insertIssueSchema.safeParse({
        ...req.body,
        citizenId,
        autoAssigned: req.body.autoAssigned ?? false
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const issue = await storage.createIssue(parsed.data);
      res.status(201).json(issue);
    } catch (error) {
      console.error("Issue creation error:", error);
      res.status(500).json({ error: "Failed to create issue" });
    }
  });

  /**
   * @swagger
   * /issues/anonymous:
   *   post:
   *     summary: Submit an anonymous issue
   *     tags: [Issues]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, description, category, location]
   *             properties:
   *               title: { type: string }
   *               description: { type: string }
   *               category: { type: string }
   *               location: { type: string }
   *               priority: { type: string }
   *     responses:
   *       201:
   *         description: Anonymous issue submitted
   */
  app.post("/api/issues/anonymous", async (req, res) => {
    try {
      const { title, description, category, location, coordinates, priority, severity, photos } = req.body;

      if (!title || !description || !category || !location) {
        return res.status(400).json({ error: "Title, description, category, and location are required" });
      }

      // Get or create the anonymous citizen
      const anonymousCitizen = await storage.getOrCreateAnonymousCitizen();

      const issue = await storage.createIssue({
        title,
        description,
        category,
        location,
        coordinates: coordinates || null,
        priority: priority || "medium",
        severity: severity || 50,
        citizenId: anonymousCitizen.id,
        jurisdictionId: req.body.jurisdictionId || null,
        wardNumber: req.body.wardNumber || null,
        suburb: req.body.suburb || null,
        photos: photos || [],
      });

      res.status(201).json({
        trackingId: issue.trackingId,
        message: "Anonymous report submitted successfully. Save your tracking ID to check status."
      });
    } catch (error) {
      console.error("Anonymous submission error:", error);
      res.status(500).json({ error: "Failed to submit anonymous report" });
    }
  });

  /**
   * @swagger
   * /upload/photo:
   *   post:
   *     summary: Upload photos for an issue
   *     tags: [Uploads]
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               photos:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       200:
   *         description: Photos uploaded successfully
   */
  app.post("/api/upload/photo", upload.array('photos', 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const urls = files.map(file => `/uploads/${file.filename}`);
      res.json({ urls, message: `Successfully uploaded ${files.length} photo(s)` });
    } catch (error) {
      console.error("Photo upload error:", error);
      res.status(500).json({ error: "Failed to upload photos" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  /**
   * @swagger
   * /issues/nearby:
   *   get:
   *     summary: Check for nearby active issues
   *     tags: [Issues]
   *     parameters:
   *       - in: query
   *         name: lat
   *         required: true
   *         schema: { type: number }
   *       - in: query
   *         name: lng
   *         required: true
   *         schema: { type: number }
   *       - in: query
   *         name: radius
   *         schema: { type: number, default: 0.05 }
   *     responses:
   *       200:
   *         description: List of nearby issues
   */
  app.get("/api/issues/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : 0.05;

      if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ error: "Lat/Lng required" });

      const nearby = await storage.getNearbyIssues(lat, lng, radius);
      res.json(nearby);
    } catch (error) {
      res.status(500).json({ error: "Failed to check nearby issues" });
    }
  });

  /**
   * @swagger
   * /issues/{id}:
   *   get:
   *     summary: Get issue details by ID
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Issue details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Issue'
   *       404:
   *         description: Issue not found
   */
  app.get("/api/issues/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.getIssue(id);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      if (req.session.escalationLevel) {
        const userLevel = ESCALATION_HIERARCHY[req.session.escalationLevel as EscalationLevel];
        const issueLevel = ESCALATION_HIERARCHY[issue.escalationLevel as EscalationLevel];
        if (issueLevel > userLevel && req.session.userRole !== 'super_admin') {
          return res.status(403).json({ error: "Issue escalation level exceeds your access" });
        }
      }

      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch issue" });
    }
  });

  /**
   * @swagger
   * /issues/tracking/{trackingId}:
   *   get:
   *     summary: Get issue by Tracking ID
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: trackingId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Issue details
   *       404:
   *         description: Issue not found
   */
  app.get("/api/issues/tracking/:trackingId", async (req, res) => {
    try {
      const issue = await storage.getIssueByTrackingId(req.params.trackingId);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch issue" });
    }
  });


  /**
   * @swagger
   * /issues/{id}/upvotes:
   *   get:
   *     summary: Get upvote count and status
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Upvote details
   */
  app.get("/api/issues/:id/upvotes", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const count = await storage.getUpvoteCount(id);
      let userUpvoted = false;

      // Check if current user upvoted
      if (req.session.userId) {
        // Bridge user -> citizen logic if needed, but for now we just track by user ID
        // Note: storage.toggleUpvote uses userId directly in the upvotes table 
        // which links to users(id) or citizens(id) depending on implementation.
        // Let's assume userId is consistent.
        userUpvoted = await storage.hasUserUpvoted(id, req.session.userId);
      }

      res.json({ count, userUpvoted });
    } catch (error) {
      res.status(500).json({ error: "Failed to get upvotes" });
    }
  });

  /**
   * @swagger
   * /issues/{id}/upvote:
   *   post:
   *     summary: Toggle upvote for an issue
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Upvote toggled
   */
  app.post("/api/issues/:id/upvote", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });

      const result = await storage.toggleUpvote(id, req.session.userId, req.session.userRole || 'citizen');
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle upvote" });
    }
  });

  /**
   * @swagger
   * /issues/{id}:
   *   patch:
   *     summary: Update an issue
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Issue'
   *     responses:
   *       200:
   *         description: Issue updated
   *       404:
   *         description: Issue not found
   *       403:
   *         description: Unauthorized
   */
  app.patch("/api/issues/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingIssue = await storage.getIssue(id);
      if (!existingIssue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      if (req.session.escalationLevel) {
        const userLevel = ESCALATION_HIERARCHY[req.session.escalationLevel as EscalationLevel];
        const issueLevel = ESCALATION_HIERARCHY[existingIssue.escalationLevel as EscalationLevel];
        if (issueLevel > userLevel && req.session.userRole !== 'super_admin') {
          return res.status(403).json({ error: "Cannot modify issue above your escalation level" });
        }
      }

      const issue = await storage.updateIssue(id, req.body);

      // Notification Logic: Status Change
      if (req.body.status && req.body.status !== existingIssue.status) {
        const notif = await storage.createNotification({
          userId: existingIssue.citizenId,
          title: 'Issue Status Updated',
          message: `Your report "${existingIssue.title}" has been updated to ${req.body.status}.`,
          type: 'info'
        });

        // Push Notification
        const citizen = await storage.getCitizen(existingIssue.citizenId);
        if (citizen && citizen.pushToken) {
          await sendPushNotification(citizen.pushToken, notif.title, notif.message, { issueId: id });
        }
      }

      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to update issue" });
    }
  });

  /**
   * @swagger
   * /issues/{id}/assign:
   *   post:
   *     summary: Assign an issue to department/staff
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               departmentId: { type: integer }
   *               staffId: { type: integer }
   *               escalationLevel: { type: string }
   *     responses:
   *       200:
   *         description: Issue assigned
   */
  app.post("/api/issues/:id/assign", requireRole("super_admin", "admin", "manager"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { departmentId, staffId, escalationLevel } = req.body;

      const existingIssue = await storage.getIssue(id);
      if (!existingIssue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      const newLevel = escalationLevel || existingIssue.escalationLevel;

      if (req.session.escalationLevel && req.session.userRole !== 'super_admin') {
        const userLevel = ESCALATION_HIERARCHY[req.session.escalationLevel as EscalationLevel];
        const targetLevel = ESCALATION_HIERARCHY[newLevel as EscalationLevel];
        if (targetLevel > userLevel) {
          return res.status(403).json({ error: "Cannot escalate above your level" });
        }
      }

      const issue = await storage.assignIssue(id, departmentId || null, staffId || null, newLevel);
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign issue" });
    }
  });

  /**
   * @swagger
   * /issues/{id}/escalate:
   *   post:
   *     summary: Escalate an issue to the next level
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Issue escalated
   */
  app.post("/api/issues/:id/escalate", requireRole("super_admin", "admin", "manager"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.getIssue(id);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      const levels: EscalationLevel[] = ['L1', 'L2', 'L3', 'L4'];
      const currentIndex = levels.indexOf(issue.escalationLevel as EscalationLevel);
      if (currentIndex >= levels.length - 1) {
        return res.status(400).json({ error: "Issue is already at maximum escalation level" });
      }

      const nextLevel = levels[currentIndex + 1];
      const updatedIssue = await storage.assignIssue(
        id,
        issue.assignedDepartmentId,
        issue.assignedStaffId,
        nextLevel
      );

      await storage.createTimeline({
        issueId: id,
        type: 'escalated',
        title: 'Issue Escalated',
        description: `Escalated from ${issue.escalationLevel} to ${nextLevel}`,
        user: req.session.userRole || 'System',
      });

      // Notify Citizen
      const notif = await storage.createNotification({
        userId: issue.citizenId,
        title: 'Issue Escalated',
        message: `Your report "${issue.title}" has been escalated to ${nextLevel} for further attention.`,
        type: 'info'
      });

      // Push Notification
      const citizen = await storage.getCitizen(issue.citizenId);
      if (citizen && citizen.pushToken) {
        await sendPushNotification(citizen.pushToken, notif.title, notif.message, { issueId: id });
      }

      res.json(updatedIssue);
    } catch (error) {
      res.status(500).json({ error: "Failed to escalate issue" });
    }
  });

  /**
   * @swagger
   * /issues/{id}/timeline:
   *   get:
   *     summary: Get timeline events for an issue
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of timeline events
   */
  app.get("/api/issues/:id/timeline", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timeline = await storage.listTimelineByIssue(id);
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timeline" });
    }
  });

  // ============ COMMENTS ROUTES ============
  /**
   * @swagger
   * /issues/{id}/comments:
   *   get:
   *     summary: Get comments for an issue
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of comments
   */
  app.get("/api/issues/:id/comments", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commentsList = await storage.listCommentsByIssue(id);
      res.json(commentsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  /**
   * @swagger
   * /issues/{id}/comments:
   *   post:
   *     summary: Add a comment to an issue
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [content, authorName]
   *             properties:
   *               content: { type: string }
   *               authorName: { type: string }
   *     responses:
   *       201:
   *         description: Comment created
   */
  app.post("/api/issues/:id/comments", async (req, res) => {
    try {
      const issueId = parseInt(req.params.id);
      let userId: number;
      let userType: string;
      let userName: string;

      if (req.session.citizenId) {
        const citizen = await storage.getCitizen(req.session.citizenId);
        if (!citizen) return res.status(404).json({ error: "Citizen not found" });
        userId = citizen.id;
        userType = 'citizen';
        userName = citizen.name;
      } else if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        userId = user.id;
        userType = user.role;
        userName = user.name;
      } else {
        return res.status(401).json({ error: "Authentication required to comment" });
      }

      const parsed = insertCommentSchema.safeParse({
        ...req.body,
        issueId,
        userId,
        userType,
        userName
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }

      const comment = await storage.createComment(parsed.data);

      // Notify Citizen if comment is from Admin/Staff
      if (req.session.userRole && req.session.userRole !== 'citizen') {
        const issue = await storage.getIssue(issueId);
        if (issue) {
          const notif = await storage.createNotification({
            userId: issue.citizenId,
            title: 'New Comment on Report',
            message: `Official Update: ${parsed.data.text.substring(0, 50)}${parsed.data.text.length > 50 ? '...' : ''}`,
            type: 'info'
          });

          // Push Notification
          const citizen = await storage.getCitizen(issue.citizenId);
          if (citizen && citizen.pushToken) {
            await sendPushNotification(citizen.pushToken, notif.title, notif.message, { issueId: issueId });
          }
        }
      }

      res.status(201).json(comment);
    } catch (error) {
      console.error("Failed to create comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.get("/api/issues/map", async (req, res) => {
    try {
      const data = await storage.getIssuesForMap();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch map data" });
    }
  });

  app.post("/api/issues/:id/upvote", requireAuth, async (req, res) => {
    try {
      const issueId = parseInt(req.params.id);
      const userId = req.session.userId!;
      // Assuming citizen role
      const result = await storage.toggleUpvote(issueId, userId, "citizen");
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: "Failed to toggle upvote" });
    }
  });

  app.get("/api/issues/:id/upvotes", async (req, res) => {
    try {
      const issueId = parseInt(req.params.id);
      const count = await storage.getUpvoteCount(issueId);
      const userUpvoted = req.session.userId
        ? await storage.hasUserUpvoted(issueId, req.session.userId)
        : false;
      res.json({ count, userUpvoted });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch upvotes" });
    }
  });

  // ============ TIMELINE ROUTES ============
  /**
   * @swagger
   * /issues/{id}/timeline:
   *   get:
   *     summary: Get timeline for an issue
   *     tags: [Issues]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Timeline events
   */
  app.get("/api/issues/:id/timeline", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timelineEntries = await storage.listTimelineByIssue(id);
      res.json(timelineEntries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timeline" });
    }
  });

  // ============ BROADCASTS ROUTES ============
  /**
   * @swagger
   * /broadcasts:
   *   get:
   *     summary: List broadcasts
   *     tags: [Broadcasts]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of broadcasts
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Broadcast'
   */
  app.get("/api/broadcasts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const broadcastsList = await storage.listBroadcasts(limit);
      res.json(broadcastsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch broadcasts" });
    }
  });

  /**
   * @swagger
   * /broadcasts:
   *   post:
   *     summary: Create a broadcast
   *     tags: [Broadcasts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, message]
   *             properties:
   *               title: { type: string }
   *               message: { type: string }
   *               type: { type: string }
   *     responses:
   *       201:
   *         description: Broadcast created
   */
  app.post("/api/broadcasts", requireRole("super_admin", "admin", "manager"), async (req, res) => {
    try {
      const parsed = insertBroadcastSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const broadcast = await storage.createBroadcast(parsed.data);
      res.status(201).json(broadcast);
    } catch (error) {
      res.status(500).json({ error: "Failed to create broadcast" });
    }
  });

  // ============ CREDITS ROUTES ============
  /**
   * @swagger
   * /citizens/{id}/credits:
   *   get:
   *     summary: Get citizen credits
   *     tags: [Citizens]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Citizen credit balance
   */
  app.get("/api/citizens/:id/credits", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const total = await storage.getCitizenCredits(id);
      res.json({ citizenId: id, totalCredits: total });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch credits" });
    }
  });

  /**
   * @swagger
   * /citizens/{id}/credits/history:
   *   get:
   *     summary: Get citizen credit history
   *     tags: [Citizens]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Citizen credit history
   */
  app.get("/api/citizens/:id/credits/history", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const history = await storage.listCreditHistory(id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch credit history" });
    }
  });

  // ============ ANALYTICS ROUTES ============
  /**
   * @swagger
   * /analytics:
   *   get:
   *     summary: Get analytics data
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Analytics summaries
   */
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // ============ EXPORT ROUTES ============
  /**
   * @swagger
   * /export/issues:
   *   get:
   *     summary: Export issues to CSV/JSON
   *     tags: [Export]
   *     parameters:
   *       - in: query
   *         name: format
   *         schema:
   *           type: string
   *           enum: [csv, json]
   *     responses:
   *       200:
   *         description: Exported data
   */
  app.get("/api/export/issues", requireRole("super_admin", "admin", "manager"), async (req, res) => {
    try {
      const { format } = req.query;
      const issues = await storage.listIssues();
      const departments = await storage.listDepartments();
      const staff = await storage.listStaff();

      // Enrich issues with department and staff names
      const enrichedIssues = issues.map((issue: Issue) => {
        const dept = departments.find((d: Department) => d.id === issue.assignedDepartmentId);
        const staffMember = staff.find((s: Staff) => s.id === issue.assignedStaffId);
        return {
          ...issue,
          departmentName: dept?.name || "Unassigned",
          staffName: staffMember?.name || "Unassigned",
        };
      });

      if (format === "csv") {
        const headers = ["Tracking ID", "Title", "Category", "Location", "Status", "Priority", "Escalation", "Department", "Staff", "Created"];
        const rows = enrichedIssues.map((issue: any) => [
          issue.trackingId,
          `"${issue.title.replace(/"/g, '""')}"`,
          issue.category,
          `"${issue.location.replace(/"/g, '""')}"`,
          issue.status,
          issue.priority,
          issue.escalationLevel,
          `"${issue.departmentName}"`,
          `"${issue.staffName}"`,
          issue.createdAt ? new Date(issue.createdAt).toISOString().split("T")[0] : "",
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=tarisa-issues-${new Date().toISOString().split("T")[0]}.csv`);
        return res.send(csvContent);
      }

      // Default: return JSON
      res.json(enrichedIssues);
    } catch (error) {
      res.status(500).json({ error: "Failed to export issues" });
    }
  });

  // Generate HTML report for printing/PDF (protected)
  app.get("/api/export/report", requireRole("super_admin", "admin", "manager"), async (req, res) => {
    try {
      const issues = await storage.listIssues();
      const analytics = await storage.getAnalytics();
      const departments = await storage.listDepartments();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>TARISA Issues Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; }
    .stat { background: #f0f4f8; padding: 20px; border-radius: 8px; text-align: center; }
    .stat h2 { margin: 0; font-size: 32px; color: #1a365d; }
    .stat p { margin: 5px 0 0; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #1a365d; color: white; }
    tr:nth-child(even) { background: #f8f9fa; }
    .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .status-submitted { background: #fef3c7; color: #92400e; }
    .status-in_progress { background: #dbeafe; color: #1e40af; }
    .status-resolved { background: #d1fae5; color: #065f46; }
    .status-verified { background: #e0e7ff; color: #3730a3; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
    @media print { body { margin: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>TARISA CivicSignal - Issues Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="stat"><h2>${analytics.totalIssues}</h2><p>Total Reports</p></div>
    <div class="stat"><h2>${analytics.resolvedIssues}</h2><p>Resolved</p></div>
    <div class="stat"><h2>${analytics.pendingIssues}</h2><p>Pending</p></div>
  </div>
  
  <h2>All Issues (${issues.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Tracking ID</th>
        <th>Title</th>
        <th>Category</th>
        <th>Location</th>
        <th>Status</th>
        <th>Priority</th>
        <th>Escalation</th>
      </tr>
    </thead>
    <tbody>
      ${issues.map(issue => `
        <tr>
          <td>${issue.trackingId}</td>
          <td>${issue.title}</td>
          <td>${issue.category}</td>
          <td>${issue.location}</td>
          <td><span class="status status-${issue.status}">${issue.status.replace('_', ' ').toUpperCase()}</span></td>
          <td>${issue.priority}</td>
          <td>${issue.escalationLevel}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p>City of Harare - TARISA CivicSignal Platform</p>
  </div>
  
  <script class="no-print">
    // Auto-print when opened for PDF generation
    if (window.location.search.includes('print=true')) {
      window.onload = () => window.print();
    }
  </script>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // ============ DEPARTMENTS CRUD ============

  app.get("/api/departments", async (req, res) => {
    try {
      const depts = await db.select().from(departments);
      res.json(depts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const [dept] = await db.select().from(departments).where(eq(departments.id, parseInt(req.params.id)));
      if (!dept) {
        return res.status(404).json({ error: "Department not found" });
      }
      res.json(dept);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch department" });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const [newDept] = await db.insert(departments).values(req.body).returning();
      res.status(201).json(newDept);
    } catch (error) {
      res.status(500).json({ error: "Failed to create department" });
    }
  });

  app.put("/api/departments/:id", async (req, res) => {
    try {
      const [updated] = await db
        .update(departments)
        .set(req.body)
        .where(eq(departments.id, parseInt(req.params.id)))
        .returning();
      if (!updated) {
        return res.status(404).json({ error: "Department not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update department" });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    try {
      await db.delete(departments).where(eq(departments.id, parseInt(req.params.id)));
      res.json({ message: "Department deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete department" });
    }
  });

  // ============ CATEGORIES CRUD ============

  app.get("/api/categories", async (req, res) => {
    try {
      const cats = await db.select().from(issueCategories);
      res.json(cats);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:code", async (req, res) => {
    try {
      const [cat] = await db.select().from(issueCategories).where(eq(issueCategories.code, req.params.code));
      if (!cat) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(cat);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const [newCat] = await db.insert(issueCategories).values(req.body).returning();
      res.status(201).json(newCat);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:code", async (req, res) => {
    try {
      const [updated] = await db
        .update(issueCategories)
        .set(req.body)
        .where(eq(issueCategories.code, req.params.code))
        .returning();
      if (!updated) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:code", async (req, res) => {
    try {
      await db.delete(issueCategories).where(eq(issueCategories.code, req.params.code));
      res.json({ message: "Category deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  return httpServer;
}
