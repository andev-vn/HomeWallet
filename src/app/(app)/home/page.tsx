import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { getMyHouseholds } from '@/features/households/queries';
import AddHouseholdSection from '@/features/households/components/AddHouseholdSection';

const PAGE = { px: { xs: 2.5, md: 5 }, maxWidth: 1600, mx: 'auto', pt: { xs: 3, md: 4 } };

export default async function HouseholdsHubPage() {
  const houses = await getMyHouseholds();

  return (
    <Box sx={PAGE}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: 24, md: 32 } }}>
            Nhà của tôi
          </Typography>
          <Typography sx={{ color: c.onSurfaceVariant }}>
            Chọn một nhà để xem chi tiêu của các thành viên
          </Typography>
        </Box>
      </Box>

      {houses.length === 0 ? (
        /* Chưa có nhà nào → CTA + form thêm nhà */
        <Card sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', bgcolor: c.surfaceContainerLow }}>
          <Box sx={{ width: 64, height: 64, borderRadius: 4, mx: 'auto', mb: 2, bgcolor: c.primaryContainer, color: c.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ms name="diversity_3" fill size={32} />
          </Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Bạn chưa tham gia nhà nào
          </Typography>
          <Typography sx={{ color: c.onSurfaceVariant, mb: 3, maxWidth: 460, mx: 'auto' }}>
            Tạo một &ldquo;Nhà&rdquo; rồi mời người thân tham gia bằng mã mời, hoặc tham gia nhà có sẵn để cùng theo dõi chi tiêu.
          </Typography>
          <Box sx={{ maxWidth: 720, mx: 'auto', textAlign: 'left' }}>
            <AddHouseholdSection defaultOpen />
          </Box>
        </Card>
      ) : (
        <>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' } }}>
            {houses.map((h) => (
              <Link key={h.id} href={`/home/${h.id}`} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'block',
                  color: 'inherit',
                  bgcolor: c.surfaceContainerLowest,
                  border: '1px solid rgba(224,192,177,0.4)',
                  borderRadius: 4,
                  p: 3,
                  boxShadow: '0 4px 16px rgba(249,115,22,0.04)',
                  transition: 'transform .15s, box-shadow .15s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(249,115,22,0.14)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: 3, bgcolor: c.primaryContainer, color: c.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ms name="home" fill />
                  </Box>
                  {h.isOwner && <Chip label="Chủ nhà" size="small" sx={{ bgcolor: 'rgba(249,115,22,0.12)', color: c.primary, fontWeight: 600 }} />}
                </Box>
                <Typography variant="h4" sx={{ fontSize: 20, mb: 0.5 }}>
                  {h.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: c.onSurfaceVariant }}>
                  <Ms name="groups" size={18} />
                  <Typography sx={{ fontSize: 14 }}>{h.memberCount} thành viên</Typography>
                  <Ms name="chevron_right" size={18} sx={{ ml: 'auto' }} />
                </Box>
              </Box>
              </Link>
            ))}
          </Box>

          <Box sx={{ mt: 4 }}>
            <AddHouseholdSection />
          </Box>
        </>
      )}
    </Box>
  );
}
