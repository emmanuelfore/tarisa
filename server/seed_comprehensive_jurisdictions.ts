
import "dotenv/config";
import { db } from "./db";
import { jurisdictions, issueCategories, departments, officers, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { ZIMBABWE_STRUCTURE } from "./data/zimbabwe_structure";

const SALT_ROUNDS = 10;

async function seed() {
    console.log("Seeding Comprehensive Zimbabwe Jurisdictions & Departments from Structure Data...");

    try {
        // 0. Seed Base Users
        console.log("Seeding Base Users...");
        const userData = [
            { username: "superadmin", password: "admin123", name: "System Administrator", email: "admin@tarisa.gov.zw", role: "super_admin", escalationLevel: "L4", departmentId: null, permissions: ["all"], active: true },
            { username: "townhouse", password: "town123", name: "Town House Director", email: "director@harare.gov.zw", role: "admin", escalationLevel: "L3", departmentId: null, permissions: ["view_all", "assign", "escalate"], active: true },
            { username: "ward_officer", password: "ward123", name: "Ward Officer", email: "ward@harare.gov.zw", role: "officer", escalationLevel: "L1", departmentId: null, permissions: ["view_ward", "update_status"], active: true },
        ];

        const userIds: Record<string, number> = {};
        for (const u of userData) {
            const existing = await db.query.users.findFirst({
                where: eq(users.username, u.username)
            });

            if (existing) {
                userIds[u.username] = existing.id;
                console.log(`  - User exists: ${u.username}`);
            } else {
                const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
                const [inserted] = await db.insert(users).values({
                    ...u,
                    password: hashedPassword,
                    permissions: u.permissions as string[],
                }).returning();
                userIds[u.username] = inserted.id;
                console.log(`  - Seeded User: ${u.username}`);
            }
        }

        // 1. Seed Provinces
        const provinceIds: Record<string, number> = {};
        for (const p of ZIMBABWE_STRUCTURE.provinces) {
            let id: number;
            const existing = await db.query.jurisdictions.findFirst({
                where: eq(jurisdictions.code, p.code)
            });

            if (existing) {
                id = existing.id;
                console.log(`- Province exists: ${p.name}`);
            } else {
                const [inserted] = await db.insert(jurisdictions).values({
                    name: p.name,
                    nameShona: p.name_shona,
                    code: p.code,
                    level: "province",
                    isActive: true
                }).returning();
                id = inserted.id;
                console.log(`- Seeded Province: ${p.name}`);
            }
            provinceIds[p.code] = id;
        }

        // 2. Seed Cities (as Local Authorities)
        const cityIds: Record<string, number> = {};
        for (const [key, city] of Object.entries(ZIMBABWE_STRUCTURE.cities)) {
            let id: number;
            const existing = await db.query.jurisdictions.findFirst({
                where: eq(jurisdictions.code, city.code)
            });

            if (existing) {
                id = existing.id;
                console.log(`  - City exists: ${city.name}`);
            } else {
                const [inserted] = await db.insert(jurisdictions).values({
                    name: city.name,
                    code: city.code,
                    level: "local_authority", // Mapping city/metropolitan to local_authority
                    parentId: provinceIds[city.province],
                    population: city.population,
                    serviceProvider: city.service_provider,
                    officeEmail: city.email,
                    officePhone: city.phone,
                    isActive: true
                }).returning();
                id = inserted.id;
                console.log(`  - Seeded City: ${city.name}`);
            }
            cityIds[key] = id;

            // 3. Seed Wards for this City
            const wards = ZIMBABWE_STRUCTURE.wards[key as keyof typeof ZIMBABWE_STRUCTURE.wards];
            if (wards) {
                for (const w of wards) {
                    let wardId: number;
                    const wardCode = `${city.code}-W${w.ward}`;
                    const existingWard = await db.query.jurisdictions.findFirst({
                        where: eq(jurisdictions.code, wardCode)
                    });

                    if (existingWard) {
                        wardId = existingWard.id;
                        // console.log(`    - Ward exists: Ward ${w.ward}`);
                    } else {
                        const [insertedWard] = await db.insert(jurisdictions).values({
                            name: w.name ? `Ward ${w.ward} - ${w.name}` : `Ward ${w.ward}`,
                            code: wardCode,
                            level: "ward",
                            parentId: id,
                            isActive: true
                        }).returning();
                        wardId = insertedWard.id;
                        // console.log(`    - Seeded Ward: Ward ${w.ward}`);
                    }

                    // 4. Seed Suburbs for this Ward
                    if (w.suburbs && w.suburbs.length > 0) {
                        for (const sub of w.suburbs) {
                            const suburbCode = `${wardCode}-${sub.replace(/\s+/g, '').toUpperCase().substring(0, 5)}`;
                            const existingSuburb = await db.query.jurisdictions.findFirst({
                                where: eq(jurisdictions.code, suburbCode)
                            });

                            if (!existingSuburb) {
                                await db.insert(jurisdictions).values({
                                    name: sub,
                                    code: suburbCode,
                                    level: "suburb",
                                    parentId: wardId,
                                    isActive: true
                                });
                            }
                        }
                    }
                }
                console.log(`    - Seeded ${wards.length} Wards and their Suburbs for ${city.name}`);
            }
        }

        // 5. Seed Issue Categories
        console.log("Seeding Issue Categories...");
        for (const cat of ZIMBABWE_STRUCTURE.issue_categories) {
            const existing = await db.query.issueCategories.findFirst({
                where: eq(issueCategories.code, cat.code)
            });

            if (!existing) {
                await db.insert(issueCategories).values({
                    name: cat.name,
                    code: cat.code,
                    nameShona: cat.name_shona,
                    parentCategory: cat.parent,
                    priorityLevel: cat.severity,
                    isActive: true,
                    // Default values for other fields
                });
                console.log(`  - Seeded Category: ${cat.name}`);
            }
        }

        // 6. Seed Departments (linked to Harare for now as primary example, or all cities?)
        // Let's seed departments for each city to ensure coverage
        console.log("Seeding Departments...");
        for (const [cityKey, cityId] of Object.entries(cityIds)) {
            for (const [deptKey, dept] of Object.entries(ZIMBABWE_STRUCTURE.departments)) {
                const deptName = `${dept.name} (${ZIMBABWE_STRUCTURE.cities[cityKey as keyof typeof ZIMBABWE_STRUCTURE.cities].name})`;
                const cityCode = ZIMBABWE_STRUCTURE.cities[cityKey as keyof typeof ZIMBABWE_STRUCTURE.cities].code;
                const deptCode = `${cityCode}-${dept.code}`;

                // Try to find by code first
                let existing = await db.query.departments.findFirst({
                    where: eq(departments.code, deptCode)
                });

                // If not found by code, try by name (to handle code changes/migrations)
                if (!existing) {
                    existing = await db.query.departments.findFirst({
                        where: eq(departments.name, deptName)
                    });
                }

                if (!existing) {
                    await db.insert(departments).values({
                        name: deptName,
                        code: deptCode,
                        jurisdictionId: cityId,
                        nameShona: dept.name_shona,
                        category: deptKey, // e.g., 'roads'
                        responseTimeSlaHours: dept.sla_hours,
                        handlesCategories: dept.categories,
                        isActive: true
                    });
                    // console.log(`  - Seeded Department: ${dept.name} for ${cityKey}`);
                } else {
                    // Update existing department to ensure categories and CODE are in sync
                    await db.update(departments)
                        .set({
                            code: deptCode, // Update code to standard if it was different
                            handlesCategories: dept.categories,
                            responseTimeSlaHours: dept.sla_hours,
                            nameShona: dept.name_shona
                        })
                        .where(eq(departments.id, existing.id));
                    // console.log(`  - Updated Department: ${dept.name} for ${cityKey}`);
                }
            }
            console.log(`  - Processed Departments for ${cityKey}`);
        }

        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Seeding failed:", error);
    }
}

seed();
