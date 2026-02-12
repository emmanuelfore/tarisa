
import 'dotenv/config';
import { db, pool } from './server/db';
import { issues } from './shared/schema';
import { count } from 'drizzle-orm';

async function check() {
    try {
        const [res] = await db.select({ value: count() }).from(issues);
        console.log('Total issues in database:', res.value);
    } catch (error) {
        console.error('Error counting issues:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

check();
