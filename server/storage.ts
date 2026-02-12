
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
  type Role,
  type InsertRole,
  roles,
  provinces, localAuthorities, wards, suburbs,
  type Province, type LocalAuthority, type Ward, type Suburb,
  jurisdictions, type Jurisdiction, type InsertJurisdiction,
  issueCategories, type IssueCategory, type InsertIssueCategory,
  officers, type Officer, type InsertOfficer,
  notifications, type Notification, type InsertNotification,
  upvotes, type Upvote
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, count, gte, lte, sql, getTableColumns, inArray, lt, ne } from "drizzle-orm";

export interface IStorage {
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  listNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  // Citizens
  getCitizen(id: number): Promise<Citizen | undefined>;
  getCitizenByEmail(email: string): Promise<Citizen | undefined>;
  getOrCreateAnonymousCitizen(): Promise<Citizen>;
  getCitizenByNid(nid: string): Promise<Citizen | undefined>;
  createCitizen(citizen: InsertCitizen): Promise<Citizen>;
  updateCitizen(id: number, data: Partial<InsertCitizen>): Promise<Citizen | undefined>;
  listCitizens(): Promise<Citizen[]>;
  verifyCitizenEmail(id: number): Promise<Citizen | undefined>;
  setResetToken(email: string, token: string, expiry: Date): Promise<void>;
  updatePassword(email: string, hash: string): Promise<void>;
  savePushToken(userId: number, token: string): Promise<void>;

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
  deleteStaff(id: number): Promise<void>;

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
  listIssuesByEscalationLevel(
    escalationLevel: EscalationLevel,
    departmentId?: number,
    jurisdictionId?: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<Issue[]>;

  // Regions
  listProvinces(): Promise<Province[]>;
  listLocalAuthorities(provinceId?: number): Promise<LocalAuthority[]>;

  // Upvotes
  toggleUpvote(issueId: number, userId: number, userType: string): Promise<{ upvoted: boolean; count: number }>;
  getUpvoteCount(issueId: number): Promise<number>;
  hasUserUpvoted(issueId: number, userId: number): Promise<boolean>;

  // User Stats
  getUserStats(userId: number): Promise<{ totalReports: number; totalCredits: number; resolvedReports: number }>;
  listWards(localAuthorityId?: number): Promise<Ward[]>;
  listSuburbs(wardId?: number): Promise<Suburb[]>;

  createLocalAuthority(data: { name: string, type: string, provinceId: number }): Promise<LocalAuthority>;
  updateLocalAuthority(id: number, data: Partial<LocalAuthority>): Promise<LocalAuthority | undefined>;

  createWard(data: { name: string, wardNumber: string, localAuthorityId: number, boundaryPolygon?: any }): Promise<Ward>;
  updateWard(id: number, data: Partial<Ward>): Promise<Ward | undefined>;
  deleteWard(id: number): Promise<void>; // Soft delete only if no issues

  createSuburb(data: { name: string, wardId: number }): Promise<Suburb>;
  updateSuburb(id: number, data: Partial<Suburb>): Promise<Suburb | undefined>;
  deleteSuburb(id: number): Promise<void>;

  // Roles
  getRoles(): Promise<Role[]>;
  getRoleBySlug(slug: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(slug: string, data: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<void>;

  // Analytics
  getAnalytics(): Promise<{
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    categoryCounts: Record<string, number>;
    priorityCounts: Record<string, number>;
    statusCounts: Record<string, number>;
    slaComplianceRate: number;
    overdueIssues: number;
  }>;

  getIssuesForMap(): Promise<any[]>;

  // New Unified Hierarchy
  listJurisdictions(level?: string): Promise<Jurisdiction[]>;
  getJurisdiction(id: number): Promise<Jurisdiction | undefined>;
  getJurisdictionByCode(code: string): Promise<Jurisdiction | undefined>;
  createJurisdiction(jurisdiction: InsertJurisdiction): Promise<Jurisdiction>;

  // Issue Categories
  listIssueCategories(): Promise<IssueCategory[]>;
  getIssueCategory(code: string): Promise<IssueCategory | undefined>;
  createIssueCategory(category: InsertIssueCategory): Promise<IssueCategory>;
  updateIssueCategoryByCode(code: string, data: Partial<InsertIssueCategory>): Promise<IssueCategory | undefined>;
  // Officers
  listOfficers(): Promise<Officer[]>;
  getOfficer(id: number): Promise<Officer | undefined>;
  getOfficerByUserId(userId: number): Promise<Officer | undefined>;
  createOfficer(officer: InsertOfficer): Promise<Officer>;
  updateOfficer(id: number, data: Partial<InsertOfficer>): Promise<Officer | undefined>;
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

  async getCitizenByNid(nid: string): Promise<Citizen | undefined> {
    const [citizen] = await db.select().from(citizens).where(eq(citizens.nid, nid));
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

  async setResetToken(email: string, token: string, expiry: Date): Promise<void> {
    await db
      .update(citizens)
      .set({ resetToken: token, resetTokenExpiry: expiry })
      .where(eq(citizens.email, email));
  }

  async updatePassword(email: string, hash: string): Promise<void> {
    await db
      .update(citizens)
      .set({ password: hash, resetToken: null, resetTokenExpiry: null })
      .where(eq(citizens.email, email));
  }

  async savePushToken(userId: number, token: string): Promise<void> {
    await db
      .update(citizens)
      .set({ pushToken: token })
      .where(eq(citizens.id, userId));
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

  async deleteStaff(id: number): Promise<void> {
    await db.delete(staff).where(eq(staff.id, id));
  }

  // Issues
  async getIssue(id: number): Promise<any | undefined> {
    const [result] = await db
      .select({
        ...getTableColumns(issues),
        jurisdictionName: jurisdictions.name,
        departmentName: departments.name
      })
      .from(issues)
      .leftJoin(jurisdictions, eq(issues.jurisdictionId, jurisdictions.id))
      .leftJoin(departments, eq(issues.assignedDepartmentId, departments.id))
      .where(eq(issues.id, id));

    return result || undefined;
  }

  async getIssueByTrackingId(trackingId: string): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.trackingId, trackingId));
    return issue || undefined;
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const year = new Date().getFullYear();
    const [issueCount] = await db.select({ count: count() }).from(issues);
    const trackingId = `TAR-${year}-${String(Number(issueCount.count) + 1).padStart(4, '0')}`;

    const photosArray: string[] = Array.isArray(insertIssue.photos) ? [...insertIssue.photos] : [];

    // Auto-assign department based on category (lookup by handles_categories)
    let autoAssignedDepartmentId = insertIssue.assignedDepartmentId ?? null;
    let expectedResponseAt: Date | null = null;
    let expectedResolutionAt: Date | null = null;

    if (!autoAssignedDepartmentId) {
      const allDepts = await this.listDepartments();
      const matchingDept = allDepts.find(d =>
        (d.handlesCategories as string[] || []).includes(insertIssue.category) ||
        d.name.toLowerCase().includes(insertIssue.category.toLowerCase())
      );
      autoAssignedDepartmentId = matchingDept?.id ?? null;
    }

    if (autoAssignedDepartmentId) {
      const dept = await this.getDepartment(autoAssignedDepartmentId);
      if (dept) {
        const now = new Date();
        expectedResponseAt = new Date(now.getTime() + (dept.responseTimeSlaHours || 48) * 60 * 60 * 1000);
        expectedResolutionAt = new Date(now.getTime() + (dept.resolutionTimeSlaHours || 168) * 60 * 60 * 1000);
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
      assignedOfficerId: insertIssue.assignedOfficerId ?? null,
      jurisdictionId: insertIssue.jurisdictionId ?? null,
      wardNumber: insertIssue.wardNumber ?? null,
      suburb: insertIssue.suburb ?? null,
      autoAssigned: insertIssue.autoAssigned ?? !!autoAssignedDepartmentId,
      photos: photosArray,
      expectedResponseAt,
      expectedResolutionAt,
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
    if (data.assignedOfficerId !== undefined) updateData.assignedOfficerId = data.assignedOfficerId;
    if (data.jurisdictionId !== undefined) updateData.jurisdictionId = data.jurisdictionId;
    if (data.wardNumber !== undefined) updateData.wardNumber = data.wardNumber;
    if (data.suburb !== undefined) updateData.suburb = data.suburb;
    if (data.photos !== undefined) updateData.photos = data.photos;
    if (data.resolutionPhotos !== undefined) updateData.resolutionPhotos = data.resolutionPhotos;
    if (data.status === 'resolved') updateData.resolvedAt = new Date();

    // Get original issue to check for status changes
    const originalIssue = await this.getIssue(id);

    const [issue] = await db
      .update(issues)
      .set(updateData)
      .where(eq(issues.id, id))
      .returning();

    if (issue && originalIssue && issue.status !== originalIssue.status) {
      await this.createTimeline({
        issueId: issue.id,
        type: 'status',
        title: `Status Updated to ${issue.status.toUpperCase()}`,
        description: `Issue status changed from ${originalIssue.status} to ${issue.status}`,
        user: 'System',
      });

      // Award credits when issue is resolved
      if (issue.status === 'resolved' && originalIssue.status !== 'resolved') {
        const citizen = await this.getCitizen(issue.citizenId);
        if (citizen && citizen.email !== "anonymous@tarisa.gov.zw") {
          await this.awardCredits(
            citizen.id,
            CREDIT_VALUES.report_resolved,
            'report_resolved',
            issue.id
          );
        }
      }
    }

    return issue || undefined;
  }

  async listIssues(filters?: {
    status?: string;
    category?: string;
    citizenId?: number;
    departmentId?: number;
    jurisdictionId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(issues.status, filters.status));
    if (filters?.category) conditions.push(eq(issues.category, filters.category));
    if (filters?.citizenId) conditions.push(eq(issues.citizenId, filters.citizenId));
    if (filters?.departmentId) conditions.push(eq(issues.assignedDepartmentId, filters.departmentId));
    if (filters?.jurisdictionId) conditions.push(eq(issues.jurisdictionId, filters.jurisdictionId));
    if (filters?.startDate) conditions.push(gte(issues.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(lte(issues.createdAt, filters.endDate));

    const result = await db
      .select({
        ...getTableColumns(issues),
        upvotes: sql<number>`count(distinct ${upvotes.id})`.as('upvotes'),
        comments: sql<number>`count(distinct ${comments.id})`.as('comments'),
      })
      .from(issues)
      .leftJoin(upvotes, eq(issues.id, upvotes.issueId))
      .leftJoin(comments, eq(issues.id, comments.issueId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(issues.id)
      .orderBy(desc(issues.createdAt));

    return result as any;
  }

  async assignIssue(
    issueId: number,
    departmentId: number | null,
    staffId: number | null,
    escalationLevel: string
  ): Promise<Issue | undefined> {
    // Lock assignment for resolved issues
    const currentIssue = await this.getIssue(issueId);
    if (currentIssue?.status === 'resolved') {
      throw new Error("Cannot reassign a resolved issue.");
    }

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
    return await db.select().from(timeline).where(eq(timeline.issueId, issueId)).orderBy(desc(timeline.createdAt));
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

  async listIssuesByEscalationLevel(
    escalationLevel: EscalationLevel,
    departmentId?: number,
    jurisdictionId?: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<Issue[]> {
    const userLevel = ESCALATION_HIERARCHY[escalationLevel];
    const allowedLevels = Object.entries(ESCALATION_HIERARCHY)
      .filter(([_, level]) => level <= userLevel)
      .map(([key]) => key);

    const conditions = [inArray(issues.escalationLevel, allowedLevels)];
    if (departmentId) {
      conditions.push(eq(issues.assignedDepartmentId, departmentId));
    }
    if (jurisdictionId) {
      conditions.push(eq(issues.jurisdictionId, jurisdictionId));
    }
    if (startDate) {
      conditions.push(gte(issues.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(issues.createdAt, endDate));
    }

    return await db
      .select({
        ...getTableColumns(issues),
        upvotes: sql<number>`count(distinct ${upvotes.id})`.as('upvotes'),
        comments: sql<number>`count(distinct ${comments.id})`.as('comments'),
      })
      .from(issues)
      .leftJoin(upvotes, eq(issues.id, upvotes.issueId))
      .leftJoin(comments, eq(issues.id, comments.issueId))
      .where(and(...conditions))
      .groupBy(issues.id)
      .orderBy(desc(issues.createdAt));
  }

  // Analytics
  async getAnalytics(): Promise<{
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    categoryCounts: Record<string, number>;
    priorityCounts: Record<string, number>;
    statusCounts: Record<string, number>;
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

    const [overdueResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(issues)
      .where(and(
        or(eq(issues.status, 'submitted'), eq(issues.status, 'verified'), eq(issues.status, 'in_progress')),
        lt(issues.expectedResolutionAt, new Date())
      ));

    const [compliantResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(issues)
      .where(and(
        eq(issues.status, 'resolved'),
        sql`${issues.resolvedAt} <= ${issues.expectedResolutionAt}`
      ));

    const categoryResults = await db
      .select({ category: issues.category, count: sql<number>`count(*)` })
      .from(issues)
      .groupBy(issues.category);

    const priorityResults = await db
      .select({ priority: issues.priority, count: sql<number>`count(*)` })
      .from(issues)
      .groupBy(issues.priority);

    const statusResults = await db
      .select({ status: issues.status, count: sql<number>`count(*)` })
      .from(issues)
      .groupBy(issues.status);

    const categoryCounts: Record<string, number> = {};
    categoryResults.forEach(r => {
      categoryCounts[r.category] = Number(r.count);
    });

    const priorityCounts: Record<string, number> = {};
    priorityResults.forEach(r => {
      priorityCounts[r.priority] = Number(r.count);
    });

    const statusCounts: Record<string, number> = {};
    statusResults.forEach(r => {
      statusCounts[r.status] = Number(r.count);
    });

    const slaComplianceRate = resolvedResult.count > 0
      ? (Number(compliantResult.count) / Number(resolvedResult.count)) * 100
      : 100;

    return {
      totalIssues: Number(totalResult.count),
      resolvedIssues: Number(resolvedResult.count),
      pendingIssues: Number(pendingResult.count),
      categoryCounts,
      priorityCounts,
      statusCounts,
      slaComplianceRate,
      overdueIssues: Number(overdueResult.count),
    };
  }

  // Regions
  async listProvinces(): Promise<Province[]> {
    return await db.select().from(provinces);
  }

  async listLocalAuthorities(provinceId?: number): Promise<LocalAuthority[]> {
    if (provinceId) {
      return await db.select().from(localAuthorities).where(eq(localAuthorities.provinceId, provinceId));
    }
    return await db.select().from(localAuthorities);
  }

  async listWards(localAuthorityId?: number): Promise<Ward[]> {
    if (localAuthorityId) {
      return await db.select().from(wards).where(eq(wards.localAuthorityId, localAuthorityId));
    }
    return await db.select().from(wards);
  }

  async listSuburbs(wardId?: number): Promise<Suburb[]> {
    if (wardId) {
      return await db.select().from(suburbs).where(and(eq(suburbs.wardId, wardId), eq(suburbs.isActive, true)));
    }
    return await db.select().from(suburbs).where(eq(suburbs.isActive, true));
  }

  async createLocalAuthority(data: { name: string, type: string, provinceId: number }): Promise<LocalAuthority> {
    const [la] = await db.insert(localAuthorities).values(data).returning();
    return la;
  }

  async updateLocalAuthority(id: number, data: Partial<LocalAuthority>): Promise<LocalAuthority | undefined> {
    const [la] = await db.update(localAuthorities).set(data).where(eq(localAuthorities.id, id)).returning();
    return la;
  }

  async createWard(data: { name: string, wardNumber: string, localAuthorityId: number, boundaryPolygon?: any }): Promise<Ward> {
    const [ward] = await db.insert(wards).values(data).returning();
    return ward;
  }

  async updateWard(id: number, data: Partial<Ward>): Promise<Ward | undefined> {
    const [ward] = await db.update(wards).set(data).where(eq(wards.id, id)).returning();
    return ward;
  }

  async deleteWard(id: number): Promise<void> {
    // Check for issues in this ward
    const issueCount = await db.select({ count: count() }).from(issues).where(eq(issues.wardId, id));
    if (issueCount[0].count > 0) {
      throw new Error("Cannot delete ward with existing issues. Deactivate it instead.");
    }
    // Soft delete
    await db.update(wards).set({ isActive: false, effectiveTo: new Date() }).where(eq(wards.id, id));
  }

  async createSuburb(data: { name: string, wardId: number }): Promise<Suburb> {
    const [sub] = await db.insert(suburbs).values(data).returning();
    return sub;
  }

  async updateSuburb(id: number, data: Partial<Suburb>): Promise<Suburb | undefined> {
    const [sub] = await db.update(suburbs).set(data).where(eq(suburbs.id, id)).returning();
    return sub;
  }

  async deleteSuburb(id: number): Promise<void> {
    await db.delete(suburbs).where(eq(suburbs.id, id));
  }

  // Unified Jurisdictions
  async listJurisdictions(level?: string): Promise<Jurisdiction[]> {
    if (level) {
      return await db.select().from(jurisdictions).where(eq(jurisdictions.level, level));
    }
    return await db.select().from(jurisdictions);
  }

  async getJurisdiction(id: number): Promise<Jurisdiction | undefined> {
    const [result] = await db.select().from(jurisdictions).where(eq(jurisdictions.id, id));
    return result || undefined;
  }

  async getJurisdictionByCode(code: string): Promise<Jurisdiction | undefined> {
    const [result] = await db.select().from(jurisdictions).where(eq(jurisdictions.code, code));
    return result || undefined;
  }

  async createJurisdiction(data: InsertJurisdiction): Promise<Jurisdiction> {
    const [result] = await db.insert(jurisdictions).values(data).returning();
    return result;
  }

  // Issue Categories
  async listIssueCategories(): Promise<IssueCategory[]> {
    return await db.select().from(issueCategories).where(eq(issueCategories.isActive, true));
  }

  async getIssueCategory(code: string): Promise<IssueCategory | undefined> {
    const [result] = await db.select().from(issueCategories).where(eq(issueCategories.code, code));
    return result || undefined;
  }

  async createIssueCategory(data: InsertIssueCategory): Promise<IssueCategory> {
    const [result] = await db.insert(issueCategories).values(data).returning();
    return result;
  }

  // Officers
  async listOfficers(): Promise<Officer[]> {
    return await db.select().from(officers).where(eq(officers.isActive, true));
  }

  async getOfficer(id: number): Promise<Officer | undefined> {
    const [result] = await db.select().from(officers).where(eq(officers.id, id));
    return result || undefined;
  }

  async getOfficerByUserId(userId: number): Promise<Officer | undefined> {
    const [result] = await db.select().from(officers).where(eq(officers.userId, userId));
    return result || undefined;
  }

  async createOfficer(data: InsertOfficer): Promise<Officer> {
    const [result] = await db.insert(officers).values(data).returning();
    return result;
  }

  async updateOfficer(id: number, data: Partial<InsertOfficer>): Promise<Officer | undefined> {
    const [result] = await db.update(officers).set({ ...data, updatedAt: new Date() }).where(eq(officers.id, id)).returning();
    return result || undefined;
  }


  // Roles
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async getRoleBySlug(slug: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.slug, slug));
    return role;
  }

  async createRole(role: InsertRole): Promise<Role> {
    const values = {
      ...role,
      permissions: role.permissions as string[]
    };
    const [newRole] = await db.insert(roles).values(values).returning();
    return newRole;
  }

  async updateRole(slug: string, data: Partial<InsertRole>): Promise<Role | undefined> {
    const values = {
      ...data,
      permissions: data.permissions ? (data.permissions as string[]) : undefined
    };
    const [updatedRole] = await db
      .update(roles)
      .set(values)
      .where(eq(roles.slug, slug))
      .returning();
    return updatedRole;
  }

  async deleteRole(id: number): Promise<void> {
    await db.delete(roles).where(and(eq(roles.id, id), eq(roles.isSystem, false)));
  }

  async toggleUpvote(issueId: number, userId: number, userType: string): Promise<{ upvoted: boolean; count: number }> {
    const existing = await db
      .select()
      .from(upvotes)
      .where(and(eq(upvotes.issueId, issueId), eq(upvotes.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(upvotes).where(eq(upvotes.id, existing[0].id));
      const count = await this.getUpvoteCount(issueId);
      return { upvoted: false, count };
    } else {
      await db.insert(upvotes).values({ issueId, userId, userType });
      const count = await this.getUpvoteCount(issueId);
      return { upvoted: true, count };
    }
  }

  async getUpvoteCount(issueId: number): Promise<number> {
    const result = await db.select({ count: count() }).from(upvotes).where(eq(upvotes.issueId, issueId));
    return result[0]?.count || 0;
  }

  async hasUserUpvoted(issueId: number, userId: number): Promise<boolean> {
    const result = await db.select({ count: count() }).from(upvotes).where(and(eq(upvotes.issueId, issueId), eq(upvotes.userId, userId)));
    return result[0]?.count > 0;
  }

  async getUserStats(userId: number): Promise<{ totalReports: number; totalCredits: number; resolvedReports: number }> {
    // Bridge: User -> Citizen (via Email)
    const user = await this.getUser(userId);
    if (!user || !user.email) return { totalReports: 0, totalCredits: 0, resolvedReports: 0 };

    let citizen = await this.getCitizenByEmail(user.email);
    if (!citizen) {
      // Auto-create citizen profile so stats (and future reports) work immediately
      citizen = await this.createCitizen({
        name: user.name,
        email: user.email,
        phone: "Verified User",
        address: "Verified User",
        ward: "Unknown",
        emailVerified: true,
        status: 'verified'
      });
    }

    const citizenId = citizen.id;

    const [reports] = await db.select({ count: count() }).from(issues).where(eq(issues.citizenId, citizenId));
    const [resolved] = await db
      .select({ count: count() })
      .from(issues)
      .where(and(eq(issues.citizenId, citizenId), eq(issues.status, "resolved")));
    const totalCredits = await this.getCitizenCredits(citizenId);

    return {
      totalReports: reports?.count || 0,
      resolvedReports: resolved?.count || 0,
      totalCredits
    };
  }

  async getIssuesForMap(): Promise<any[]> {
    const result = await db
      .select({
        id: issues.id,
        title: issues.title,
        status: issues.status,
        category: issues.category,
        coordinates: issues.coordinates,
        location: issues.location,
        createdAt: issues.createdAt,
        jurisdictionName: jurisdictions.name,
        upvoteCount: count(upvotes.id)
      })
      .from(issues)
      .leftJoin(jurisdictions, eq(issues.jurisdictionId, jurisdictions.id))
      .leftJoin(upvotes, eq(issues.id, upvotes.issueId))
      .groupBy(issues.id, jurisdictions.name)
      .orderBy(desc(issues.createdAt)); // Show newest first

    return result;
  }

  async getNearbyIssues(lat: number, lng: number, radiusKm: number = 0.05): Promise<any[]> {
    // Haversine formula for precise distance
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // km

    const result = await db.select({
      id: issues.id,
      title: issues.title,
      category: issues.category,
      coordinates: issues.coordinates,
      status: issues.status,
      createdAt: issues.createdAt
    })
      .from(issues)
      .where(ne(issues.status, 'resolved'));

    return result.filter(issue => {
      if (!issue.coordinates) return false;
      const [iLat, iLng] = issue.coordinates.split(',').map(Number);

      const dLat = toRad(iLat - lat);
      const dLng = toRad(iLng - lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat)) * Math.cos(toRad(iLat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;

      return d <= radiusKm;
    });
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async listNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

}


export const storage = new DatabaseStorage();
