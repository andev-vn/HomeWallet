import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHmac } from 'node:crypto';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '@/db/schema';

export { hashPassword, verifyPassword } from './password';

const COOKIE = 'vn_session';
const SECRET = process.env.SESSION_SECRET ?? 'vinha-dev-secret-change-me';

export const SESSION_COOKIE = COOKIE;
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};

/* ---------- phiên (cookie ký HMAC) ---------- */
const sign = (uid: number) => createHmac('sha256', SECRET).update(String(uid)).digest('hex');

/** Giá trị cookie phiên đã ký — dùng cho route handler set thẳng lên NextResponse. */
export const sessionCookieValue = (userId: number) => `${userId}.${sign(userId)}`;

export async function createSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, sessionCookieValue(userId), SESSION_COOKIE_OPTIONS);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

async function getSessionUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE)?.value;
  if (!raw) return null;
  const [uid, sig] = raw.split('.');
  if (!uid || sig !== sign(Number(uid))) return null;
  return Number(uid);
}

/**
 * User hiện tại hoặc null.
 * Bọc React cache() để mọi lần gọi trong cùng một request (layout + page + nhiều
 * query) chỉ truy vấn DB một lần thay vì lặp lại từng round-trip Neon.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  return user ?? null;
});

/** User hiện tại, hoặc chuyển hướng về /login. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

/* ---------- nhà đang xem (active household) ---------- */
const ACTIVE_COOKIE = 'vn_household';

/**
 * Lựa chọn nhà đang xem từ cookie:
 * - `null`  → chưa chọn (để getContext mặc định nhà đầu tiên)
 * - `'personal'` → người dùng chủ động chọn chế độ cá nhân
 * - `number` → id nhà
 */
export async function getActiveHouseholdPref(): Promise<number | 'personal' | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ACTIVE_COOKIE)?.value;
  if (!raw) return null;
  if (raw === 'personal') return 'personal';
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Đặt nhà đang xem; truyền null để về chế độ cá nhân. */
export async function setActiveHousehold(id: number | null) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_COOKIE, id ? String(id) : 'personal', {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}
