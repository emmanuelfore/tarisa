
const BASE_URL = 'http://localhost:5000';

async function testCitizenRegistration() {
    const uniqueId = Date.now();
    const payload = {
        name: `Test Citizen ${uniqueId}`,
        email: `test${uniqueId}@example.com`,
        phone: `+26377${uniqueId.toString().slice(-7)}`,
        nid: `63-${uniqueId}-X-07`,
        address: '123 Test Street, Harare',
        ward: 'Ward 7',
        password: 'password123',
        confirmPassword: 'password123'
    };

    try {
        // 3. Check Registration Route
        console.log('\n--- Checking /api/auth/citizen/register on port 5000 ---');
        console.log('Sending registration request...', payload);
        const response = await fetch(`${BASE_URL}/api/auth/citizen/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            if (response.status === 201) {
                console.log('✅ Registration Successful!');
                console.log('User created:', data.user);
            } else {
                console.error('❌ Registration request failed with JSON response:', response.status, data);
            }
        } else {
            console.error('❌ Registration endpoint returned non-JSON (likely HTML fallback). Status:', response.status);
        }

    } catch (error: any) {
        console.error('❌ Registration Failed:', error.message);
    }
}

testCitizenRegistration();
