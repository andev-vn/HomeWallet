import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ví Nhà — Quản lý chi tiêu gia đình',
    short_name: 'Ví Nhà',
    description: 'Ứng dụng quản lý chi tiêu cho cả gia đình',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fff8f6',
    theme_color: '#f97316',
    lang: 'vi',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
