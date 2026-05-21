import {
  Box,
  Card,
  Grid,
  Stack,
  Table,
  Skeleton,
  TableBody,
  CardContent,
  TableContainer,
} from '@mui/material';

import { SimplePaper } from 'src/components/paper/SimplePaper';

import { VendaTableRowSkeleton } from './VendasTableRowSkeleton';

const VENDAS_STAT_LABEL_WIDTHS = ['48%', '52%', '40%', '58%', '62%'];
const VENDAS_STAT_VALUE_WIDTHS = ['28%', '32%', '24%', '72%', '36%'];

export function VendasStatCardSkeleton({ labelWidth, valueWidth }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={0.5}>
          <Skeleton
            variant="text"
            animation="wave"
            width={labelWidth}
            height={20}
            sx={{ transform: 'none', maxWidth: '100%' }}
          />
          <Skeleton
            variant="text"
            animation="wave"
            width={valueWidth}
            height={28}
            sx={{ transform: 'none', maxWidth: '100%' }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export function VendasStatsCardsSkeleton({ sx }) {
  return (
    <Box sx={{ p: 2.5, ...sx }} aria-busy aria-label="Carregando estatísticas de vendas">
      <Grid container spacing={2}>
        {VENDAS_STAT_LABEL_WIDTHS.map((labelWidth, index) => (
          <Grid key={`vendas-stat-sk-${index}`} xs={12} sm={6} md={2.4}>
            <VendasStatCardSkeleton
              labelWidth={labelWidth}
              valueWidth={VENDAS_STAT_VALUE_WIDTHS[index]}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function VendaMobileCardSkeleton() {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack spacing={1}>
            <Skeleton variant="text" width={120} sx={{ fontSize: '1.25rem' }} />
            <Skeleton variant="text" width={180} />
          </Stack>
          <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 1.5 }} />
        </Stack>
        <Skeleton variant="rounded" height={50} sx={{ mb: 2 }} />
        <Stack direction="row" justifyContent="flex-end">
          <Skeleton variant="rounded" width={100} height={36} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export function VendasPageSkeleton() {
  return (
    <SimplePaper>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack>
          <Skeleton variant="text" width={220} height={40} />
          <Skeleton variant="text" width={300} />
        </Stack>
        <Skeleton variant="rounded" width={180} height={40} />
      </Stack>

      <VendasStatsCardsSkeleton sx={{ mb: 3, p: 0 }} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} sm={4}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid xs={12} sm={4}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid xs={12} sm={4}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 4. Conteúdo (Tabela para Desktop) */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer>
          <Table>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <VendaTableRowSkeleton key={`desktop-sk-${i}`} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
        {[...Array(4)].map((_, i) => (
          <VendaMobileCardSkeleton key={`mobile-sk-${i}`} />
        ))}
      </Stack>
    </SimplePaper>
  );
}