'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { login, type AuthState } from '@/features/auth/actions';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {});

  return (
    <Card sx={{ borderRadius: 6, overflow: 'hidden', boxShadow: '0 16px 40px rgba(249,115,22,0.10)' }}>
      <Box sx={{ height: 130, background: `linear-gradient(135deg, ${c.primaryFixed}, ${c.surfaceContainerHigh})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: 72, height: 72, borderRadius: 4, bgcolor: c.primaryContainer, color: c.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(249,115,22,0.3)' }}>
          <Ms name="home_app_logo" fill size={36} />
        </Box>
      </Box>

      <Box component="form" action={formAction} sx={{ px: { xs: 3, md: 4 }, pb: 4, pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ color: c.primary, fontSize: 32 }}>
            Ví Nhà
          </Typography>
          <Typography sx={{ color: c.onSurfaceVariant }}>Quản lý chi tiêu gia đình thông minh</Typography>
        </Box>

        <TextField
          name="username"
          label="Tên đăng nhập"
          placeholder="username"
          required
          fullWidth
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Ms name="person" size={20} /></InputAdornment> } }}
        />
        <TextField
          name="password"
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          required
          fullWidth
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Ms name="lock" size={20} /></InputAdornment> } }}
        />

        {state.error && <Alert severity="error">{state.error}</Alert>}

        <Button type="submit" variant="contained" size="large" disabled={pending} endIcon={<Ms name="arrow_forward" size={18} />} sx={{ py: 1.25 }}>
          {pending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>

        <Typography sx={{ textAlign: 'center', color: c.onSurfaceVariant }}>
          Chưa có tài khoản?{' '}
          <Box component={Link} href="/register" sx={{ color: c.primary, fontWeight: 700 }}>
            Đăng ký ngay
          </Box>
        </Typography>
      </Box>
    </Card>
  );
}
