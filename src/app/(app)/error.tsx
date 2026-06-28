'use client';

import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';

/** Bắt lỗi runtime trong nhóm (app) — tránh màn hình trắng, cho phép thử lại. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, px: 3, textAlign: 'center' }}>
      <Box sx={{ width: 64, height: 64, borderRadius: 999, bgcolor: `${c.error}1a`, color: c.error, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ms name="error" size={32} />
      </Box>
      <Typography sx={{ fontSize: 20, fontWeight: 700, color: c.onSurface }}>Đã có lỗi xảy ra</Typography>
      <Typography sx={{ color: c.onSurfaceVariant, maxWidth: 360 }}>
        Trang gặp sự cố khi tải. Bạn hãy thử lại nhé.
      </Typography>
      <Button variant="contained" startIcon={<Ms name="refresh" size={18} />} onClick={reset}>
        Thử lại
      </Button>
    </Box>
  );
}
