import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function verify() {
    console.log("Verifying endpoints...");

    try {
        console.log("\nTesting GET /api/categories...");
        const catRes = await axios.get(`${BASE_URL}/categories`);
        console.log(`Status: ${catRes.status}`);
        console.log(`Data found: ${Array.isArray(catRes.data) ? catRes.data.length : 'Not an array'} items`);
        if (catRes.data.length > 0) {
            console.log("Sample category:", catRes.data[0]);
        }
    } catch (err: any) {
        console.error("GET /api/categories failed:", err.message);
    }

    try {
        console.log("\nTesting GET /api/citizens...");
        // This might fail if auth is enforced and not bypassed for localhost
        const citRes = await axios.get(`${BASE_URL}/citizens`);
        console.log(`Status: ${citRes.status}`);
        console.log(`Data found: ${Array.isArray(citRes.data) ? citRes.data.length : 'Not an array'} items`);
        if (citRes.data.length > 0) {
            console.log("Sample citizen:", citRes.data[0]);
        }
    } catch (err: any) {
        console.error("GET /api/citizens failed (likely auth):", err.message);
    }
}

verify();
