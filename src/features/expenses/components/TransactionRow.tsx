'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { formatCurrency, formatTime, formatDateTime, paymentMeta } from '@/utils/format';
import ExpenseFormDrawer from './ExpenseFormDrawer';
import { deleteExpense } from '../actions';
import type { EnrichedExpense } from '@/features/expenses/queries';
import type { Category } from '@/db/schema';

function Field({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
      <Ms name={icon} size={20} sx={{ color: c.onSurfaceVariant }} />
      <Typography sx={{ flex: 1, color: c.onSurfaceVariant }}>{label}</Typography>
      <Typography sx={{ fontWeight: 600, color: c.onSurface, textAlign: 'right' }}>{value}</Typography>
    </Box>
  );
}

export default function TransactionRow({
  row,
  showUser = false,
  divider = false,
  editable = false,
  categories = [],
}: {
  row: EnrichedExpense;
  showUser?: boolean;
  divider?: boolean;
  editable?: boolean;
  categories?: Category[];
}) {
  const theme = useTheme();
  const router = useRouter();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePending, startDelete] = useTransition();

  function confirmDelete() {
    const fd = new FormData();
    fd.set('id', String(row.id));
    startDelete(async () => {
      await deleteExpense(fd);
      setConfirmOpen(false);
      setDetailOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      {/* Dòng giao dịch — bấm để xem chi tiết */}
      <Box
        onClick={() => setDetailOpen(true)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2, md: 2.5 },
          py: 1.5,
          cursor: 'pointer',
          borderTop: divider ? `1px solid ${c.outlineVariant}33` : 'none',
          transition: 'background .15s',
          '&:hover': { bgcolor: `${c.surfaceContainerLow}99` },
        }}
      >
        <Box sx={{ width: 44, height: 44, borderRadius: 999, bgcolor: `${row.categoryColor}1A`, color: row.categoryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ms name={row.categoryIcon} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, color: c.onSurface }} noWrap>
            {row.note || row.categoryName || 'Chi tiêu'}
          </Typography>
          <Typography sx={{ fontSize: 13, color: c.onSurfaceVariant }} noWrap>
            {showUser ? `${row.userName} • ` : ''}{row.categoryName ?? 'Khác'} • {formatTime(row.occurredAt)}
          </Typography>
        </Box>
        <Typography sx={{ fontWeight: 700, color: c.onSurface, flexShrink: 0 }}>
          −{formatCurrency(row.amount)}
        </Typography>
      </Box>

      {/* Drawer chi tiết */}
      <Drawer
        anchor={isDesktop ? 'right' : 'bottom'}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        slotProps={{
          paper: {
            sx: {
              bgcolor: c.surfaceContainerLowest,
              ...(isDesktop
                ? { width: 440, maxWidth: '100%', height: '100%', borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }
                : { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxWidth: 560, width: '100%', mx: 'auto' }),
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="h4" sx={{ fontSize: 18, flex: 1 }}>Chi tiết giao dịch</Typography>
          <IconButton onClick={() => setDetailOpen(false)} aria-label="Đóng" size="small">
            <Ms name="close" />
          </IconButton>
        </Box>

        {/* Tóm tắt */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, pb: 2 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: 999, bgcolor: `${row.categoryColor}1A`, color: row.categoryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
            <Ms name={row.categoryIcon} size={32} />
          </Box>
          <Typography sx={{ fontSize: 32, fontWeight: 800, color: c.onSurface }}>−{formatCurrency(row.amount)}</Typography>
          <Typography sx={{ color: c.onSurfaceVariant }}>{row.note || row.categoryName || 'Chi tiêu'}</Typography>
        </Box>

        <Divider />
        <Box sx={{ px: 3, py: 1 }}>
          <Field icon="category" label="Danh mục" value={row.categoryName ?? 'Khác'} />
          {showUser && <Field icon="person" label="Người chi" value={row.userName} />}
          <Field icon="schedule" label="Thời gian" value={formatDateTime(row.occurredAt)} />
          <Field icon={paymentMeta(row.paymentMethod).icon} label="Hình thức" value={paymentMeta(row.paymentMethod).label} />
        </Box>

        {editable && (
          <Box sx={{ display: 'flex', gap: 1.5, px: 3, pt: 2, pb: 3.5, mt: 'auto' }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Ms name="edit" />}
              onClick={() => { setDetailOpen(false); setEditOpen(true); }}
              sx={{ borderColor: c.outlineVariant, color: c.onSurface }}
            >
              Sửa
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<Ms name="delete" />}
              onClick={() => setConfirmOpen(true)}
            >
              Xóa
            </Button>
          </Box>
        )}
      </Drawer>

      {/* Drawer sửa */}
      {editable && (
        <ExpenseFormDrawer
          open={editOpen}
          onClose={() => setEditOpen(false)}
          categories={categories}
          expense={{ id: row.id, amount: row.amount, categoryId: row.categoryId, paymentMethod: row.paymentMethod, note: row.note, occurredAt: row.occurredAt }}
        />
      )}

      {/* Xác nhận xóa */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Xóa khoản chi?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {row.note || 'Khoản chi này'} sẽ bị xóa vĩnh viễn. Bạn chắc chứ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deletePending} sx={{ color: c.onSurfaceVariant }}>Hủy</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deletePending}>
            {deletePending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
