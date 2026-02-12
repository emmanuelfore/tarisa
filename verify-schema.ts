
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking citizens table schema...");
    try {
        const result = await db.execute(sql`
      SELECT table_schema, table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'citizens' AND column_name = 'password';
    `);
        console.log("Found columns:", result.rows);
    } catch (error) {
        console.error("Error checking schema:", error);
    }
    process.exit(0);
}

main();
