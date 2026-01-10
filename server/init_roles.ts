
import pg from 'pg';
import { ROLE_PERMISSIONS } from '../shared/schema';

// Use same robust connection string style as seed_standalone
const connectionString = "postgresql://postgres.sdcmpmfcqmfzkeizvvlf:a8gCc2ZQ..Y7d.J@aws-1-eu-west-1.pooler.supabase.com:5432/postgres";

const pool = new pg.Pool({ connectionString });

async function initRoles() {
    console.log("Initializing dynamic roles...");
    const client = await pool.connect();

    try {
        // Create table if not exists (raw SQL to match schema)
        await client.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                description TEXT,
                permissions JSONB NOT NULL DEFAULT '[]',
                is_system BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // Seed default roles from the existing hardcoded configuration
        const defaultRoles = [
            { name: "Super Admin", slug: "super_admin", desc: "Full system access", perms: ROLE_PERMISSIONS.super_admin },
            { name: "Admin", slug: "admin", desc: "Town House Administrator", perms: ROLE_PERMISSIONS.admin },
            { name: "Manager", slug: "manager", desc: "District/Department Manager", perms: ROLE_PERMISSIONS.manager },
            { name: "Officer", slug: "officer", desc: "Field Officer", perms: ROLE_PERMISSIONS.officer },
        ];

        for (const r of defaultRoles) {
            console.log(`Ensuring role: ${r.name}`);
            // Upsert based on slug
            await client.query(`
                INSERT INTO roles (name, slug, description, permissions, is_system)
                VALUES ($1, $2, $3, $4, true)
                ON CONFLICT (slug) DO UPDATE 
                SET permissions = $4, description = $3
            `, [r.name, r.slug, r.desc, JSON.stringify(r.perms)]);
        }

        console.log("Roles initialized successfully!");
    } catch (e) {
        console.error("Error initializing roles:", e);
    } finally {
        client.release();
        pool.end();
    }
}

initRoles();
