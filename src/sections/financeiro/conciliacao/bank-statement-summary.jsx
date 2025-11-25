'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function BankStatementSummary({ summary, loading }) {
  const totalLancamentos = summary.conciliados + summary.pendentes;
  const conciliationProgress = totalLancamentos
    ? Math.round((summary.conciliados / totalLancamentos) * 100)
    : 0;

  const cards = [
    {
      label: 'Saldo projetado',
      value: formatCurrency(summary.saldo),
      helper: 'Entradas - Saídas',
    },
    {
      label: 'Entradas',
      value: formatCurrency(summary.totalEntradas),
      helper: `${summary.porDia.length} dias computados`,
    },
    {
      label: 'Saídas',
      value: formatCurrency(summary.totalSaidas),
      helper: 'Valores absolutos',
    },
    {
      label: 'Conciliação',
      value: `${summary.conciliados} de ${totalLancamentos}`,
      helper: `${summary.pendentes} pendentes`,
      progress: conciliationProgress,
    },
  ];

  const pendencias = summary.pendenciasPrioritarias ?? [];
  const diario = summary.porDia?.slice(-5) ?? [];

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.label}>
          <Card sx={{ p: 3 }}>
            {loading ? (
              <Skeleton variant="rectangular" height={80} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="h5">{card.value}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.helper}
                </Typography>
                {typeof card.progress === 'number' && (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={card.progress}
                      sx={{ mt: 1, height: 8, borderRadius: 999 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {card.progress}% conciliado
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Card>
        </Grid>
      ))}

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Pendências prioritárias</Typography>
            <Chip label={`${pendencias.length} itens`} color="warning" size="small" />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Skeleton variant="rectangular" height={160} />
          ) : pendencias.length ? (
            <List dense disablePadding>
              {pendencias.map((item) => (
                <ListItem key={item.id} disableGutters sx={{ py: 1 }}>
                  <ListItemText
                    primary={item.description}
                    secondary={`${formatDate(item.date)} • ${formatCurrency(item.amount)}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhuma pendência identificada. Excelente!
            </Typography>
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Resumo diário</Typography>
            <Chip label="Últimos 5 dias" variant="outlined" size="small" />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Skeleton variant="rectangular" height={160} />
          ) : diario.length ? (
            <List dense disablePadding>
              {diario.map((dia) => (
                <ListItem key={dia.date} disableGutters sx={{ py: 1 }}>
                  <ListItemText
                    primary={formatDate(dia.date)}
                    secondary={
                      <>
                        <Typography variant="caption" color="success.main" sx={{ mr: 1 }}>
                          Entradas {formatCurrency(dia.credit)}
                        </Typography>
                        <Typography variant="caption" color="error.main">
                          Saídas {formatCurrency(dia.debit)}
                        </Typography>
                      </>
                    }
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Importe um extrato para visualizar o histórico por dia.
            </Typography>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}

function formatCurrency(value = 0) {
  return currencyFormatter.format(value || 0);
}

function formatDate(date) {
  if (!date) {
    return '—';
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString('pt-BR');
}
