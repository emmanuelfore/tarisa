
import pg from 'pg';

// Robust connection string
const connectionString = "postgresql://postgres.sdcmpmfcqmfzkeizvvlf:a8gCc2ZQ..Y7d.J@aws-1-eu-west-1.pooler.supabase.com:5432/postgres";
const pool = new pg.Pool({ connectionString });

async function initRegions() {
    console.log("Initializing Administrative Regions...");
    const client = await pool.connect();

    try {
        // 1. Create Tables (Idempotent)
        console.log("Creating tables...");

        await client.query(`
            CREATE TABLE IF NOT EXISTS provinces (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS local_authorities (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                province_id INTEGER REFERENCES provinces(id)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS wards (
                id SERIAL PRIMARY KEY,
                ward_number TEXT NOT NULL,
                name TEXT,
                local_authority_id INTEGER NOT NULL REFERENCES local_authorities(id)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS suburbs (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                ward_id INTEGER NOT NULL REFERENCES wards(id)
            );
        `);

        // Add columns to issues table if they don't exist
        await client.query(`
            ALTER TABLE issues 
            ADD COLUMN IF NOT EXISTS local_authority_id INTEGER REFERENCES local_authorities(id),
            ADD COLUMN IF NOT EXISTS ward_id INTEGER REFERENCES wards(id),
            ADD COLUMN IF NOT EXISTS suburb_id INTEGER REFERENCES suburbs(id);
        `);

        // Add Active/Safety columns (clean & safe model)
        await client.query(`
            ALTER TABLE local_authorities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
            
            ALTER TABLE wards 
            ADD COLUMN IF NOT EXISTS boundary_polygon JSONB,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS effective_from TIMESTAMP DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS effective_to TIMESTAMP;

            ALTER TABLE suburbs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        `);

        // 2. Seed Data
        console.log("Seeding data...");

        // PROVINCES
        const provinces = [
            { name: "Harare Metropolitan" },
            { name: "Bulawayo Metropolitan" },
            { name: "Manicaland" }
        ];

        let provinceMap: Record<string, number> = {};

        for (const p of provinces) {
            const res = await client.query(`
                INSERT INTO provinces (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id`, [p.name]
            );
            // If conflict, select it
            if (res.rows.length === 0) {
                const existing = await client.query(`SELECT id FROM provinces WHERE name = $1`, [p.name]);
                provinceMap[p.name] = existing.rows[0].id;
            } else {
                provinceMap[p.name] = res.rows[0].id;
            }
        }

        // LOCAL AUTHORITIES
        const authorities = [
            { name: "Harare City Council", type: "City", prov: "Harare Metropolitan" },
            { name: "Chitungwiza Municipality", type: "Municipality", prov: "Harare Metropolitan" },
            { name: "Epworth Local Board", type: "Local Board", prov: "Harare Metropolitan" },
            { name: "Bulawayo City Council", type: "City", prov: "Bulawayo Metropolitan" }
        ];

        let authMap: Record<string, number> = {};

        for (const a of authorities) {
            const pid = provinceMap[a.prov];
            const res = await client.query(`
                INSERT INTO local_authorities (name, type, province_id) VALUES ($1, $2, $3) RETURNING id`, [a.name, a.type, pid]
            );
            authMap[a.name] = res.rows[0].id;
        }

        // WARDS & SUBURBS (Harare)
        const harareId = authMap["Harare City Council"];

        const harareWards = [
            { num: "1", name: "Central", suburbs: ["Harare CBD", "Avenues"] },
            { num: "2", name: "Arcadia", suburbs: ["Arcadia", "Braeside", "Eastlea"] },
            { num: "3", name: "Mbare East", suburbs: ["Mbare National", "Matapi"] },
            { num: "4", name: "Mbare West", suburbs: ["Mbare Musika", "Nenyere"] },
            { num: "6", name: "Avenues", suburbs: ["Milton Park", "Belgravia"] },
            { num: "7", name: "Avondale", suburbs: ["Avondale", "Avondale West", "Strathaven"] },
            { num: "16", name: "Mabvuku", suburbs: ["Mabvuku Old", "Mabvuku New"] },
            { num: "18", name: "Borrowdale", suburbs: ["Borrowdale", "Borrowdale Brooke", "Helensvale"] },
            { num: "41", name: "Marlborough", suburbs: ["Marlborough", "Emerald Hill", "Westgate"] }
        ];

        for (const w of harareWards) {
            const pres = await client.query(`
                INSERT INTO wards (ward_number, name, local_authority_id) VALUES ($1, $2, $3) RETURNING id`,
                [w.num, w.name, harareId]
            );
            const wardId = pres.rows[0].id;

            for (const s of w.suburbs) {
                await client.query(`INSERT INTO suburbs (name, ward_id) VALUES ($1, $2)`, [s, wardId]);
            }
        }

        console.log("Regions initialized successfully!");

    } catch (e) {
        console.error("Error initializing regions:", e);
    } finally {
        client.release();
        pool.end();
    }
}

initRegions();
