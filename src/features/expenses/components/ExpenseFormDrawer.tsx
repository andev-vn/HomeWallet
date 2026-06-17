'use client';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import AddExpenseForm, { type ExpenseInitial } from './AddExpenseForm';
import type { Category } from '@/db/schema';

/** Khung drawer chứa form thêm/sửa chi tiêu (đáy ở mobile, phải ở desktop). */
export default function ExpenseFormDrawer({
  open,
  onClose,
  categories,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  expense?: ExpenseInitial;
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isEdit = !!expense;

  return (
    <Drawer
      anchor={isDesktop ? 'right' : 'bottom'}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            display: 'flex',
            flexDirection: 'column',
            bgcolor: c.surfaceContainerLowest,
            overflow: 'hidden',
            ...(isDesktop
              ? { width: 460, maxWidth: '100%', height: '100%', borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }
              : { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '96vh', maxWidth: 560, width: '100%', mx: 'auto' }),
          },
        },
      }}
    >
      {!isDesktop && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 999, bgcolor: c.outlineVariant }} />
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1.5, borderBottom: `1px solid ${c.outlineVariant}55`, flexShrink: 0 }}>
        <Ms name={isEdit ? 'edit' : 'payments'} sx={{ color: c.primary }} />
        <Typography variant="h4" sx={{ fontSize: 20, flex: 1 }}>
          {isEdit ? 'Sửa Chi Tiêu' : 'Thêm Chi Tiêu'}
        </Typography>
        <IconButton onClick={onClose} aria-label="Đóng" size="small">
          <Ms name="close" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <AddExpenseForm categories={categories} expense={expense} onSuccess={onClose} />
      </Box>
    </Drawer>
  );
}
