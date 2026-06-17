import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { c } from '@/theme/colors';
import { byDay } from '@/features/expenses/lib';
import type { EnrichedExpense } from '@/features/expenses/queries';
import { formatCurrency, formatDayLabel } from '@/utils/format';
import TransactionRow from './TransactionRow';
import type { Category } from '@/db/schema';

/** Danh sách giao dịch, gom theo ngày (Hôm nay / Hôm qua / ngày đầy đủ). */
export default function TransactionList({
  rows,
  now,
  showUser = false,
  categories,
  currentUserId,
}: {
  rows: EnrichedExpense[];
  now: Date;
  showUser?: boolean;
  /** Truyền vào để bật sửa/xóa cho các khoản chi của chính user. */
  categories?: Category[];
  currentUserId?: number;
}) {
  const days = byDay(rows);

  if (days.length === 0) {
    return <Typography sx={{ color: c.onSurfaceVariant }}>Chưa có giao dịch nào.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {days.map((day) => (
        <Box key={day.key}>
          {/* Nhãn ngày — đứng riêng phía trên cụm thẻ của ngày đó */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: c.onSurface }}>
              {formatDayLabel(day.date, now)}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: c.onSurfaceVariant }}>
              −{formatCurrency(day.total)}
            </Typography>
          </Box>

          {/* Cụm giao dịch của ngày */}
          <Box sx={{ bgcolor: c.surfaceContainerLowest, border: '1px solid rgba(224,192,177,0.4)', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 16px rgba(249,115,22,0.04)' }}>
            {day.rows.map((r, i) => (
              <TransactionRow
                key={r.id}
                row={r}
                showUser={showUser}
                divider={i !== 0}
                editable={!!categories && currentUserId === r.userId}
                categories={categories}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
