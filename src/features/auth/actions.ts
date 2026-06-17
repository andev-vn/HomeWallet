'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'node:crypto';
import { put } from '@vercel/blob';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { households, householdMembers, users } from '@/db/schema';
import {
  hashPassword,
  verifyPassword,
  createSession,
  clearSession,
  requireUser,
  setActiveHousehold,
} from './session';

export interface AuthState {
  ok?: boolean;
  error?: string;
  notice?: string;
}

const usernameOk = (u: string) => /^[a-zA-Z0-9_.]{3,20}$/.test(u);
const inviteCode = () => randomBytes(4).toString('hex').toUpperCase().slice(0, 6);

/* ---------- tài khoản ---------- */
export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') ?? '').trim();
  const username = String(formData.get('username') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!name) return { error: 'Vui lòng nhập tên.' };
  if (!usernameOk(username)) return { error: 'Username 3–20 ký tự, chỉ gồm chữ, số, _ hoặc .' };
  if (password.length < 6) return { error: 'Mật khẩu cần ít nhất 6 ký tự.' };

  const [existing] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (existing) return { error: 'Username này đã tồn tại.' };

  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff&bold=true`;
  const [user] = await db
    .insert(users)
    .values({ name, username, passwordHash: hashPassword(password), avatarUrl: avatar, monthlyBudget: 10_000_000 })
    .returning();

  await createSession(user.id);
  redirect('/home');
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get('username') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: 'Username hoặc mật khẩu không đúng.' };
  }

  await createSession(user.id);
  redirect('/home');
}

export async function logout() {
  await clearSession();
  redirect('/login');
}

/** Cập nhật thông tin cá nhân: tên + ảnh đại diện (upload file, tùy chọn). */
export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const me = await requireUser();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Vui lòng nhập tên.' };

  const fields: { name: string; avatarUrl?: string } = { name };

  const file = formData.get('avatar');
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith('image/')) return { error: 'File ảnh không hợp lệ.' };
    if (file.size > 4 * 1024 * 1024) return { error: 'Ảnh tối đa 4MB.' };

    const ext = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    // Lưu lên Vercel Blob (CDN công khai). Tên kèm timestamp để mỗi lần đổi là URL mới.
    const blob = await put(`avatars/avatar-${me.id}-${Date.now()}.${ext}`, file, { access: 'public' });
    fields.avatarUrl = blob.url;
  }

  await db.update(users).set(fields).where(eq(users.id, me.id));
  revalidatePath('/profile');
  revalidatePath('/home');
  return { ok: true };
}

/* ---------- nhà ---------- */
export async function createHousehold(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const me = await requireUser();
  const name = String(formData.get('name') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim() || 'Chủ nhà';
  if (!name) return { error: 'Vui lòng nhập tên nhà.' };

  const [home] = await db
    .insert(households)
    .values({ name, inviteCode: inviteCode(), ownerId: me.id })
    .returning();
  await db.insert(householdMembers).values({ householdId: home.id, userId: me.id, role, status: 'active' });

  await setActiveHousehold(home.id);
  redirect('/home');
}

/** Gửi yêu cầu tham gia (chờ chủ nhà duyệt). */
export async function joinHousehold(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const me = await requireUser();
  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  const role = String(formData.get('role') ?? '').trim() || 'Thành viên';
  if (!code) return { error: 'Vui lòng nhập mã mời.' };

  const [home] = await db.select().from(households).where(eq(households.inviteCode, code)).limit(1);
  if (!home) return { error: 'Mã mời không tồn tại.' };

  const [existing] = await db
    .select()
    .from(householdMembers)
    .where(and(eq(householdMembers.householdId, home.id), eq(householdMembers.userId, me.id)))
    .limit(1);
  if (existing) {
    return { error: existing.status === 'active' ? 'Bạn đã ở trong nhà này rồi.' : 'Bạn đã gửi yêu cầu, đang chờ duyệt.' };
  }

  await db.insert(householdMembers).values({ householdId: home.id, userId: me.id, role, status: 'pending' });
  revalidatePath('/profile');
  return { notice: `Đã gửi yêu cầu tham gia "${home.name}". Chờ chủ nhà duyệt.` };
}

/** Chủ nhà duyệt một yêu cầu (theo id của household_members). */
export async function approveMember(formData: FormData) {
  const me = await requireUser();
  const memberId = Number(formData.get('memberId'));
  const [m] = await db.select().from(householdMembers).where(eq(householdMembers.id, memberId)).limit(1);
  if (!m) return;
  const [home] = await db.select().from(households).where(eq(households.id, m.householdId)).limit(1);
  if (!home || home.ownerId !== me.id) return; // chỉ chủ nhà
  await db.update(householdMembers).set({ status: 'active' }).where(eq(householdMembers.id, memberId));
  revalidatePath('/home');
  revalidatePath(`/home/${m.householdId}`);
}

/** Chủ nhà từ chối / xoá một thành viên (hoặc yêu cầu). */
export async function rejectMember(formData: FormData) {
  const me = await requireUser();
  const memberId = Number(formData.get('memberId'));
  const [m] = await db.select().from(householdMembers).where(eq(householdMembers.id, memberId)).limit(1);
  if (!m) return;
  const [home] = await db.select().from(households).where(eq(households.id, m.householdId)).limit(1);
  if (!home || home.ownerId !== me.id) return;
  if (m.userId === home.ownerId) return; // không xoá chủ nhà
  await db.delete(householdMembers).where(eq(householdMembers.id, memberId));
  revalidatePath('/home');
  revalidatePath(`/home/${m.householdId}`);
}

/** Rời khỏi một nhà (chủ nhà không tự rời được — phải xoá nhà, chưa hỗ trợ). */
export async function leaveHousehold(formData: FormData) {
  const me = await requireUser();
  const householdId = Number(formData.get('householdId'));
  const [home] = await db.select().from(households).where(eq(households.id, householdId)).limit(1);
  if (home && home.ownerId === me.id) return;
  await db
    .delete(householdMembers)
    .where(and(eq(householdMembers.householdId, householdId), eq(householdMembers.userId, me.id)));
  await setActiveHousehold(null);
  revalidatePath('/profile');
  redirect('/home');
}

/** Đổi tên nhà — chỉ chủ nhà. */
export async function renameHousehold(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const me = await requireUser();
  const householdId = Number(formData.get('householdId'));
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Vui lòng nhập tên nhà.' };

  const [home] = await db.select().from(households).where(eq(households.id, householdId)).limit(1);
  if (!home || home.ownerId !== me.id) return { error: 'Chỉ chủ nhà mới được sửa.' };

  await db.update(households).set({ name }).where(eq(households.id, householdId));
  revalidatePath('/home');
  revalidatePath(`/home/${householdId}`);
  return { ok: true };
}

/**
 * Xóa nhà — chỉ chủ nhà. Chỉ gỡ nhóm chia sẻ: thành viên bị gỡ (cascade).
 * Chi tiêu là của cá nhân nên KHÔNG ai mất khoản chi nào.
 */
export async function deleteHousehold(formData: FormData) {
  const me = await requireUser();
  const householdId = Number(formData.get('householdId'));
  const [home] = await db.select().from(households).where(eq(households.id, householdId)).limit(1);
  if (!home || home.ownerId !== me.id) return;

  await db.delete(households).where(eq(households.id, householdId));
  await setActiveHousehold(null);
  revalidatePath('/home');
  redirect('/home');
}

/** Đổi nhà đang xem (hoặc về cá nhân nếu truyền 'personal'). */
export async function switchHousehold(formData: FormData) {
  await requireUser();
  const value = String(formData.get('householdId') ?? 'personal');
  await setActiveHousehold(value === 'personal' ? null : Number(value));
  revalidatePath('/home');
  redirect('/home');
}
