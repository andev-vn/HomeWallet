/**
 * Bảng màu "Warm Family Finance" (từ Stitch).
 *
 * QUAN TRỌNG: file này KHÔNG mang 'use client'. `c` được dùng trong cả Server
 * Component lẫn Client Component — nếu export từ một module 'use client' thì khi
 * Server Component import sẽ nhận về reference rỗng (undefined) khiến style inline
 * (background gradient, color...) bị bỏ qua. Giữ palette ở module thuần như thế này.
 */
export const c = {
  primary: '#9d4300',
  primaryContainer: '#f97316',
  onPrimary: '#ffffff',
  primaryFixed: '#ffdbca',
  primaryFixedDim: '#ffb690',
  surface: '#fff8f6',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#fff1eb',
  surfaceContainer: '#ffeae0',
  surfaceContainerHigh: '#fce3d9',
  surfaceContainerHighest: '#f6ded3',
  surfaceVariant: '#f6ded3',
  surfaceDim: '#edd5cb',
  onSurface: '#251913',
  onSurfaceVariant: '#584237',
  onSecondaryFixedVariant: '#4b4641',
  outline: '#8c7164',
  outlineVariant: '#e0c0b1',
  secondary: '#645d58',
  secondaryContainer: '#eae1da',
  tertiary: '#006398',
  tertiaryContainer: '#00a2f4',
  tertiaryFixedDim: '#93ccff',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  background: '#fff8f6',
} as const;
