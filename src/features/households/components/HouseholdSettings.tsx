'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { renameHousehold, deleteHousehold, type AuthState } from '@/features/auth/actions';

export default function HouseholdSettings({
  householdId,
  currentName,
}: {
  householdId: number;
  currentName: string;
}) {
  const router = useRouter();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AuthState, FormData>(renameHousehold, {});

  useEffect(() => {
    if (state.ok) {
      setRenameOpen(false);
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <>
      <IconButton aria-label="Cài đặt nhà" onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: c.onSurfaceVariant }}>
        <Ms name="settings" />
      </IconButton>

      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); setRenameOpen(true); }}>
          <ListItemIcon><Ms name="edit" size={20} /></ListItemIcon>
          Đổi tên nhà
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); setConfirmOpen(true); }} sx={{ color: c.error }}>
          <ListItemIcon sx={{ color: c.error }}><Ms name="delete" size={20} /></ListItemIcon>
          Xóa nhà
        </MenuItem>
      </Menu>

      {/* Đổi tên */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Đổi tên nhà</DialogTitle>
        <Box component="form" action={formAction}>
          <input type="hidden" name="householdId" value={householdId} />
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField name="name" label="Tên nhà" defaultValue={currentName} autoFocus required fullWidth />
            {state.error && <Alert severity="error">{state.error}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRenameOpen(false)} sx={{ color: c.onSurfaceVariant }}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={pending}>{pending ? 'Đang lưu...' : 'Lưu'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Xóa */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Xóa nhà &ldquo;{currentName}&rdquo;?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Nhà này sẽ bị gỡ và các thành viên không còn chia sẻ chi tiêu với nhau nữa. Chi tiêu của mỗi người là của cá nhân nên <b>không ai mất khoản chi nào</b>. Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} sx={{ color: c.onSurfaceVariant }}>Hủy</Button>
          <form action={deleteHousehold}>
            <input type="hidden" name="householdId" value={householdId} />
            <Button type="submit" color="error" variant="contained">Xóa nhà</Button>
          </form>
        </DialogActions>
      </Dialog>
    </>
  );
}
