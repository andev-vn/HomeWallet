import Link from 'next/link';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import MonthNav from '@/components/MonthNav';
import HouseholdSettings from '@/features/households/components/HouseholdSettings';
import TransactionList from '@/features/expenses/components/TransactionList';
import { approveMember, rejectMember } from '@/features/auth/actions';
import { getHouseholdView, getHouseholdPending } from '@/features/households/queries';
import { getMembersExpenses, getCategories } from '@/features/expenses/queries';
import { inMonth, sum, byMember } from '@/features/expenses/lib';
import { formatCurrency, ymString, parseYm } from '@/utils/format';

const PAGE = { px: { xs: 2.5, md: 5 }, maxWidth: 1600, mx: 'auto', pt: { xs: 3, md: 4 } };

export default async function HouseholdDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ym?: string }>;
}) {
  const { id } = await params;
  const { ym } = await searchParams;
  const householdId = Number(id);
  if (!Number.isInteger(householdId)) notFound();

  const view = await getHouseholdView(householdId);
  if (!view) notFound();
  const { household, members, isOwner } = view;

  const now = new Date();
  const { year, month0 } = parseYm(ym, now);
  const ymCur = ymString(year, month0);

  const memberIds = members.map((m) => m.userId);
  const [all, categories, pending] = await Promise.all([
    getMembersExpenses(memberIds),
    getCategories(),
    isOwner ? getHouseholdPending(householdId) : Promise.resolve([]),
  ]);
  const monthRows = inMonth(all, year, month0);
  const total = sum(monthRows);
  const spenders = byMember(monthRows);
  const spendOf = (uid: number) => spenders.find((s) => s.userId === uid)?.total ?? 0;

  return (
    <Box sx={PAGE}>
      <Link href="/home" style={{ textDecoration: 'none' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 14, fontWeight: 600, color: c.onSurfaceVariant, mb: 2, '&:hover': { color: c.primary } }}>
          <Ms name="arrow_back" size={18} /> Nhà của tôi
        </Box>
      </Link>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: { xs: 24, md: 32 } }}>
              {household.name}
            </Typography>
            <Typography sx={{ color: c.onSurfaceVariant }}>
              {members.length} thành viên • mã mời <b>{household.inviteCode}</b>
            </Typography>
          </Box>
          {isOwner && <HouseholdSettings householdId={householdId} currentName={household.name} />}
        </Box>
        <Box sx={{ alignSelf: { xs: 'flex-start', md: 'auto' } }}>
          <MonthNav year={year} month0={month0} basePath={`/home/${householdId}`} />
        </Box>
      </Box>

      {/* Tổng chi cả nhà */}
      <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3, p: { xs: 3, md: 4 }, color: c.onPrimary, background: `linear-gradient(135deg, ${c.primaryContainer}, ${c.primary})`, boxShadow: '0 16px 32px rgba(249,115,22,0.2)' }}>
        <Box sx={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.12)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ opacity: 0.9 }}>Tổng chi cả nhà trong tháng</Typography>
          <Typography sx={{ fontSize: { xs: 32, md: 44 }, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCurrency(total)}</Typography>
        </Box>
      </Box>

      {/* Yêu cầu chờ duyệt (chủ nhà) */}
      {pending.length > 0 && (
        <>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            Yêu cầu tham gia ({pending.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1, bgcolor: c.surfaceContainerLowest, border: '1px solid rgba(224,192,177,0.4)', borderRadius: 4 }}>
            {pending.map((p) => (
              <Box key={p.memberId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
                <Avatar src={p.avatarUrl ?? undefined} sx={{ width: 44, height: 44, flexShrink: 0 }}>
                  {p.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>{p.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: c.onSurfaceVariant }}>Vai trò: {p.role}</Typography>
                </Box>
                <Box component="form" action={approveMember}>
                  <input type="hidden" name="memberId" value={p.memberId} />
                  <Button type="submit" variant="contained" size="small" startIcon={<Ms name="check" size={18} />}>
                    Duyệt
                  </Button>
                </Box>
                <Box component="form" action={rejectMember}>
                  <input type="hidden" name="memberId" value={p.memberId} />
                  <Button type="submit" variant="text" size="small" color="error">
                    Từ chối
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* Thành viên */}
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Chi tiêu theo thành viên
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' } }}>
        {members.map((m) => {
          const spent = spendOf(m.userId);
          const pct = total > 0 ? Math.round((spent / total) * 100) : 0;
          return (
            <Box
              key={m.userId}
              sx={{
                position: 'relative',
                bgcolor: c.surfaceContainerLowest,
                border: '1px solid rgba(224,192,177,0.4)',
                borderRadius: 4,
                boxShadow: '0 4px 16px rgba(249,115,22,0.04)',
                transition: 'transform .15s, box-shadow .15s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(249,115,22,0.14)' },
              }}
            >
              <Link
                href={`/home/${householdId}/member/${m.userId}?ym=${ymCur}`}
                style={{ textDecoration: 'none' }}
              >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, color: 'inherit' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={m.avatarUrl ?? undefined} sx={{ width: 48, height: 48, flexShrink: 0, border: `2px solid ${c.surfaceContainer}` }}>
                    {m.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h4" sx={{ fontSize: 17 }} noWrap>
                      {m.name}
                    </Typography>
                    <Chip label={m.role} size="small" sx={{ mt: 0.25, height: 22, bgcolor: c.surfaceContainerHigh, color: c.onSurfaceVariant }} />
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 12, color: c.onSurfaceVariant }}>Đã chi</Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: c.primary, lineHeight: 1.2 }}>{formatCurrency(spent)}</Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 999, bgcolor: c.surfaceVariant, '& .MuiLinearProgress-bar': { bgcolor: c.primaryContainer } }} />
              </Box>
              </Link>
            </Box>
          );
        })}
      </Box>

      {/* Giao dịch cả nhà trong tháng */}
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Giao dịch trong tháng
      </Typography>
      <TransactionList rows={monthRows} now={now} showUser categories={categories} currentUserId={view.me.id} />
    </Box>
  );
}
