import Link from 'next/link';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import MonthNav from '@/components/MonthNav';
import TransactionList from '@/features/expenses/components/TransactionList';
import RemoveMemberButton from '@/features/households/components/RemoveMemberButton';
import { getHouseholdView } from '@/features/households/queries';
import { getUserExpenses, getCategories } from '@/features/expenses/queries';
import { inMonth, sum, byCategory } from '@/features/expenses/lib';
import { formatCurrency, ymString, parseYm } from '@/utils/format';

const PAGE = { px: { xs: 2.5, md: 5 }, maxWidth: 1600, mx: 'auto', pt: { xs: 3, md: 4 } };

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; uid: string }>;
  searchParams: Promise<{ ym?: string }>;
}) {
  const { id, uid } = await params;
  const { ym } = await searchParams;
  const householdId = Number(id);
  const userId = Number(uid);
  if (!Number.isInteger(householdId) || !Number.isInteger(userId)) notFound();

  const view = await getHouseholdView(householdId);
  if (!view) notFound();
  const member = view.members.find((m) => m.userId === userId);
  if (!member) notFound();

  const now = new Date();
  const { year, month0 } = parseYm(ym, now);
  const ymCur = ymString(year, month0);

  const [all, categories] = await Promise.all([getUserExpenses(userId), getCategories()]);
  const rows = inMonth(all, year, month0);
  const total = sum(rows);
  const cats = byCategory(rows);

  return (
    <Box sx={PAGE}>
      <Link href={`/home/${householdId}?ym=${ymCur}`} style={{ textDecoration: 'none' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 14, fontWeight: 600, color: c.onSurfaceVariant, mb: 2, '&:hover': { color: c.primary } }}>
          <Ms name="arrow_back" size={18} /> {view.household.name}
        </Box>
      </Link>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={member.avatarUrl ?? undefined} sx={{ width: 64, height: 64, border: `3px solid ${c.surfaceContainer}` }}>
            {member.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h2" sx={{ fontSize: { xs: 24, md: 32 } }}>
              {member.name}
            </Typography>
            <Chip label={member.role} size="small" sx={{ bgcolor: c.surfaceContainerHigh, color: c.onSurfaceVariant }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', alignSelf: { xs: 'flex-start', md: 'auto' } }}>
          <MonthNav year={year} month0={month0} basePath={`/home/${householdId}/member/${userId}`} />
          {view.isOwner && member.userId !== view.me.id && (
            <RemoveMemberButton memberId={member.memberId} memberName={member.name} householdId={householdId} />
          )}
        </Box>
      </Box>

      {/* Tổng chi của thành viên */}
      <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3, p: { xs: 3, md: 4 }, color: c.onPrimary, background: `linear-gradient(135deg, ${c.primaryContainer}, ${c.primary})`, boxShadow: '0 16px 32px rgba(249,115,22,0.2)' }}>
        <Box sx={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.12)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ opacity: 0.9 }}>Tổng chi trong tháng</Typography>
          <Typography sx={{ fontSize: { xs: 32, md: 44 }, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCurrency(total)}</Typography>
          <Typography sx={{ opacity: 0.9, fontSize: 14, mt: 0.5 }}>{rows.length} giao dịch</Typography>
        </Box>
      </Box>

      {/* Theo danh mục */}
      {cats.length > 0 && (
        <>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            Theo danh mục
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {cats.map((cat) => (
              <Box key={String(cat.categoryId)} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: c.surfaceContainerLowest, border: '1px solid rgba(224,192,177,0.4)', borderRadius: 999, pl: 1, pr: 2, py: 0.75 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: 999, bgcolor: `${cat.color}1A`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ms name={cat.icon} size={18} />
                </Box>
                <Typography sx={{ fontSize: 14, color: c.onSurfaceVariant }}>{cat.name}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.onSurface }}>{formatCurrency(cat.total)}</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* Chi tiết giao dịch */}
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Chi tiết giao dịch
      </Typography>
      <TransactionList rows={rows} now={now} categories={categories} currentUserId={view.me.id} />
    </Box>
  );
}
