
import "dotenv/config";
import { db } from "./db";
import { users, staff, officers } from "@shared/schema";

async function debugUserStaff() {
    try {
        const allUsers = await db.select().from(users);
        const allStaff = await db.select().from(staff);
        const allOfficers = await db.select().from(officers);

        console.log(`Users count: ${allUsers.length}`);
        console.log(`Staff count: ${allStaff.length}`);
        console.log(`Officers count: ${allOfficers.length}`);

        console.log("\n--- Users ---");
        allUsers.slice(0, 5).forEach(u =>
            console.log(`ID: ${u.id}, Name: ${u.name}, Role: ${u.role}, Email: ${u.email}`)
        );

        console.log("\n--- Staff (Legacy?) ---");
        allStaff.slice(0, 5).forEach(s =>
            console.log(`ID: ${s.id}, Name: ${s.name}, Role: ${s.role}, DeptID: ${s.departmentId}`)
        );

        console.log("\n--- Officers ---");
        allOfficers.slice(0, 5).forEach(o =>
            console.log(`ID: ${o.id}, UserID: ${o.userId}, Name: ${o.fullName}, Role: ${o.role}`)
        );

    } catch (error) {
        console.error("Error debugging user/staff:", error);
    } finally {
        process.exit();
    }
}

debugUserStaff();
