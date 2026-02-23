import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, serial, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Citizens (users of the platform)
export const citizens = pgTable("citizens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  nid: text("nid"), // National ID (optional, since email verification is primary)
  address: text("address"),
  ward: text("ward"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  verifiedAt: timestamp("verified_at"),
  status: text("status").notNull().default("pending"), // pending, verified, suspended
  password: text("password").notNull().default('$2b$10$EpRnTzVlqHNP0.f0T2u16.tABCdefg'), // Default placeholder hash for existing users
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  pushToken: text("push_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const citizensRelations = relations(citizens, ({ many }) => ({
  issues: many(issues),
}));

// Jurisdictions (Unified Hierarchy: Country -> Province -> District -> Ward -> Suburb)
export const jurisdictions = pgTable("jurisdictions", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // e.g., "ZW-HA-W17"
  name: text("name").notNull(),
  nameShona: text("name_shona"),

  level: varchar("level", { length: 50 }).notNull(), // country, province, district, constituency, ward, suburb
  parentId: integer("parent_id"), // Recursive reference logic handled in types/app

  boundaryGeom: jsonb("boundary_geom").$type<any>(), // GeoJSON fallback
  centerPoint: jsonb("center_point").$type<{ lat: number, lng: number }>(),
  areaSqKm: integer("area_sq_km"),

  officialName: text("official_name"),
  shortName: varchar("short_name", { length: 100 }),

  officeAddress: text("office_address"),
  officePhone: varchar("office_phone", { length: 20 }),
  officeEmail: varchar("office_email", { length: 255 }),
  website: varchar("website", { length: 255 }),

  councilorName: text("councilor_name"),
  councilorPhone: varchar("councilor_phone", { length: 20 }),
  councilorEmail: varchar("councilor_email", { length: 255 }),
  mayorName: text("mayor_name"),

  isActive: boolean("is_active").default(true).notNull(),
  acceptsReports: boolean("accepts_reports").default(true).notNull(),
  serviceProvider: varchar("service_provider", { length: 100 }), // e.g., 'Harare City Council'

  totalIssues: integer("total_issues").default(0).notNull(),
  resolvedIssues: integer("resolved_issues").default(0).notNull(),
  avgResolutionHours: integer("avg_resolution_hours").default(0),
  lastResponseAt: timestamp("last_response_at"),

  population: integer("population"),
  households: integer("households"),
  urbanRural: varchar("urban_rural", { length: 10 }), // urban, rural, mixed

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jurisdictionsRelations = relations(jurisdictions, ({ one, many }) => ({
  parent: one(jurisdictions, {
    fields: [jurisdictions.parentId],
    references: [jurisdictions.id],
    relationName: "parent_jurisdiction",
  }),
  children: many(jurisdictions, {
    relationName: "parent_jurisdiction",
  }),
  departments: many(departments),
  issues: many(issues),
  officers: many(officers),
}));

// Issue Categories configuration
export const issueCategories = pgTable("issue_categories", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // pothole, water_leak
  name: text("name").notNull(),
  nameShona: text("name_shona"),
  parentCategory: varchar("parent_category", { length: 50 }), // roads, water, etc.
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),

  defaultDepartmentCategory: varchar("default_department_category", { length: 100 }),
  priorityLevel: varchar("priority_level", { length: 20 }).default("medium").notNull(),

  responseTimeHours: integer("response_time_hours").default(48),
  resolutionTimeHours: integer("resolution_time_hours").default(168),

  requiresPhoto: boolean("requires_photo").default(true).notNull(),
  requiresVideo: boolean("requires_video").default(false).notNull(),
  minVerifications: integer("min_verifications").default(2).notNull(),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Departments (Updated for new hierarchy)
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  jurisdictionId: integer("jurisdiction_id").references(() => jurisdictions.id),

  code: varchar("code", { length: 50 }),
  name: text("name").notNull().unique(),
  nameShona: text("name_shona"),

  category: varchar("category", { length: 100 }), // roads, water, sewer, etc.
  type: text("type"), // Municipal, Parastatal, Police, Government

  headOfDepartment: text("head_of_department"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  officeLocation: text("office_location"),

  responseTimeSlaHours: integer("response_time_sla_hours").default(48),
  resolutionTimeSlaHours: integer("resolution_time_sla_hours").default(168),

  handlesCategories: jsonb("handles_categories").$type<string[]>().default([]),

  totalAssigned: integer("total_assigned").default(0),
  totalResolved: integer("total_resolved").default(0),
  avgResolutionTime: integer("avg_resolution_time"),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  jurisdiction: one(jurisdictions, {
    fields: [departments.jurisdictionId],
    references: [jurisdictions.id],
  }),
  officers: many(officers),
  issues: many(issues),
  // staff: many(staff), // Removed
}));


