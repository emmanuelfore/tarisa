
async function verify() {
    try {
        const response = await fetch("http://localhost:5000/api/jurisdictions");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jurisdictions = await response.json() as any[];

        type Level = 'province' | 'local_authority' | 'ward' | 'suburb';

        const counts: Record<string, number> = {
            province: 0,
            local_authority: 0,
            ward: 0,
            suburb: 0,
            other: 0
        };

        const samples: Record<string, string[]> = {
            province: [],
            local_authority: [],
            ward: [],
            suburb: []
        };

        for (const j of jurisdictions) {
            const level = j.level as string;
            if (Object.prototype.hasOwnProperty.call(counts, level)) {
                counts[level]++;
                if (samples[level] && samples[level].length < 3) {
                    samples[level].push(j.name);
                }
            } else {
                counts.other++;
            }
        }

        console.log("Jurisdiction Counts from API:");
        console.log(JSON.stringify(counts, null, 2));
        console.log("Samples:");
        console.log(JSON.stringify(samples, null, 2));

    } catch (error) {
        console.error("API Verification Failed:", (error as Error).message);
    }
}

verify();
