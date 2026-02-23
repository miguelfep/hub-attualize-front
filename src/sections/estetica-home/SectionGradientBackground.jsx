'use client';

import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function SectionGradientBackground({ children, py = { xs: 10, md: 16 }, sx, ...other }) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const yellow = theme.palette.yellow ?? {};
  const blue = theme.palette.blue ?? {};
  const brown = theme.palette.brown ?? {};

  const YELLOW_MAIN = yellow.main ?? theme.palette.primary.main;
  const BLUE_MAIN = blue.main ?? '#0096D9';
  const BROWN_MAIN = brown.main ?? '#645658';

  const SECTION_BG = isLight
    ? `linear-gradient(165deg, ${alpha(YELLOW_MAIN, 0.06)} 0%, ${alpha(BLUE_MAIN, 0.03)} 35%, ${alpha(BROWN_MAIN, 0.04)} 70%, ${theme.palette.background.default} 100%)`
    : `linear-gradient(165deg, ${alpha(YELLOW_MAIN, 0.1)} 0%, ${alpha(theme.palette.grey[900], 0.6)} 50%, ${theme.palette.background.default} 100%)`;

  return (
    <Box
      component="section"
      sx={[
        {
          py,
          position: 'relative',
          background: SECTION_BG,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${alpha(YELLOW_MAIN, 0.3)}, ${alpha(BLUE_MAIN, 0.25)}, ${alpha(BROWN_MAIN, 0.3)}, transparent)`,
            opacity: 0.8,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Box>
  );
}