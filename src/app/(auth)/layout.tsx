import type { Viewport } from 'next';
import Box from '@mui/material/Box';
import { c } from '@/theme/colors';

// Login/register/invite có form tương tác + useSearchParams → render động.
export const dynamic = 'force-dynamic';

// Status bar màn đăng nhập: màu kem trùng nền.
export const viewport: Viewport = { themeColor: '#fdf3ee' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: c.background,
        px: 2,
      }}
    >
      {/* Ambient blobs */}
      <Box sx={{ position: 'absolute', top: '-15%', left: '-10%', width: 600, height: 600, borderRadius: 999, bgcolor: 'rgba(249,115,22,0.10)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: '-15%', right: '-5%', width: 500, height: 500, borderRadius: 999, bgcolor: 'rgba(237,213,203,0.4)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}>{children}</Box>
    </Box>
  );
}
