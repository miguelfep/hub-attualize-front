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

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" sx={{ width: '50%', fontSize: '0.75rem' }} />
        <Skeleton variant="text" sx={{ width: '30%', fontSize: '1.5rem' }} />
      </CardContent>
    </Card>
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

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[...Array(5)].map((_, i) => (
          <Grid item key={`stat-sk-${i}`} xs={12} sm={6} md={2.4}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12} sm={4}>
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