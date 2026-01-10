
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;
const SALT_ROUNDS = 10;

// Hardcoded for robustness in this standalone script
const connectionString = "postgresql://postgres.sdcmpmfcqmfzkeizvvlf:a8gCc2ZQ..Y7d.J@aws-1-eu-west-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
    connectionString,
});

async function seed() {
    console.log("Seeding database via standalone script...");
    const client = await pool.connect();
    try {
        // Truncate
        console.log("Truncating tables...");
        await client.query(`TRUNCATE TABLE timeline, comments, issues, staff, citizens, users, broadcasts, departments RESTART IDENTITY CASCADE`);

        // Departments
        console.log("Creating departments...");
        const deptRes = await client.query(`
      INSERT INTO departments (name, type, contact_phone, contact_email) VALUES 
      ('CoH Water', 'Municipal', '+263 242 252 000', 'water@harare.gov.zw'),
      ('CoH Roads', 'Municipal', '+263 242 252 001', 'roads@harare.gov.zw'),
      ('CoH Sewer', 'Municipal', '+263 242 252 002', 'sewer@harare.gov.zw'),
      ('CoH Lights', 'Municipal', '+263 242 252 003', 'lights@harare.gov.zw'),
      ('CoH Waste Management', 'Municipal', '+263 242 252 004', 'waste@harare.gov.zw'),
      ('ZESA Holdings', 'Parastatal', '+263 242 774 000', 'support@zesa.co.zw'),
      ('ZINWA', 'Parastatal', '+263 242 700 000', 'info@zinwa.co.zw'),
      ('ZRP Traffic', 'Police', '+263 242 995', 'traffic@zrp.gov.zw'),
      ('Ministry of Local Government', 'Government', '+263 242 700 001', 'info@mlg.gov.zw')
      RETURNING id, name;
    `);
        const depts = deptRes.rows;

        // Users
        console.log("Creating users...");
        const users = [
            { username: "superadmin", password: "admin123", name: "System Administrator", email: "admin@tarisa.gov.zw", role: "super_admin", escalationLevel: "L4", departmentId: null, permissions: '["all"]' },
            { username: "townhouse", password: "town123", name: "Town House Director", email: "director@harare.gov.zw", role: "admin", escalationLevel: "L3", departmentId: null, permissions: '["view_all", "assign", "escalate"]' },
            { username: "district_mgr", password: "district123", name: "District Manager", email: "district@harare.gov.zw", role: "manager", escalationLevel: "L2", departmentId: depts[0].id, permissions: '["view_district", "assign", "escalate"]' },
            { username: "ward_officer", password: "ward123", name: "Ward Officer", email: "ward@harare.gov.zw", role: "officer", escalationLevel: "L1", departmentId: depts[1].id, permissions: '["view_ward", "update_status"]' },
        ];

        for (const u of users) {
            const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
            await client.query(`
        INSERT INTO users (username, password, name, email, role, escalation_level, department_id, permissions, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      `, [u.username, hash, u.name, u.email, u.role, u.escalationLevel, u.departmentId, u.permissions]);
        }

        // Citizens
        console.log("Creating citizens...");
        const citizensRes = await client.query(`
      INSERT INTO citizens (name, email, phone, address, ward, email_verified, status) VALUES
      ('Anonymous Citizen', 'anonymous@tarisa.gov.zw', 'N/A', 'N/A', 'N/A', true, 'verified'),
      ('Tendai Makoni', 'tendai.makoni@gmail.com', '+263 77 111 2222', '123 Samora Machel Ave', 'Ward 1', true, 'verified'),
      ('Rumbidzai Chigumba', 'rchigumba@yahoo.com', '+263 77 222 3333', '45 Robert Mugabe Road', 'Ward 3', true, 'verified')
      RETURNING id;
    `);
        const citizens = citizensRes.rows;

        // Staff
        console.log("Creating staff...");
        const staffRes = await client.query(`
      INSERT INTO staff (name, role, department_id, phone, email, active) VALUES
      ('John Moyo', 'Technician', ${depts[0].id}, '+263 77 123 4567', 'j.moyo@harare.gov.zw', true),
      ('Mary Ndlovu', 'Inspector', ${depts[1].id}, '+263 77 234 5678', 'm.ndlovu@harare.gov.zw', true)
      RETURNING id;
    `);
        const staff = staffRes.rows;

        // Issues
        console.log("Creating issues...");
        const year = new Date().getFullYear();
        // Helper to get random coordinate near Harare
        const getRandomCoord = () => {
            const lat = -17.8216 + (Math.random() - 0.5) * 0.1; // +/- 0.05 degrees (~5km)
            const lng = 31.0492 + (Math.random() - 0.5) * 0.1;
            return `${lat.toFixed(6)},${lng.toFixed(6)}`;
        };

        const categories = ["Roads", "Water", "Sewer", "Lights", "Waste", "Municipal", "Police"];
        const statuses = ["submitted", "in_progress", "resolved", "verified", "rejected"];
        const priorities = ["low", "medium", "high", "critical"];

        const issueValues = [
            [`TAR-${year}-0001`, "Large pothole on main road", "Deep pothole causing vehicle damage", "Roads", "Corner Sam Nujoma & Samora Machel", "-17.8292,31.0522", "in_progress", "high", 80, citizens[1].id, depts[1].id, staff[1].id, "L1"],
            [`TAR-${year}-0002`, "Water pipe burst", "Major water leak", "Water", "15 Borrowdale Road", "-17.7839,31.0789", "submitted", "critical", 95, citizens[0].id, depts[0].id, null, "L2"],
            [`TAR-${year}-0003`, "Street light malfunction", "Street lights not working for 3 blocks", "Lights", "Jason Moyo Ave", "-17.8310,31.0500", "verified", "medium", 40, citizens[1].id, depts[3].id, null, "L1"],
            [`TAR-${year}-0004`, "Uncollected Refuse", "Garbage piling up for 2 weeks", "Waste", "Mbare Musika", "-17.8550,31.0350", "submitted", "high", 70, citizens[2].id, depts[4].id, null, "L2"],
            [`TAR-${year}-0005`, "Blocked Sewer", "Sewage flowing into street", "Sewer", "Highfield", "-17.8800,30.9900", "in_progress", "critical", 90, citizens[0].id, depts[2].id, null, "L3"],
        ];

        // Generate 15 more random issues
        for (let i = 6; i <= 20; i++) {
            const cat = categories[Math.floor(Math.random() * categories.length)];
            const stat = statuses[Math.floor(Math.random() * statuses.length)];
            const prio = priorities[Math.floor(Math.random() * priorities.length)];
            const citizenId = citizens[Math.floor(Math.random() * citizens.length)].id;
            // Assign department based on category loosely
            let deptId = null;
            if (cat === 'Water') deptId = depts[0].id; // CoH Water
            if (cat === 'Roads') deptId = depts[1].id;
            if (cat === 'Sewer') deptId = depts[2].id;
            if (cat === 'Lights') deptId = depts[3].id;
            if (cat === 'Waste') deptId = depts[4].id;

            const staffId = (stat === 'in_progress' || stat === 'resolved') && deptId ? staff[0].id : null;

            issueValues.push([
                `TAR-${year}-${String(i).padStart(4, '0')}`,
                `Reported ${cat} Issue`,
                `Automatically generated issue description for ${cat}`,
                cat,
                `Location near Harare Central`,
                getRandomCoord(),
                stat,
                prio,
                Math.floor(Math.random() * 100),
                citizenId,
                deptId,
                staffId,
                "L1"
            ]);
        }

        for (const issue of issueValues) {
            await client.query(`
         INSERT INTO issues (tracking_id, title, description, category, location, coordinates, status, priority, severity, citizen_id, assigned_department_id, assigned_staff_id, escalation_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       `, issue);
        }
        console.log("Seeding complete!");

    } catch (e) {
        console.error("Seeding Error:", e);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
