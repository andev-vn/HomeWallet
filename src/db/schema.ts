import { pgTable, serial, text, bigint, timestamp, integer, unique } from 'drizzle-orm/pg-core';

/** Người dùng. Đăng nhập bằng username + mật khẩu. */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  monthlyBudget: bigint('monthly_budget', { mode: 'number' }).notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Một "Nhà". ownerId = chủ nhà (người duyệt thành viên). */
export const households = pgTable('households', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  inviteCode: text('invite_code').notNull().unique(),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Quan hệ nhiều-nhiều user ↔ nhà. Một user có thể ở nhiều nhà.
 * status: 'pending' (chờ chủ nhà duyệt) | 'active' (đã là thành viên).
 */
export const householdMembers = pgTable(
  'household_members',
  {
    id: serial('id').primaryKey(),
    householdId: integer('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('Thành viên'),
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.householdId, t.userId)],
);

/** Danh mục chi tiêu dùng chung toàn hệ thống. */
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('payments'),
  color: text('color').notNull().default('#f97316'),
  monthlyBudget: bigint('monthly_budget', { mode: 'number' }).notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Ngân sách theo danh mục — do TỪNG user tự đặt. Không có dòng = user chưa đặt
 * ngân sách cho danh mục đó (UI để trống, không hiển thị phần ngân sách).
 */
export const userCategoryBudgets = pgTable(
  'user_category_budgets',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    monthlyBudget: bigint('monthly_budget', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.categoryId)],
);

/**
 * Phiếu nạp tiền vào ví của một user. Số dư ví = tổng các phiếu nạp − tổng chi tiêu.
 * Mỗi lần thêm tiền là một phiếu (có thể sửa/xóa).
 */
export const walletTopups = pgTable('wallet_topups', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  note: text('note'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Một khoản chi. householdId = null nghĩa là chi tiêu cá nhân. */
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  householdId: integer('household_id').references(() => households.id, { onDelete: 'set null' }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  paymentMethod: text('payment_method').notNull().default('cash'),
  note: text('note'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Household = typeof households.$inferSelect;
export type HouseholdMember = typeof householdMembers.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type UserCategoryBudget = typeof userCategoryBudgets.$inferSelect;
export type WalletTopup = typeof walletTopups.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
