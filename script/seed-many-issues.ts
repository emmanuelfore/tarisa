
import 'dotenv/config';
import { db, pool } from '../server/db';
import { issues, citizens, jurisdictions, issueCategories } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { storage } from '../server/storage';

const ISSUE_TITLES = [
    "Burst Water Pipe",
    "Missing Manhole Cover",
    "Illegal Dumping",
    "Pothole on Main Road",
    "Broken Street Light",
    "Uncollected Refuse",
    "Faulty Traffic Lights",
    "Overflowing Sewer",
    "Vandalized Public Bench",
    "Overgrown Grass in Park",
    "Illegal Construction",
    "No Water Supply",
    "Low Water Pressure",
    "Power Outage",
    "Dangerously Leaning Tree",
    "Blocked Storm Drain",
    "Abandoned Vehicle",
    "Graffiti on Public Building",
    "Noise Complaint",
    "Stray Dogs in Neighborhood"
];

const ISSUE_DESCRIPTIONS = [
    "The issue has been present for several days and is getting worse.",
    "Needs urgent attention as it poses a safety hazard to residents.",
    "Multiple people have reported this, but no action has been taken yet.",
    "The situation is causing significant inconvenience for everyone in the area.",
    "This is a recurring problem that requires a permanent fix.",
    "The smell is becoming unbearable and attracting pests.",
    "Drivers are having to swerve to avoid this, which is dangerous.",
    "It's pitch black at night, making people feel unsafe walking through.",
    "Water is just wasting away while some areas have no water at all.",
    "This has been reported to the council several times with no response."
];

const STATUSES = ["submitted", "in_progress", "resolved", "verified"];
const PRIORITIES = ["low", "medium", "high", "critical"];

function getRandom(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

async function main() {
    console.log("🌱 Mass Seeding Database with Issues...");

    try {
        // 1. Get or Create a Test Citizen
        let citizen = await db.query.citizens.findFirst({
            where: eq(citizens.email, 'bulk@citizen.com')
        });

        if (!citizen) {
            console.log("Creating bulk test citizen...");
            citizen = await storage.createCitizen({
                name: "Bulk Test Citizen",
                email: "bulk@citizen.com",
                phone: "+263771111111",
                address: "Harare, Zimbabwe",
                ward: "Ward 1",
                emailVerified: true,
                status: 'verified'
            });
        }
        console.log(`Using Citizen ID: ${citizen.id}`);

        // 2. Get Wards
        const allWards = await db.select().from(jurisdictions).where(eq(jurisdictions.level, 'ward'));
        if (allWards.length === 0) {
            console.error("No wards found in jurisdictions table. Please run script/seed-jurisdictions.ts first.");
            process.exit(1);
        }

        // 3. Get Issue Categories
        const categories = await db.select().from(issueCategories).where(eq(issueCategories.isActive, true));
        if (categories.length === 0) {
            console.error("No active issue categories found. Please run the main seed script first.");
            process.exit(1);
        }

        // 4. Generate 200 Issues (Increasing to 200 for better stress test)
        const COUNT = 200;
        console.log(`Generating ${COUNT} issues...`);

        for (let i = 0; i < COUNT; i++) {
            const ward = getRandom(allWards);

            // Try to find a suburb for this ward
            const suburbs = await db.select().from(jurisdictions).where(
                and(
                    eq(jurisdictions.parentId, ward.id),
                    eq(jurisdictions.level, 'suburb')
                )
            );

            const suburb = suburbs.length > 0 ? getRandom(suburbs) : null;
            const targetJurisdiction = suburb || ward;

            const category = getRandom(categories);
            const title = `${getRandom(ISSUE_TITLES)} - ${i + 1}`;
            const description = getRandom(ISSUE_DESCRIPTIONS);
            const status = getRandom(STATUSES);
            const priority = getRandom(PRIORITIES);
            const severity = Math.floor(Math.random() * 100);

            // Random coordinates around Harare center point if available, else generic Harare area
            const center = targetJurisdiction.centerPoint || ward.centerPoint || { lat: -17.8252, lng: 31.0335 };
            const lat = center.lat + getRandomInRange(-0.03, 0.03);
            const lng = center.lng + getRandomInRange(-0.03, 0.03);

            const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);

            await storage.createIssue({
                title,
                description,
                category: category.code,
                location: `${suburb ? suburb.name + ', ' : ''}${ward.name}, Harare`,
                coordinates: `${lat},${lng}`,
                status,
                priority,
                severity,
                citizenId: citizen.id,
                jurisdictionId: targetJurisdiction.id,
                createdAt
            });

            if ((i + 1) % 20 === 0) {
                console.log(`Created ${i + 1} issues...`);
            }
        }

        console.log("✅ Mass Seeding Complete!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main().catch(console.error);
