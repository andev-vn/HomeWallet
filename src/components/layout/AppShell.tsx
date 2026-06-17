'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';
import { logout } from '@/features/auth/actions';
import { mainNav, footerNav, type NavItem } from './navItems';
import AddExpenseDrawer from '@/features/expenses/components/AddExpenseDrawer';
import type { Category } from '@/db/schema';

const SIDEBAR = 260;

export interface ShellUser {
  name: string;
  avatarUrl: string | null;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

function SideLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Box
      component={Link}
      href={item.href}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderRadius: 2,
        color: active ? c.primary : c.onSecondaryFixedVariant,
        fontWeight: active ? 700 : 500,
        bgcolor: active ? 'rgba(249,115,22,0.10)' : 'transparent',
        borderRight: active ? `4px solid ${c.primary}` : '4px solid transparent',
        transition: 'all .2s',
        '&:hover': { color: c.primary, bgcolor: 'rgba(234,225,218,0.5)' },
      }}
    >
      <Ms name={item.icon} fill={active} />
      <Typography component="span" sx={{ fontSize: 16, fontWeight: 'inherit' }}>
        {item.label}
      </Typography>
    </Box>
  );
}

export default function AppShell({
  user,
  categories,
  children,
}: {
  user: ShellUser;
  categories: Category[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', overflowX: 'clip', bgcolor: c.background }}>
      {/* ===== Sidebar (desktop) ===== */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: SIDEBAR,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          py: 3,
          px: 2,
          bgcolor: c.surface,
          boxShadow: '0 4px 16px rgba(249,115,22,0.08)',
          zIndex: 40,
        }}
      >
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, px: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 999,
              bgcolor: c.primaryContainer,
              color: c.onPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Ms name="wallet" fill />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 800, color: c.primary, lineHeight: 1.1 }}>
              Ví Nhà
            </Typography>
            <Typography sx={{ fontSize: 13, color: c.onSurfaceVariant }}>
              Quản lý chi tiêu gia đình
            </Typography>
          </Box>
        </Box>

        {/* Main nav */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {mainNav.map((item) => (
            <SideLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </Box>

        {/* Footer nav */}
        <Box
          sx={{
            mt: 'auto',
            pt: 2,
            borderTop: `1px solid ${c.outlineVariant}66`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {footerNav.map((item) => (
            <SideLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}

          {/* User hiện tại */}
          <Box component={Link} href="/profile" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, mt: 0.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(234,225,218,0.5)' } }}>
            <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 32, height: 32, fontSize: 14 }}>
              {user.name.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: c.onSurface }} noWrap>
                {user.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: c.onSurfaceVariant }} noWrap>
                Xem hồ sơ
              </Typography>
            </Box>
          </Box>

          <Box component="form" action={logout}>
            <Box
              component="button"
              type="submit"
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                color: c.error,
                bgcolor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                transition: 'all .2s',
                '&:hover': { bgcolor: 'rgba(186,26,26,0.08)' },
              }}
            >
              <Ms name="logout" />
              <Typography component="span" sx={{ fontSize: 16 }}>
                Đăng xuất
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ===== Main content ===== */}
      <Box
        component="main"
        sx={{
          ml: { md: `${SIDEBAR}px` },
          pb: { xs: '160px', md: 4 },
          minHeight: '100vh',
        }}
      >
        {/* Header mobile (ẩn trên desktop vì đã có sidebar) */}
        <Box
          component="header"
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'sticky',
            top: 0,
            zIndex: 30,
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            bgcolor: 'rgba(255,248,246,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${c.outlineVariant}55`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0, mr: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 999, bgcolor: c.primaryContainer, color: c.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ms name="wallet" fill size={20} />
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: c.primary }}>Ví Nhà</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 999, bgcolor: c.surfaceContainer, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.onSurfaceVariant }}>
              <Ms name="notifications" size={22} />
            </Box>
            <Box component={Link} href="/profile" aria-label="Hồ sơ">
              <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 40, height: 40 }}>
                {user.name.charAt(0)}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {children}
      </Box>

      {/* ===== FAB + drawer thêm chi tiêu ===== */}
      <AddExpenseDrawer categories={categories} />

      {/* ===== Bottom nav (mobile) ===== */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'space-around',
          alignItems: 'center',
          px: 2,
          py: 0.5,
          bgcolor: 'rgba(255,248,246,0.9)',
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${c.outlineVariant}`,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0 -4px 16px rgba(249,115,22,0.08)',
          zIndex: 50,
        }}
      >
        {mainNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Box
              key={item.href}
              component={Link}
              href={item.href}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                py: 0.75,
                color: active ? c.primary : c.onSurfaceVariant,
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 0.25,
                  borderRadius: 999,
                  bgcolor: active ? 'rgba(249,115,22,0.18)' : 'transparent',
                  mb: 0.25,
                }}
              >
                <Ms name={item.icon} fill={active} />
              </Box>
              <Typography sx={{ fontSize: 11, fontWeight: active ? 700 : 600 }}>
                {item.shortLabel}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
