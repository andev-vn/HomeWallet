import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { categories, expenses, users, userCategoryBudgets, walletTopups } from '@/db/schema';
import type { WalletTopup } from '@/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import type { Category } from '@/db/schema';

export interface EnrichedExpense {
  id: number;
  amount: number;
  paymentMethod: string;
  note: string | null;
  occurredAt: Date;
  userId: number;
  userName: string;
  userAvatar: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categoryIcon: string;
  categoryColor: string;
}

const columns = {
  id: expenses.id,
  amount: expenses.amount,
  paymentMethod: expenses.paymentMethod,
  note: expenses.note,
  occurredAt: expenses.occurredAt,
  userId: expenses.userId,
  userName: users.name,
  userAvatar: users.avatarUrl,
  categoryId: expenses.categoryId,
  categoryName: categories.name,
  categoryIcon: categories.icon,
  categoryColor: categories.color,
};

const base = () =>
  db
    .select(columns)
    .from(expenses)
    .innerJoin(users, eq(expenses.userId, users.id))
    .leftJoin(categories, eq(expenses.categoryId, categories.id));

/**
 * Toàn bộ chi tiêu của MỘT user (chi tiêu vốn là của cá nhân).
 * Dùng cho màn "Chi Tiêu Của Tôi" và xem chi tiết một thành viên.
 */
export async function getUserExpenses(userId: number): Promise<EnrichedExpense[]> {
  return base()
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.occurredAt), desc(expenses.id)) as Promise<EnrichedExpense[]>;
}

/**
 * Chi tiêu của một NHÓM user (các thành viên đang ở trong nhà). Nhà chỉ để chia sẻ
 * tầm nhìn — nên gom đủ chi tiêu của mọi thành viên, kể cả khoản tạo trước khi vào nhà.
 */
export async function getMembersExpenses(userIds: number[]): Promise<EnrichedExpense[]> {
  if (userIds.length === 0) return [];
  return base()
    .where(inArray(expenses.userId, userIds))
    .orderBy(desc(expenses.occurredAt), desc(expenses.id)) as Promise<EnrichedExpense[]>;
}

/**
 * Danh mục là dữ liệu seed gần như bất biến → cache xuyên request (1 giờ).
 * Gắn tag 'categories' để có thể revalidateTag khi đổi danh mục về sau.
 */
export const getCategories = unstable_cache(
  async (): Promise<Category[]> => db.select().from(categories).orderBy(categories.id),
  ['categories'],
  { tags: ['categories'], revalidate: 3600 },
);

/** Các phiếu nạp tiền vào ví của user, mới nhất trước. */
export async function getWalletTopups(userId: number): Promise<WalletTopup[]> {
  return db
    .select()
    .from(walletTopups)
    .where(eq(walletTopups.userId, userId))
    .orderBy(desc(walletTopups.occurredAt), desc(walletTopups.id));
}

/** Tình trạng ví của user: tổng đã nạp, tổng đã chi, số dư còn lại. */
export async function getWalletState(
  userId: number,
): Promise<{ deposited: number; spent: number; balance: number }> {
  const [topups, exp] = await Promise.all([
    db.select({ a: walletTopups.amount }).from(walletTopups).where(eq(walletTopups.userId, userId)),
    db.select({ a: expenses.amount }).from(expenses).where(eq(expenses.userId, userId)),
  ]);
  const deposited = topups.reduce((s, r) => s + r.a, 0);
  const spent = exp.reduce((s, r) => s + r.a, 0);
  return { deposited, spent, balance: deposited - spent };
}

/** Ngân sách theo danh mục mà user đã tự đặt: Map categoryId -> số tiền. */
export async function getUserBudgets(userId: number): Promise<Map<number, number>> {
  const rows = await db
    .select({ categoryId: userCategoryBudgets.categoryId, monthlyBudget: userCategoryBudgets.monthlyBudget })
    .from(userCategoryBudgets)
    .where(eq(userCategoryBudgets.userId, userId));
  return new Map(rows.map((r) => [r.categoryId, r.monthlyBudget]));
}
