import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function resetPassword() {
    console.log("--- Resetting Admin Passwords ---");

    try {
        const passwordMap = {
            "superadmin": "admin123",
            "townhouse": "town123",
            "ward_officer": "ward123"
        };

        for (const [username, plainPassword] of Object.entries(passwordMap)) {
            const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

            const result = await db.update(users)
                .set({ password: hashedPassword })
                .where(eq(users.username, username))
                .returning();

            if (result.length > 0) {
                console.log(`✅ Reset password for: ${username} → ${plainPassword}`);
            } else {
                console.log(`❌ User not found: ${username}`);
            }
        }

        console.log("\n--- Password Reset Complete ---");
        console.log("You can now login with:");
        console.log("  superadmin / admin123");
        console.log("  townhouse / town123");
        console.log("  ward_officer / ward123");
    } catch (error) {
        console.error("Password reset failed:", error);
    } finally {
        process.exit(0);
    }
}

resetPassword();
