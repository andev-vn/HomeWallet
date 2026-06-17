'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { joinHousehold, type AuthState } from '@/features/auth/actions';

export default function InvitePage() {
  const params = useSearchParams();
  const [state, formAction, pending] = useActionState<AuthState, FormData>(joinHousehold, {});

  return (
    <Card sx={{ borderRadius: 7, p: { xs: 3, md: 4 }, textAlign: 'center', boxShadow: '0 24px 48px rgba(249,115,22,0.08)' }}>
      <Box sx={{ width: 64, height: 64, borderRadius: 4, mx: 'auto', mb: 1.5, background: `linear-gradient(135deg, ${c.primaryContainer}, ${c.primary})`, color: c.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-3deg)', boxShadow: '0 8px 24px rgba(249,115,22,0.25)' }}>
        <Ms name="group_add" fill size={32} />
      </Box>
      <Typography variant="h3" sx={{ mb: 0.5 }}>
        Tham gia một nhà
      </Typography>
      <Typography sx={{ color: c.onSurfaceVariant, mb: 3 }}>
        Nhập mã mời mà chủ nhà chia sẻ cho bạn.
      </Typography>

      <Box component="form" action={formAction} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          name="code"
          label="Mã mời"
          placeholder="VD: GIADINH"
          required
          defaultValue={params.get('code') ?? ''}
          fullWidth
          slotProps={{ htmlInput: { style: { textTransform: 'uppercase', letterSpacing: 4, fontWeight: 700 } } }}
        />
        <TextField name="role" label="Vai trò của bạn (tuỳ chọn)" placeholder="VD: Con" fullWidth />
        {state.error && <Alert severity="error">{state.error}</Alert>}
        {state.notice && <Alert severity="success">{state.notice}</Alert>}
        <Button type="submit" variant="contained" size="large" disabled={pending} endIcon={<Ms name="arrow_forward" />} sx={{ py: 1.5 }}>
          {pending ? 'Đang gửi...' : 'Gửi yêu cầu tham gia'}
        </Button>
      </Box>

      <Typography sx={{ mt: 2, fontSize: 13, color: c.onSurfaceVariant }}>
        Quay lại{' '}
        <Box component={Link} href="/home" sx={{ color: c.primary, fontWeight: 700 }}>
          Trang chủ
        </Box>
      </Typography>
    </Card>
  );
}
