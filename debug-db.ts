
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Testing DB connection...");
    try {
        const res = await db.execute(sql`SELECT 1 as "test"`);
        console.log("Connection successful:", res.rows);

        console.log("Testing citizens table select...");
        const citizens = await db.execute(sql`SELECT * FROM citizens LIMIT 1`);
        console.log("Citizens select successful:", citizens.rows);
    } catch (error) {
        console.error("DB Error:", error);
    }
    process.exit(0);
}

main();
