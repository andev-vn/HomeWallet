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
import { register, type AuthState } from '@/features/auth/actions';

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(register, {});

  return (
    <Card sx={{ borderRadius: 6, overflow: 'hidden', boxShadow: '0 16px 40px rgba(249,115,22,0.10)' }}>
      <Box sx={{ height: 130, background: `linear-gradient(135deg, ${c.primaryFixed}, ${c.surfaceContainerHigh})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: 72, height: 72, borderRadius: 4, bgcolor: c.primaryContainer, color: c.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(249,115,22,0.3)' }}>
          <Ms name="person_add" fill size={34} />
        </Box>
      </Box>

      <Box component="form" action={formAction} sx={{ px: { xs: 3, md: 4 }, pb: 4, pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ color: c.primary, fontSize: 32 }}>
            Tạo tài khoản
          </Typography>
          <Typography sx={{ color: c.onSurfaceVariant }}>Bắt đầu quản lý chi tiêu cá nhân của bạn</Typography>
        </Box>

        <TextField
          name="name"
          label="Tên của bạn"
          placeholder="Nguyễn Văn A"
          required
          fullWidth
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Ms name="person" size={20} /></InputAdornment> } }}
        />
        <TextField
          name="username"
          label="Tên đăng nhập"
          placeholder="vd: an_nguyen"
          required
          fullWidth
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Ms name="alternate_email" size={20} /></InputAdornment> } }}
        />
        <TextField
          name="password"
          label="Mật khẩu"
          type="password"
          placeholder="Ít nhất 6 ký tự"
          required
          fullWidth
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Ms name="lock" size={20} /></InputAdornment> } }}
        />

        {state.error && <Alert severity="error">{state.error}</Alert>}

        <Button type="submit" variant="contained" size="large" disabled={pending} endIcon={<Ms name="arrow_forward" size={18} />} sx={{ py: 1.25 }}>
          {pending ? 'Đang tạo...' : 'Đăng ký'}
        </Button>

        <Typography sx={{ textAlign: 'center', color: c.onSurfaceVariant }}>
          Đã có tài khoản?{' '}
          <Box component={Link} href="/login" sx={{ color: c.primary, fontWeight: 700 }}>
            Đăng nhập
          </Box>
        </Typography>
      </Box>
    </Card>
  );
}
