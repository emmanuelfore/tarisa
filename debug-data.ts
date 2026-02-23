process.env.DATABASE_URL = "postgresql://postgres.sdcmpmfcqmfzkeizvvlf:a8gCc2ZQ..Y7d.J@aws-1-eu-west-1.pooler.supabase.com:5432/postgres";
import { storage } from "./server/storage";
import { db } from "./server/db";
import { citizens, issues } from "./shared/schema";
import { count, eq } from "drizzle-orm";

async function debug() {
    console.log("--- Citizens ---");
    const allCitizens = await db.select().from(citizens);
    for (const c of allCitizens) {
        const [issueCount] = await db.select({ val: count() }).from(issues).where(eq(issues.citizenId, c.id));
        console.log(`Citizen: ${c.name} (${c.email}), ID: ${c.id}, Issues: ${issueCount.val}`);
    }

    console.log("\n--- Issues without Valid Citizen ---");
    const orphanIssues = await db.select().from(issues);
    for (const i of orphanIssues) {
        const [citizen] = await db.select().from(citizens).where(eq(citizens.id, i.citizenId));
        if (!citizen) {
            console.log(`Orphan Issue: ${i.title}, Tracking ID: ${i.trackingId}, CitizenID: ${i.citizenId}`);
        }
    }

    process.exit(0);
}

debug().catch(console.error);
