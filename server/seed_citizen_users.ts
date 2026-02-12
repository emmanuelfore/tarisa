
import "dotenv/config";
import { db } from "./db";
import { users, citizens } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seedCitizenUsers() {
    console.log("Seeding user accounts for existing citizens...");

    const allCitizens = await db.select().from(citizens);

    for (const citizen of allCitizens) {
        if (!citizen.email) continue;

        // Generate a username from email (e.g. tendai.makoni)
        const username = citizen.email.split('@')[0];

        const existingUser = await db.query.users.findFirst({
            where: eq(users.username, username)
        });

        if (existingUser) {
            console.log(`User ${username} already exists. Skipping.`);
            continue;
        }

        console.log(`Creating user for ${citizen.name} (${username})...`);
        const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);

        await db.insert(users).values({
            username: username,
            password: hashedPassword,
            name: citizen.name,
            email: citizen.email,
            role: "citizen",
            escalationLevel: "L1",
            permissions: ["create_issue", "view_my_issues", "view_broadcasts"],
            active: true,
        });
    }
}

seedCitizenUsers()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    });
