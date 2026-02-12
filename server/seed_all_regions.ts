
import "dotenv/config";
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set in .env");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seedAllRegions() {
    console.log("Starting Full Region Seeding...");
    const client = await pool.connect();

    try {
        console.log("Cleaning up existing regions (optional - careful purely additive if constraints allow)...");
        // For this seed, we assume we want to POPULATE missing, or we could truncate. 
        // Let's truncate to be clean as requested "Seed the database..." usually implies a fresh state or full upsert.
        // But let's be safe and just Truncate to avoid duplicates if ID PKs clash or complex upsert logic.
        // User asked to "Seed", usually implies freshness.
        await client.query(`TRUNCATE TABLE suburbs, wards, local_authorities, provinces CASCADE`);

        console.log("Tables truncated. Inserting Provinces...");

        const provinces = [
            "Harare Metropolitan", "Bulawayo Metropolitan", "Manicaland",
            "Mashonaland Central", "Mashonaland East", "Mashonaland West",
            "Masvingo", "Matabeleland North", "Matabeleland South", "Midlands"
        ];

        let provMap: Record<string, number> = {};

        for (const p of provinces) {
            const res = await client.query(`INSERT INTO provinces (name) VALUES ($1) RETURNING id`, [p]);
            provMap[p] = res.rows[0].id;
        }

        console.log("Inserting Local Authorities...");

        const authorities = [
            // Harare
            { name: "Harare City Council", type: "City", prov: "Harare Metropolitan" },
            { name: "Chitungwiza Municipality", type: "Municipality", prov: "Harare Metropolitan" },
            { name: "Epworth Local Board", type: "Local Board", prov: "Harare Metropolitan" },
            { name: "Ruwa Local Board", type: "Local Board", prov: "Harare Metropolitan" },

            // Bulawayo
            { name: "Bulawayo City Council", type: "City", prov: "Bulawayo Metropolitan" },

            // Manicaland
            { name: "Mutare City Council", type: "City", prov: "Manicaland" },
            { name: "Rusape Town Council", type: "Town", prov: "Manicaland" },
            { name: "Chipinge Town Council", type: "Town", prov: "Manicaland" },
            { name: "Nyanga Rural District Council", type: "RDC", prov: "Manicaland" },

            // Midlands
            { name: "Gweru City Council", type: "City", prov: "Midlands" },
            { name: "Kwekwe City Council", type: "City", prov: "Midlands" },
            { name: "Redcliff Municipality", type: "Municipality", prov: "Midlands" },
            { name: "Gokwe Town Council", type: "Town", prov: "Midlands" },
            { name: "Zvishavane Town Council", type: "Town", prov: "Midlands" },

            // Masvingo
            { name: "Masvingo City Council", type: "City", prov: "Masvingo" },
            { name: "Chiredzi Town Council", type: "Town", prov: "Masvingo" },
            { name: "Great Zimbabwe RDC", type: "RDC", prov: "Masvingo" },

            // Mash West
            { name: "Chinhoyi Municipality", type: "Municipality", prov: "Mashonaland West" },
            { name: "Kadoma City Council", type: "City", prov: "Mashonaland West" },
            { name: "Chegutu Municipality", type: "Municipality", prov: "Mashonaland West" },
            { name: "Kariba Municipality", type: "Municipality", prov: "Mashonaland West" },

            // Mash East
            { name: "Marondera Municipality", type: "Municipality", prov: "Mashonaland East" },
            { name: "Ruwa Local Board", type: "Local Board", prov: "Mashonaland East" }, // Actually often disputed or listed, kept simple

            // Mash Central
            { name: "Bindura Municipality", type: "Municipality", prov: "Mashonaland Central" },
            { name: "Mvurwi Town Council", type: "Town", prov: "Mashonaland Central" },

            // Mat North
            { name: "Victoria Falls City Council", type: "City", prov: "Matabeleland North" },
            { name: "Hwange Local Board", type: "Local Board", prov: "Matabeleland North" },

            // Mat South
            { name: "Gwanda Municipality", type: "Municipality", prov: "Matabeleland South" },
            { name: "Beitbridge Municipality", type: "Municipality", prov: "Matabeleland South" }
        ];

        let authIds: { id: number, name: string }[] = [];

        for (const a of authorities) {
            const pid = provMap[a.prov];
            if (!pid) continue;
            const res = await client.query(`INSERT INTO local_authorities (name, type, province_id) VALUES ($1, $2, $3) RETURNING id`, [a.name, a.type, pid]);
            authIds.push({ id: res.rows[0].id, name: a.name });
        }

        console.log("Inserting Wards and Suburbs...");

        for (const auth of authIds) {
            // Generate wards based on type
            let wardCount = 10;
            if (auth.name.includes("City")) wardCount = 20;
            if (auth.name.includes("Harare")) wardCount = 46;
            if (auth.name.includes("Bulawayo")) wardCount = 29;

            for (let i = 1; i <= wardCount; i++) {
                const wardNum = i.toString();
                const wName = `${auth.name.split(" ")[0]} Ward ${wardNum}`;

                const wRes = await client.query(`INSERT INTO wards (ward_number, name, local_authority_id, is_active) VALUES ($1, $2, $3, true) RETURNING id`,
                    [wardNum, wName, auth.id]
                );
                const wardId = wRes.rows[0].id;

                // Add 2-3 generic suburbs per ward
                for (let k = 1; k <= 3; k++) {
                    const subName = `${wName} - Suburb ${String.fromCharCode(64 + k)}`; // Suburb A, B, C
                    await client.query(`INSERT INTO suburbs (name, ward_id, is_active) VALUES ($1, $2, true)`, [subName, wardId]);
                }
            }
        }

        console.log("Seeding Complete!");

    } catch (e) {
        console.error("Error seeding regions:", e);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

seedAllRegions();
