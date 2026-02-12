
import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, inArray, notInArray } from "drizzle-orm";

const VALID_ROLES = ["super_admin", "admin", "manager", "officer"];

async function fixUserRoles() {
    console.log("Checking for users with invalid roles...");

    const invalidUsers = await db.select().from(users).where(
        notInArray(users.role, VALID_ROLES)
    );

    console.log(`Found ${invalidUsers.length} users with invalid roles.`);

    for (const user of invalidUsers) {
        let newRole = "officer";
        const oldRole = user.role.toLowerCase();

        if (oldRole.includes("admin") || oldRole === "system admin") {
            newRole = "admin";
        } else if (oldRole.includes("manager") || oldRole.includes("head") || oldRole === "department head") {
            newRole = "manager";
        } else if (oldRole.includes("dispatcher")) {
            newRole = "officer"; // or manager?
        }

        console.log(`Migrating User ${user.id} (${user.name}): '${user.role}' -> '${newRole}'`);

        await db.update(users)
            .set({ role: newRole })
            .where(eq(users.id, user.id));
    }

    console.log("Role fix completed.");
    process.exit(0);
}

fixUserRoles().catch(console.error);
