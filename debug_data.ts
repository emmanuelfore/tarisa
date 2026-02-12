
import { db } from "./server/db";
import { users, citizens, issues } from "./shared/schema";
import { eq, count } from "drizzle-orm";

async function debugData() {
    console.log("--- Users ---");
    const allUsers = await db.select().from(users);
    for (const u of allUsers) {
        console.log(`User: ${u.username} (ID: ${u.id}), Email: ${u.email}, Role: ${u.role}`);
    }

    console.log("\n--- Citizens ---");
    const allCitizens = await db.select().from(citizens);
    for (const c of allCitizens) {
        console.log(`Citizen: ${c.name} (ID: ${c.id}), Email: ${c.email}, Phone: ${c.phone}`);
    }

    console.log("\n--- Issues ---");
    const allIssues = await db.select().from(issues);
    console.log(`Total Issues: ${allIssues.length}`);
    for (const i of allIssues) {
        console.log(`Issue ${i.id}: ${i.title}, Status: ${i.status}, CitizenID: ${i.citizenId}`);
    }
}

debugData().catch(console.error).finally(() => process.exit());
