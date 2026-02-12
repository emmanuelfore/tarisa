
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Attempting to fix citizens table schema directly...");
    try {
        // Check if column exists
        const check = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'citizens' AND column_name = 'password';
    `);

        if (check.rows.length === 0) {
            console.log("Column 'password' missing. Adding it now...");
            await db.execute(sql`
        ALTER TABLE citizens 
        ADD COLUMN password TEXT NOT NULL DEFAULT '$2b$10$EpRnTzVlqHNP0.f0T2u16.tABCdefg';
      `);
            console.log("Successfully added 'password' column.");
        } else {
            console.log("Column 'password' already exists.");
        }

    } catch (error) {
        console.error("Schema Fix Error:", error);
    }
    process.exit(0);
}

main();
