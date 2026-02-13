import m from 'framer-motion';

import {  Box, Card, Grid, Stack, Skeleton, CardContent } from '@mui/material'

export function NovoServicoPageSkeleton() {
  return (
    <m.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack spacing={1}><Skeleton variant="text" sx={{ fontSize: '2rem', width: 200 }} /><Skeleton variant="text" sx={{ fontSize: '1rem', width: 300 }} /></Stack>
          <Stack direction="row" spacing={1.5}><Skeleton variant="rounded" width={100} height={40} /><Skeleton variant="rounded" width={100} height={40} /></Stack>
        </Box>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: 200, mb: 3 }} />
          <Grid container spacing={2}>
            <Grid xs={12}><Skeleton variant="rectangular" height={56} /></Grid>
            <Grid xs={12}><Skeleton variant="rectangular" height={80} /></Grid>
            <Grid xs={12} sm={4}><Skeleton variant="rectangular" height={56} /></Grid>
            <Grid xs={12} sm={4}><Skeleton variant="rectangular" height={56} /></Grid>
            <Grid xs={12} sm={4}><Skeleton variant="rectangular" height={56} /></Grid>
          </Grid>
        </CardContent>
      </Card>
    </m.div>
  );
}
