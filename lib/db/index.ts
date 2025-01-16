import Database from 'better-sqlite3';
import path from 'node:path';

const db = new Database(path.join(process.cwd(), 'subscriptions.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription TEXT NOT NULL
  );
`);

export default db; 