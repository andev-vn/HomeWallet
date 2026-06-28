'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { updateProfile } from '@/features/auth/actions';

/** Nút bút chì mở hộp thoại sửa tên + ảnh đại diện. */
export default function EditProfile({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nameDraft, setNameDraft] = useState(name);
  // URL xem trước ảnh (ảnh hiện tại hoặc ảnh vừa chọn từ máy).
  const [preview, setPreview] = useState<string | null>(avatarUrl);

  // Side-effect (đóng dialog + refresh) chạy trong callback của transition, không
  // dùng useEffect — tránh cascading render và lỗi lint set-state-in-effect.
  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateProfile({}, formData);
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  const openDialog = () => {
    setNameDraft(name);
    setPreview(avatarUrl);
    setError(null);
    setOpen(true);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  return (
    <>
      <IconButton onClick={openDialog} aria-label="Sửa hồ sơ" sx={{ color: c.onSurfaceVariant }}>
        <Ms name="edit" size={20} />
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Sửa hồ sơ</DialogTitle>
        <Box component="form" action={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'stretch' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Avatar src={preview || undefined} sx={{ width: 96, height: 96 }}>
                {nameDraft.charAt(0)}
              </Avatar>
              <input ref={fileRef} type="file" name="avatar" accept="image/*" hidden onChange={onPickFile} />
              <Button variant="outlined" size="small" startIcon={<Ms name="photo_camera" size={18} />} onClick={() => fileRef.current?.click()} sx={{ borderColor: c.outlineVariant, color: c.onSurface }}>
                Chọn ảnh từ máy
              </Button>
            </Box>
            <TextField
              name="name"
              label="Tên hiển thị"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              required
              fullWidth
            />
            {error && <Alert severity="error">{error}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} sx={{ color: c.onSurfaceVariant }}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={pending}>{pending ? 'Đang lưu...' : 'Lưu'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
