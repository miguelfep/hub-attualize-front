'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';

import { CARD, CARD_HEADER } from '../components/dash-tokens';

const DAYS_PER_WEEK = 7;
const WEEKS_COUNT = 5;

export default function TaxCalendarWidgetSkeleton({ sx, ...other }) {
  return (
    <Card
      sx={{
        ...CARD,
        height: '100%',
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
        title={<Skeleton variant="text" width={100} height={18} />}
        subheader={<Skeleton variant="text" width={220} height={14} />}
        sx={{
          ...CARD_HEADER,
          pb: 1,
          '& .MuiCardHeader-title': { fontSize: '0.9rem' },
          '& .MuiCardHeader-subheader': { fontSize: '0.75rem' },
        }}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ px: { xs: 0.5, sm: 1 }, minWidth: 0 }}>
          {/* Navegação do mês */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 1, mb: 0.5 }}
          >
            <Skeleton variant="rounded" width={32} height={32} />
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="rounded" width={32} height={32} />
          </Stack>
          {/* Dias da semana */}
          <Stack
            direction="row"
            justifyContent="space-around"
            sx={{ mb: 0.5, px: 0.5 }}
          >
            {Array.from({ length: DAYS_PER_WEEK }).map((_, i) => (
              <Skeleton key={i} variant="text" width={24} height={14} />
            ))}
          </Stack>
          {/* Grid de dias */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${DAYS_PER_WEEK}, 1fr)`,
              gap: 0.5,
              maxHeight: 200,
              px: 0.5,
            }}
          >
            {Array.from({ length: DAYS_PER_WEEK * WEEKS_COUNT }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={32}
                height={32}
                sx={{ borderRadius: 1, justifySelf: 'center' }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', mx: 2, my: 0.5, opacity: 0.4 }} />

        {/* Lista de itens do dia */}
        <Box sx={{ p: 2, pt: 1.5, flex: 1, minHeight: 0 }}>
          <Skeleton variant="text" width={100} height={12} sx={{ mb: 1.5 }} />
          <Stack spacing={1}>
            {[1, 2, 3].map((i) => (
              <Stack
                key={i}
                direction="row"
                alignItems="center"
                spacing={1.25}
                sx={{ p: 1, borderRadius: 1 }}
              >
                <Skeleton variant="rounded" width={3.5} height={24} sx={{ borderRadius: 1 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton variant="text" width="60%" height={12} sx={{ mb: 0.25 }} />
                  <Skeleton variant="text" width="40%" height={10} />
                </Box>
                <Skeleton variant="circular" width={28} height={28} />
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
