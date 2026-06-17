import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { getContext } from '@/features/households/queries';
import { getWalletTopups, getUserExpenses } from '@/features/expenses/queries';
import { sum } from '@/features/expenses/lib';
import { leaveHousehold, switchHousehold, logout } from '@/features/auth/actions';
import { formatCurrency } from '@/utils/format';
import EditProfile from '@/features/auth/components/EditProfile';

const PAGE = { px: { xs: 2.5, md: 5 }, maxWidth: 1600, mx: 'auto', pt: { xs: 3, md: 5 } };

export default async function ProfilePage() {
  const { me, myHouseholds, activeHousehold, members } = await getContext();
  const [topups, allExpenses] = await Promise.all([
    getWalletTopups(me.id),
    getUserExpenses(me.id),
  ]);
  const deposited = topups.reduce((s, t) => s + t.amount, 0);
  const balance = deposited - sum(allExpenses);

  return (
    <Box sx={PAGE}>
      <Typography variant="h2" sx={{ fontSize: { xs: 24, md: 32 }, mb: 3 }}>
        Hồ Sơ
      </Typography>

      {/* User card */}
      <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
        <Avatar src={me.avatarUrl ?? undefined} sx={{ width: 80, height: 80, flexShrink: 0 }}>
          {me.name.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4">{me.name}</Typography>
          <Typography sx={{ color: c.onSurfaceVariant, fontSize: 14 }}>@{me.username}</Typography>
          {deposited > 0 && (
            <Typography sx={{ mt: 0.5, color: c.onSurfaceVariant }}>
              Số dư ví: {formatCurrency(balance)}
            </Typography>
          )}
        </Box>
        <EditProfile name={me.name} avatarUrl={me.avatarUrl} />
      </Card>

      {/* Nhà của tôi */}
      <Typography variant="h4" sx={{ mb: 1.5 }}>
        Nhà của tôi ({myHouseholds.length})
      </Typography>
      {myHouseholds.length === 0 ? (
        <Typography sx={{ color: c.onSurfaceVariant, mb: 3 }}>Bạn chưa tham gia nhà nào.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          {myHouseholds.map((h) => {
            const owner = h.ownerId === me.id;
            const active = activeHousehold?.id === h.id;
            return (
              <Card key={h.id} sx={{ p: 2.5, border: active ? `2px solid ${c.primaryContainer}` : undefined }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 999, bgcolor: c.surfaceContainerHigh, color: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ms name="home" fill={active} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 120 }}>
                    <Typography sx={{ fontWeight: 700 }}>{h.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      {owner && <Chip label="Chủ nhà" size="small" color="primary" />}
                      {active && <Chip label="Đang xem" size="small" sx={{ bgcolor: c.surfaceContainerHigh }} />}
                    </Box>
                  </Box>
                  {!active && (
                    <Box component="form" action={switchHousehold}>
                      <input type="hidden" name="householdId" value={h.id} />
                      <Button type="submit" variant="outlined" size="small" sx={{ borderColor: c.outlineVariant, color: c.onSurface }}>
                        Chọn xem
                      </Button>
                    </Box>
                  )}
                  {!owner && (
                    <Box component="form" action={leaveHousehold}>
                      <input type="hidden" name="householdId" value={h.id} />
                      <Button type="submit" variant="text" size="small" color="error">
                        Rời
                      </Button>
                    </Box>
                  )}
                </Box>
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: c.onSurfaceVariant }}>
                  <Ms name="key" size={18} />
                  <Typography sx={{ fontSize: 14 }}>
                    Mã mời: <b style={{ letterSpacing: 2, color: c.primary }}>{h.inviteCode}</b>
                  </Typography>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Thành viên nhà đang xem */}
      {activeHousehold && (
        <>
          <Typography variant="h4" sx={{ mb: 1.5 }}>
            Thành viên {activeHousehold.name} ({members.length})
          </Typography>
          <Card sx={{ p: 1, mb: 3 }}>
            {members.map((m) => (
              <Box key={m.userId} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5 }}>
                <Avatar src={m.avatarUrl ?? undefined} sx={{ width: 44, height: 44 }}>
                  {m.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {m.name} {m.userId === me.id && '(bạn)'}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: c.onSurfaceVariant }}>{m.role}</Typography>
                </Box>
                {activeHousehold.ownerId === m.userId && <Chip label="Chủ nhà" size="small" color="primary" />}
              </Box>
            ))}
          </Card>
        </>
      )}

      {/* Đăng xuất — chỉ hiện trên mobile (desktop đã có ở sidebar) */}
      <Box component="form" action={logout} sx={{ display: { xs: 'block', md: 'none' }, mt: 1 }}>
        <Button type="submit" variant="outlined" color="error" fullWidth startIcon={<Ms name="logout" />} sx={{ py: 1.25 }}>
          Đăng xuất
        </Button>
      </Box>
    </Box>
  );
}
