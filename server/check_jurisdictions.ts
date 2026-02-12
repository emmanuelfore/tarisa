
import "dotenv/config";
import { db } from "./db";
import { jurisdictions } from "@shared/schema";

async function checkJurisdictions() {
    try {
        console.log("Checking jurisdictions...");
        const results = await db.select().from(jurisdictions);
        console.log(`Found ${results.length} jurisdictions.`);
        if (results.length > 0) {
            console.log("Sample jurisdiction:", JSON.stringify(results[0], null, 2));
        }
    } catch (error) {
        console.error("Error fetching jurisdictions:", error);
    } finally {
        process.exit();
    }
}

checkJurisdictions();
