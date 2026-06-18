import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { c } from '@/theme/colors';

const PAGE = { px: { xs: 2.5, md: 5 }, maxWidth: 1600, mx: 'auto', pt: { xs: 3, md: 4 } };

/**
 * Fallback hiện ngay khi chuyển menu, trong lúc data của trang đang stream về.
 * Khung xương khớp đại khái bố cục chung: tiêu đề + thẻ lớn + lưới thẻ.
 */
export default function Loading() {
  return (
    <Box sx={PAGE}>
      {/* Tiêu đề */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={220} sx={{ fontSize: { xs: 28, md: 38 } }} />
        <Skeleton variant="text" width={300} sx={{ fontSize: 16 }} />
      </Box>

      {/* Thẻ lớn (số liệu tổng) */}
      <Skeleton variant="rounded" height={132} sx={{ borderRadius: 3, bgcolor: `${c.primary}14`, mb: 4 }} />

      {/* Lưới thẻ */}
      <Skeleton variant="text" width={200} sx={{ fontSize: 22, mb: 2 }} />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' } }}>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: 4 }} />
        ))}
      </Box>
    </Box>
  );
}
