
import {
  citizens, departments, staff, issues, comments, timeline, broadcasts, users, credits,
  type Citizen, type InsertCitizen,
  type Department, type InsertDepartment,
  type Staff, type InsertStaff,
  type Issue, type InsertIssue,
  type Comment, type InsertComment,
  type Timeline, type InsertTimeline,
  type Broadcast, type InsertBroadcast,
  type Credit, type InsertCredit,
  type User, type InsertUser,
  ESCALATION_HIERARCHY,
  type EscalationLevel,
  CREDIT_VALUES,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, gte, lte, inArray, count } from "drizzle-orm";

export interface IStorage {
  // Citizens
  getCitizen(id: number): Promise<Citizen | undefined>;
  getCitizenByEmail(email: string): Promise<Citizen | undefined>;
  getOrCreateAnonymousCitizen(): Promise<Citizen>;
  createCitizen(citizen: InsertCitizen): Promise<Citizen>;
  updateCitizen(id: number, data: Partial<InsertCitizen>): Promise<Citizen | undefined>;
  listCitizens(): Promise<Citizen[]>;
  verifyCitizenEmail(id: number): Promise<Citizen | undefined>;

  // Departments
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  listDepartments(): Promise<Department[]>;

  // Staff
  getStaff(id: number): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  listStaff(): Promise<Staff[]>;
  listStaffByDepartment(departmentId: number): Promise<Staff[]>;
  updateStaff(id: number, data: Partial<InsertStaff>): Promise<Staff | undefined>;

