
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { citizens } from "../shared/schema";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/civic_db"; // Default fallback
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function listCitizens() {
    try {
        const allCitizens = await db.select().from(citizens);
        console.log(`Found ${allCitizens.length} citizens:`);
        allCitizens.forEach(c => {
            console.log(`- ${c.name} (${c.email}) - Ward: ${c.ward}, NID: ${c.nid}`);
        });
    } catch (error) {
        console.error("Error listing citizens:", error);
    }
    process.exit(0);
}

listCitizens();
