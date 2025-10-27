import {
  Box,
  Card,
  Grid,
  Stack,
  Divider,
  Skeleton,
  CardContent,
} from '@mui/material';

import { SimplePaper } from 'src/components/paper/SimplePaper';


export function OrcamentoEditPageSkeleton() {
  return (
    <SimplePaper>
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ md: 'center' }}
            gap={2}
          >
            <Stack spacing={1}>
              <Skeleton variant="text" width={250} height={40} />
              <Skeleton variant="text" width={300} />
              <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1.5 }} />
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Skeleton variant="rounded" width={80} height={40} />
              <Skeleton variant="rounded" width={100} height={40} />
              <Skeleton variant="rounded" width={140} height={40} />
            </Stack>
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>
            <Box>
              <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Stack spacing={1}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="50%" />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={1}>
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="rounded" height={40} sx={{ width: { xs: '100%', sm: 220 } }} />
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* 3. SKELETON DO ITEM DO SERVIÇO */}
            <Box>
              <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={260} />
            </Box>

            <Divider />

            {/* 4. SKELETON DAS OBSERVAÇÕES E TOTAIS */}
            <Box>
              <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Skeleton variant="rounded" height={100} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Skeleton variant="rounded" height={100} />
                </Grid>
                <Grid item xs={12}>
                  <Skeleton variant="rounded" height={80} sx={{ mt: 2 }} />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </SimplePaper>
  );
}