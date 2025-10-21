import { Divider } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export const CustomDivider = ({ sx }) => {
  const theme = useTheme();
  return (
    <Divider
      sx={{
        borderStyle: 'dashed',
        borderColor: () => alpha(theme.palette.primary.main, 0.4),
        background: `linear-gradient(90deg, transparent, ${alpha(
          theme.palette.primary.main,
          0.2
        )}, transparent)`,
        ...sx,
      }}
    />
  );
};
