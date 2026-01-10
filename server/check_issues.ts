
import { storage } from "./storage";

async function checkIssues() {
    try {
        const issues = await storage.listIssues();
        console.log(`Total issues in DB: ${issues.length}`);
        if (issues.length > 0) {
            console.log("First issue:", JSON.stringify(issues[0], null, 2));
        }
    } catch (err) {
        console.error("Error checking issues:", err);
    }
}

checkIssues();