export const issueCategoriesRelations = relations(issueCategories, ({ many }) => ({
  issues: many(issues),
}));

// Officers (Service Delivery Personnel)
export const officers = pgTable("officers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),

  employeeNumber: varchar("employee_number", { length: 50 }).unique(),
  fullName: text("full_name").notNull(),
  title: varchar("title", { length: 100 }),

  departmentId: integer("department_id").references(() => departments.id),
  jurisdictionId: integer("jurisdiction_id").references(() => jurisdictions.id),
  assignedWards: jsonb("assigned_wards").$type<number[]>().default([]),

  workEmail: varchar("work_email", { length: 255 }),
  workPhone: varchar("work_phone", { length: 20 }),

  role: varchar("role", { length: 50 }), // field_officer, supervisor, etc.
  canVerifyIssues: boolean("can_verify_issues").default(true).notNull(),
  canAssignIssues: boolean("can_assign_issues").default(false).notNull(),
  canCloseIssues: boolean("can_close_issues").default(true).notNull(),

  assignedIssuesCount: integer("assigned_issues_count").default(0),
  resolvedIssuesCount: integer("resolved_issues_count").default(0),
  avgResolutionHours: integer("avg_resolution_hours"),
  rating: integer("rating"),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const officersRelations = relations(officers, ({ one, many }) => ({
  user: one(users, {
    fields: [officers.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [officers.departmentId],
    references: [departments.id],
  }),
  jurisdiction: one(jurisdictions, {
    fields: [officers.jurisdictionId],
    references: [jurisdictions.id],
  }),
  assignedIssues: many(issues, { relationName: "officer_issues" }),
}));

// Issues/Reports (Updated with jurisdiction links)
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  trackingId: text("tracking_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  coordinates: text("coordinates"),
  status: text("status").notNull().default("submitted"),
  priority: text("priority").notNull().default("medium"),
  severity: integer("severity").default(50),

  citizenId: integer("citizen_id").references(() => citizens.id).notNull(),

  assignedDepartmentId: integer("assigned_department_id").references(() => departments.id),
  assignedUserId: integer("assigned_user_id").references(() => users.id), // Replaces assignedStaffId
  assignedOfficerId: integer("assigned_officer_id").references(() => officers.id),

  // Escalation is deprecated but kept notNull for DB compatibility
  escalationLevel: text("escalation_level").default("L1").notNull(),

  jurisdictionId: integer("jurisdiction_id").references(() => jurisdictions.id),
  wardNumber: integer("ward_number"),
  suburb: text("suburb"),
  autoAssigned: boolean("auto_assigned").default(false).notNull(),

  photos: jsonb("photos").$type<string[]>().default([]),
  resolutionPhotos: jsonb("resolution_photos").$type<string[]>().default([]),

  expectedResponseAt: timestamp("expected_response_at"),
  expectedResolutionAt: timestamp("expected_resolution_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),

  // New Verification Fields
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by").references(() => users.id),
}, (table) => {
  return {
    citizenIdx: index("idx_issues_citizen").on(table.citizenId),
    statusIdx: index("idx_issues_status").on(table.status),
    createdIdx: index("idx_issues_created_at").on(table.createdAt),
  };
});

export const issuesRelations = relations(issues, ({ one, many }) => ({
  citizen: one(citizens, {
    fields: [issues.citizenId],
    references: [citizens.id],
  }),
  assignedDepartment: one(departments, {
    fields: [issues.assignedDepartmentId],
    references: [departments.id],
  }),
  assignedUser: one(users, {
    fields: [issues.assignedUserId],
    references: [users.id],
  }),
  assignedOfficer: one(officers, {
    fields: [issues.assignedOfficerId],
    references: [officers.id],
    relationName: "officer_issues",
  }),
  jurisdiction: one(jurisdictions, {
    fields: [issues.jurisdictionId],
    references: [jurisdictions.id],
  }),
  comments: many(comments),
  timeline: many(timeline),
  upvotes: many(upvotes),
}));

// Administrative Hierarchy (Keep old tables for backwards compatibility during migration)
export const provinces = pgTable("provinces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const provincesRelations = relations(provinces, ({ many }) => ({
  localAuthorities: many(localAuthorities),
}));

export const localAuthorities = pgTable("local_authorities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  provinceId: integer("province_id").references(() => provinces.id),
  isActive: boolean("is_active").default(true).notNull(),
});

export const localAuthoritiesRelations = relations(localAuthorities, ({ one, many }) => ({
  province: one(provinces, {
    fields: [localAuthorities.provinceId],
    references: [provinces.id],
  }),
  wards: many(wards),
  issues: many(issues),
}));

