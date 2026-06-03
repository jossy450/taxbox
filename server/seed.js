import { getDb } from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const DEMO_USERS = [
  { email: 'admin@taxbox.ng', name: 'Admin User', password: 'demo123', role: 'admin', company: 'TaxBox NG' },
  { email: 'hr@company.com', name: 'HR Manager', password: 'demo123', role: 'corporate', company: 'ACME Corp' },
  { email: 'consultant@taxpro.com', name: 'Jane Consultant', password: 'demo123', role: 'consultant', company: 'TaxPro Advisors' },
  { email: 'user@example.com', name: 'John Taxpayer', password: 'demo123', role: 'individual', company: null },
];

async function seed() {
  const db = getDb();
  const existing = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existing.count > 0) {
    console.log('Database already has users, skipping seed.');
    return;
  }

  const insert = db.prepare(
    'INSERT INTO users (id, email, name, password, role, company) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    insert.run(uuid(), u.email, u.name, hash, u.role, u.company);
    console.log(`  ✓ Created ${u.email} (${u.role})`);
  }

  console.log(`Seeded ${DEMO_USERS.length} demo users.`);
  console.log('Password for all: demo123');
}

seed().catch(console.error);
