
import { db } from "./db";
import { issues } from "../shared/schema";
import { isNotNull } from "drizzle-orm";

async function check() {
    try {
        const allIssues = await db.select().from(issues).where(isNotNull(issues.coordinates));
        console.log(`Found ${allIssues.length} issues with coordinates.`);
        allIssues.forEach(i => {
            console.log(`ID: ${i.id}, Coordinates: ${i.coordinates}, Status: ${i.status}`);
        });
    } catch (e) {
        console.error("Check failed:", e);
    } finally {
        process.exit(0);
    }
}

check();
