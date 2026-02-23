
import "dotenv/config";
import { db } from "./db";
import { users, PERMISSIONS } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function createSuperAdmin() {
    const username = "ICT";
    const password = "ict123";
    const name = "ICT Administrator";
    const email = "ict@tarisa.gov.zw";

    console.log(`Checking if user ${username} exists...`);

    const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username)
    });

    if (existingUser) {
        console.log(`User ${username} already exists. Updating password and permissions...`);
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await db.update(users)
            .set({
                password: hashedPassword,
                role: "super_admin",
                escalationLevel: "L4",
                permissions: Object.values(PERMISSIONS),
                active: true
            })
            .where(eq(users.id, existingUser.id));
        console.log(`User ${username} updated successfully.`);
        return;
    }

    console.log(`Creating superadmin user ${username}...`);
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await db.insert(users).values({
        username: username,
        password: hashedPassword,
        name: name,
        email: email,
        role: "super_admin",
        escalationLevel: "L4",
        permissions: Object.values(PERMISSIONS),
        active: true,
    });

    console.log(`Superadmin user ${username} created successfully.`);
}

createSuperAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Failed to create superadmin:", err);
        process.exit(1);
    });
