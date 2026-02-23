import 'dotenv/config'; // Load env vars
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding verification columns...");

    try {
        await db.execute(sql`
      ALTER TABLE issues 
      ADD COLUMN IF NOT EXISTS verified_at timestamp,
      ADD COLUMN IF NOT EXISTS verified_by integer REFERENCES users(id);
    `);
        console.log("Successfully added columns.");
    } catch (error) {
        console.error("Error updating schema:", error);
    }

    process.exit(0);
}

main();
