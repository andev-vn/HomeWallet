'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { rejectMember } from '@/features/auth/actions';

/** Nút "Đuổi khỏi nhà" (chủ nhà) — có hộp xác nhận trước khi xoá. */
export default function RemoveMemberButton({
  memberId,
  memberName,
  householdId,
}: {
  memberId: number;
  memberName: string;
  householdId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const confirm = () => {
    const fd = new FormData();
    fd.set('memberId', String(memberId));
    start(async () => {
      await rejectMember(fd);
      router.push(`/home/${householdId}`);
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outlined"
        color="error"
        startIcon={<Ms name="person_remove" size={18} />}
      >
        Đuổi khỏi nhà
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Đuổi thành viên?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: c.onSurfaceVariant }}>
            Đuổi <b>{memberName}</b> khỏi nhà? Các khoản chi cá nhân của họ vẫn được giữ, chỉ gỡ khỏi nhóm chia sẻ này.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={pending} sx={{ color: c.onSurfaceVariant }}>Hủy</Button>
          <Button onClick={confirm} disabled={pending} color="error" variant="contained">
            {pending ? 'Đang xử lý...' : 'Đuổi'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
