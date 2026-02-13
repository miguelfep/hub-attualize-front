import { m } from "framer-motion";

import { Box, Card, Grid, Stack, Divider, Skeleton, CardContent, } from "@mui/material";

export function EditarServicoPageSkeleton() {
  return (
    <m.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack spacing={1}>
            <Skeleton variant="text" sx={{ fontSize: '2rem', width: 200 }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: 300 }} />
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Skeleton variant="rounded" width={100} height={40} />
            <Skeleton variant="rounded" width={150} height={40} />
          </Stack>
        </Box>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: 200 }} />
          </Stack>
          <Grid container spacing={2}>
            <Grid xs={12}><Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} /></Grid>
            <Grid xs={12}><Skeleton variant="rectangular" height={88} sx={{ borderRadius: 1 }} /></Grid>
            <Grid xs={12} sm={4}><Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} /></Grid>
            <Grid xs={12} sm={4}><Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} /></Grid>
            <Grid xs={12} sm={4}><Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} /></Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

          {/* Skeleton da Seção 2 */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: 300 }} />
          </Stack>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}><Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} /></Grid>
            <Grid xs={12} sm={3}><Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} /></Grid>
            <Grid xs={12} sm={3}><Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} /></Grid>
          </Grid>
        </CardContent>
      </Card>
    </m.div>
  );
}
