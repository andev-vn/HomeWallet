'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import CreateOrJoinHousehold from './CreateOrJoinHousehold';

/**
 * Khu vực thêm nhà ở màn "Nhà của tôi".
 * - `defaultOpen` (onboarding khi chưa có nhà): hiện luôn cả tạo + tham gia.
 * - Mặc định: 2 nút riêng "Thêm nhà" (tạo) và "Tham gia nhà" (bằng mã).
 */
export default function AddHouseholdSection({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [mode, setMode] = useState<'create' | 'join' | null>(null);

  if (defaultOpen) return <CreateOrJoinHousehold mode="both" />;

  if (!mode) {
    return (
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button onClick={() => setMode('create')} variant="contained" startIcon={<Ms name="add_home" />} sx={{ py: 1.25 }}>
          Thêm nhà
        </Button>
        <Button onClick={() => setMode('join')} variant="outlined" startIcon={<Ms name="group_add" />} sx={{ py: 1.25, borderColor: c.outlineVariant, color: c.onSurface }}>
          Tham gia nhà
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ fontWeight: 700, fontSize: 18, color: c.onSurface }}>
          {mode === 'create' ? 'Tạo nhà mới' : 'Tham gia nhà'}
        </Box>
        <Button onClick={() => setMode(null)} size="small" sx={{ color: c.onSurfaceVariant }} startIcon={<Ms name="close" size={18} />}>
          Đóng
        </Button>
      </Box>
      <CreateOrJoinHousehold mode={mode} />
    </Box>
  );
}
