
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function check() {
    try {
        const allUsers = await db.select().from(users);
        console.log("Total users found:", allUsers.length);
        allUsers.forEach(u => {
            console.log(`User: ${u.username}, Role: ${u.role}, Active: ${u.active}, ID: ${u.id}`);
        });
        process.exit(0);
    } catch (e) {
        console.error("Error checking users:", e);
        process.exit(1);
    }
}

check();
