import { db } from "./db";
import { departments, users, citizens, issues, staff } from "@shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seed() {
  console.log("Seeding database...");

  await db.execute(sql`TRUNCATE TABLE timeline, comments, issues, staff, citizens, users, broadcasts, departments RESTART IDENTITY CASCADE`);

  const departmentData = [
    { name: "CoH Water", type: "Municipal", contactPhone: "+263 242 252 000", contactEmail: "water@harare.gov.zw" },
    { name: "CoH Roads", type: "Municipal", contactPhone: "+263 242 252 001", contactEmail: "roads@harare.gov.zw" },
    { name: "CoH Sewer", type: "Municipal", contactPhone: "+263 242 252 002", contactEmail: "sewer@harare.gov.zw" },
    { name: "CoH Lights", type: "Municipal", contactPhone: "+263 242 252 003", contactEmail: "lights@harare.gov.zw" },
    { name: "CoH Waste Management", type: "Municipal", contactPhone: "+263 242 252 004", contactEmail: "waste@harare.gov.zw" },
    { name: "ZESA Holdings", type: "Parastatal", contactPhone: "+263 242 774 000", contactEmail: "support@zesa.co.zw" },
    { name: "ZINWA", type: "Parastatal", contactPhone: "+263 242 700 000", contactEmail: "info@zinwa.co.zw" },
    { name: "ZRP Traffic", type: "Police", contactPhone: "+263 242 995", contactEmail: "traffic@zrp.gov.zw" },
    { name: "Ministry of Local Government", type: "Government", contactPhone: "+263 242 700 001", contactEmail: "info@mlg.gov.zw" },
  ];

  const createdDepts = await db.insert(departments).values(departmentData).returning();
  console.log(`Created ${createdDepts.length} departments`);

  const userData = [
    { username: "superadmin", password: "admin123", name: "System Administrator", email: "admin@tarisa.gov.zw", role: "super_admin", escalationLevel: "L4", departmentId: null, permissions: ["all"], active: true },
    { username: "townhouse", password: "town123", name: "Town House Director", email: "director@harare.gov.zw", role: "admin", escalationLevel: "L3", departmentId: null, permissions: ["view_all", "assign", "escalate"], active: true },
    { username: "district_mgr", password: "district123", name: "District Manager", email: "district@harare.gov.zw", role: "manager", escalationLevel: "L2", departmentId: createdDepts[0].id, permissions: ["view_district", "assign", "escalate"], active: true },
    { username: "ward_officer", password: "ward123", name: "Ward Officer", email: "ward@harare.gov.zw", role: "officer", escalationLevel: "L1", departmentId: createdDepts[1].id, permissions: ["view_ward", "update_status"], active: true },
    { username: "water_officer", password: "water123", name: "Water Department Officer", email: "water.officer@harare.gov.zw", role: "officer", escalationLevel: "L1", departmentId: createdDepts[0].id, permissions: ["view_ward", "update_status"], active: true },
    { username: "roads_manager", password: "roads123", name: "Roads Department Manager", email: "roads.manager@harare.gov.zw", role: "manager", escalationLevel: "L2", departmentId: createdDepts[1].id, permissions: ["view_district", "assign", "escalate"], active: true },
  ];

  for (const user of userData) {
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
    const perms: string[] = Array.isArray(user.permissions) ? [...user.permissions] : [];
    await db.insert(users).values({
      username: user.username,
      password: hashedPassword,
      name: user.name,
      email: user.email,
      role: user.role,
      escalationLevel: user.escalationLevel,
      departmentId: user.departmentId,
      permissions: perms,
      active: user.active,
    });
  }
  console.log(`Created ${userData.length} users with hashed passwords`);

  const staffData = [
    { name: "John Moyo", role: "Technician", departmentId: createdDepts[0].id, phone: "+263 77 123 4567", email: "j.moyo@harare.gov.zw", active: true },
    { name: "Mary Ndlovu", role: "Inspector", departmentId: createdDepts[1].id, phone: "+263 77 234 5678", email: "m.ndlovu@harare.gov.zw", active: true },
    { name: "Peter Chuma", role: "Foreman", departmentId: createdDepts[2].id, phone: "+263 77 345 6789", email: "p.chuma@harare.gov.zw", active: true },
    { name: "Grace Mutasa", role: "Electrician", departmentId: createdDepts[3].id, phone: "+263 77 456 7890", email: "g.mutasa@harare.gov.zw", active: true },
    { name: "David Sithole", role: "Supervisor", departmentId: createdDepts[4].id, phone: "+263 77 567 8901", email: "d.sithole@harare.gov.zw", active: true },
  ];

  const createdStaff = await db.insert(staff).values(staffData).returning();
  console.log(`Created ${createdStaff.length} staff members`);

  const citizenData = [
    { name: "Tendai Makoni", email: "tendai.makoni@gmail.com", phone: "+263 77 111 2222", address: "123 Samora Machel Ave", ward: "Ward 1", emailVerified: true, status: "verified" },
    { name: "Rumbidzai Chigumba", email: "rchigumba@yahoo.com", phone: "+263 77 222 3333", address: "45 Robert Mugabe Road", ward: "Ward 3", emailVerified: true, status: "verified" },
    { name: "Farai Mutamba", email: "f.mutamba@outlook.com", phone: "+263 77 333 4444", address: "78 Julius Nyerere Way", ward: "Ward 7", emailVerified: false, status: "pending" },
  ];

  const createdCitizens = await db.insert(citizens).values(citizenData).returning();
  console.log(`Created ${createdCitizens.length} citizens`);

  const year = new Date().getFullYear();
  const issueData = [
    { trackingId: `TAR-${year}-0001`, title: "Large pothole on main road", description: "Deep pothole causing vehicle damage near shopping center", category: "Roads", location: "Corner Sam Nujoma & Samora Machel", coordinates: "-17.8292,31.0522", status: "in_progress", priority: "high", severity: 80, citizenId: createdCitizens[0].id, assignedDepartmentId: createdDepts[1].id, assignedStaffId: createdStaff[1].id, escalationLevel: "L1", photos: [] as string[] },
    { trackingId: `TAR-${year}-0002`, title: "Water pipe burst", description: "Major water leak flooding the street and homes", category: "Water", location: "15 Borrowdale Road", coordinates: "-17.7839,31.0789", status: "submitted", priority: "critical", severity: 95, citizenId: createdCitizens[1].id, assignedDepartmentId: createdDepts[0].id, assignedStaffId: null, escalationLevel: "L2", photos: [] as string[] },
    { trackingId: `TAR-${year}-0003`, title: "Street lights not working", description: "Entire block without street lighting for 2 weeks", category: "Lights", location: "Enterprise Road, Highlands", coordinates: "-17.8012,31.0567", status: "verified", priority: "medium", severity: 60, citizenId: createdCitizens[0].id, assignedDepartmentId: createdDepts[3].id, assignedStaffId: createdStaff[3].id, escalationLevel: "L1", photos: [] as string[] },
    { trackingId: `TAR-${year}-0004`, title: "Sewage overflow in residential area", description: "Raw sewage flooding multiple properties, health hazard", category: "Sewer", location: "Warren Park D", coordinates: "-17.8456,31.0123", status: "in_progress", priority: "critical", severity: 100, citizenId: createdCitizens[1].id, assignedDepartmentId: createdDepts[2].id, assignedStaffId: createdStaff[2].id, escalationLevel: "L3", photos: [] as string[] },
    { trackingId: `TAR-${year}-0005`, title: "Illegal dumping site", description: "Vacant lot being used as illegal dump site", category: "Waste", location: "Mbare Industrial", coordinates: "-17.8567,31.0234", status: "submitted", priority: "medium", severity: 55, citizenId: createdCitizens[2].id, assignedDepartmentId: null, assignedStaffId: null, escalationLevel: "L1", photos: [] as string[] },
  ];

  for (const issue of issueData) {
    await db.insert(issues).values(issue);
  }
  console.log(`Created ${issueData.length} issues`);

  console.log("\nSeeding complete!");
  console.log("\nTest accounts (all passwords are hashed with bcrypt):");
  console.log("  superadmin / admin123 - Full access (L4)");
  console.log("  townhouse / town123 - Admin (L3)");
  console.log("  district_mgr / district123 - Manager (L2)");
  console.log("  ward_officer / ward123 - Officer (L1)");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
