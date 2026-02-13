import { Box, Card, Grid, Stack, Skeleton } from '@mui/material';

export function PortalServicosPageSkeleton() {
  return (
    <div>
      <Stack spacing={1} sx={{ mb: 2 }}><Skeleton variant="text" width="20%" sx={{ fontSize: '1.5rem' }} /><Skeleton variant="text" width="30%" /></Stack>
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Stack spacing={1} sx={{ width: '40%' }}><Skeleton variant="text" sx={{ fontSize: '2rem' }} /><Skeleton variant="text" sx={{ fontSize: '1rem' }} /></Stack><Skeleton variant="rounded" width={150} height={40} /></Box>
        <Stack sx={{ p: 2.5, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}><Grid container spacing={2}><Grid xs={12} md={4}><Skeleton variant="rectangular" height={56} /></Grid><Grid xs={12} sm={6} md={4}><Skeleton variant="rectangular" height={56} /></Grid><Grid xs={12} sm={6} md={4}><Skeleton variant="rectangular" height={56} /></Grid></Grid></Stack>
        <Box sx={{ p: 2 }}><Skeleton variant="rectangular" height={400} /></Box>
      </Card>
    </div>
  );
}
