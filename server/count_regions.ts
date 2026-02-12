
import "dotenv/config";
import { db } from "./db";
import { provinces, localAuthorities, wards, suburbs } from "@shared/schema";
import { count } from "drizzle-orm";

async function checkCounts() {
    try {
        const [pCount] = await db.select({ count: count() }).from(provinces);
        const [aCount] = await db.select({ count: count() }).from(localAuthorities);
        const [wCount] = await db.select({ count: count() }).from(wards);
        const [sCount] = await db.select({ count: count() }).from(suburbs);

        console.log("Database Region Counts:");
        console.log(`Provinces: ${pCount.count}`);
        console.log(`Local Authorities: ${aCount.count}`);
        console.log(`Wards: ${wCount.count}`);
        console.log(`Suburbs: ${sCount.count}`);
        process.exit(0);
    } catch (e) {
        console.error("Error counting:", e);
        process.exit(1);
    }
}

checkCounts();
