import { db } from './index';
import { households, householdMembers, users, expenses, userCategoryBudgets, walletTopups } from './schema';

/**
 * Xóa sạch dữ liệu người dùng để đưa vào production (giữ lại bảng `categories`
 * vì là dữ liệu hệ thống dùng chung). Chạy: pnpm db:wipe
 */
async function wipe() {
  console.log('Xóa dữ liệu người dùng...');
  await db.delete(walletTopups);
  await db.delete(userCategoryBudgets);
  await db.delete(expenses);
  await db.delete(householdMembers);
  await db.delete(households);
  await db.delete(users);
  console.log('✓ Đã xóa sạch. Giữ lại danh mục hệ thống.');
  process.exit(0);
}

wipe().catch((err) => {
  console.error(err);
  process.exit(1);
});
