import "dotenv/config";
import { db, pool } from "./db";
import {
  users, departments, staff, citizens, issues, credits, broadcasts,
  issueCategories, jurisdictions, provinces, localAuthorities, wards,
} from "../shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seed() {
  console.log("🌱 Starting seeding...");

  try {
    // Clear existing data
    console.log("Cleaning formatted tables...");
    await db.execute(sql`TRUNCATE TABLE 
            timeline, comments, ${issues}, ${credits}, ${broadcasts}, 
            ${citizens}, ${departments}, ${issueCategories}, ${jurisdictions},
            ${provinces}, ${localAuthorities}, ${wards}, ${users}, ${staff}
            RESTART IDENTITY CASCADE`);

    // 1. Create Jurisdiction Hierarchy
    console.log("Creating jurisdictions...");
    const [harare] = await db.insert(jurisdictions).values({
      code: "ZW-HA",
      name: "Harare",
      level: "district",
      serviceProvider: "Harare City Council"
    }).returning();

    const [ward17] = await db.insert(jurisdictions).values({
      code: "ZW-HA-W17",
      name: "Ward 17",
      level: "ward",
      parentId: harare.id,
      serviceProvider: "Harare City Council"
    }).returning();

    // 2. Create Departments
    console.log("Creating departments...");
    const depts = await db.insert(departments).values([
      { name: "Roads & Transport", type: "Municipal", contactEmail: "roads@city.gov.zw", jurisdictionId: harare.id },
      { name: "Water & Sanitation", type: "Municipal", contactEmail: "water@city.gov.zw", jurisdictionId: harare.id },
      { name: "Electricity (ZESA)", type: "Parastatal", contactEmail: "faults@zesa.co.zw", jurisdictionId: harare.id },
      { name: "Waste Management", type: "Municipal", contactEmail: "waste@city.gov.zw", jurisdictionId: harare.id },
      { name: "Public Safety", type: "Police", contactEmail: "police@city.gov.zw", jurisdictionId: harare.id },
    ]).returning();

    const roadsDept = depts.find(d => d.name === "Roads & Transport")!;
    const waterDept = depts.find(d => d.name === "Water & Sanitation")!;

    // 3. Create Issue Categories
    console.log("Creating issue categories...");
    await db.insert(issueCategories).values([
      { code: "pothole", name: "Pothole", parentCategory: "Roads & Transport", icon: "drill", responseTimeHours: 48, resolutionTimeHours: 168 },
      { code: "street_light", name: "Broken Street Light", parentCategory: "Electricity (ZESA)", icon: "lightbulb", responseTimeHours: 24, resolutionTimeHours: 72 },
      { code: "water_leak", name: "Water Leak / Burst Pipe", parentCategory: "Water & Sanitation", icon: "droplets", responseTimeHours: 12, resolutionTimeHours: 48 },
      { code: "refuse_collection", name: "Uncollected Refuse", parentCategory: "Waste Management", icon: "trash2", responseTimeHours: 24, resolutionTimeHours: 48 },
      { code: "traffic_lights", name: "Faulty Traffic Lights", parentCategory: "Roads & Transport", icon: "traffic-light", responseTimeHours: 8, resolutionTimeHours: 24 },
    ]);

    // 4. Create Staff
    console.log("Creating staff...");
    await db.insert(staff).values([
      { name: "John Moyo", role: "Manager", departmentId: roadsDept.id, email: "j.moyo@city.gov.zw" },
      { name: "Sarah Phiri", role: "Field Officer", departmentId: roadsDept.id, email: "s.phiri@city.gov.zw" },
      { name: "Blessing Ncube", role: "Manager", departmentId: waterDept.id, email: "b.ncube@city.gov.zw" },
    ]);

    // 5. Create users
    console.log("Creating users...");
    const adminHashed = await bcrypt.hash("admin123", SALT_ROUNDS);
    const townHashed = await bcrypt.hash("town123", SALT_ROUNDS);

    await db.insert(users).values([
      {
        username: "superadmin",
        password: adminHashed,
        name: "System Administrator",
        email: "admin@tarisa.gov.zw",
        role: "super_admin",
        escalationLevel: "L4",
        departmentId: null,
      },
      {
        username: "townhouse",
        password: townHashed,
        name: "Town House Director",
        email: "director@harare.gov.zw",
        role: "admin",
        escalationLevel: "L3",
        departmentId: null,
      },
      {
        username: "roads_manager",
        password: await bcrypt.hash("password123", SALT_ROUNDS),
        name: "Roads Manager",
        email: "manager@roads.gov.zw",
        role: "manager",
        escalationLevel: "L2",
        departmentId: roadsDept.id,
      }
    ]);

    // 6. Create Citizens
    console.log("Creating citizens...");
    const newCitizens = await db.insert(citizens).values([
      {
        name: "Tendai Gwatidzo",
        email: "tendai@example.com",
        phone: "+263772123456",
        address: "123 Samora Machel Ave",
        ward: "Ward 17",
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

    // 7. Create Issues
    console.log("Creating issues...");
    await db.insert(issues).values([
      {
        trackingId: "TAR-2025-001",
        title: "Large Pothole on Samora Machel",
        description: "There is a dangerous pothole near the intersection causing traffic delays.",
        category: "pothole",
        location: "Samora Machel Ave & 4th St",
        status: "in_progress",
        priority: "high",
        severity: 85,
        citizenId: newCitizens[0].id,
        assignedDepartmentId: roadsDept.id,
        escalationLevel: "L2",
        jurisdictionId: ward17.id,
        updatedAt: new Date(),
      },
      {
        trackingId: "TAR-2025-002",
        title: "Burst Water Pipe",
        description: "Clean water wasting away from a burst pipe on the verge.",
        category: "water_leak",
        location: "12 Nelson Mandela Ave",
        status: "submitted",
        priority: "critical",
        severity: 90,
        citizenId: newCitizens[1].id,
        assignedDepartmentId: waterDept.id,
        escalationLevel: "L1",
        jurisdictionId: harare.id,
      },
      {
        trackingId: "TAR-2025-003",
        title: "Broken Street Light",
        description: "Street light not working for 2 weeks, unsafe area at night.",
        category: "street_light",
        location: "Borrowdale Rd",
        status: "resolved",
        priority: "medium",
        severity: 40,
        citizenId: newCitizens[0].id,
        assignedDepartmentId: depts.find(d => d.name === "Electricity (ZESA)")!.id,
        escalationLevel: "L1",
        jurisdictionId: harare.id,
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
