'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { expenses, userCategoryBudgets, walletTopups } from '@/db/schema';
import { getContext } from '@/features/households/queries';
import { getWalletState } from './queries';
import { formatCurrency } from '@/utils/format';

export interface ActionState {
  ok?: boolean;
  error?: string;
}

// Driver neon-http KHÔNG hỗ trợ transaction tương tác (read-rồi-write không nguyên
// tử → có thể đua làm ví âm). Thay vào đó mọi thao tác động tiền đều ghi CÓ ĐIỀU KIỆN
// trong một câu lệnh SQL duy nhất: phép tính số dư nằm ngay trong WHERE, nên DB tự
// chối nếu sẽ âm. RETURNING cho biết có ghi được hay không.
type ExecResult = { rows: { id: number }[] };

/** Tổng đã nạp của user trong SQL (loại trừ phiếu `exceptTopupId` nếu có). */
const depositedSql = (uid: number, exceptTopupId?: number) =>
  sql`COALESCE((SELECT SUM(amount) FROM wallet_topups WHERE user_id = ${uid}${
    exceptTopupId ? sql` AND id <> ${exceptTopupId}` : sql``
  }), 0)`;

/** Tổng đã chi của user trong SQL (loại trừ khoản `exceptExpenseId` nếu có). */
const spentSql = (uid: number, exceptExpenseId?: number) =>
  sql`COALESCE((SELECT SUM(amount) FROM expenses WHERE user_id = ${uid}${
    exceptExpenseId ? sql` AND id <> ${exceptExpenseId}` : sql``
  }), 0)`;

/**
 * Chuỗi từ input date/datetime-local -> Date, hiểu theo GIỜ VIỆT NAM (UTC+7) bất kể
 * TZ của máy chủ (Vercel chạy UTC). Rỗng/không hợp lệ -> thời điểm hiện tại.
 * - "YYYY-MM-DD"          -> nửa đêm giờ VN của ngày đó
 * - "YYYY-MM-DDTHH:mm[:ss]" (không kèm offset) -> giờ tường VN
 */
function parseWhen(str: string | null): Date {
  if (str) {
    let iso = str;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) iso = `${str}T00:00:00+07:00`;
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(str)) iso = `${str}+07:00`;
    const d = new Date(iso);
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
  // Ghi nguyên tử: chỉ chèn nếu số dư hiện tại vẫn đủ (chống đua làm ví âm).
  const res = (await db.execute(sql`
    INSERT INTO expenses (user_id, household_id, category_id, amount, payment_method, note, occurred_at)
    SELECT ${me.id}, NULL, ${f.categoryId}, ${f.amount}, ${f.paymentMethod}, ${f.note}, ${f.occurredAt}
    WHERE ${depositedSql(me.id)} - ${spentSql(me.id)} >= ${f.amount}
    RETURNING id
  `)) as ExecResult;
  if (res.rows.length === 0) return { error: 'Số dư ví không đủ. Hãy nạp thêm rồi thử lại.' };

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

  // Cập nhật nguyên tử: tổng đã chi LOẠI TRỪ khoản này + khoản mới không vượt số đã nạp.
  const res = (await db.execute(sql`
    UPDATE expenses
    SET amount = ${f.amount}, category_id = ${f.categoryId}, note = ${f.note},
        occurred_at = ${f.occurredAt}, payment_method = ${f.paymentMethod}
    WHERE id = ${id} AND user_id = ${me.id}
      AND ${depositedSql(me.id)} - ${spentSql(me.id, id)} >= ${f.amount}
    RETURNING id
  `)) as ExecResult;
  if (res.rows.length === 0) return { error: 'Số dư ví không đủ. Vui lòng thử lại.' };

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

  const [row] = await db.select().from(walletTopups).where(and(eq(walletTopups.id, id), eq(walletTopups.userId, me.id))).limit(1);
  if (!row) return { error: 'Không tìm thấy phiếu nạp của bạn.' };

  // Giảm số tiền phiếu không được làm ví âm: số dư sau khi đổi = số dư hiện tại - khoản cũ + khoản mới.
  const wallet = await getWalletState(me.id);
  if (wallet.balance - row.amount + amount < 0) {
    return { error: `Không thể giảm xuống mức này — ví sẽ âm. Tối thiểu ${formatCurrency(row.amount - wallet.balance)}.` };
  }

  // Cập nhật nguyên tử: (số mới + tổng nạp loại trừ phiếu này) phải đủ bù tổng đã chi.
  const note = (formData.get('note') as string)?.trim() || null;
  const when = parseWhen(formData.get('occurredAt') as string);
  const res = (await db.execute(sql`
    UPDATE wallet_topups
    SET amount = ${amount}, note = ${note}, occurred_at = ${when}
    WHERE id = ${id} AND user_id = ${me.id}
      AND ${amount} + ${depositedSql(me.id, id)} - ${spentSql(me.id)} >= 0
    RETURNING id
  `)) as ExecResult;
  if (res.rows.length === 0) return { error: 'Không thể giảm — ví sẽ âm. Vui lòng thử lại.' };

  revalidateWallet();
  return { ok: true };
}

/** Xóa phiếu nạp — chỉ chủ phiếu. Không cho xóa nếu sẽ làm ví âm (không đủ tiền hoàn). */
export async function deleteTopup(formData: FormData): Promise<ActionState> {
  const { me } = await getContext();
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id)) return { error: 'Phiếu không hợp lệ.' };

  const [row] = await db.select().from(walletTopups).where(and(eq(walletTopups.id, id), eq(walletTopups.userId, me.id))).limit(1);
  if (!row) return { error: 'Không tìm thấy phiếu nạp của bạn.' };

  // Xóa phiếu sẽ trừ số đã nạp khỏi ví → chặn nếu số dư còn lại không đủ để hoàn.
  const wallet = await getWalletState(me.id);
  if (wallet.balance - row.amount < 0) {
    return { error: `Không đủ tiền để xóa phiếu này (số dư còn ${formatCurrency(wallet.balance)}). Hãy xóa bớt chi tiêu trước.` };
  }

  // Xóa nguyên tử: chỉ xóa nếu tổng nạp CÒN LẠI vẫn bù đủ tổng đã chi (không âm).
  const res = (await db.execute(sql`
    DELETE FROM wallet_topups
    WHERE id = ${id} AND user_id = ${me.id}
      AND ${depositedSql(me.id, id)} - ${spentSql(me.id)} >= 0
    RETURNING id
  `)) as ExecResult;
  if (res.rows.length === 0) return { error: 'Không đủ tiền để xóa phiếu này. Vui lòng thử lại.' };

  revalidateWallet();
  return { ok: true };
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
