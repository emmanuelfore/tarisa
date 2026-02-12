
import "dotenv/config";
import { db } from "./db";
import { users, staff, officers, issues } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function migrateStaff() {
    console.log("Starting Staff -> Users/Officers Migration...");

    try {
        const allStaff = await db.select().from(staff);
        console.log(`Found ${allStaff.length} staff records to migrate.`);

        for (const s of allStaff) {
            console.log(`Processing staff: ${s.name} (${s.email || 'no email'})`);

            // 1. Create or Find User
            let userId: number;
            // Generate a username/email if missing
            const email = s.email || `${s.name.toLowerCase().replace(/\s+/g, '.')}@system.local`;
            const username = s.email ? s.email.split('@')[0] : s.name.toLowerCase().replace(/\s+/g, '.');

            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, email)
            });

            if (existingUser) {
                userId = existingUser.id;
                console.log(`  - Linked to existing user ID: ${userId}`);
            } else {
                const hashedPassword = await bcrypt.hash("officer123", SALT_ROUNDS);
                const [newUser] = await db.insert(users).values({
                    name: s.name,
                    email: email,
                    username: username,
                    password: hashedPassword,
                    role: "officer", // Default role
                    departmentId: s.departmentId,
                    active: s.active,
                    permissions: ["view_reports", "update_status"]
                }).returning();
                userId = newUser.id;
                console.log(`  - Created new user ID: ${userId}`);
            }

            // 2. Create Officer Record (if not exists)
            // Check if this user is already an officer
            const existingOfficer = await db.query.officers.findFirst({
                where: eq(officers.userId, userId)
            });

            let officerId: number;

            if (existingOfficer) {
                officerId = existingOfficer.id;
                console.log(`  - Officer record already exists ID: ${officerId}`);
            } else {
                const [newOfficer] = await db.insert(officers).values({
                    userId: userId,
                    fullName: s.name,
                    departmentId: s.departmentId,
                    role: s.role,
                    workEmail: email,
                    isActive: s.active,
                    employeeNumber: `EMP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` // Temp gen
                }).returning();
                officerId = newOfficer.id;
                console.log(`  - Created officer record ID: ${officerId}`);
            }

            // 3. Migrate Issue Assignments
            // Find issues assigned to this staff.id
            const assignedIssues = await db.select().from(issues).where(eq(issues.assignedStaffId, s.id));
            if (assignedIssues.length > 0) {
                console.log(`  - Migrating ${assignedIssues.length} issues from Staff #${s.id} to Officer #${officerId}`);
                await db.update(issues)
                    .set({
                        assignedOfficerId: officerId,
                        assignedStaffId: null // Clear legacy field
                    })
                    .where(eq(issues.assignedStaffId, s.id));
            }
        }

        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        process.exit();
    }
}

migrateStaff();
