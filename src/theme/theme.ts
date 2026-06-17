'use client';

import { createTheme } from '@mui/material/styles';
import { c } from './colors';

// Re-export để các client component cũ import `c` từ '@/theme/theme' vẫn chạy.
export { c };

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: { main: c.primaryContainer, dark: c.primary, contrastText: c.onPrimary },
    secondary: { main: c.tertiary, contrastText: '#ffffff' },
    error: { main: c.error },
    background: { default: c.background, paper: c.surfaceContainerLowest },
    text: { primary: c.onSurface, secondary: c.onSurfaceVariant },
    divider: 'rgba(140,113,100,0.18)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'var(--font-jakarta), system-ui, Arial, sans-serif',
    h1: { fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h2: { fontSize: 32, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.25 },
    h3: { fontSize: 24, fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: 20, fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: 16, lineHeight: 1.5 },
    body2: { fontSize: 14, lineHeight: 1.43 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: c.surfaceContainerLowest,
          border: '1px solid rgba(224,192,177,0.4)',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(249,115,22,0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999 },
        contained: { boxShadow: '0 8px 16px rgba(249,115,22,0.2)' },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12, backgroundColor: c.surface } } },
  },
});

export default theme;
