import Grid from '@mui/material/Unstable_Grid2';
import { Box, Card, Stack, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';

// ----------------------------------------------------------------------

function Componente({ label, value, icon, color, sinal }) {
  return (
    <Card
      variant="outlined"
      sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => theme.palette[color]?.lighter ?? theme.palette.grey[200],
            color: (theme) => theme.palette[color]?.dark ?? theme.palette.text.primary,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Stack>

      <Typography
        sx={{
          mt: 'auto',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          fontSize: { xs: '1.05rem', xl: '1.15rem' },
          color: (theme) => theme.palette[color]?.dark ?? theme.palette.text.primary,
        }}
      >
        {sinal}
        {formatToCurrency(value ?? 0)}
      </Typography>
    </Card>
  );
}

export default function NrrComponentesCards({ resumo }) {
  const cards = [
    {
      label: 'Receita inicial',
      value: resumo?.receitaInicial,
      icon: 'solar:wallet-money-bold-duotone',
      color: 'info',
      sinal: '',
    },
    {
      label: 'Expansão',
      value: resumo?.expansao,
      icon: 'solar:arrow-up-bold-duotone',
      color: 'success',
      sinal: '+ ',
    },
    {
      label: 'Downgrade',
      value: resumo?.downgrade,
      icon: 'solar:arrow-down-bold-duotone',
      color: 'warning',
      sinal: '− ',
    },
    {
      label: 'Churn',
      value: resumo?.churn,
      icon: 'solar:user-cross-bold-duotone',
      color: 'error',
      sinal: '− ',
    },
    {
      label: 'Receita final da base',
      value: resumo?.receitaFinalCohort,
      icon: 'solar:chart-2-bold-duotone',
      color: 'primary',
      sinal: '',
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid key={card.label} xs={6} sm={4} md={2.4}>
          <Componente {...card} />
        </Grid>
      ))}
    </Grid>
  );
}