export const wards = pgTable("wards", {
  id: serial("id").primaryKey(),
  wardNumber: text("ward_number").notNull(),
  name: text("name"),
  localAuthorityId: integer("local_authority_id").references(() => localAuthorities.id).notNull(),
  boundaryPolygon: jsonb("boundary_polygon").$type<any>(),
  isActive: boolean("is_active").default(true).notNull(),
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveTo: timestamp("effective_to"),
});

export const wardsRelations = relations(wards, ({ one, many }) => ({
  localAuthority: one(localAuthorities, {
    fields: [wards.localAuthorityId],
    references: [localAuthorities.id],
  }),
  suburbs: many(suburbs),
  issues: many(issues),
}));

export const suburbs = pgTable("suburbs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  wardId: integer("ward_id").references(() => wards.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const suburbsRelations = relations(suburbs, ({ one, many }) => ({
  ward: one(wards, {
    fields: [suburbs.wardId],
    references: [wards.id],
  }),
  issues: many(issues),
}));


// Staff members
// Staff table removed. Use users table instead.

// Staff relations removed.

// Comments on issues
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").references(() => issues.id).notNull(),
  userId: integer("user_id").notNull(), // Could be citizen or staff
  userType: text("user_type").notNull(), // citizen, staff, admin
  userName: text("user_name").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  issue: one(issues, {
    fields: [comments.issueId],
    references: [issues.id],
  }),
}));

// Timeline/Activity log
export const timeline = pgTable("timeline", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").references(() => issues.id).notNull(),
  type: text("type").notNull(), // created, status, assigned, comment, escalated
  title: text("title").notNull(),
  description: text("description").notNull(),
  user: text("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timelineRelations = relations(timeline, ({ one }) => ({
  issue: one(issues, {
    fields: [timeline.issueId],
    references: [issues.id],
  }),
}));

// Broadcast alerts
export const broadcasts = pgTable("broadcasts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull(), // info, warning, critical
  targetWards: jsonb("target_wards").$type<string[]>().default([]),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});

// CivicCredits rewards system
export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  citizenId: integer("citizen_id").references(() => citizens.id).notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(), // report_submitted, report_resolved, verification_bonus, etc.
  issueId: integer("issue_id").references(() => issues.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditsRelations = relations(credits, ({ one }) => ({
  citizen: one(citizens, {
    fields: [credits.citizenId],
    references: [citizens.id],
  }),
  issue: one(issues, {
    fields: [credits.issueId],
    references: [issues.id],
  }),
}));

// Upvotes on issues
export const upvotes = pgTable("upvotes", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").references(() => issues.id).notNull(),
  userId: integer("user_id").notNull(), // Citizen ID (or generic user ID if unified)
  userType: text("user_type").notNull().default('citizen'), // citizen, staff
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const upvotesRelations = relations(upvotes, ({ one }) => ({
  issue: one(issues, {
    fields: [upvotes.issueId],
    references: [issues.id],
  }),
}));

// User Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Citizen ID
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  read: true
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Admin users with role-based access control
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role").notNull().default("officer"), // super_admin, admin, manager, officer
  departmentId: integer("department_id").references(() => departments.id),
  escalationLevel: text("escalation_level").notNull().default("L1"), // L1, L2, L3, L4
  permissions: jsonb("permissions").$type<string[]>().default([]),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
}));

// Dynamic Roles
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // Matches users.role
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
  isSystem: boolean("is_system").default(false).notNull(), // Prevent deletion of core roles
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

// Jurisdiction & Categories
export const insertJurisdictionSchema = createInsertSchema(jurisdictions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIssueCategorySchema = createInsertSchema(issueCategories).omit({
  id: true,
  createdAt: true,
});

export const insertOfficerSchema = createInsertSchema(officers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas
export const insertCitizenSchema = createInsertSchema(citizens).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
});

// Staff schema removed

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  trackingId: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertTimelineSchema = createInsertSchema(timeline).omit({
  id: true,
  createdAt: true,
});

export const insertBroadcastSchema = createInsertSchema(broadcasts).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export const insertCreditSchema = createInsertSchema(credits).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  officer: 1,
} as const;

// Escalation level hierarchy
export const ESCALATION_HIERARCHY = {
  L1: 1, // Ward level
  L2: 2, // District level
  L3: 3, // Town House level
  L4: 4, // Ministry level
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

// Permission definitions
export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  MANAGE_USERS: "manage_users",
  MANAGE_STAFF: "manage_staff",
  MANAGE_CITIZENS: "manage_citizens",
  VIEW_REPORTS: "view_reports",
  EDIT_REPORTS: "edit_reports",
  DELETE_REPORTS: "delete_reports",
  ESCALATE_ISSUES: "escalate_issues",
  RESOLVE_ISSUES: "resolve_issues",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_SETTINGS: "manage_settings",
  SEND_BROADCASTS: "send_broadcasts",
} as const;

