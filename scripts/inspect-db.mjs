import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';

// đọc DATABASE_URL từ .env.local
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const url = env.match(/DATABASE_URL="?([^"\n]+)"?/)[1];
const sql = neon(url);

const tables = await sql`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name;
`;
console.log('TABLES:', JSON.stringify(tables));

for (const { table_name } of tables) {
  const cols = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table_name}
    ORDER BY ordinal_position;
  `;
  console.log(`\n== ${table_name} ==`);
  console.table(cols);
}
