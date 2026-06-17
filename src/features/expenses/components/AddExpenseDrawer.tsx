'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import ExpenseFormDrawer from './ExpenseFormDrawer';
import type { Category } from '@/db/schema';

export default function AddExpenseDrawer({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FAB mở drawer */}
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Thêm chi tiêu"
        sx={{
          position: 'fixed',
          bottom: { xs: 96, md: 32 },
          right: { xs: 20, md: 32 },
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          borderRadius: { xs: 4, md: 999 },
          border: 'none',
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${c.primaryContainer}, ${c.primary})`,
          color: c.onPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
          zIndex: 45,
          transition: 'transform .15s',
          '&:hover': { transform: 'scale(1.05)' },
          '&:active': { transform: 'scale(0.95)' },
        }}
      >
        <Ms name="add" size={28} />
      </Box>

      <ExpenseFormDrawer open={open} onClose={() => setOpen(false)} categories={categories} />
    </>
  );
}
