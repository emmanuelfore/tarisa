
import "dotenv/config";
import { db } from "./db";
import { departments } from "@shared/schema";

async function listDepartments() {
    try {
        const results = await db.select().from(departments);
        console.log("All Departments:");
        if (results.length === 0) {
            console.log("No departments found.");
        }
        results.forEach(d => {
            console.log(`ID: ${d.id}, Code: ${d.code}, Name: ${d.name}, JurisdictionID: ${d.jurisdictionId}`);
        });
    } catch (error) {
        console.error("Error fetching departments:", error);
    } finally {
        process.exit();
    }
}

listDepartments();
