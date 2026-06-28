import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { getContext } from '@/features/households/queries';
import { getUserExpenses, getCategories } from '@/features/expenses/queries';
import { inMonth, sum } from '@/features/expenses/lib';
import { formatCurrency, formatMonthShort } from '@/utils/format';
import TransactionList from '@/features/expenses/components/TransactionList';

const PAGE = { px: { xs: 2.5, md: 5 }, maxWidth: 1600, mx: 'auto', pt: { xs: 3, md: 4 } };

/** Parse "2026-6" -> {year, month0}; fallback về tháng hiện tại. */
function parseYm(ym: string | undefined, now: Date): { year: number; month0: number } {
  const m = ym?.match(/^(\d{4})-(\d{1,2})$/);
  if (m) return { year: Number(m[1]), month0: Number(m[2]) - 1 };
  return { year: now.getFullYear(), month0: now.getMonth() };
}

export default async function MonthTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ ym?: string; cat?: string }>;
}) {
  const { ym, cat } = await searchParams;
  const now = new Date();
  const { year, month0 } = parseYm(ym, now);
  const catId = cat ? Number(cat) : null;

  const { me } = await getContext();
  const [all, categories] = await Promise.all([getUserExpenses(me.id), getCategories()]);

  let rows = inMonth(all, year, month0);
  if (catId) rows = rows.filter((r) => r.categoryId === catId);

  const catName = catId ? rows[0]?.categoryName ?? 'Danh mục' : null;
  const total = sum(rows);

  return (
    <Box sx={PAGE}>
      <Link href="/expenses" style={{ textDecoration: 'none', display: 'inline-flex' }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 14, fontWeight: 600, color: c.onSurfaceVariant, mb: 2, '&:hover': { color: c.primary } }}>
        <Ms name="arrow_back" size={18} /> Tổng quan
      </Box>
      </Link>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { md: 'flex-end' }, flexDirection: { xs: 'column', md: 'row' }, gap: 1, mb: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: 24, md: 32 } }}>
            {catName ? `Chi tiêu: ${catName}` : 'Giao dịch trong tháng'}
          </Typography>
          <Typography sx={{ color: c.onSurfaceVariant }}>
            {formatMonthShort(year, month0)} • {rows.length} giao dịch
          </Typography>
        </Box>
        <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, color: c.primary }}>
          {formatCurrency(total)}
        </Typography>
      </Box>

      <TransactionList rows={rows} now={now} categories={categories} currentUserId={me.id} />
    </Box>
  );
}
