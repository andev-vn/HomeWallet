import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { getCategories } from '@/features/expenses/queries';
import AddExpenseForm from '@/features/expenses/components/AddExpenseForm';

export default async function AddExpensePage() {
  const categories = await getCategories();

  return (
    <Box sx={{ px: { xs: 2, md: 5 }, pt: { xs: 3, md: 5 }, maxWidth: 1600, mx: 'auto' }}>
      <Card sx={{ overflow: 'hidden', borderRadius: 4, maxWidth: 560, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 2, borderBottom: `1px solid ${c.outlineVariant}55` }}>
          <Ms name="payments" sx={{ color: c.primary }} />
          <Typography variant="h4" sx={{ fontSize: 20 }}>
            Thêm Chi Tiêu
          </Typography>
        </Box>
        <AddExpenseForm categories={categories} />
      </Card>
    </Box>
  );
}
