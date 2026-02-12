
import { storage } from "./storage";

async function test() {
    try {
        console.log("Testing getNearbyIssues...");
        const lat = -17.824858;
        const lng = 31.053028;
        const results = await storage.getNearbyIssues(lat, lng, 0.1);
        console.log("Results found:", results.length);
        console.log("Sample result:", results[0]);
    } catch (e) {
        console.error("Test failed with error:", e);
    } finally {
        process.exit(0);
    }
}

test();
