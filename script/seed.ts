
import "dotenv/config";
import { db, pool } from "../server/db";
import {
    users, departments, staff, citizens, issues, credits, broadcasts,
    ROLE_HIERARCHY, ESCALATION_HIERARCHY
} from "@shared/schema";
import { hash } from "bcrypt";
import { sql } from "drizzle-orm";

async function seed() {
    console.log("🌱 Starting seeding...");

    try {
        // Clear existing data
        console.log("Cleaning formatted tables...");
        await db.execute(sql`TRUNCATE TABLE ${users}, ${staff}, ${issues}, ${credits}, ${broadcasts}, ${citizens}, ${departments} RESTART IDENTITY CASCADE`);

        // 1. Create Departments
        console.log("Creating departments...");
        const depts = await db.insert(departments).values([
            { name: "Roads & Transport", type: "Municipal", contactEmail: "roads@city.gov.zw" },
            { name: "Water & Sanitation", type: "Municipal", contactEmail: "water@city.gov.zw" },
            { name: "Electricity (ZESA)", type: "Parastatal", contactEmail: "faults@zesa.co.zw" },
            { name: "Waste Management", type: "Municipal", contactEmail: "waste@city.gov.zw" },
            { name: "Public Safety", type: "Police", contactEmail: "police@city.gov.zw" },
        ]).returning();

        const roadsDept = depts.find(d => d.name === "Roads & Transport")!;
        const waterDept = depts.find(d => d.name === "Water & Sanitation")!;

        // 2. Create Staff
        console.log("Creating staff...");
        await db.insert(staff).values([
            { name: "John Moyo", role: "Manager", departmentId: roadsDept.id, email: "j.moyo@city.gov.zw" },
            { name: "Sarah Phiri", role: "Field Officer", departmentId: roadsDept.id, email: "s.phiri@city.gov.zw" },
            { name: "Blessing Ncube", role: "Manager", departmentId: waterDept.id, email: "b.ncube@city.gov.zw" },
        ]);

        // 3. Create Admin User
        console.log("Creating admin user...");
        const hashedPassword = await hash("password123", 10);
        await db.insert(users).values([
            {
                username: "admin",
                password: hashedPassword,
                name: "System Administrator",
                email: "admin@tarisa.gov.zw",
                role: "super_admin",
                escalationLevel: "L4",
                departmentId: null,
            },
            {
                username: "roads_manager",
                password: hashedPassword,
                name: "Roads Manager",
                email: "manager@roads.gov.zw",
                role: "manager",
                escalationLevel: "L2",
                departmentId: roadsDept.id,
            }
        ]);

        // 4. Create Citizens
        console.log("Creating citizens...");
        const newCitizens = await db.insert(citizens).values([
            {
                name: "Tendai Gwatidzo",
                email: "tendai@example.com",
                phone: "+263772123456",
                address: "123 Samora Machel Ave",
                ward: "Ward 5",
                status: "verified"
            },
            {
                name: "Grace Mutoko",
                email: "grace@example.com",
                phone: "+263733987654",
                address: "45 Borrowdale Rd",
                ward: "Ward 18",
                status: "verified"
            }
        ]).returning();

        // 5. Create Issues
        console.log("Creating issues...");
        await db.insert(issues).values([
            {
                trackingId: "TAR-2025-001",
                title: "Large Pothole on Samora Machel",
                description: "There is a dangerous pothole near the intersection causing traffic delays.",
                category: "Roads",
                location: "Samora Machel Ave & 4th St",
                status: "in_progress",
                priority: "high",
                severity: 85,
                citizenId: newCitizens[0].id,
                assignedDepartmentId: roadsDept.id,
                escalationLevel: "L2",
                updatedAt: new Date(),
            },
            {
                trackingId: "TAR-2025-002",
                title: "Burst Water Pipe",
                description: "Clean water wasting away from a burst pipe on the verge.",
                category: "Water",
                location: "12 Nelson Mandela Ave",
                status: "submitted",
                priority: "critical",
                severity: 90,
                citizenId: newCitizens[1].id,
                assignedDepartmentId: waterDept.id,
                escalationLevel: "L1",
            },
            {
                trackingId: "TAR-2025-003",
                title: "Broken Street Light",
                description: "Street light not working for 2 weeks, unsafe area at night.",
                category: "Electricity",
                location: "Borrowdale Rd",
                status: "resolved",
                priority: "medium",
                severity: 40,
                citizenId: newCitizens[0].id,
                assignedDepartmentId: depts.find(d => d.name === "Electricity (ZESA)")!.id,
                escalationLevel: "L1",
                resolvedAt: new Date(),
            }
        ]);

        console.log("✅ Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
