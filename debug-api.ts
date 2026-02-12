
import axios from 'axios';

async function main() {
    try {
        console.log("Testing /api/issues/map endpoint...");
        const res = await axios.get('http://localhost:5000/api/issues/map');
        console.log(`Status: ${res.status}`);
        console.log(`Issues Found: ${res.data.length}`);
        if (res.data.length > 0) {
            console.log("First Issue Sample:", JSON.stringify(res.data[0], null, 2));
        } else {
            console.log("No issues found in API response.");
        }
    } catch (error: any) {
        console.error("API Error:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    }
}

main();
