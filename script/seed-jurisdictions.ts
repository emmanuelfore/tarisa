
import 'dotenv/config';
import { db, pool } from '../server/db';
import { jurisdictions } from '../shared/schema';
import { eq } from 'drizzle-orm';

const HARARE_WARDS = [
    { number: 1, suburbs: ["CBD", "Avenues"] },
    { number: 2, suburbs: ["Milton Park", "Belvedere"] },
    { number: 3, suburbs: ["Mbare East"] },
    { number: 4, suburbs: ["Mbare west"] },
    { number: 5, suburbs: ["Sunningdale", "Ardbennie"] },
    { number: 6, suburbs: ["Milton Park South"] },
    { number: 7, suburbs: ["Avondale", "Belgravia", "Alexandra Park"] },
    { number: 8, suburbs: ["Highlands", "Newlands"] },
    { number: 9, suburbs: ["Greendale", "Athlone", "Mandara"] },
    { number: 10, suburbs: ["Borrowdale West", "Mount Pleasant"] },
    { number: 11, suburbs: ["Mabvuku East"] },
    { number: 12, suburbs: ["Mabvuku West"] },
    { number: 13, suburbs: ["Epworth"] }, // Usually separate but often grouped
    { number: 14, suburbs: ["Kambuzuma"] },
    { number: 15, suburbs: ["Warren Park 1", "Warren Park 2"] },
    { number: 16, suburbs: ["Mabelreign", "Ashdown Park", "Sentosa"] },
    { number: 17, suburbs: ["Mount Pleasant", "Vainona", "Northwood"] },
    { number: 18, suburbs: ["Borrowdale", "Glen Lorne", "Helensvale"] },
    { number: 19, suburbs: ["Mabvuku North"] },
    { number: 20, suburbs: ["Tafara"] },
    { number: 21, suburbs: ["Mabvuku South"] },
    { number: 22, suburbs: ["Hatfield", "Epworth South"] },
    { number: 23, suburbs: ["Waterfalls", "Parktown", "Mainway Meadows"] },
    { number: 24, suburbs: ["Highfield East"] },
    { number: 25, suburbs: ["Highfield West"] },
    { number: 26, suburbs: ["Highfield South"] },
    { number: 27, suburbs: ["Glen Norah A"] },
    { number: 28, suburbs: ["Glen Norah B"] },
    { number: 29, suburbs: ["Glen View 1", "Glen View 2"] },
    { number: 30, suburbs: ["Glen View 3", "Glen View 4"] },
    { number: 31, suburbs: ["Glen Norah C"] },
    { number: 32, suburbs: ["Glen Norah Tilla"] },
    { number: 33, suburbs: ["Budiriro 1", "Budiriro 2"] },
    { number: 34, suburbs: ["Budiriro 3", "Budiriro 4", "Budiriro 5"] },
    { number: 35, suburbs: ["Mufakose"] },
    { number: 36, suburbs: ["Mufakose North"] },
    { number: 37, suburbs: ["Kuwadzana 1", "Kuwadzana 2"] },
    { number: 38, suburbs: ["Kuwadzana 3", "Kuwadzana 4"] },
    { number: 39, suburbs: ["Dzivarasekwa 1", "Dzivarasekwa 2"] },
    { number: 40, suburbs: ["Dzivarasekwa Extension"] },
    { number: 41, suburbs: ["Marlborough", "Avonlea"] },
    { number: 42, suburbs: ["Hatcliffe"] },
    { number: 43, suburbs: ["Budiriro South"] },
    { number: 44, suburbs: ["KuwadzanaExtension"] },
    { number: 45, suburbs: ["Kuwadzana South"] },
    { number: 46, suburbs: ["Harare West Rural"] }
];

async function main() {
    console.log("🌱 Seeding Jurisdictions (Harare Wards & Suburbs)...");

    try {
        // 1. Ensure Harare District exists
        let [harare] = await db.select().from(jurisdictions).where(eq(jurisdictions.code, "ZW-HA")).limit(1);
        if (!harare) {
            console.log("Creating Harare District...");
            [harare] = await db.insert(jurisdictions).values({
                code: "ZW-HA",
                name: "Harare",
                level: "district",
                serviceProvider: "Harare City Council"
            }).returning();
        }

        // 2. Seed Wards
        console.log(`Seeding ${HARARE_WARDS.length} wards...`);
        for (const wardData of HARARE_WARDS) {
            const wardCode = `ZW-HA-W${wardData.number}`;
            let [ward] = await db.select().from(jurisdictions).where(eq(jurisdictions.code, wardCode)).limit(1);

            if (!ward) {
                [ward] = await db.insert(jurisdictions).values({
                    code: wardCode,
                    name: `Ward ${wardData.number}`,
                    level: "ward",
                    parentId: harare.id,
                    serviceProvider: "Harare City Council"
                }).returning();
                console.log(`+ Created Ward ${wardData.number}`);
            } else {
                console.log(`~ Ward ${wardData.number} already exists`);
            }

            // 3. Seed Suburbs for this ward
            for (const suburbName of wardData.suburbs) {
                const subCode = `ZW-HA-W${wardData.number}-${suburbName.replace(/\s+/g, '-').toUpperCase()}`;
                const [existingSub] = await db.select().from(jurisdictions).where(eq(jurisdictions.code, subCode)).limit(1);

                if (!existingSub) {
                    await db.insert(jurisdictions).values({
                        code: subCode,
                        name: suburbName,
                        level: "suburb",
                        parentId: ward.id,
                        serviceProvider: "Harare City Council"
                    });
                    // console.log(`  + Created Suburb: ${suburbName}`);
                }
            }
        }

        console.log("✅ Jurisdiction Seeding Complete!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main().catch(console.error);
