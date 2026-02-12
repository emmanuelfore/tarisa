
import "dotenv/config";
import { db } from "./db";
import { departments } from "@shared/schema";

async function listDepartments() {
    const allDepts = await db.query.departments.findMany();
    console.log("Existing Departments:");
    allDepts.forEach(d => {
        console.log(`- ID: ${d.id}, Name: "${d.name}", Code: "${d.code}", Categories: [${d.handlesCategories?.join(", ")}]`);
    });
}

listDepartments();
