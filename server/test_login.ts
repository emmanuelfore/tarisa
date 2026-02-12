import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function testLogin() {
    console.log("--- Testing Login Flow ---\n");

    try {
        const testUsername = "superadmin";
        const testPassword = "admin123";

        console.log(`1. Looking up user: ${testUsername}`);
        const [user] = await db.select().from(users).where(eq(users.username, testUsername));

        if (!user) {
            console.log("❌ User not found!");
            return;
        }

        console.log(`✅ User found: ${user.username}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Active: ${user.active}`);
        console.log(`   - Password hash (first 20 chars): ${user.password.substring(0, 20)}...`);

        console.log(`\n2. Testing password: "${testPassword}"`);
        const isValid = await bcrypt.compare(testPassword, user.password);

        if (isValid) {
            console.log("✅ PASSWORD MATCHES!");
        } else {
            console.log("❌ PASSWORD DOES NOT MATCH!");

            // Try some common variations
            console.log("\n3. Testing password variations:");
            const variations = ["Admin123", "ADMIN123", "admin", "admin1234"];
            for (const v of variations) {
                const matches = await bcrypt.compare(v, user.password);
                console.log(`   - "${v}": ${matches ? "✅ MATCH" : "❌ no match"}`);
            }
        }

        console.log("\n--- Test Complete ---");
    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        process.exit(0);
    }
}

testLogin();
