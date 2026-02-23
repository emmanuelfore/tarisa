
import "dotenv/config";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifySuperAdmin() {
    const username = "ICT";
    console.log(`Verifying user ${username}...`);

    const user = await db.query.users.findFirst({
        where: eq(users.username, username)
    });

    if (user) {
        console.log("User Found:");
        console.log(`ID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Name: ${user.name}`);
        console.log(`Role: ${user.role}`);
        console.log(`Permissions Count: ${Array.isArray(user.permissions) ? user.permissions.length : 0}`);
        console.log(`Escalation Level: ${user.escalationLevel}`);
    } else {
        console.log("User NOT found.");
    }
}

verifySuperAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Verification failed:", err);
        process.exit(1);
    });