// Permission metadata for UI display
export const PERMISSION_INFO = {
  view_dashboard: {
    name: 'View Dashboard',
    description: 'Access to admin dashboard and analytics overview',
    category: 'dashboard'
  },
  manage_users: {
    name: 'Manage System Users',
    description: 'Create, edit, and manage system user accounts and roles',
    category: 'user_management'
  },
  manage_staff: {
    name: 'Manage Staff',
    description: 'Add, edit, and remove departmental staff members',
    category: 'user_management'
  },
  manage_citizens: {
    name: 'Manage Citizens',
    description: 'View and manage citizen accounts, suspend users',
    category: 'user_management'
  },
  view_reports: {
    name: 'View Reports',
    description: 'View all submitted issues and reports',
    category: 'reports'
  },
  edit_reports: {
    name: 'Edit Reports',
    description: 'Update issue details, status, and assignments',
    category: 'reports'
  },
  delete_reports: {
    name: 'Delete Reports',
    description: 'Permanently remove issues from the system',
    category: 'reports'
  },
  escalate_issues: {
    name: 'Escalate Issues',
    description: 'Escalate issues to higher authority levels',
    category: 'reports'
  },
  resolve_issues: {
    name: 'Resolve Issues',
    description: 'Mark issues as resolved and verified',
    category: 'reports'
  },
  view_analytics: {
    name: 'View Analytics',
    description: 'Access reports, charts, and system analytics',
    category: 'analytics'
  },
  manage_settings: {
    name: 'Manage Settings',
    description: 'Configure system settings and global parameters',
    category: 'system'
  },
  send_broadcasts: {
    name: 'Send Broadcasts',
    description: 'Create and send alerts to residents',
    category: 'system'
  },
} as const;

// Permission categories for organized display
export const PERMISSION_CATEGORIES = {
  dashboard: {
    label: 'Dashboard',
    description: 'Main dashboard access',
    icon: 'LayoutDashboard'
  },
  user_management: {
    label: 'User Management',
    description: 'Manage users, staff, and citizens',
    icon: 'Users'
  },
  reports: {
    label: 'Reports & Issues',
    description: 'View and manage reported issues',
    icon: 'FileText'
  },
  analytics: {
    label: 'Analytics',
    description: 'View system analytics and statistics',
    icon: 'BarChart'
  },
  system: {
    label: 'System Administration',
    description: 'System-wide settings and broadcasts',
    icon: 'Settings'
  },
} as const;


export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: Object.values(PERMISSIONS),
  admin: Object.values(PERMISSIONS).filter(p => !["manage_settings"].includes(p)), // Example restriction
  manager: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EDIT_REPORTS,
    PERMISSIONS.ESCALATE_ISSUES,
    PERMISSIONS.RESOLVE_ISSUES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_STAFF,
  ],
  officer: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EDIT_REPORTS, // restricted mainly to status updates
    PERMISSIONS.RESOLVE_ISSUES,
  ],
};

export type EscalationLevel = keyof typeof ESCALATION_HIERARCHY;

// Select/Infer types
export type Citizen = typeof citizens.$inferSelect;
export type InsertCitizen = z.infer<typeof insertCitizenSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

// export type Staff = typeof staff.$inferSelect;


export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Timeline = typeof timeline.$inferSelect;
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;

export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcast = z.infer<typeof insertBroadcastSchema>;

export type Credit = typeof credits.$inferSelect;
export type InsertCredit = z.infer<typeof insertCreditSchema>;

export type Upvote = typeof upvotes.$inferSelect;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Admin Hierarchy Types
export type Province = typeof provinces.$inferSelect;
export type LocalAuthority = typeof localAuthorities.$inferSelect;
export type Ward = typeof wards.$inferSelect;
export type Suburb = typeof suburbs.$inferSelect;

export type Jurisdiction = typeof jurisdictions.$inferSelect;
export type InsertJurisdiction = z.infer<typeof insertJurisdictionSchema>;

export type IssueCategory = typeof issueCategories.$inferSelect;
export type InsertIssueCategory = z.infer<typeof insertIssueCategorySchema>;

export type Officer = typeof officers.$inferSelect;
export type InsertOfficer = z.infer<typeof insertOfficerSchema>;

// Credit point values
export const CREDIT_VALUES = {
  report_submitted: 5,
  report_resolved: 10,
  verification_bonus: 3,
  report_photo: 2,
} as const;
