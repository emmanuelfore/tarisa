
import axios from "axios";

async function verifyFix() {
    try {
        console.log("Testing /api/notifications...");
        const response = await axios.get("http://127.0.0.1:5000/api/notifications");
        console.log("Response:", response.status, response.data);
    } catch (error: any) {
        if (error.response) {
            console.log("Error Response:", error.response.status, error.response.data);
            if (error.response.status === 401) {
                console.log("SUCCESS: Received 401 Unauthorized instead of 500 TypeError.");
            } else {
                console.log("UNEXPECTED: Received", error.response.status);
            }
        } else {
            console.error("Connection failed:", error.message);
        }
    }
}

verifyFix();
