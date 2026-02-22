'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

import { CARD } from '../components/dash-tokens';

export default function MetricCardSkeleton({ sx, ...other }) {
  return (
    <Card
      sx={{
        ...CARD,
        p: 2,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: '100%',
        ...sx,
      }}
      {...other}
    >
      <Skeleton
        variant="rounded"
        width={36}
        height={36}
        sx={{ borderRadius: 1.5, flexShrink: 0 }}
      />
      <Stack spacing={0.5} flexGrow={1} minWidth={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'nowrap' }}>
          <Skeleton variant="text" width="30%" height={14} sx={{ flexShrink: 0 }} />
          <Skeleton variant="rounded" width={56} height={16} sx={{ borderRadius: 1, flexShrink: 0 }} />
        </Box>
        <Skeleton variant="text" width="55%" height={24} />
      </Stack>
    </Card>
  );
}
