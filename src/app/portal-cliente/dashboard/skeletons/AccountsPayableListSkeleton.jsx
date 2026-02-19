'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';

import { CARD, CARD_HEADER } from '../components/dash-tokens';

const LIST_ITEMS_COUNT = 5;

export default function AccountsPayableListSkeleton({ sx, ...other }) {
  return (
    <Card
      sx={{
        ...CARD,
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...sx,
      }}
      {...other}
    >
      <CardHeader
        title={<Skeleton variant="text" width={140} height={18} />}
        subheader={<Skeleton variant="text" width="70%" height={14} />}
        sx={{
          ...CARD_HEADER,
          py: 1.5,
          '& .MuiCardHeader-title': { fontSize: '0.875rem' },
          '& .MuiCardHeader-subheader': CARD_HEADER.subheader,
        }}
      />
      <Box sx={{ flex: 1, px: 2, pb: 2, minHeight: 0 }}>
        <Stack spacing={1.25}>
          {Array.from({ length: LIST_ITEMS_COUNT }).map((_, index) => (
            <Stack
              key={index}
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
              }}
            >
              <Skeleton variant="circular" width={36} height={36} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="text" width="85%" height={14} sx={{ mb: 0.25 }} />
                <Skeleton variant="text" width="60%" height={12} />
              </Box>
              <Skeleton variant="text" width={70} height={16} />
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
