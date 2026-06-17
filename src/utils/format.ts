/** Các hàm format thuần, dùng được cả server lẫn client. */

const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

/** 1500000 -> "1.500.000 ₫" */
export function formatCurrency(amount: number): string {
  return VND.format(amount);
}

/** 1500000 -> "1.500.000" (không ký hiệu tiền) */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

/** 8200000 -> "8.2M", 450000 -> "450K" */
export function formatCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
  return String(amount);
}

/** Date | string -> "11 thg 6, 2026" */
export function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

/** Date | string -> "08:15" (24h) */
export function formatTime(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

/** Date | string -> "08:15:42" (24h, kèm giây) */
export function formatTimeSec(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date);
}

/** Date | string -> "11 thg 6, 2026 • 08:15:42" */
export function formatDateTime(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${formatDate(date)} • ${formatTimeSec(date)}`;
}

/** Nhãn ngày tương đối: "Hôm nay", "Hôm qua", hoặc ngày đầy đủ. */
export function formatDayLabel(date: Date, now: Date): string {
  const atMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((atMidnight(now) - atMidnight(date)) / 86_400_000);
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  return formatDate(date);
}

/** Tên tháng tiếng Việt: "Tháng 6, 2026" */
export function formatMonth(year: number, month0: number): string {
  return `Tháng ${month0 + 1}, ${year}`;
}

/** Dạng gọn cho bộ chọn tháng: "Tháng 6/2026" */
export function formatMonthShort(year: number, month0: number): string {
  return `Tháng ${month0 + 1}/${year}`;
}

/** Chuỗi query tháng: (2026, 5) -> "2026-6" */
export function ymString(year: number, month0: number): string {
  return `${year}-${month0 + 1}`;
}

/** Parse "2026-6" -> {year, month0}; fallback về tháng hiện tại. */
export function parseYm(ym: string | undefined, now: Date): { year: number; month0: number } {
  const m = ym?.match(/^(\d{4})-(\d{1,2})$/);
  if (m) return { year: Number(m[1]), month0: Number(m[2]) - 1 };
  return { year: now.getFullYear(), month0: now.getMonth() };
}

/** Dịch tháng đi `delta` tháng, chuẩn hoá năm. */
export function shiftMonth(year: number, month0: number, delta: number): { year: number; month0: number } {
  const total = year * 12 + month0 + delta;
  return { year: Math.floor(total / 12), month0: ((total % 12) + 12) % 12 };
}

/** Hình thức thanh toán: nhãn + icon Material Symbol. */
export const PAYMENT = {
  cash: { label: 'Tiền mặt', icon: 'payments' },
  transfer: { label: 'Chuyển khoản', icon: 'account_balance' },
} as const;

export const paymentMeta = (m: string) => (m === 'transfer' ? PAYMENT.transfer : PAYMENT.cash);
