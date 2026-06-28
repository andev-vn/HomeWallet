import type { EnrichedExpense } from './queries';
import { vnYMD } from '@/utils/format';

export const sum = (rows: EnrichedExpense[]) => rows.reduce((t, r) => t + r.amount, 0);

export const inMonth = (rows: EnrichedExpense[], year: number, month0: number) =>
  rows.filter((r) => {
    const p = vnYMD(r.occurredAt);
    return p.year === year && p.month0 === month0;
  });

export interface MemberSpend {
  userId: number;
  name: string;
  avatar: string | null;
  total: number;
}

export function byMember(rows: EnrichedExpense[]): MemberSpend[] {
  const map = new Map<number, MemberSpend>();
  for (const r of rows) {
    const cur = map.get(r.userId) ?? { userId: r.userId, name: r.userName, avatar: r.userAvatar, total: 0 };
    cur.total += r.amount;
    map.set(r.userId, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export interface CategorySpend {
  categoryId: number | null;
  name: string;
  icon: string;
  color: string;
  total: number;
}

export function byCategory(rows: EnrichedExpense[]): CategorySpend[] {
  const map = new Map<string, CategorySpend>();
  for (const r of rows) {
    const key = String(r.categoryId);
    const cur =
      map.get(key) ??
      {
        categoryId: r.categoryId,
        name: r.categoryName ?? 'Khác',
        icon: r.categoryIcon ?? 'more_horiz',
        color: r.categoryColor ?? '#645d58',
        total: 0,
      };
    cur.total += r.amount;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export interface DayGroup {
  key: string;
  date: Date; // đầu ngày (00:00) để so sánh
  total: number;
  rows: EnrichedExpense[];
}

/** Gom chi tiêu theo từng ngày, mới nhất trước. Giả định `rows` đã sort desc. */
export function byDay(rows: EnrichedExpense[]): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const r of rows) {
    const p = vnYMD(r.occurredAt);
    const key = `${p.year}-${p.month0}-${p.day}`;
    const cur =
      map.get(key) ??
      { key, date: new Date(Date.UTC(p.year, p.month0, p.day)), total: 0, rows: [] };
    cur.total += r.amount;
    cur.rows.push(r);
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export interface MonthGroup {
  year: number;
  month0: number;
  total: number;
  rows: EnrichedExpense[];
}

export function byMonth(rows: EnrichedExpense[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  for (const r of rows) {
    const { year: y, month0: m } = vnYMD(r.occurredAt);
    const key = `${y}-${m}`;
    const cur = map.get(key) ?? { year: y, month0: m, total: 0, rows: [] };
    cur.total += r.amount;
    cur.rows.push(r);
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.year - a.year || b.month0 - a.month0);
}
