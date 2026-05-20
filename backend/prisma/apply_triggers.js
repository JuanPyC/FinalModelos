const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function main() {
  console.log('Applying triggers and stored procedures...');

  const sqlPath = path.join(__dirname, 'extra_constraints_and_triggers.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split by BEGIN/COMMIT blocks and execute each
  const blocks = sql.split(/BEGIN;|COMMIT;/).filter(b => b.trim());

  for (const block of blocks) {
    const statements = block.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      try {
        await pool.query(stmt.trim());
      } catch (err) {
        // Ignore "already exists" errors for constraints
        if (err.message.includes('already exists')) {
          continue;
        }
        throw err;
      }
    }
  }

  console.log('Triggers and procedures applied successfully');
  await pool.end();
}

main().catch(e => {
  console.error('Error applying triggers:', e);
  process.exit(1);
});
