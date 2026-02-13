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

export function NovoOrcamentoPageSkeleton() {
  return (
    <SimplePaper>
      <Card sx={{ borderRadius: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Stack>
            <Skeleton variant="text" width={220} height={40} />
            <Skeleton variant="text" width={340} />
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Skeleton variant="rounded" width={100} height={40} />
            <Skeleton variant="rounded" width={90} height={40} />
          </Stack>
        </Stack>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>
            <Box>
              <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid xs={12} md={8}>
                  <Skeleton variant="rounded" height={56} />
                </Grid>
                <Grid xs={12} md={4}>
                  <Skeleton variant="rounded" height={56} />
                </Grid>
                <Grid xs={12} md={4}>
                  <Skeleton variant="rounded" height={56} />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <Skeleton variant="text" width={180} height={32} />
                <Skeleton variant="rounded" width={150} height={36} />
              </Stack>
              <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid xs={12}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid xs={12}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid xs={6} sm={4} md={3}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid xs={6} sm={4} md={3}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid xs={12} sm={4} md={3}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                </Grid>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Skeleton variant="rounded" height={100} />
                </Grid>
                <Grid xs={12} md={6}>
                  <Skeleton variant="rounded" height={100} />
                </Grid>
                <Grid xs={12}>
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