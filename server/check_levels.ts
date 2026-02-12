
import "dotenv/config";
import { db } from "./db";
import { jurisdictions } from "@shared/schema";
import { sql } from "drizzle-orm";

async function checkLevels() {
    try {
        const results = await db
            .select({ level: jurisdictions.level, count: sql<number>`count(*)` })
            .from(jurisdictions)
            .groupBy(jurisdictions.level);
        console.log("Jurisdiction levels in database:", results);
    } catch (error) {
        console.error("Error checking levels:", error);
    } finally {
        process.exit();
    }
}

checkLevels();
