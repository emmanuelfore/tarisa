import "dotenv/config";
import { storage } from "./storage";

async function quickTest() {
    console.log("Testing all methods used in login...");

    try {
        console.log("1. getUserByUsername...");
        const user = await storage.getUserByUsername("superadmin");
        console.log("   ✓ User found:", user?.username);

        console.log("2. getRoleBySlug...");
        const role = await storage.getRoleBySlug("super_admin");
        console.log("   ✓ Role result:", role);

        console.log("3. getOfficerByUserId...");
        const officer = await storage.getOfficerByUserId(user!.id);
        console.log("   ✓ Officer result:", officer);

        console.log("\n✅ All methods work!");
    } catch (error) {
        console.error("\n❌ Error:", error);
    } finally {
        process.exit(0);
    }
}

quickTest();