  // Issues
  getIssue(id: number): Promise<Issue | undefined>;
  getIssueByTrackingId(trackingId: string): Promise<Issue | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, data: Partial<InsertIssue>): Promise<Issue | undefined>;
  listIssues(filters?: {
    status?: string;
    category?: string;
    citizenId?: number;
    departmentId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Issue[]>;
  assignIssue(issueId: number, departmentId: number | null, staffId: number | null, escalationLevel: string): Promise<Issue | undefined>;

  // Analytics
  getAnalytics(): Promise<{
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    categoryCounts: Record<string, number>;
    priorityCounts: Record<string, number>;
  }>;

  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  listCommentsByIssue(issueId: number): Promise<Comment[]>;

  // Timeline
  createTimeline(timeline: InsertTimeline): Promise<Timeline>;
  listTimelineByIssue(issueId: number): Promise<Timeline[]>;

  // Broadcasts
  createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast>;
  listBroadcasts(limit?: number): Promise<Broadcast[]>;

  // Credits
  awardCredits(citizenId: number, amount: number, reason: string, issueId?: number): Promise<Credit>;
  getCitizenCredits(citizenId: number): Promise<number>;
  listCreditHistory(citizenId: number): Promise<Credit[]>;

  // Admin Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;

  // Role-based issue access
  listIssuesByEscalationLevel(escalationLevel: EscalationLevel, departmentId?: number): Promise<Issue[]>;

  // Analytics
  getAnalytics(): Promise<{
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    categoryCounts: Record<string, number>;
    priorityCounts: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Citizens
  async getCitizen(id: number): Promise<Citizen | undefined> {
    const [citizen] = await db.select().from(citizens).where(eq(citizens.id, id));
    return citizen || undefined;
  }

  async getCitizenByEmail(email: string): Promise<Citizen | undefined> {
    const [citizen] = await db.select().from(citizens).where(eq(citizens.email, email));
    return citizen || undefined;
  }

  async getOrCreateAnonymousCitizen(): Promise<Citizen> {
    const anonymousEmail = "anonymous@tarisa.gov.zw";
    let citizen = await this.getCitizenByEmail(anonymousEmail);
    if (!citizen) {
      citizen = await this.createCitizen({
        name: "Anonymous Citizen",
        email: anonymousEmail,
        phone: "N/A",
        address: "N/A",
        ward: "N/A",
        emailVerified: true,
        status: "verified",
      });
    }
    return citizen;
  }

  async createCitizen(insertCitizen: InsertCitizen): Promise<Citizen> {
    const [citizen] = await db.insert(citizens).values(insertCitizen).returning();
    return citizen;
  }

  async updateCitizen(id: number, data: Partial<InsertCitizen>): Promise<Citizen | undefined> {
    const [citizen] = await db.update(citizens).set(data).where(eq(citizens.id, id)).returning();
    return citizen || undefined;
  }

  async listCitizens(): Promise<Citizen[]> {
    return await db.select().from(citizens).orderBy(desc(citizens.createdAt));
  }

  async verifyCitizenEmail(id: number): Promise<Citizen | undefined> {
    const [citizen] = await db
      .update(citizens)
      .set({ emailVerified: true, status: 'verified', verifiedAt: new Date() })
      .where(eq(citizens.id, id))
      .returning();
    return citizen || undefined;
  }

  // Departments
  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [department] = await db.insert(departments).values(insertDepartment).returning();
    return department;
  }

  async listDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  // Staff
  async getStaff(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const [staffMember] = await db.insert(staff).values(insertStaff).returning();
    return staffMember;
  }

  async listStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }

  async listStaffByDepartment(departmentId: number): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.departmentId, departmentId));
  }

  async updateStaff(id: number, data: Partial<InsertStaff>): Promise<Staff | undefined> {
    const [staffMember] = await db.update(staff).set(data).where(eq(staff.id, id)).returning();
    return staffMember || undefined;
  }

  // Issues
  async getIssue(id: number): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    return issue || undefined;
  }

  async getIssueByTrackingId(trackingId: string): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.trackingId, trackingId));
    return issue || undefined;
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const year = new Date().getFullYear();
    const [issueCount] = await db.select({ count: count() }).from(issues);
    const trackingId = `TAR - ${year} -${String(Number(issueCount.count) + 1).padStart(4, '0')} `;

    const photosArray: string[] = Array.isArray(insertIssue.photos) ? [...insertIssue.photos] : [];

    // Auto-assign department based on category (lookup by name pattern)
    let autoAssignedDepartmentId = insertIssue.assignedDepartmentId ?? null;

    if (!autoAssignedDepartmentId) {
      const categoryToNamePattern: Record<string, string> = {
        'water': 'Water',
        'roads': 'Roads',
        'sewer': 'Sewer',
        'lights': 'Lights',
        'waste': 'Waste',
      };
      const pattern = categoryToNamePattern[insertIssue.category.toLowerCase()];
      if (pattern) {
        const allDepts = await this.listDepartments();
        const matchingDept = allDepts.find(d => d.name.toLowerCase().includes(pattern.toLowerCase()));
        autoAssignedDepartmentId = matchingDept?.id ?? null;
      }
    }

    const [issue] = await db.insert(issues).values({
      title: insertIssue.title,
      description: insertIssue.description,
      category: insertIssue.category,
      location: insertIssue.location,
      citizenId: insertIssue.citizenId,
      trackingId,
      coordinates: insertIssue.coordinates ?? null,
      status: insertIssue.status ?? 'submitted',
      priority: insertIssue.priority ?? 'medium',
      severity: insertIssue.severity ?? 50,
      escalationLevel: insertIssue.escalationLevel ?? 'L1',
      assignedDepartmentId: autoAssignedDepartmentId,
      assignedStaffId: insertIssue.assignedStaffId ?? null,
      photos: photosArray,
    }).returning();

    await this.createTimeline({
      issueId: issue.id,
      type: 'created',
      title: 'Report Submitted',
      description: 'Issue reported by citizen',
      user: 'System',
    });

    // Add timeline entry for auto-assignment if department was assigned
    if (autoAssignedDepartmentId && !insertIssue.assignedDepartmentId) {
      const dept = await this.getDepartment(autoAssignedDepartmentId);
      await this.createTimeline({
        issueId: issue.id,
        type: 'assigned',
        title: 'Auto-Assigned to Department',
        description: `Automatically assigned to ${dept?.name || 'department'} based on category`,
        user: 'System',
      });
    }

    // Award credits for registered citizens (not anonymous)
    const citizen = await this.getCitizen(insertIssue.citizenId);
    if (citizen && citizen.email !== "anonymous@tarisa.gov.zw") {
      await this.awardCredits(
        citizen.id,
        CREDIT_VALUES.report_submitted,
        'report_submitted',
        issue.id
      );

      // Bonus for including photos
      if (photosArray.length > 0) {
        await this.awardCredits(
          citizen.id,
          CREDIT_VALUES.report_photo,
          'report_photo',
          issue.id
        );
      }
    }

    return issue;
  }

  async updateIssue(id: number, data: Partial<InsertIssue>): Promise<Issue | undefined> {
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.coordinates !== undefined) updateData.coordinates = data.coordinates;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.severity !== undefined) updateData.severity = data.severity;
    if (data.escalationLevel !== undefined) updateData.escalationLevel = data.escalationLevel;
    if (data.assignedDepartmentId !== undefined) updateData.assignedDepartmentId = data.assignedDepartmentId;
    if (data.assignedStaffId !== undefined) updateData.assignedStaffId = data.assignedStaffId;
    if (data.photos !== undefined) updateData.photos = data.photos;

    const [issue] = await db
      .update(issues)
      .set(updateData)
      .where(eq(issues.id, id))
      .returning();
    return issue || undefined;
  }

  async listIssues(filters?: {
    status?: string;
    category?: string;
    citizenId?: number;
    departmentId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Issue[]> {
    let query = db.select().from(issues);

    const conditions = [];
    if (filters?.status) conditions.push(eq(issues.status, filters.status));
    if (filters?.category) conditions.push(eq(issues.category, filters.category));
    if (filters?.citizenId) conditions.push(eq(issues.citizenId, filters.citizenId));
    if (filters?.departmentId) conditions.push(eq(issues.assignedDepartmentId, filters.departmentId));
    if (filters?.startDate) conditions.push(gte(issues.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(lte(issues.createdAt, filters.endDate));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(issues.createdAt));
  }

  async assignIssue(
    issueId: number,
    departmentId: number | null,
    staffId: number | null,
    escalationLevel: string
  ): Promise<Issue | undefined> {
    const [issue] = await db
      .update(issues)
      .set({
        assignedDepartmentId: departmentId,
        assignedStaffId: staffId,
        escalationLevel,
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(issues.id, issueId))
      .returning();

    if (issue) {
      // Add timeline entry
      await this.createTimeline({
        issueId: issue.id,
        type: 'assigned',
        title: 'Issue Assigned',
        description: `Assigned to department(escalation: ${escalationLevel})`,
        user: 'Admin',
      });
    }

    return issue || undefined;
  }

  // Comments
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();

    // Add timeline entry
    await this.createTimeline({
      issueId: insertComment.issueId,
      type: 'comment',
      title: 'New Comment',
      description: insertComment.text.substring(0, 100),
      user: insertComment.userName,
    });

    return comment;
  }

  async listCommentsByIssue(issueId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.issueId, issueId)).orderBy(comments.createdAt);
  }

  // Timeline
  async createTimeline(insertTimeline: InsertTimeline): Promise<Timeline> {
    const [timelineEntry] = await db.insert(timeline).values(insertTimeline).returning();
    return timelineEntry;
  }

  async listTimelineByIssue(issueId: number): Promise<Timeline[]> {
    return await db.select().from(timeline).where(eq(timeline.issueId, issueId)).orderBy(timeline.createdAt);
  }

  // Broadcasts
  async createBroadcast(insertBroadcast: InsertBroadcast): Promise<Broadcast> {
    const wardsArray: string[] = Array.isArray(insertBroadcast.targetWards) ? [...insertBroadcast.targetWards] : [];
    const [broadcast] = await db.insert(broadcasts).values({
      title: insertBroadcast.title,
      message: insertBroadcast.message,
      severity: insertBroadcast.severity,
      createdBy: insertBroadcast.createdBy,
      targetWards: wardsArray,
      sentAt: new Date(),
    }).returning();
    return broadcast;
  }

  async listBroadcasts(limit = 50): Promise<Broadcast[]> {
    return await db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt)).limit(limit);
  }

  // Credits
  async awardCredits(citizenId: number, amount: number, reason: string, issueId?: number): Promise<Credit> {
    const [credit] = await db.insert(credits).values({
      citizenId,
      amount,
      reason,
      issueId: issueId ?? null,
    }).returning();
    return credit;
  }

  async getCitizenCredits(citizenId: number): Promise<number> {
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(credits)
      .where(eq(credits.citizenId, citizenId));
    return Number(result[0]?.total ?? 0);
  }

  async listCreditHistory(citizenId: number): Promise<Credit[]> {
    return await db
      .select()
      .from(credits)
      .where(eq(credits.citizenId, citizenId))
      .orderBy(desc(credits.createdAt));
  }

  // Admin Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const permissionsArray: string[] = Array.isArray(insertUser.permissions) ? [...insertUser.permissions] : [];
    const [user] = await db.insert(users).values({
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name,
      email: insertUser.email ?? null,
      role: insertUser.role ?? 'officer',
      departmentId: insertUser.departmentId ?? null,
      escalationLevel: insertUser.escalationLevel ?? 'L1',
      permissions: permissionsArray,
      active: insertUser.active ?? true,
    }).returning();
    return user;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const updateData: Record<string, any> = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId;
    if (data.escalationLevel !== undefined) updateData.escalationLevel = data.escalationLevel;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.permissions !== undefined) {
      updateData.permissions = Array.isArray(data.permissions) ? [...data.permissions] : [];
    }

    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async listIssuesByEscalationLevel(escalationLevel: EscalationLevel, departmentId?: number): Promise<Issue[]> {
    const userLevel = ESCALATION_HIERARCHY[escalationLevel];
    const allowedLevels = Object.entries(ESCALATION_HIERARCHY)
      .filter(([_, level]) => level <= userLevel)
      .map(([key]) => key);

    const conditions = [inArray(issues.escalationLevel, allowedLevels)];
    if (departmentId) {
      conditions.push(eq(issues.assignedDepartmentId, departmentId));
    }

    return await db
      .select()
      .from(issues)
      .where(and(...conditions))
      .orderBy(desc(issues.createdAt));
  }

  // Analytics
  async getAnalytics(): Promise<{
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    categoryCounts: Record<string, number>;
    priorityCounts: Record<string, number>;
  }> {
    const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(issues);
    const [resolvedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(issues)
      .where(eq(issues.status, 'resolved'));
    const [pendingResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(issues)
      .where(or(eq(issues.status, 'submitted'), eq(issues.status, 'verified'), eq(issues.status, 'in_progress')));

    const categoryResults = await db
      .select({ category: issues.category, count: sql<number>`count(*)` })
      .from(issues)
      .groupBy(issues.category);

    const priorityResults = await db
      .select({ priority: issues.priority, count: sql<number>`count(*)` })
      .from(issues)
      .groupBy(issues.priority);

    const categoryCounts: Record<string, number> = {};
    categoryResults.forEach(r => {
      categoryCounts[r.category] = Number(r.count);
    });

    const priorityCounts: Record<string, number> = {};
    priorityResults.forEach(r => {
      priorityCounts[r.priority] = Number(r.count);
    });

    return {
      totalIssues: Number(totalResult.count),
      resolvedIssues: Number(resolvedResult.count),
      pendingIssues: Number(pendingResult.count),
      categoryCounts,
      priorityCounts,
    };
  }
}

export const storage = new DatabaseStorage();
