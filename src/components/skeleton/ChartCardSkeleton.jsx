import { Box, Card, Grid, Stack, Skeleton, CardHeader } from '@mui/material';

export default function ChartCardSkeleton({ chartType = 'rectangular' }) {
  const headerAction =
    chartType === 'circular' ? (
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width={80} height={40} />
        <Skeleton variant="rounded" width={80} height={40} />
      </Stack>
    ) : (
      <Skeleton variant="rounded" width={120} height={40} />
    );

  let chartContent;

  switch (chartType) {
    case 'circular':
      chartContent = (
        <Grid container spacing={3} alignItems="center">
          <Grid xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Skeleton variant="circular" width={240} height={240} />
          </Grid>
          <Grid xs={12} md={6}>
            <Stack spacing={2}>
              {Array.from(new Array(5)).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={20} />
              ))}
            </Stack>
          </Grid>
        </Grid>
      );
      break;

    case 'rectangular':
    default:
      chartContent = <Skeleton variant="rounded" height={300} />;
      break;
  }

  return (
    <Card>
      <CardHeader
        title={<Skeleton variant="text" sx={{ width: '40%' }} />}
        subheader={<Skeleton variant="text" sx={{ width: '25%' }} />}
        action={headerAction}
      />
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {chartContent}
      </Box>
    </Card>
  );
}
