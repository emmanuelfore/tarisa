import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";

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
  ROLE_PERMISSIONS,
  type UserRole,
} from "@shared/schema";

const SALT_ROUNDS = 10;

declare module "express-session" {
  interface SessionData {
    userId?: number;
    userRole?: string;
    escalationLevel?: string;
    departmentId?: number | null;
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
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.active) {
        return res.status(403).json({ error: "Account is disabled" });
      }

      // Calculate permissions: Role Defaults + Custom User Permissions
      const roleDefaults = ROLE_PERMISSIONS[user.role as UserRole] || [];
      const userCustom = (user.permissions as string[]) || [];
      // Combine unique permissions
      const allPermissions = Array.from(new Set([...roleDefaults, ...userCustom]));

      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.escalationLevel = user.escalationLevel;
      req.session.departmentId = user.departmentId;
      req.session.permissions = allPermissions;

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, message: "Logged in successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal login error" });
    }
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
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.active) {
        return res.status(403).json({ error: "Account is disabled" });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.escalationLevel = user.escalationLevel;
      req.session.departmentId = user.departmentId;

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, message: "Logged in successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal login error" });
    }
  });
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
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  });

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
  app.get("/api/issues", requireAuth, async (req, res) => {
    try {
      const { status, category, citizenId, departmentId, startDate, endDate } = req.query;

      console.log("GET /api/issues request:", {
        session: req.session,
        query: req.query
      });

      if (req.session.escalationLevel) {
        const issues = await storage.listIssuesByEscalationLevel(
          req.session.escalationLevel as EscalationLevel,
          req.session.departmentId || undefined
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
      const parsed = insertIssueSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const issue = await storage.createIssue(parsed.data);
      res.status(201).json(issue);
    } catch (error) {
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
  app.get("/api/issues/:id", requireAuth, async (req, res) => {
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

      res.json(updatedIssue);
    } catch (error) {
      res.status(500).json({ error: "Failed to escalate issue" });
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
      const issue = await storage.getIssue(issueId);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      const parsed = insertCommentSchema.safeParse({ ...req.body, issueId });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }

      const comment = await storage.createComment(parsed.data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
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

  return httpServer;
}
