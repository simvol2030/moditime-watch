#!/usr/bin/env node
// Run: node run-cities-migration.js

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'sqlite', 'app.db');
const sqlPath = path.join(__dirname, 'insert-102-cities.sql');

console.log('Database path:', dbPath);
console.log('SQL file path:', sqlPath);

try {
  const db = new Database(dbPath);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split by semicolon and filter empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute`);

  // Execute in transaction
  db.exec('BEGIN TRANSACTION');

  let inserted = 0;
  for (const stmt of statements) {
    try {
      db.exec(stmt);
      inserted++;
    } catch (err) {
      console.error('Error executing statement:', stmt.substring(0, 100) + '...');
      console.error(err.message);
    }
  }

  db.exec('COMMIT');

  // Verify
  const count = db.prepare('SELECT COUNT(*) as count FROM cities').get();
  console.log(`\nSuccess! Total cities in database: ${count.count}`);

  // Show sample
  const sample = db.prepare('SELECT slug, name, region FROM cities ORDER BY priority DESC LIMIT 10').all();
  console.log('\nTop 10 cities by priority:');
  sample.forEach((c, i) => console.log(`${i+1}. ${c.name} (${c.slug}) - ${c.region}`));

  db.close();

} catch (err) {
  console.error('Fatal error:', err);
  process.exit(1);
}
