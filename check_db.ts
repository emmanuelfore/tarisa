
import "dotenv/config";
import { db } from "./server/db";
import { jurisdictions } from "./shared/schema";
import { sql } from "drizzle-orm";

async function check() {
    try {
        console.log("Checking DB...");
        const result = await db.execute(sql`SELECT 1`);
        console.log("Select 1 success:", result);

        const jurCount = await db.execute(sql`SELECT count(*) FROM jurisdictions`);
        console.log("Jurisdictions count:", jurCount);
    } catch (e) {
        console.error("Check failed:", e);
    } finally {
        process.exit(0);
    }
}

check();
