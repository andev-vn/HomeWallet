import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { getContext } from '@/features/households/queries';
import { getUserExpenses, getCategories, getUserBudgets, getWalletTopups } from '@/features/expenses/queries';
import { inMonth, sum, byCategory } from '@/features/expenses/lib';
import { formatCurrency, formatCompact, ymString, parseYm, shiftMonth } from '@/utils/format';
import TransactionList from '@/features/expenses/components/TransactionList';
import MonthNav from '@/components/MonthNav';

const PAGE = { px: { xs: 2.5, md: 5 }, maxWidth: 1600, mx: 'auto', pt: { xs: 3, md: 4 } };

export default async function MyExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ ym?: string }>;
}) {
  const { ym: ymParam } = await searchParams;
  const { me } = await getContext();
  const [all, cats, budgetOf, topups] = await Promise.all([
    getUserExpenses(me.id),
    getCategories(),
    getUserBudgets(me.id),
    getWalletTopups(me.id),
  ]);

  const now = new Date();
  const { year, month0 } = parseYm(ymParam, now);
  const ym = ymString(year, month0);
  const mine = inMonth(all, year, month0);
  const total = sum(mine);
  const deposited = topups.reduce((s, t) => s + t.amount, 0); // tổng đã nạp vào ví
  const hasWallet = deposited > 0;
  const remaining = Math.max(0, deposited - sum(all)); // số dư = đã nạp − tổng đã chi
  const remainPct = hasWallet ? Math.round((remaining / deposited) * 100) : 0;
  const cats2 = byCategory(mine);
  const recent = mine.slice(0, 5);

  // So sánh với tháng trước để hiển thị xu hướng.
  const prev = shiftMonth(year, month0, -1);
  const prevTotal = sum(inMonth(all, prev.year, prev.month0));
  const deltaPct = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0;
  const down = deltaPct < 0;

  return (
    <Box sx={PAGE}>
      <Box
        sx={{
          position: { xs: 'static', md: 'sticky' },
          top: 0,
          zIndex: 20,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { md: 'center' },
          gap: 2,
          mb: 3,
          py: 2,
          bgcolor: `${c.background}f2`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: 24, md: 32 } }}>
            Tổng quan chi tiêu
          </Typography>
          <Typography sx={{ color: c.onSurfaceVariant }}>
            Theo dõi sát sao ngân sách tháng này
          </Typography>
        </Box>
        {/* Bộ chọn tháng */}
        <Box sx={{ alignSelf: { xs: 'flex-start', md: 'auto' } }}>
          <MonthNav year={year} month0={month0} basePath="/expenses" />
        </Box>
      </Box>

      <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3, p: { xs: 3, md: 4 }, color: c.onPrimary, background: `linear-gradient(135deg, ${c.primaryContainer}, ${c.primary})`, boxShadow: '0 16px 32px rgba(249,115,22,0.2)' }}>
        <Box sx={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.12)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-end' }, gap: 3 }}>
          <Box>
            <Typography sx={{ opacity: 0.9 }}>Tổng chi tiêu tháng này</Typography>
            <Typography sx={{ fontSize: { xs: 32, md: 44 }, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCurrency(total)}</Typography>
            {deltaPct !== 0 && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1.5, px: 1.25, py: 0.5, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.18)', fontSize: 13, fontWeight: 600 }}>
                <Ms name={down ? 'trending_down' : 'trending_up'} size={16} />
                {down ? 'Giảm' : 'Tăng'} {Math.abs(deltaPct)}% so với tháng trước
              </Box>
            )}
          </Box>
          {hasWallet && (
            <Box sx={{ minWidth: { md: 200 }, textAlign: { md: 'right' } }}>
              <Typography sx={{ opacity: 0.9, fontSize: 14 }}>Còn lại trong ví</Typography>
              <Typography variant="h4">{formatCurrency(remaining)}</Typography>
              <Box sx={{ width: { xs: '100%', md: 200 }, height: 8, borderRadius: 999, bgcolor: 'rgba(0,0,0,0.2)', mt: 1, overflow: 'hidden', ml: { md: 'auto' } }}>
                <Box sx={{ height: '100%', width: `${remainPct}%`, bgcolor: '#fff', borderRadius: 999 }} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Chi tiết theo danh mục
      </Typography>
      {cats2.length === 0 ? (
        <Typography sx={{ color: c.onSurfaceVariant }}>Bạn chưa có khoản chi nào trong tháng này.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' } }}>
          {cats2.map((cat) => {
            const budget = (cat.categoryId && budgetOf.get(cat.categoryId)) || 0;
            const pct = budget > 0 ? Math.min(100, Math.round((cat.total / budget) * 100)) : 100;
            const over = budget > 0 && cat.total > budget;
            return (
              <Box
                key={String(cat.categoryId)}
                component="a"
                href={`/expenses/transactions?ym=${ym}${cat.categoryId ? `&cat=${cat.categoryId}` : ''}`}
                sx={{
                  display: 'block',
                  bgcolor: c.surfaceContainerLowest,
                  border: '1px solid rgba(224,192,177,0.4)',
                  borderRadius: 4,
                  p: 2.5,
                  boxShadow: '0 4px 16px rgba(249,115,22,0.04)',
                  transition: 'transform .15s, box-shadow .15s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(249,115,22,0.12)' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 999, bgcolor: `${cat.color}1A`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ms name={cat.icon} />
                    </Box>
                    <Typography variant="h4" sx={{ fontSize: 18 }}>
                      {cat.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(cat.total)}</Typography>
                    <Ms name="chevron_right" size={20} sx={{ color: c.onSurfaceVariant }} />
                  </Box>
                </Box>
                {budget > 0 ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: over ? c.error : c.onSurfaceVariant, mb: 0.5 }}>
                      <span>Đã chi {formatCompact(cat.total)}</span>
                      <span>Ngân sách {formatCompact(budget)}</span>
                    </Box>
                    <Box sx={{ width: '100%', height: 10, borderRadius: 999, bgcolor: c.surfaceContainerHigh, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 999, bgcolor: over ? c.error : cat.color }} />
                    </Box>
                  </>
                ) : (
                  <Typography sx={{ fontSize: 13, color: c.onSurfaceVariant }}>
                    Đã chi {formatCompact(cat.total)}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* ===== Giao dịch trong tháng (5 gần nhất) ===== */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
        <Typography variant="h4">Giao dịch trong tháng</Typography>
        <Box component="a" href={`/expenses/transactions?ym=${ym}`} sx={{ fontSize: 14, fontWeight: 600, color: c.primary, '&:hover': { textDecoration: 'underline' } }}>
          Xem tất cả
        </Box>
      </Box>

      <TransactionList rows={recent} now={now} categories={cats} currentUserId={me.id} />
    </Box>
  );
}
