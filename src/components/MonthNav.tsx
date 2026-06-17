'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { formatMonthShort, ymString, shiftMonth } from '@/utils/format';

/**
 * Bộ chọn tháng dạng pill với mũi tên trái/phải.
 * Bấm nhãn tháng để mở popover chọn nhanh năm + tháng (tự dựng theo theme,
 * không phụ thuộc lib ngoài vì @mui/x-date-pickers chưa hỗ trợ MUI v9).
 * Điều hướng bằng query `?ym=YYYY-M` trên `basePath`.
 */
export default function MonthNav({
  year,
  month0,
  basePath,
}: {
  year: number;
  month0: number;
  basePath: string;
}) {
  const router = useRouter();
  const prev = shiftMonth(year, month0, -1);
  const next = shiftMonth(year, month0, 1);

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // Năm đang xem trong popover (đổi năm chưa điều hướng ngay).
  const [viewYear, setViewYear] = useState(year);

  const go = (y: number, m0: number) => router.push(`${basePath}?ym=${ymString(y, m0)}`);

  const open = (e: React.MouseEvent<HTMLElement>) => {
    setViewYear(year);
    setAnchor(e.currentTarget);
  };
  const close = () => setAnchor(null);

  const pick = (m0: number) => {
    close();
    go(viewYear, m0);
  };

  const arrow = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 999,
    border: 'none',
    bgcolor: 'transparent',
    cursor: 'pointer',
    color: c.onSurfaceVariant,
    '&:hover': { bgcolor: c.surfaceContainerHigh },
  } as const;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: c.surfaceContainerHighest, borderRadius: 999, px: 0.75, py: 0.5 }}>
      <Box component="button" type="button" onClick={() => go(prev.year, prev.month0)} sx={arrow} aria-label="Tháng trước">
        <Ms name="chevron_left" size={20} />
      </Box>

      <Box
        component="button"
        type="button"
        onClick={open}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          minWidth: 120,
          height: 32,
          px: 1,
          border: 'none',
          bgcolor: 'transparent',
          borderRadius: 999,
          cursor: 'pointer',
          fontWeight: 700,
          color: c.onSurface,
          '&:hover': { bgcolor: c.surfaceContainerHigh },
        }}
      >
        <Typography component="span" sx={{ fontWeight: 700, color: 'inherit' }}>
          {formatMonthShort(year, month0)}
        </Typography>
        <Ms name="arrow_drop_down" size={18} />
      </Box>

      <Box component="button" type="button" onClick={() => go(next.year, next.month0)} sx={arrow} aria-label="Tháng sau">
        <Ms name="chevron_right" size={20} />
      </Box>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { mt: 1, p: 2, width: 280, borderRadius: 4, boxShadow: '0 8px 28px rgba(249,115,22,0.18)' } } }}
      >
        {/* Bộ chọn năm */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box component="button" type="button" onClick={() => setViewYear((y) => y - 1)} sx={arrow} aria-label="Năm trước">
            <Ms name="chevron_left" size={20} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 18, color: c.onSurface }}>{viewYear}</Typography>
          <Box component="button" type="button" onClick={() => setViewYear((y) => y + 1)} sx={arrow} aria-label="Năm sau">
            <Ms name="chevron_right" size={20} />
          </Box>
        </Box>

        {/* Lưới 12 tháng */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {Array.from({ length: 12 }, (_, m0) => {
            const selected = viewYear === year && m0 === month0;
            return (
              <Box
                key={m0}
                component="button"
                type="button"
                onClick={() => pick(m0)}
                sx={{
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: selected ? c.primary : 'transparent',
                  bgcolor: selected ? c.primary : 'transparent',
                  color: selected ? c.onPrimary : c.onSurface,
                  fontWeight: selected ? 700 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all .15s',
                  '&:hover': { bgcolor: selected ? c.primary : c.surfaceContainerHigh },
                }}
              >
                Th {m0 + 1}
              </Box>
            );
          })}
        </Box>

        {/* Lối tắt về tháng hiện tại */}
        <Box
          component="button"
          type="button"
          onClick={() => {
            const now = new Date();
            close();
            go(now.getFullYear(), now.getMonth());
          }}
          sx={{
            mt: 1.5,
            width: '100%',
            py: 1,
            borderRadius: 2,
            border: 'none',
            bgcolor: 'transparent',
            color: c.primary,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(249,115,22,0.10)' },
          }}
        >
          Tháng này
        </Box>
      </Popover>
    </Box>
  );
}
