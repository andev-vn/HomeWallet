import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

/** Icon Material Symbols. `fill` để tô đặc, `size` cỡ px. */
export default function Ms({
  name,
  fill = false,
  size = 24,
  sx,
}: {
  name: string;
  fill?: boolean;
  size?: number;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      component="span"
      className={`material-symbols-outlined${fill ? ' ms-fill' : ''}`}
      aria-hidden
      sx={{ fontSize: size, ...sx }}
    >
      {name}
    </Box>
  );
}
