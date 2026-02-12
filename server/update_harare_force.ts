
import "dotenv/config";
import { db } from "./db";
import { departments } from "@shared/schema";
import { eq, like } from "drizzle-orm";
import { ZIMBABWE_STRUCTURE } from "./data/zimbabwe_structure";

async function forceUpdateHarareDepartments() {
    console.log("Force Updating Harare Departments...");

    // Harare departments are likely the first ones or have specific names
    const harareDepts = await db.query.departments.findMany({
        where: like(departments.name, "%(City of Harare)%")
    });

    console.log(`Found ${harareDepts.length} Harare departments.`);

    for (const dept of harareDepts) {
        // Find matching definition in ZIMBABWE_STRUCTURE
        // Expected name format: "Roads and Highways Department (City of Harare)"
        // We need to extract the base name to match with ZIMBABWE_STRUCTURE
        const baseName = dept.name.replace(" (City of Harare)", "");

        let match = null;
        for (const [key, def] of Object.entries(ZIMBABWE_STRUCTURE.departments)) {
            if (def.name === baseName) {
                match = { key, ...def };
                break;
            }
        }

        if (match) {
            console.log(`Updating ${dept.name}...`);
            const newCode = `ZW-HA-CITY-` + match.code;

            await db.update(departments)
                .set({
                    code: newCode,
                    handlesCategories: match.categories,
                    // valid keys for update
                })
                .where(eq(departments.id, dept.id));

            console.log(`  -> Code: ${newCode}`);
            console.log(`  -> Categories: ${match.categories.join(", ")}`);
        } else {
            console.log(`No match found for ${dept.name}`);
        }
    }
    console.log("Done.");
}

forceUpdateHarareDepartments();
