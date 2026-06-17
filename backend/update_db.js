const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mudanzas_mi_hogar',
    });

    try {
        const sql = fs.readFileSync('schema.sql', 'utf8');
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        
        for (const stmt of statements) {
            await pool.query(stmt);
        }
        console.log("Database updated successfully");
    } catch (e) {
        console.error("Error updating database:", e.message);
    } finally {
        pool.end();
    }
}

run();
