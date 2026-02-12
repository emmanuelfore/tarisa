
import 'dotenv/config';
import { storage } from './server/storage';
import { db } from './server/db';
import { issues } from './shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log("Checking nearby issues logic...");

    // 1. Get a real issue from DB to use as reference
    const allIssues = await db.select().from(issues).limit(1);
    if (allIssues.length === 0) {
        console.log("No issues in DB to test with.");
        return;
    }

    const target = allIssues[0];
    console.log(`Target Issue: ID ${target.id}, Coords: ${target.coordinates}`);

    if (!target.coordinates) {
        console.log("Target issue has no coordinates.");
        return;
    }

    const [lat, lng] = target.coordinates.split(',').map(Number);

    // 2. Test exact location
    console.log(`\nTesting exact location (${lat}, ${lng})...`);
    const nearbyExact = await storage.getNearbyIssues(lat, lng, 0.05); // 50m
    console.log(`Found ${nearbyExact.length} issues (Expected at least 1)`);
    nearbyExact.forEach(i => console.log(` - ID ${i.id}: ${i.title} (${i.coordinates})`));

    // 3. Test slightly offset location (approx 10 meters)
    // 0.0001 deg is roughly 11 meters
    const offsetLat = lat + 0.0001;
    console.log(`\nTesting offset location (${offsetLat}, ${lng}) - approx 11m away...`);
    const nearbyOffset = await storage.getNearbyIssues(offsetLat, lng, 0.05);
    console.log(`Found ${nearbyOffset.length} issues`);
    nearbyOffset.forEach(i => console.log(` - ID ${i.id}: ${i.title}`));

    // 4. Test far location
    console.log(`\nTesting far location (${lat + 1.0}, ${lng})...`);
    const nearbyFar = await storage.getNearbyIssues(lat + 1.0, lng, 0.05);
    console.log(`Found ${nearbyFar.length} issues (Expected 0)`);

    process.exit(0);
}

main().catch(console.error);
