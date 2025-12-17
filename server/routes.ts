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

  // Anonymous issue submission (for elderly/ICT-challenged users)
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

  // Photo upload endpoint
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

  // ============ CREDITS ROUTES ============
  app.get("/api/citizens/:id/credits", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const total = await storage.getCitizenCredits(id);
      res.json({ citizenId: id, totalCredits: total });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch credits" });
    }
  });

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
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // ============ EXPORT ROUTES ============
  app.get("/api/export/issues", requireRole("super_admin", "admin", "manager"), async (req, res) => {
    try {
      const { format } = req.query;
      const issues = await storage.listIssues();
      const departments = await storage.listDepartments();
      const staff = await storage.listStaff();

      // Enrich issues with department and staff names
      const enrichedIssues = issues.map(issue => {
        const dept = departments.find(d => d.id === issue.assignedDepartmentId);
        const staffMember = staff.find(s => s.id === issue.assignedStaffId);
        return {
          ...issue,
          departmentName: dept?.name || "Unassigned",
          staffName: staffMember?.name || "Unassigned",
        };
      });

      if (format === "csv") {
        const headers = ["Tracking ID", "Title", "Category", "Location", "Status", "Priority", "Escalation", "Department", "Staff", "Created"];
        const rows = enrichedIssues.map(issue => [
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
