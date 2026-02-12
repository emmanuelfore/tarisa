
import 'dotenv/config';
import { db, pool } from './server/db';
import { citizens, issues, jurisdictions, issueCategories } from './shared/schema';
import { count } from 'drizzle-orm';

async function diagnose() {
    try {
        const [issueCount] = await db.select({ value: count() }).from(issues);
        const [citizenCount] = await db.select({ value: count() }).from(citizens);
        const [jurisdictionCount] = await db.select({ value: count() }).from(jurisdictions);
        const [categoryCount] = await db.select({ value: count() }).from(issueCategories);

        console.log('--- Database Diagnostics ---');
        console.log('Total Issues:', issueCount.value);
        console.log('Total Citizens:', citizenCount.value);
        console.log('Total Jurisdictions:', jurisdictionCount.value);
        console.log('Total Categories:', categoryCount.value);

        const lastIssues = await db.select().from(issues).limit(5);
        console.log('Recent 5 issues:', JSON.stringify(lastIssues, null, 2));

    } catch (error) {
        console.error('Diagnosis failed:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

diagnose();
