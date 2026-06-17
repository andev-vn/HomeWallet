import AppShell from '@/components/layout/AppShell';
import { getContext } from '@/features/households/queries';
import { getCategories } from '@/features/expenses/queries';

// Dữ liệu thay đổi qua Server Action → luôn lấy mới.
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [{ me }, categories] = await Promise.all([getContext(), getCategories()]);
  return (
    <AppShell user={{ name: me.name, avatarUrl: me.avatarUrl }} categories={categories}>
      {children}
    </AppShell>
  );
}
