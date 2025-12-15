import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage";
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
} from "@shared/schema";

const SALT_ROUNDS = 10;

declare module "express-session" {
  interface SessionData {
    userId?: number;
    userRole?: string;
    escalationLevel?: string;
    departmentId?: number | null;
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
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  // ============ AUTH ROUTES ============
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
      res.json({ user: safeUser });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  });

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
  app.get("/api/users", requireRole("super_admin", "admin"), async (req, res) => {
    try {
      const users = await storage.listUsers();
      const safeUsers = users.map(({ password: _, ...u }) => u);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

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
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.listDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  });

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

  // ============ CITIZENS ROUTES ============
  app.get("/api/citizens", requireAuth, async (req, res) => {
    try {
      const citizens = await storage.listCitizens();
      res.json(citizens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch citizens" });
    }
  });

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
  app.get("/api/issues", requireAuth, async (req, res) => {
    try {
      const { status, category, citizenId, departmentId, startDate, endDate } = req.query;

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
  app.get("/api/issues/:id/comments", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commentsList = await storage.listCommentsByIssue(id);
      res.json(commentsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

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
  app.get("/api/broadcasts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const broadcastsList = await storage.listBroadcasts(limit);
      res.json(broadcastsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch broadcasts" });
    }
  });

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

  // ============ ANALYTICS ROUTES ============
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  return httpServer;
}
