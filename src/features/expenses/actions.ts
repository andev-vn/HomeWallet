'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { expenses, userCategoryBudgets, walletTopups } from '@/db/schema';
import { getContext } from '@/features/households/queries';
import { getWalletState } from './queries';
import { formatCurrency } from '@/utils/format';

export interface ActionState {
  ok?: boolean;
  error?: string;
}

/**
 * Chuỗi từ input datetime-local ("YYYY-MM-DDTHH:mm[:ss]") -> Date (giờ địa phương,
 * giữ đủ giờ/phút/giây). Rỗng/không hợp lệ -> thời điểm hiện tại.
 */
function parseWhen(str: string | null): Date {
  if (str) {
    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/** Đọc các trường chung của form chi tiêu. */
function readFields(formData: FormData) {
  const amount = Number(String(formData.get('amount')).replace(/\D/g, ''));
  const categoryRaw = Number(formData.get('categoryId'));
  return {
    amount,
    categoryId: Number.isInteger(categoryRaw) && categoryRaw > 0 ? categoryRaw : null,
    note: (formData.get('note') as string)?.trim() || null,
    occurredAt: parseWhen(formData.get('occurredAt') as string),
    paymentMethod: formData.get('paymentMethod') === 'transfer' ? 'transfer' : 'cash',
  };
}

function revalidateAll() {
  revalidatePath('/home');
  revalidatePath('/expenses');
}

/** Thêm khoản chi cho user hiện tại (chi tiêu cá nhân). */
export async function addExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { me } = await getContext();
  const f = readFields(formData);
  if (!Number.isFinite(f.amount) || f.amount <= 0) return { error: 'Số tiền phải lớn hơn 0.' };

  // Bắt buộc ví phải có tiền và đủ số dư trước khi ghi chi tiêu.
  const wallet = await getWalletState(me.id);
  if (wallet.deposited <= 0) return { error: 'Ví đang trống. Hãy thêm tiền vào ví trước khi ghi chi tiêu.' };
  if (f.amount > wallet.balance) return { error: `Số dư ví không đủ (còn ${formatCurrency(wallet.balance)}). Hãy nạp thêm.` };

  // Chi tiêu luôn là của cá nhân (householdId = null). Nhà chỉ để chia sẻ tầm nhìn.
  await db.insert(expenses).values({
    userId: me.id,
    householdId: null,
    categoryId: f.categoryId,
    amount: f.amount,
    paymentMethod: f.paymentMethod,
    note: f.note,
    occurredAt: f.occurredAt,
  });

  revalidateAll();
  return { ok: true };
}

/** Sửa khoản chi — chỉ chủ khoản chi mới được sửa. */
export async function updateExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { me } = await getContext();
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id)) return { error: 'Khoản chi không hợp lệ.' };

  const [row] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!row || row.userId !== me.id) return { error: 'Không tìm thấy khoản chi của bạn.' };

  const f = readFields(formData);
  if (!Number.isFinite(f.amount) || f.amount <= 0) return { error: 'Số tiền phải lớn hơn 0.' };

  // Số dư khả dụng = số dư hiện tại + khoản cũ (vì sẽ thay khoản cũ bằng khoản mới).
  const wallet = await getWalletState(me.id);
  const available = wallet.balance + row.amount;
  if (f.amount > available) return { error: `Số dư ví không đủ (tối đa ${formatCurrency(available)}).` };

  await db
    .update(expenses)
    .set({ amount: f.amount, categoryId: f.categoryId, note: f.note, occurredAt: f.occurredAt, paymentMethod: f.paymentMethod })
    .where(and(eq(expenses.id, id), eq(expenses.userId, me.id)));

  revalidateAll();
  return { ok: true };
}

function revalidateWallet() {
  revalidatePath('/expenses');
  revalidatePath('/settings');
  revalidatePath('/profile');
}

/** Thêm một phiếu nạp tiền vào ví. */
export async function addTopup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { me } = await getContext();
  const amount = Number(String(formData.get('amount')).replace(/\D/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Số tiền phải lớn hơn 0.' };

  await db.insert(walletTopups).values({
    userId: me.id,
    amount,
    note: (formData.get('note') as string)?.trim() || null,
    occurredAt: parseWhen(formData.get('occurredAt') as string),
  });
  revalidateWallet();
  return { ok: true };
}

/** Sửa phiếu nạp — chỉ chủ phiếu. */
export async function updateTopup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { me } = await getContext();
  const id = Number(formData.get('id'));
  const amount = Number(String(formData.get('amount')).replace(/\D/g, ''));
  if (!Number.isInteger(id)) return { error: 'Phiếu không hợp lệ.' };
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Số tiền phải lớn hơn 0.' };

  await db
    .update(walletTopups)
    .set({ amount, note: (formData.get('note') as string)?.trim() || null, occurredAt: parseWhen(formData.get('occurredAt') as string) })
    .where(and(eq(walletTopups.id, id), eq(walletTopups.userId, me.id)));
  revalidateWallet();
  return { ok: true };
}

/** Xóa phiếu nạp — chỉ chủ phiếu. */
export async function deleteTopup(formData: FormData): Promise<void> {
  const { me } = await getContext();
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id)) return;
  await db.delete(walletTopups).where(and(eq(walletTopups.id, id), eq(walletTopups.userId, me.id)));
  revalidateWallet();
}

/**
 * Lưu ngân sách theo danh mục của user. Mỗi input tên `budget_<categoryId>`.
 * Giá trị > 0 → upsert; rỗng/0 → xóa (coi như chưa đặt).
 */
export async function saveCategoryBudgets(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { me } = await getContext();

  for (const [key, val] of formData.entries()) {
    if (!key.startsWith('budget_')) continue;
    const categoryId = Number(key.slice('budget_'.length));
    if (!Number.isInteger(categoryId)) continue;
    const amount = Number(String(val).replace(/\D/g, ''));

    if (amount > 0) {
      await db
        .insert(userCategoryBudgets)
        .values({ userId: me.id, categoryId, monthlyBudget: amount })
        .onConflictDoUpdate({
          target: [userCategoryBudgets.userId, userCategoryBudgets.categoryId],
          set: { monthlyBudget: amount },
        });
    } else {
      await db
        .delete(userCategoryBudgets)
        .where(and(eq(userCategoryBudgets.userId, me.id), eq(userCategoryBudgets.categoryId, categoryId)));
    }
  }

  revalidatePath('/expenses');
  revalidatePath('/settings');
  return { ok: true };
}

/** Xóa khoản chi — chỉ chủ khoản chi mới được xóa. */
export async function deleteExpense(formData: FormData): Promise<void> {
  const { me } = await getContext();
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id)) return;

  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, me.id)));
  revalidateAll();
}
