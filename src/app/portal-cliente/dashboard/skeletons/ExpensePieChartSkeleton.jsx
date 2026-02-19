'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';

import { CARD, CARD_HEADER } from '../components/dash-tokens';

export default function ExpensePieChartSkeleton({ sx, ...other }) {
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
        title={<Skeleton variant="text" width="55%" height={20} />}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={140} height={32} />
            <Skeleton variant="rounded" width={120} height={32} />
          </Stack>
        }
        sx={{
          ...CARD_HEADER,
          py: 2,
          '& .MuiCardHeader-action': { m: 0 },
        }}
      />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          gap: 2,
        }}
      >
        <Skeleton variant="circular" width={200} height={200} />
        <Stack spacing={0.75}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={16} width={80} />
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
