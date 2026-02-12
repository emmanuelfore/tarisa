import "dotenv/config";
import { db } from "./db";
import { issueCategories, departments } from "@shared/schema";

async function seedCategories() {
    console.log("Seeding Issue Categories...");

    const categoryData = [
        // Roads Department
        { code: "potholes", name: "Potholes", icon: "pothole", parentCategory: "roads", responseTimeHours: 24, resolutionTimeHours: 48 },
        { code: "road_damage", name: "Road Damage", icon: "road", parentCategory: "roads", responseTimeHours: 24, resolutionTimeHours: 72 },
        { code: "streetlights", name: "Streetlights", icon: "sun", parentCategory: "roads", responseTimeHours: 12, resolutionTimeHours: 24 },

        // Water & Sanitation
        { code: "water_leaks", name: "Water Leaks", icon: "droplets", parentCategory: "water", responseTimeHours: 6, resolutionTimeHours: 24 },
        { code: "burst_pipes", name: "Burst Pipes", icon: "wrench", parentCategory: "water", responseTimeHours: 2, resolutionTimeHours: 12 },
        { code: "sewer_overflow", name: "Sewer Overflow", icon: "alert-triangle", parentCategory: "water", responseTimeHours: 2, resolutionTimeHours: 8 },

        // Waste Management
        { code: "uncollected_waste", name: "Uncollected Waste", icon: "trash", parentCategory: "waste", responseTimeHours: 24, resolutionTimeHours: 48 },
        { code: "illegal_dumping", name: "Illegal Dumping", icon: "ban", parentCategory: "waste", responseTimeHours: 12, resolutionTimeHours: 48 },

        // Parks & Recreation
        { code: "damaged_playground", name: "Damaged Playground", icon: "trees", parentCategory: "parks", responseTimeHours: 48, resolutionTimeHours: 168 },
        { code: "overgrown_grass", name: "Overgrown Vegetation", icon: "leaf", parentCategory: "parks", responseTimeHours: 72, resolutionTimeHours: 168 },

        // Public Health
        { code: "stray_animals", name: "Stray Animals", icon: "dog", parentCategory: "health", responseTimeHours: 12, resolutionTimeHours: 48 },
        { code: "pest_infestation", name: "Pest Infestation", icon: "bug", parentCategory: "health", responseTimeHours: 24, resolutionTimeHours: 72 },

        // Public Works
        { code: "building_damage", name: "Building Damage", icon: "building", parentCategory: "public_works", responseTimeHours: 24, resolutionTimeHours: 72 },
        { code: "drainage_issues", name: "Drainage Issues", icon: "droplet", parentCategory: "public_works", responseTimeHours: 24, resolutionTimeHours: 72 },
    ];

    for (const cat of categoryData) {
        try {
            await db.insert(issueCategories).values(cat);
            console.log(`  ✓ ${cat.name}`);
        } catch (error: any) {
            if (error.code === '23505') { // Unique violation
                console.log(`  - ${cat.name} (already exists)`);
            } else {
                console.log(`  ✗ ${cat.name}:`, error.message);
            }
        }
    }

    console.log("\n✅ Categories seeded!");
    process.exit(0);
}

seedCategories();
