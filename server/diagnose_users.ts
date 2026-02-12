
import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";

async function diagnose() {
    console.log("--- Starting User Diagnosis ---");
    try {
        const rows = await db.select().from(users);
        console.log(`Total users found: ${rows.length}`);

        for (const r of rows) {
            const isHashed = r.password.startsWith("$2b$") || r.password.startsWith("$2a$");
            console.log(`User: ${r.username}`);
            console.log(`  - Role: ${r.role}`);
            console.log(`  - Password Length: ${r.password.length}`);
            console.log(`  - Is Hashed (bcrypt): ${isHashed}`);

            // Test against common passwords if possible or just log hash prefix
            if (isHashed) {
                console.log(`  - Hash prefix: ${r.password.substring(0, 10)}...`);
            } else {
                console.log(`  - Raw Password (partial): ${r.password.substring(0, 2)}...`);
            }
        }
    } catch (error) {
        console.error("Diagnosis failed:", error);
    } finally {
        process.exit(0);
    }
}

diagnose();
