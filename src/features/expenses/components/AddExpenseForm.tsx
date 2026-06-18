'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { addExpense, updateExpense, type ActionState } from '../actions';
import type { Category } from '@/db/schema';

/** Dữ liệu khoản chi cần để sửa. */
export interface ExpenseInitial {
  id: number;
  amount: number;
  categoryId: number | null;
  paymentMethod: string;
  note: string | null;
  occurredAt: Date;
}

/** Date -> "YYYY-MM-DDTHH:mm:ss" cho input datetime-local. */
const toDateTimeInput = (d: Date) => {
  const x = new Date(d);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}:${p(x.getSeconds())}`;
};
const now = () => toDateTimeInput(new Date());
const fmt = (digits: string) => (digits ? Number(digits).toLocaleString('vi-VN') : '');

export default function AddExpenseForm({
  categories,
  onSuccess,
  expense,
}: {
  categories: Category[];
  onSuccess?: () => void;
  expense?: ExpenseInitial;
}) {
  const router = useRouter();
  const isEdit = !!expense;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateExpense : addExpense,
    {},
  );
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '0');
  const [catId, setCatId] = useState<number | ''>(expense?.categoryId ?? categories[0]?.id ?? '');
  const [method, setMethod] = useState<'cash' | 'transfer'>(expense?.paymentMethod === 'transfer' ? 'transfer' : 'cash');

  useEffect(() => {
    if (!state.ok) return;
    if (onSuccess) {
      onSuccess();
      router.refresh();
    } else {
      router.push('/home');
    }
  }, [state.ok, router, onSuccess]);

  return (
    <Box component="form" action={formAction}>
      {isEdit && <input type="hidden" name="id" value={expense!.id} />}
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="categoryId" value={catId} />
      <input type="hidden" name="paymentMethod" value={method} />

      {/* Hero amount */}
      <Box
        sx={{
          py: 4,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: `1px solid ${c.outlineVariant}55`,
          background: `linear-gradient(180deg, ${c.surfaceContainerLowest}, ${c.surfaceContainer}30)`,
        }}
      >
        <Typography sx={{ fontSize: 13, color: c.onSurfaceVariant, mb: 1 }}>Số tiền đã tiêu</Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', borderBottom: '2px solid transparent', '&:focus-within': { borderColor: c.primaryContainer } }}>
          <InputBase
            value={fmt(amount)}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            inputMode="numeric"
            autoFocus
            sx={{
              '& input': { textAlign: 'center', fontSize: 40, fontWeight: 800, color: c.onSurface, width: 220, p: 0 },
            }}
          />
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: c.primary, ml: 1 }}>₫</Typography>
        </Box>
      </Box>

      {/* Category grid */}
      <Box sx={{ p: { xs: 2.5, md: 3 }, borderBottom: `1px solid ${c.outlineVariant}55` }}>
        <Typography sx={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: c.onSurfaceVariant, mb: 2 }}>
          Danh mục
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          {categories.map((cat) => {
            const active = cat.id === catId;
            return (
              <Box
                key={cat.id}
                onClick={() => setCatId(cat.id)}
                role="button"
                tabIndex={0}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.75,
                  p: 1.25,
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: active ? c.primaryContainer : 'transparent',
                  bgcolor: active ? 'rgba(249,115,22,0.12)' : c.surface,
                  transition: 'all .15s',
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: active ? c.surfaceContainerLowest : c.surfaceContainer,
                    color: active ? c.primary : c.onSurfaceVariant,
                  }}
                >
                  <Ms name={cat.icon} fill={active} />
                </Box>
                <Typography sx={{ fontSize: 12, textAlign: 'center', lineHeight: 1.2, color: active ? c.onSurface : c.onSurfaceVariant }}>
                  {cat.name}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Details */}
      <Box sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Hình thức thanh toán */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {([
            { key: 'cash', label: 'Tiền mặt', icon: 'payments' },
            { key: 'transfer', label: 'Chuyển khoản', icon: 'account_balance' },
          ] as const).map((opt) => {
            const active = method === opt.key;
            return (
              <Box
                key={opt.key}
                onClick={() => setMethod(opt.key)}
                role="button"
                tabIndex={0}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 1.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: active ? c.primaryContainer : c.outlineVariant,
                  bgcolor: active ? 'rgba(249,115,22,0.12)' : c.surface,
                  color: active ? c.primary : c.onSurfaceVariant,
                  fontWeight: 600,
                  transition: 'all .15s',
                }}
              >
                <Ms name={opt.icon} size={20} fill={active} />
                {opt.label}
              </Box>
            );
          })}
        </Box>

        <TextField
          name="occurredAt"
          type="datetime-local"
          label="Thời gian"
          defaultValue={expense ? toDateTimeInput(expense.occurredAt) : now()}
          fullWidth
          slotProps={{
            input: { startAdornment: <InputAdornment position="start"><Ms name="schedule" size={20} /></InputAdornment> },
            htmlInput: { step: 1 },
            inputLabel: { shrink: true },
          }}
        />
        <TextField
          name="note"
          label="Ghi chú"
          placeholder="Thêm mô tả chi tiết..."
          defaultValue={expense?.note ?? ''}
          fullWidth
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Ms name="notes" size={20} /></InputAdornment> } }}
        />

        {state.error && <Alert severity="error">{state.error}</Alert>}

        <Button type="submit" variant="contained" size="large" disabled={pending} startIcon={<Ms name="check_circle" />} sx={{ py: 1.5, mt: 1 }}>
          {pending ? 'Đang lưu...' : isEdit ? 'Cập Nhật' : 'Lưu Chi Tiêu'}
        </Button>
      </Box>
    </Box>
  );
}
