
import 'dotenv/config';
import { db } from './server/db';
import { issues, wards } from './shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log("Checking DB Content...");

    // 1. Check Issues
    const allIssues = await db.select().from(issues);
    console.log(`Total Issues: ${allIssues.length}`);
    allIssues.forEach(i => {
        console.log(`- [${i.id}] ${i.title} | Status: ${i.status} | WardId: ${i.wardId}`);
    });

    // 2. Check Wards
    const allWards = await db.select().from(wards);
    console.log(`\nTotal Wards: ${allWards.length}`);
    allWards.forEach(w => console.log(`- [${w.id}] ${w.name} (${w.wardNumber})`));

    // 3. Assign a ward to an issue if possible (for testing UI)
    if (allIssues.length > 0 && allWards.length > 0) {
        const targetIssue = allIssues[0];
        const targetWard = allWards[0];

        if (!targetIssue.wardId) {
            console.log(`\nAssigning Issue ${targetIssue.id} to Ward ${targetWard.id}...`);
            await db.update(issues)
                .set({ wardId: targetWard.id })
                .where(eq(issues.id, targetIssue.id));
            console.log("Update complete.");
        }
    } else if (allWards.length === 0) {
        console.log("\nNo wards found. Seeding a test ward...");
        // Ideally I'd use storage.ts but direct DB is faster for debug script
        // But I need localAuthority first. 
        // Let's just note this.
    }

    process.exit(0);
}

main().catch(console.error);
