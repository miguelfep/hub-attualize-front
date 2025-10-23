import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';

export function DashboardSkeleton() {
  return (
    <Container maxWidth="xl">
      {/* Skeleton para o Título */}
      <Skeleton variant="text" width="20%" sx={{ fontSize: '2rem', mb: 3 }} />

      <Grid container spacing={3}>
        {/* Skeleton para Welcome e Banners */}
        <Grid item xs={12} md={8}>
          <Skeleton variant="rectangular" sx={{ height: 280, borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" sx={{ height: 280, borderRadius: 2 }} />
        </Grid>

        {/* Skeleton para os Widgets de Resumo */}
        <Grid item xs={12} sm={6} md={4}>
          <Skeleton variant="rectangular" sx={{ height: 140, borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Skeleton variant="rectangular" sx={{ height: 140, borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Skeleton variant="rectangular" sx={{ height: 140, borderRadius: 2 }} />
        </Grid>

        {/* Skeleton para o Gráfico */}
        <Grid item xs={12}>
          <Skeleton variant="rectangular" sx={{ height: 400, borderRadius: 2 }} />
        </Grid>

        {/* Skeleton para a Tabela */}
        <Grid item xs={12}>
          <Skeleton variant="rectangular" sx={{ height: 300, borderRadius: 2 }} />
        </Grid>
      </Grid>
    </Container>
  );
}
