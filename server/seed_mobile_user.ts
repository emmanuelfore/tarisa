
import "dotenv/config";
import { db } from "./db";
import { users } from "../shared/schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seedMobileUser() {
    console.log("Seeding mobile citizen user...");

    const password = "citizen123";
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
        await db.insert(users).values({
            username: "citizen",
            password: hashedPassword,
            name: "John Citizen",
            email: "citizen@tarisa.gov.zw",
            role: "citizen",
            escalationLevel: "L1", // Default
            permissions: ["create_issue", "view_my_issues"],
            active: true,
        });
        console.log("Created user: citizen / citizen123");
    } catch (e) {
        console.log("User might already exist or error:", e);
    }
}

seedMobileUser()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    });
