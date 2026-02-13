import { Grid, Paper, Stack, Divider, Skeleton } from '@mui/material';

export function LicencaRowSkeleton() {
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Stack sx={{ width: '50%' }}>
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <Skeleton variant="rounded" width={120} height={24} />
          <Skeleton variant="rounded" width={110} height={24} />
          <Skeleton variant="rounded" width={110} height={36} />
        </Stack>
      </Stack>

      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

      <Grid container spacing={2}>
        {[...Array(4)].map((_, index) => (
          <Grid xs={6} sm={3} key={index}>
            <Skeleton variant="text" width="50%" sx={{ fontSize: '0.7rem' }} />
            <Skeleton variant="text" width="80%" sx={{ fontSize: '0.9rem' }} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
