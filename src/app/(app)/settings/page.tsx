import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { getContext } from '@/features/households/queries';
import { getCategories, getUserBudgets, getWalletTopups, getUserExpenses } from '@/features/expenses/queries';
import { sum } from '@/features/expenses/lib';
import CategoryBudgetForm from '@/features/expenses/components/CategoryBudgetForm';
import WalletManager from '@/features/expenses/components/WalletManager';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { me } = await getContext();
  const [categories, budgets, topups, allExpenses] = await Promise.all([
    getCategories(),
    getUserBudgets(me.id),
    getWalletTopups(me.id),
    getUserExpenses(me.id),
  ]);
  const current = Object.fromEntries(budgets);
  const deposited = topups.reduce((s, t) => s + t.amount, 0);
  const balance = deposited - sum(allExpenses);

  return (
    <Box sx={{ px: { xs: 2.5, md: 5 }, pt: { xs: 3, md: 5 }, maxWidth: 1600, mx: 'auto' }}>
      <Typography variant="h2" sx={{ fontSize: { xs: 24, md: 32 }, mb: 1 }}>
        Ví của tôi
      </Typography>

      <Card sx={{ p: { xs: 2.5, md: 3 }, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Ms name="account_balance_wallet" sx={{ color: c.primary }} />
          <Typography variant="h4" sx={{ fontSize: 18 }}>
            Ví của tôi
          </Typography>
        </Box>
        <Typography sx={{ color: c.onSurfaceVariant, fontSize: 14, mb: 2.5 }}>
          Thêm tiền vào ví bằng các phiếu nạp (có thể sửa/xóa). Số dư ví = tổng đã nạp − tổng chi tiêu. Chưa nạp đồng nào thì màn chi tiêu sẽ ẩn phần ngân sách.
        </Typography>
        <WalletManager topups={topups} balance={balance} />
      </Card>

      <Card sx={{ p: { xs: 2.5, md: 3 }, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Ms name="savings" sx={{ color: c.primary }} />
          <Typography variant="h4" sx={{ fontSize: 18 }}>
            Ngân sách theo danh mục
          </Typography>
        </Box>
        <Typography sx={{ color: c.onSurfaceVariant, fontSize: 14, mb: 2.5 }}>
          Đặt hạn mức chi mỗi tháng cho từng danh mục. Để trống nếu không muốn theo dõi — màn chi tiêu sẽ không hiển thị phần ngân sách cho danh mục đó.
        </Typography>
        <CategoryBudgetForm categories={categories} current={current} />
      </Card>
    </Box>
  );
}
