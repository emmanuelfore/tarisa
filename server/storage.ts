import {
  citizens, departments, staff, issues, comments, timeline, broadcasts, users,
  type Citizen, type InsertCitizen,
  type Department, type InsertDepartment,
  type Staff, type InsertStaff,
  type Issue, type InsertIssue,
  type Comment, type InsertComment,
  type Timeline, type InsertTimeline,
  type Broadcast, type InsertBroadcast,
  type User, type InsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Citizens
  getCitizen(id: number): Promise<Citizen | undefined>;
  getCitizenByEmail(email: string): Promise<Citizen | undefined>;
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

  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  listCommentsByIssue(issueId: number): Promise<Comment[]>;

  // Timeline
  createTimeline(timeline: InsertTimeline): Promise<Timeline>;
  listTimelineByIssue(issueId: number): Promise<Timeline[]>;

  // Broadcasts
  createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast>;
  listBroadcasts(limit?: number): Promise<Broadcast[]>;

  // Admin Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
    // Generate tracking ID
    const year = new Date().getFullYear();
    const count = await db.select({ count: sql<number>`count(*)` }).from(issues);
    const trackingId = `TAR-${year}-${String(Number(count[0].count) + 1).padStart(4, '0')}`;

    const [issue] = await db
      .insert(issues)
      .values({ ...insertIssue, trackingId })
      .returning();
    
    // Create initial timeline entry
    await this.createTimeline({
      issueId: issue.id,
      type: 'created',
      title: 'Report Submitted',
      description: 'Issue reported by citizen',
      user: 'System',
    });

    return issue;
  }

  async updateIssue(id: number, data: Partial<InsertIssue>): Promise<Issue | undefined> {
    const [issue] = await db
      .update(issues)
      .set({ ...data, updatedAt: new Date() })
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
        description: `Assigned to department (escalation: ${escalationLevel})`,
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
    const [broadcast] = await db
      .insert(broadcasts)
      .values({ ...insertBroadcast, sentAt: new Date() })
      .returning();
    return broadcast;
  }

  async listBroadcasts(limit = 50): Promise<Broadcast[]> {
    return await db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt)).limit(limit);
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
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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
