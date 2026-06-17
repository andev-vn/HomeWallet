'use client';

import { useActionState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Ms from '@/components/Ms';
import MoneyField from './MoneyField';
import { c } from '@/theme/colors';
import { saveCategoryBudgets } from '../actions';
import type { ActionState } from '../actions';
import type { Category } from '@/db/schema';

export default function CategoryBudgetForm({
  categories,
  current,
}: {
  categories: Category[];
  /** categoryId -> ngân sách đã đặt (đồng). */
  current: Record<number, number>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveCategoryBudgets, {});

  return (
    <Box component="form" action={formAction}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {categories.map((cat) => (
          <Box key={cat.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 999, bgcolor: `${cat.color}1A`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ms name={cat.icon} />
            </Box>
            <Typography sx={{ flex: 1, fontWeight: 600, color: c.onSurface }}>{cat.name}</Typography>
            <MoneyField
              name={`budget_${cat.id}`}
              size="small"
              placeholder="Chưa đặt"
              initial={current[cat.id] ?? ''}
              sx={{ width: { xs: 150, sm: 200 } }}
            />
          </Box>
        ))}
      </Box>

      {state.ok && <Alert severity="success" sx={{ mt: 2 }}>Đã lưu ngân sách.</Alert>}

      <Button type="submit" variant="contained" disabled={pending} startIcon={<Ms name="save" />} sx={{ mt: 3 }}>
        {pending ? 'Đang lưu...' : 'Lưu ngân sách'}
      </Button>
    </Box>
  );
}
