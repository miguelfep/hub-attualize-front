import { Card, Stack, Skeleton } from '@mui/material';

export default function WidgetSummarySkeleton() {
  return (
    <Stack component={Card} spacing={2} sx={{ p: 3 }}>
      <Skeleton variant="text" sx={{ width: 0.5, fontSize: '1rem' }} />
      <Skeleton variant="text" sx={{ width: 0.3, fontSize: '2rem' }} />
      <Skeleton variant="rounded" height={60} />
    </Stack>
  );
}
