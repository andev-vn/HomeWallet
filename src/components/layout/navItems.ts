export interface NavItem {
  label: string;
  shortLabel: string; // dùng cho bottom nav (mobile)
  icon: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { label: 'Chi Tiêu Của Tôi', shortLabel: 'Chi Tiêu', icon: 'payments', href: '/expenses' },
  { label: 'Nhà', shortLabel: 'Nhà', icon: 'home_app_logo', href: '/home' },
  { label: 'Ví Của Tôi', shortLabel: 'Ví', icon: 'account_balance_wallet', href: '/settings' },
  { label: 'Hồ Sơ', shortLabel: 'Hồ Sơ', icon: 'account_circle', href: '/profile' },
];

export const footerNav: NavItem[] = [];
