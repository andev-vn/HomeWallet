import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL="?([^"\n]+)"?/)[1];
const sql = neon(url);

// Bỏ toàn bộ bảng để dựng lại schema.
await sql`DROP TABLE IF EXISTS expenses CASCADE`;
await sql`DROP TABLE IF EXISTS household_members CASCADE`;
await sql`DROP TABLE IF EXISTS members CASCADE`;
await sql`DROP TABLE IF EXISTS households CASCADE`;
await sql`DROP TABLE IF EXISTS users CASCADE`;
await sql`DROP TABLE IF EXISTS categories CASCADE`;
console.log('✓ Đã xóa toàn bộ bảng cũ.');
