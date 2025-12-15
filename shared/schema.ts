import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, serial } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const citizensRelations = relations(citizens, ({ many }) => ({
  issues: many(issues),
}));

// Departments/Authorities
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // Municipal, Parastatal, Police, Government
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  staff: many(staff),
  issues: many(issues),
}));

// Staff members
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  departmentId: integer("department_id").references(() => departments.id).notNull(),
  phone: text("phone"),
  email: text("email"),
  active: boolean("active").default(true).notNull(),
});

export const staffRelations = relations(staff, ({ one, many }) => ({
  department: one(departments, {
    fields: [staff.departmentId],
    references: [departments.id],
  }),
  assignedIssues: many(issues),
}));

// Issues/Reports
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  trackingId: text("tracking_id").notNull().unique(), // TAR-2025-XXXX
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Roads, Water, Sewer, Lights, Waste, etc.
  location: text("location").notNull(),
  coordinates: text("coordinates"), // lat,lng
  status: text("status").notNull().default("submitted"), // submitted, verified, in_progress, resolved, rejected
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  severity: integer("severity").default(50), // 0-100 for heatmap
  
  citizenId: integer("citizen_id").references(() => citizens.id).notNull(),
  
  assignedDepartmentId: integer("assigned_department_id").references(() => departments.id),
  assignedStaffId: integer("assigned_staff_id").references(() => staff.id),
  escalationLevel: text("escalation_level").default("L1").notNull(), // L1-L4
  
  photos: jsonb("photos").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
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
  assignedStaff: one(staff, {
    fields: [issues.assignedStaffId],
    references: [staff.id],
  }),
  comments: many(comments),
  timeline: many(timeline),
}));

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

// Admin users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"), // admin, staff
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
});

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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Select/Infer types
export type Citizen = typeof citizens.$inferSelect;
export type InsertCitizen = z.infer<typeof insertCitizenSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Timeline = typeof timeline.$inferSelect;
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;

export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcast = z.infer<typeof insertBroadcastSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
