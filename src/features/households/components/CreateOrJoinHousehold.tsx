'use client';

import { useActionState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { createHousehold, joinHousehold, type AuthState } from '@/features/auth/actions';

/**
 * Form tạo nhà và/hoặc tham gia nhà bằng mã.
 * `mode`: 'both' (mặc định) | 'create' (chỉ tạo) | 'join' (chỉ tham gia).
 */
export default function CreateOrJoinHousehold({ mode = 'both' }: { mode?: 'both' | 'create' | 'join' }) {
  const [createState, createAction, creating] = useActionState<AuthState, FormData>(createHousehold, {});
  const [joinState, joinAction, joining] = useActionState<AuthState, FormData>(joinHousehold, {});

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: mode === 'both' ? '1fr 1fr' : '1fr' } }}>
      {/* Tạo nhà */}
      {mode !== 'join' && (
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Ms name="add_home" sx={{ color: c.primary }} />
          <Typography variant="h4" sx={{ fontSize: 18 }}>
            Tạo nhà mới
          </Typography>
        </Box>
        <Box component="form" action={createAction} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField name="name" label="Tên nhà" placeholder="VD: Tổ Ấm Hạnh Phúc" required fullWidth />
          <TextField name="role" label="Vai trò của bạn" placeholder="VD: Bố / Mẹ" fullWidth />
          {createState.error && <Alert severity="error">{createState.error}</Alert>}
          <Button type="submit" variant="contained" disabled={creating}>
            {creating ? 'Đang tạo...' : 'Tạo nhà'}
          </Button>
        </Box>
      </Card>
      )}

      {/* Tham gia bằng mã */}
      {mode !== 'create' && (
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Ms name="group_add" sx={{ color: c.tertiary }} />
          <Typography variant="h4" sx={{ fontSize: 18 }}>
            Tham gia nhà
          </Typography>
        </Box>
        <Box component="form" action={joinAction} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField name="code" label="Mã mời" placeholder="VD: GIADINH" required fullWidth />
          <TextField name="role" label="Vai trò của bạn" placeholder="VD: Con" fullWidth />
          {joinState.error && <Alert severity="error">{joinState.error}</Alert>}
          {joinState.notice && <Alert severity="success">{joinState.notice}</Alert>}
          <Button type="submit" variant="outlined" disabled={joining} sx={{ borderColor: c.outlineVariant, color: c.onSurface }}>
            {joining ? 'Đang tham gia...' : 'Tham gia'}
          </Button>
        </Box>
      </Card>
      )}
    </Box>
  );
}
