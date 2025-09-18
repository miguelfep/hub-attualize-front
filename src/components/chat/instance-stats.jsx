import {
  Box,
  Card,
  Stack,
  Typography,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { getInstanceConfig } from 'src/config/instances';
import type { InstanceStats } from 'src/types/chat';

interface InstanceStatsProps {
  stats: InstanceStats;
  loading?: boolean;
}

export function InstanceStats({ stats, loading = false }) {
  const theme = useTheme();

  const getInstanceCard = (instanceType, instanceStats) => {
    const config = getInstanceConfig(instanceType);
    const total = instanceStats.total;
    const emAtendimento = instanceStats.emAtendimento;
    const naFila = instanceStats.naFila;
    const fechados = instanceStats.fechados;

    const progressValue = total > 0 ? (emAtendimento / total) * 100 : 0;

    return (
      <Card
        key={instanceType}
        sx={{
          p: 3,
          border: `2px solid ${config.borderColor}`,
          bgcolor: config.bgColor,
          '&:hover': {
            boxShadow: theme.customShadows.card,
          },
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon={config.icon} width={24} sx={{ color: config.color }} />
            <Typography variant="h6" sx={{ color: config.textColor, fontWeight: 600 }}>
              {config.name}
            </Typography>
          </Stack>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: config.textColor }}>
                Total: {total}
              </Typography>
              <Typography variant="body2" sx={{ color: config.textColor }}>
                {emAtendimento} em atendimento
              </Typography>
            </Stack>
            
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: config.color,
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          <Stack direction="row" spacing={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: config.color, fontWeight: 700 }}>
                {naFila}
              </Typography>
              <Typography variant="caption" sx={{ color: config.textColor }}>
                Na Fila
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: config.color, fontWeight: 700 }}>
                {emAtendimento}
              </Typography>
              <Typography variant="caption" sx={{ color: config.textColor }}>
                Atendimento
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: config.color, fontWeight: 700 }}>
                {fechados}
              </Typography>
              <Typography variant="caption" sx={{ color: config.textColor }}>
                Fechados
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Card>
    );
  };

  if (loading) {
    return (
      <Stack direction="row" spacing={2}>
        {[1, 2].map((i) => (
          <Card key={i} sx={{ p: 3, flex: 1 }}>
            <Stack spacing={2}>
              <Box sx={{ height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
              <Box sx={{ height: 8, bgcolor: 'grey.200', borderRadius: 4 }} />
              <Stack direction="row" spacing={2}>
                {[1, 2, 3].map((j) => (
                  <Box key={j} sx={{ textAlign: 'center', flex: 1 }}>
                    <Box sx={{ height: 32, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                    <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={2}>
      {getInstanceCard('operacional', stats.operacional)}
      {getInstanceCard('financeiro-comercial', stats.financeiroComercial)}
    </Stack>
  );
} 