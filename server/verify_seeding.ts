
import "dotenv/config";
import { db } from "./db";
import { jurisdictions, departments, issueCategories } from "@shared/schema";
import { sql } from "drizzle-orm";

async function verify() {
    const jurisCount = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(jurisdictions);
    const deptCount = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(departments);
    const catCount = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(issueCategories);

    console.log("Database Counts:");
    console.log(`- Jurisdictions: ${jurisCount[0].count}`);
    console.log(`- Departments: ${deptCount[0].count}`);
    console.log(`- Issue Categories: ${catCount[0].count}`);
}

verify().catch(console.error);
