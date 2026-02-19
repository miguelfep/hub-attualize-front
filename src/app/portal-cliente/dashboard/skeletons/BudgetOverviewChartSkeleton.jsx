'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';

import { CARD, CARD_HEADER } from '../components/dash-tokens';

export default function BudgetOverviewChartSkeleton({ sx, ...other }) {
  return (
    <Card
      sx={{
        ...CARD,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      {...other}
    >
      <CardHeader
        title={<Skeleton variant="text" width={120} height={22} />}
        subheader={<Skeleton variant="text" width={180} height={18} />}
        action={<Skeleton variant="rounded" width={160} height={20} />}
        sx={{
          ...CARD_HEADER,
          py: 2,
          gap: 3,
          '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' },
        }}
      />
      <Box sx={{ flex: 1, px: 1.5, pb: 2 }}>
        <Skeleton variant="rounded" width="100%" height={320} sx={{ borderRadius: 2 }} />
      </Box>
    </Card>
  );
}
