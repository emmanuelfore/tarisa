
import "dotenv/config";
import pkg from 'pg';
const { Client } = pkg;

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Connected to database. Adding column...");

        // Check if column exists first
        const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='issues' AND column_name='resolution_photos';
    `);

        if (checkRes.rowCount === 0) {
            await client.query('ALTER TABLE issues ADD COLUMN resolution_photos jsonb DEFAULT \'[]\'::jsonb;');
            console.log("Column 'resolution_photos' added successfully.");
        } else {
            console.log("Column 'resolution_photos' already exists.");
        }

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await client.end();
        process.exit();
    }
}

runMigration();
