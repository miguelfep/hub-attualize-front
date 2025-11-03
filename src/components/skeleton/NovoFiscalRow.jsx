import { Grid, Paper, Stack, Skeleton } from '@mui/material';

export function NotaRowSkeleton() {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1.5 }}>
      <Grid container spacing={2} alignItems="center">
        
        <Grid item xs={12} md={5}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: '70%' }} />
          </Stack>
        </Grid>

        <Grid item xs={12} md={3}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="80%" />
            </Grid>
            <Grid item xs={6}>
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="80%" />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="flex-end">
            <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: 80 }} />
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}