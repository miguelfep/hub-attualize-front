'use client';

import {
  Card,
  Stack,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  Paper,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function FatorRCard({ fatorR }) {
  if (!fatorR) return null;

  const atingiuMinimo = fatorR.aplicavelAnexoIII || fatorR.percentual >= 28;

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Fator R</Typography>
          <Chip
            label={atingiuMinimo ? 'Anexo III' : 'Anexo V'}
            color={atingiuMinimo ? 'success' : 'warning'}
            icon={
              <Iconify
                icon={atingiuMinimo ? 'solar:trend-up-bold-duotone' : 'solar:trend-down-bold-duotone'}
                width={16}
              />
            }
          />
        </Stack>

        <Grid container spacing={3}>
          {/* Mês Corrente */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                MÊS CORRENTE
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Folha de Pagamento:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    R${' '}
                    {fatorR.folhaDoMes?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    INSS/CPP:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    R${' '}
                    {fatorR.inssDoMes?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Receita Bruta:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    R${' '}
                    {fatorR.receitaDoMes?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {/* Últimos 12 Meses */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                ÚLTIMOS 12 MESES
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Folha de Pagamento:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    R${' '}
                    {fatorR.folhaPagamento12Meses?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    INSS/CPP:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    R${' '}
                    {fatorR.inssCpp12Meses?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Receita Bruta:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    R${' '}
                    {fatorR.receitaBruta12Meses?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Percentual e Progress Bar */}
        <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Percentual do Fator R
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {fatorR.percentual?.toFixed(2)}%
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  Faixa Mínima
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.secondary">
                  28%
                </Typography>
              </Box>
            </Stack>

            <Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(fatorR.percentual || 0, 100)}
                sx={{
                  height: 12,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: atingiuMinimo ? 'success.main' : 'warning.main',
                    borderRadius: 1,
                  },
                }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              {atingiuMinimo ? (
                <>
                  ✅ Fator R ≥ 28%: A empresa se enquadra no <strong>Anexo III</strong> (alíquotas
                  menores)
                </>
              ) : (
                <>
                  ℹ️ Fator R &lt; 28%: A empresa permanece no <strong>Anexo V</strong> (alíquotas
                  maiores)
                </>
              )}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

