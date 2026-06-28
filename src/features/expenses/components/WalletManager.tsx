'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Ms from '@/components/Ms';
import MoneyField from './MoneyField';
import { c } from '@/theme/colors';
import { addTopup, updateTopup, deleteTopup } from '../actions';
import { formatCurrency, formatDate } from '@/utils/format';
import type { WalletTopup } from '@/db/schema';

const toDateInput = (d: Date | string) => {
  const x = new Date(d);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
};

function EditTopupDialog({ topup, onClose }: { topup: WalletTopup; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateTopup({}, formData);
      if (res.error) setError(res.error);
      else {
        onClose();
        router.refresh();
      }
    });
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Sửa phiếu nạp</DialogTitle>
      <Box component="form" action={handleSubmit}>
        <input type="hidden" name="id" value={topup.id} />
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <MoneyField name="amount" label="Số tiền" initial={topup.amount} required fullWidth />
          <TextField name="note" label="Ghi chú" defaultValue={topup.note ?? ''} fullWidth />
          <TextField name="occurredAt" type="date" label="Ngày" defaultValue={toDateInput(topup.occurredAt)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ color: c.onSurfaceVariant }}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={pending}>{pending ? 'Đang lưu...' : 'Lưu'}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function WalletManager({ topups, balance }: { topups: WalletTopup[]; balance: number }) {
  const router = useRouter();
  const [addPending, startAdd] = useTransition();
  const [addError, setAddError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<WalletTopup | null>(null);
  const [deleting, setDeleting] = useState<WalletTopup | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  function handleAdd(formData: FormData) {
    setAddError(null);
    startAdd(async () => {
      const res = await addTopup({}, formData);
      if (res.error) setAddError(res.error);
      else {
        setFormKey((k) => k + 1); // reset các ô nhập sau khi thêm
        router.refresh();
      }
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    const fd = new FormData();
    fd.set('id', String(deleting.id));
    setDeleteError(null);
    startDelete(async () => {
      const res = await deleteTopup(fd);
      if (res?.error) {
        setDeleteError(res.error);
        return;
      }
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <Box>
      {/* Số dư hiện tại */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
        <Typography sx={{ color: c.onSurfaceVariant }}>Số dư ví:</Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 800, color: balance < 0 ? c.error : c.primary }}>
          {formatCurrency(balance)}
        </Typography>
      </Box>

      {/* Thêm phiếu */}
      <Box key={formKey} component="form" action={handleAdd} sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start', mb: 1 }}>
        <MoneyField name="amount" label="Thêm tiền" placeholder="0" size="small" sx={{ flex: '1 1 140px' }} />
        <TextField name="note" label="Ghi chú" placeholder="VD: Lương tháng 6" size="small" sx={{ flex: '2 1 200px' }} />
        <TextField name="occurredAt" type="date" label="Ngày" defaultValue={toDateInput(new Date())} size="small" sx={{ flex: '1 1 150px' }} slotProps={{ inputLabel: { shrink: true } }} />
        <Button type="submit" variant="contained" disabled={addPending} startIcon={<Ms name="add" />} sx={{ height: 40 }}>
          Thêm
        </Button>
      </Box>
      {addError && <Alert severity="error" sx={{ mb: 1 }}>{addError}</Alert>}

      {/* Danh sách phiếu */}
      {topups.length === 0 ? (
        <Typography sx={{ color: c.onSurfaceVariant, mt: 2 }}>Chưa có phiếu nạp nào.</Typography>
      ) : (
        <Box sx={{ mt: 2, border: `1px solid ${c.outlineVariant}55`, borderRadius: 3, overflow: 'hidden' }}>
          {topups.map((t, i) => (
            <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, borderTop: i === 0 ? 'none' : `1px solid ${c.outlineVariant}33` }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 999, bgcolor: 'rgba(22,163,74,0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ms name="add" size={20} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, color: c.onSurface }} noWrap>{t.note || 'Nạp ví'}</Typography>
                <Typography sx={{ fontSize: 13, color: c.onSurfaceVariant }}>{formatDate(t.occurredAt)}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, color: '#16a34a', flexShrink: 0 }}>+{formatCurrency(t.amount)}</Typography>
              <IconButton size="small" aria-label="Sửa" onClick={() => setEditing(t)} sx={{ color: c.onSurfaceVariant }}><Ms name="edit" size={18} /></IconButton>
              <IconButton size="small" aria-label="Xóa" onClick={() => setDeleting(t)} sx={{ color: c.error }}><Ms name="delete" size={18} /></IconButton>
            </Box>
          ))}
        </Box>
      )}

      {editing && <EditTopupDialog topup={editing} onClose={() => setEditing(null)} />}

      {/* Xác nhận xóa */}
      <Dialog open={!!deleting} onClose={() => { setDeleting(null); setDeleteError(null); }}>
        <DialogTitle>Xóa phiếu nạp?</DialogTitle>
        {deleteError && (
          <DialogContent sx={{ pt: 0 }}>
            <Alert severity="error">{deleteError}</Alert>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => { setDeleting(null); setDeleteError(null); }} disabled={deletePending} sx={{ color: c.onSurfaceVariant }}>Hủy</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deletePending}>
            {deletePending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
