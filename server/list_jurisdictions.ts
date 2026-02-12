
import "dotenv/config";
import { db } from "./db";
import { jurisdictions } from "@shared/schema";

async function listAllJurisdictions() {
    try {
        const results = await db.select().from(jurisdictions);
        console.log("All Jurisdictions:");
        results.forEach(j => {
            console.log(`ID: ${j.id}, Code: ${j.code}, Name: ${j.name}, Level: ${j.level}, Parent: ${j.parentId}`);
        });
    } catch (error) {
        console.error("Error fetching jurisdictions:", error);
    } finally {
        process.exit();
    }
}

listAllJurisdictions();
