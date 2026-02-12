
import 'dotenv/config';
import { db } from './server/db';
import { issues, citizens, wards } from './shared/schema';
import { eq } from 'drizzle-orm';
import { storage } from './server/storage';

async function main() {
    console.log("🌱 Seeding Database with Issues...");

    // 1. Get or Create a Test Citizen
    let citizen = await db.query.citizens.findFirst({
        where: eq(citizens.email, 'test@citizen.com')
    });

    if (!citizen) {
        console.log("Creating test citizen...");
        citizen = await storage.createCitizen({
            name: "Test Citizen",
            email: "test@citizen.com",
            phone: "+263770000000",
            address: "123 Samora Machel Ave, Harare",
            ward: "Ward 7",
            emailVerified: true,
            status: 'verified'
        });
    }
    console.log(`Using Citizen ID: ${citizen.id}`);

    // 2. Get Wards (to link issues)
    const allWards = await db.select().from(wards).limit(5);
    const wardId = allWards.length > 0 ? allWards[0].id : null;
    console.log(`Using Ward ID: ${wardId} (${allWards.length > 0 ? allWards[0].name : 'None'})`);

    // 3. Define Issues to Seed
    const issuesToSeed = [
        {
            title: "Illegal Dumping Site",
            description: "Pile of garbage growing next to the park. Smell is terrible. Needs immediate clearing.",
            category: "Waste",
            location: "Harare Gardens, South Gate",
            coordinates: "-17.8292,31.0522", // Harare Gardens
            status: "verified",
            priority: "high",
            severity: 75,
            wardId: wardId,
            photos: ["https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=1000"],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        },
        {
            title: "Burst Water Pipe",
            description: "Clean water flowing down the street for 2 days. Please fix this wastage.",
            category: "Water",
            location: "Corner 2nd St and Jason Moyo",
            coordinates: "-17.8277,31.0533",
            status: "submitted",
            priority: "critical",
            severity: 90,
            wardId: wardId,
            photos: ["https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&q=80&w=1000"],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
            title: "Pothole on Samora Machel",
            description: "Deep pothole causing traffic buildup near the intersection.",
            category: "Roads",
            location: "Samora Machel Ave",
            coordinates: "-17.8252,31.0335",
            status: "in_progress",
            priority: "medium",
            severity: 40,
            wardId: wardId,
            photos: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1000"],
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        {
            title: "Street Light Broken",
            description: "Street light not working, area is very dark and dangerous at night.",
            category: "Lights",
            location: "Borrowdale Road",
            coordinates: "-17.7946,31.0530",
            status: "submitted",
            priority: "medium",
            severity: 30,
            wardId: wardId,
            photos: [],
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        }
    ];

    // 4. Insert Issues
    console.log(`Seeding ${issuesToSeed.length} issues...`);
    for (const issueData of issuesToSeed) {
        // Check if title exists to avoid duplicates in this run
        const existing = await db.query.issues.findFirst({
            where: eq(issues.title, issueData.title)
        });

        if (!existing) {
            await storage.createIssue({
                ...issueData,
                citizenId: citizen.id,
                // trackingId generated automatically in createIssue
            });
            console.log(`+ Created: ${issueData.title}`);
        } else {
            console.log(`~ Skipped (Exists): ${issueData.title}`);
        }
    }

    console.log("✅ Seeding Complete!");
    process.exit(0);
}

main().catch(console.error);
