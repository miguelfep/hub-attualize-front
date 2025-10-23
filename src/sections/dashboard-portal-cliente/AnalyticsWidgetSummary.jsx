import Link from 'next/link';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';

export function AnalyticsWidgetSummary({
  title,
  total,
  icon,
  link,
  formatar = false,
  count = 0,
  color = 'primary',
  sx,
  ...other
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...sx,
      }}
      {...other}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4">
          {formatar ? formatToCurrency(total) : total}
          {count > 0 && (
            <Box
              component="span"
              sx={{
                ml: 0.5,
                color: 'text.secondary',
                fontSize: 'subtitle2.fontSize',
                fontWeight: 'fontWeightRegular',
              }}
            >
              {`(${count})`}
            </Box>
          )}{' '}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>
          <Link href={{ pathname: link }}>
            <Iconify
              icon="icon-park-twotone:info"
              sx={{
                width: 16,
                height: 16,
                color: 'primary.dark',
                verticalAlign: 'middle',
              }}
            />
          </Link>
        </Box>
      </Stack>

      <Box
        sx={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          color: `${color}.main`,
          bgcolor: alpha(theme.palette[color].main, 0.08),
        }}
      >
        <Iconify icon={icon} width={32} />
      </Box>
    </Card>
  );
}
